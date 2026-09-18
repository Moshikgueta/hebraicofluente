/* build.js — data + templates → dist/
   Validates first. A fatal violation stops the build before a single file is
   written, so dist/ never holds a page that breaks the order rule. */

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validate, report } from './validate.js';
import { renderLetter } from '../templates/letter.js';
import { renderPage0 } from '../templates/page-0.js';
import { renderReview } from '../templates/review.js';
import { renderAppendix } from '../templates/appendix.js';
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

  /* ── 3. Assemble the book in READING ORDER ───────────────────────────
     Reviews are interleaved where the learner actually meets them — after
     letters 4, 8, 12, 16 and 20 — not bolted on at the end. This same order
     drives the per-file output, the index, and the single-file book. */
  const REVIEW_AT = [4, 8, 12, 16, 20];
  const maxOrder = letters.length ? letters[letters.length - 1].order : 0;

  const sections = [];
  sections.push({
    kind: 'intro', id: 'vogais', file: '00-vogais.html',
    title: 'Os sinais de vogal', sub: 'Antes da primeira letra',
    docTitle: 'Os sinais de vogal — Hebraico Moderno',
    desc: 'Os seis sons vocálicos do hebraico, apresentados pelo som e não pelo nome.',
    body: () => renderPage0(ctx)
  });

  for (const L of letters) {
    sections.push({
      kind: 'letter', id: L.id, order: L.order, letter: L.letter,
      file: `${String(L.order).padStart(2, '0')}-${L.id}.html`,
      title: `${L.order}. ${L.namePt}`, sub: L.sound,
      docTitle: `Letra ${L.namePt} — Hebraico Moderno`,
      desc: `A letra ${L.namePt}: som, sílabas, palavras, escrita cursiva e exercícios.`,
      body: () => renderLetter(L, ctx)
    });
    const at = REVIEW_AT.indexOf(L.order);
    if (at >= 0) {
      const R = { n: at + 1, upTo: L.order, final: false };
      sections.push({
        kind: 'review', id: `rev${R.n}`, file: `r${R.n}-revisao-${R.upTo}.html`,
        title: `Revisão ${R.n}`, sub: `letras 1 a ${R.upTo}`,
        docTitle: `Revisão ${R.n} — letras 1 a ${R.upTo}`,
        desc: `Revisão cumulativa das letras 1 a ${R.upTo}: leitura, reconhecimento, escrita e ditado.`,
        body: () => renderReview(R, ctx)
      });
    }
  }

  if (maxOrder >= 22) {
    const R = { n: 6, upTo: 22, final: true };
    sections.push({
      kind: 'review', id: 'rev6', file: 'r6-revisao-final.html',
      title: 'Revisão final', sub: 'as 22 letras',
      docTitle: 'Revisão final — todo o alfabeto',
      desc: 'Revisão cumulativa das 22 letras, das 5 formas finais e de todo o vocabulário.',
      body: () => renderReview(R, ctx)
    });
  }

  sections.push({
    kind: 'appendix', id: 'apendice', file: 'apendice.html',
    title: 'Apêndice', sub: 'tabelas de referência',
    docTitle: 'Apêndice — Hebraico Moderno',
    desc: 'Alfabeto completo, nomes dos sinais de vogal, chave de transliteração e quadro de cursiva.',
    body: () => renderAppendix(ctx)
  });

  /* ── 4. Render, numbering the pages continuously across the whole book ──
     The templates number their own sheets 1..n because a module has to make
     sense printed on its own. In the book those numbers would restart thirty
     times, so the folio is rewritten here from a single running counter — one
     number, always the page of the book. */
  /* Real page numbers for the contents, measured from a previous print run.
     Absent on a first build — the contents then shows a dash. */
  let pageMap = {}, bookPages = 0;
  try {
    const pm = readJson('data/page-map.json');
    pageMap = pm.sections || {};
    bookPages = pm.pages || 0;
  } catch { /* first run — the contents shows dashes */ }

  /* Sheets are numbered continuously across the whole book, contents first.
     The templates number their own sheets 1..n because a module has to make
     sense printed on its own; here that is rewritten from one running counter.

     The contents is rendered before the numbering starts: its length depends
     only on how many modules there are, never on the page numbers it shows,
     so there is no circularity. */
  const modules = [];
  const rawBodies = [];
  let probe = 1;
  for (const sec of sections) {
    const body = sec.body();
    rawBodies.push(body);
    const sheets = (body.match(/class="sheet"/g) || []).length;
    modules.push({ href: sec.file, kind: sec.kind, order: sec.order, id: sec.id,
                   title: sec.title, sub: sec.sub, letter: sec.letter,
                   sheet: probe, page: pageMap[sec.id] || null });
    probe += sheets;
  }

  const toc = renderIndex(modules, letters, probe - 1, bookPages);
  const tocSheets = (toc.match(/class="sheet"/g) || []).length;

  let folio = 1;
  const renumber = html => html.replace(
    /<span class="folio">\d+<\/span>/g,
    () => `<span class="folio">${folio++}</span>`
  );

  const tocNumbered = renumber(toc);

  const bodies = [];
  sections.forEach((sec, i) => {
    const startSheet = folio;
    /* The marker goes BETWEEN the badge and the h1, not at the very top of the
       section. A zero-height box sitting immediately after a forced page break
       gets assigned to either side of it at Chromium's discretion, and several
       sections came out reported one page early. */
    const marker = `<span class="secmark" aria-hidden="true">\u00a7sec:${sec.id}\u00a7</span>`;
    const body = renumber(rawBodies[i]).replace('<h1', marker + '<h1');
    bodies.push(body);
    modules[i].sheet = startSheet;
    writeFileSync(join(DIST, sec.file), document_({
      title: sec.docTitle, description: sec.desc, body
    }));
  });
  const totalPages = folio - 1;

  /* ── 5. The whole book as one file, for printing ────────────────────── */
  writeFileSync(join(DIST, 'livro-completo.html'), document_({
    title: 'Hebraico Moderno — Workbook de Alfabetização',
    description: 'O workbook completo: sinais de vogal, 22 letras, 6 revisões e apêndice.',
    body: [tocNumbered, ...bodies].join('\n')
  }));

  /* ── 6. Index ───────────────────────────────────────────────────────── */
  writeFileSync(join(DIST, 'index.html'), document_({
    title: 'Hebraico Moderno — Workbook de Alfabetização',
    description: 'Workbook de alfabetização em hebraico moderno para brasileiros adultos.',
    body: tocNumbered
  }));

  /* ── 7. Re-validate, now including the built HTML (V8/V9 — the bidi contract). */
  console.log('  validando saída…');
  const post = validate({ checkDist: true });
  const ok = report(post);

  console.log(`\n  ${modules.length} módulo(s), ${totalPages} folhas → dist/`);
  if (!ok) process.exit(1);
}

