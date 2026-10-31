/* A lista dos scripts de cada página, para a CSP estrita (auditoria, SEC-003).
 * ─────────────────────────────────────────────────────────────────────────
 * O export do Next escreve o próprio bootstrap em <script> inline, e por isso
 * a CSP que vale hoje precisa de `'unsafe-inline'` (ver `CSP` em
 * worker/src/worker.js). Um export estático não tem como carimbar nonce por
 * requisição, mas tem como fazer a outra coisa que a CSP aceita: dizer, por
 * página, o hash exato de cada script que ela traz. Um script injetado tem
 * outro hash e não roda.
 *
 * Este script roda depois do `next build` e escreve `out/_csp-hashes.json`:
 *
 *   { "/": ["sha256-…", …], "/faq": […], "404": […] }
 *
 * A chave é a rota como o Worker a vê (`/faq`, e não `faq/index.html`); a
 * página de erro é "404". O Worker lê o arquivo pelo servidor de ativos e o
 * arquivo em si não é servido a ninguém.
 *
 * Por enquanto a regra estrita vai no cabeçalho de OBSERVAÇÃO
 * (`Content-Security-Policy-Report-Only`): o navegador relata o que teria
 * bloqueado em /api/csp-report e não bloqueia nada. Só depois de dias sem
 * relato ela passa a valer.
 *
 *   node tools/csp-hashes.mjs [pasta do export, padrão app/out (app/out-en no inglês)]
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/* O conteúdo EXATO entre as tags, como o navegador o vê: o hash é sobre os
   bytes, e um espaço a mais é outro script. Scripts com `src` ficam de fora -
   esses já são cobertos por `'self'`. */
const INLINE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

export function hashesDoHtml(html) {
  const out = new Set();
  for (const [, attrs, corpo] of html.matchAll(INLINE)) {
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/\btype\s*=\s*["']?application\/(ld\+)?json/i.test(attrs)) continue; // dado, não código
    out.add('sha256-' + createHash('sha256').update(corpo, 'utf8').digest('base64'));
  }
  return [...out];
}

export function rotaDoArquivo(rel) {
  const p = rel.split(sep).join('/');
  if (p === '404.html' || p === '404/index.html') return '404';
  if (p === 'index.html') return '/';
  if (p.endsWith('/index.html')) return '/' + p.slice(0, -'/index.html'.length);
  return '/' + p.replace(/\.html$/, '');
}

function* htmls(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '_next') yield* htmls(f); }
    else if (e.name.endsWith('.html')) yield f;
  }
}

/* Só quando chamado como script. O teste importa as duas funções acima, e
   roda no CI ANTES do build: uma conferência da pasta no topo do módulo
   derrubava o teste (e a publicação) por falta de um out/ que ele nem usa. */
if (import.meta.url === `file://${process.argv[1]}`) {
  const padrao = process.env.NEXT_PUBLIC_LOCALE === 'en' ? '../app/out-en' : '../app/out';
  const OUT = process.argv[2] || new URL(padrao, import.meta.url).pathname;
  if (!existsSync(OUT)) { console.error(`csp-hashes: ${OUT} não existe; rode o build antes.`); process.exit(1); }
  const mapa = {};
  let total = 0;
  for (const f of htmls(OUT)) {
    const rota = rotaDoArquivo(relative(OUT, f));
    const hs = hashesDoHtml(readFileSync(f, 'utf8'));
    mapa[rota] = [...new Set([...(mapa[rota] || []), ...hs])];
    total += hs.length;
  }
  writeFileSync(join(OUT, '_csp-hashes.json'), JSON.stringify(mapa));
  console.log(`csp-hashes: ${Object.keys(mapa).length} páginas, ${total} scripts inline.`);
}
