/* build.js — data + templates → dist/
   Validates first. A fatal violation stops the build before a single file is
   written, so dist/ never holds a page that breaks the order rule. */

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validate, report } from './validate.js';
import { renderLetter } from '../templates/letter.js';
import { renderPage0 } from '../templates/page-0.js';
import { document_ } from '../templates/partials.js';
import { esc } from './lib/render.js';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

function main() {
  console.log('\nhebraico-fluente — build\n');

  /* 1. Validate the data. dist/ is not checked yet (it is about to be rebuilt). */
  console.log('  validando dados…');
  const pre = validate({ checkDist: false });
  if (pre.fails.length) { report(pre); process.exit(1); }
  pre.warns.forEach(w => console.log(`  ! ${w.rule}  ${w.where} — ${w.detail}`));

  const letters = readJson('data/letters.json').sort((a, b) => a.order - b.order);
  const nikud = readJson('data/nikud.json');
  const translit = readJson('data/translit.json');
  const ctx = { letters, nikud, translit };

  /* 2. Clean and copy the static side. */
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  cpSync(join(ROOT, 'styles'), join(DIST, 'styles'), { recursive: true });
  cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });

  const modules = [];

  /* 3. Página 0 — the vowel signs, before letter 1. */
  writeFileSync(join(DIST, '00-vogais.html'), document_({
    title: 'Os sinais de vogal — Hebraico Moderno',
    description: 'Os seis sons vocálicos do hebraico, apresentados pelo som e não pelo nome.',
    body: renderPage0(ctx)
  }));
  modules.push({ href: '00-vogais.html', kind: 'intro', title: 'Os sinais de vogal', sub: 'Antes da primeira letra' });

  /* 4. One module per letter. */
  for (const L of letters) {
    const file = `${String(L.order).padStart(2, '0')}-${L.id}.html`;
    writeFileSync(join(DIST, file), document_({
      title: `Letra ${L.namePt} — Hebraico Moderno`,
      description: `A letra ${L.namePt}: som, sílabas, palavras, escrita cursiva e exercícios.`,
      body: renderLetter(L, ctx)
    }));
    modules.push({
      href: file, kind: 'letter', order: L.order,
      title: `${L.order}. ${L.namePt}`, letter: L.letter, sub: L.sound
    });
  }

  /* 5. Index. */
  writeFileSync(join(DIST, 'index.html'), document_({
    title: 'Hebraico Moderno — Workbook de Alfabetização',
    description: 'Workbook de alfabetização em hebraico moderno para brasileiros adultos.',
    body: renderIndex(modules, letters)
  }));

  /* 6. Re-validate, now including the built HTML (V8/V9 — the bidi contract). */
  console.log('  validando saída…');
  const post = validate({ checkDist: true });
  const ok = report(post);

  console.log(`\n  ${modules.length} módulo(s) → dist/`);
  if (!ok) process.exit(1);
}

function renderIndex(modules, letters) {
  const cards = modules.filter(m => m.kind === 'letter').map(m => `
    <a class="idx-card" href="./${m.href}">
      <span class="he he--big" lang="he">${esc(m.letter)}</span>
      <span class="idx-t">${esc(m.title)}</span>
      <span class="idx-s">${esc(m.sub)}</span>
    </a>`).join('');

  return `<section class="sheet">
  <span class="badge">Nível A0 — iniciante absoluto</span>
  <h1>Hebraico Moderno<br>Workbook de Alfabetização</h1>
  <p class="lead">Guia para brasileiros adultos aprenderem a ler, pronunciar e escrever o hebraico moderno — do zero ao domínio do alfabeto.</p>

  <h2>Antes de começar</h2>
  <a class="idx-card idx-card--wide" href="./00-vogais.html">
    <span class="idx-t">Os sinais de vogal</span>
    <span class="idx-s">Os seis sons, apresentados pelo som e não pelo nome</span>
  </a>

  <h2>As letras</h2>
  <p class="hint">${letters.length} de 22 letras prontas. Cada letra é um módulo de cinco páginas.</p>
  <div class="idx-grid">${cards}</div>

  <aside class="callout callout--tip">
    <span class="callout-icon" aria-hidden="true">💡</span>
    <div><p>Estude uma letra por vez. Avance apenas quando sentir segurança na leitura e na escrita da letra atual.</p></div>
  </aside>
</section>`;
}

main();