function renderIndex(modules, letters, totalPages, bookPages) {
  const row = m => `
    <a class="toc-row toc-row--${m.kind}" href="./${m.href}">
      <span class="toc-mark">${m.letter ? `<span class="he" lang="he">${esc(m.letter)}</span>` : ''}</span>
      <span class="toc-t">${esc(m.title)}</span>
      <span class="toc-s">${esc(m.sub)}</span>
      <span class="toc-p">${m.page == null ? '—' : m.page}</span>
    </a>`;

  /* The contents is itself paginated: 30 entries do not fit one A4 page, and
     the first sheet also carries the title block, so it holds fewer rows. */
  const groups = [];
  const FIRST = 12, REST = 17;
  groups.push(modules.slice(0, FIRST));
  for (let i = FIRST; i < modules.length; i += REST) groups.push(modules.slice(i, i + REST));

  return groups.map((g, gi) => `<section class="sheet">
  ${gi === 0 ? `<span class="badge">Nível A0 — iniciante absoluto</span>
  <h1>Hebraico Moderno<br>Workbook de Alfabetização</h1>
  <p class="lead">Guia para brasileiros adultos aprenderem a ler, pronunciar e escrever o hebraico moderno — do zero ao domínio do alfabeto.</p>

  <div class="toc-meta">
    <span><strong>${letters.length}</strong> letras</span>
    <span><strong>${modules.filter(m => m.kind === 'review').length}</strong> revisões</span>
    <span><strong>${bookPages || totalPages}</strong> páginas A4</span>
    <span class="no-print"><a href="./livro-completo.html">Abrir o livro inteiro num arquivo só →</a></span>
  </div>

  <h2>Sumário</h2>`
  : `<span class="badge">Sumário · continuação</span>
  <h1>Sumário</h1>`}
  <nav class="toc">${g.map(row).join('')}</nav>
  <span class="folio">0</span>
</section>`).join('\n');
}

main();
