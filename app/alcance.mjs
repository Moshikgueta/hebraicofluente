/* Toda página pública a dois cliques da capa (23/10/2026).
   ─────────────────────────────────────────────────────────────────────────
   Lê o HTML exportado: os links da capa são o primeiro clique, os links das
   páginas que eles abrem são o segundo. Falha se alguma página do sitemap
   (as anunciáveis de seo.mjs) ficar mais longe que isso, ou órfã. Os links
   do menu "Experiências" e do rodapé contam, porque estão no HTML mesmo com
   o painel fechado.

   node alcance.mjs  (de dentro de app/, depois do build) */

import { existsSync, readFileSync } from 'node:fs';
import { classificar, rotas } from './seo.mjs';

const arquivo = (r) => {
  const limpo = r.replace(/\/+$/, '');
  for (const f of [`out${limpo}/index.html`, `out${limpo}.html`]) if (existsSync(f)) return f;
  return null;
};
const comBarra = (r) => (r.endsWith('/') ? r : `${r}/`);
/* Os links internos de uma página, na forma canônica "/rota/". O endereço
   antigo da venda conta como a página nova: o Worker responde 301. */
function links(rota) {
  const f = arquivo(rota);
  if (!f) return [];
  const html = readFileSync(f, 'utf8');
  const achados = new Set();
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    let r = comBarra(m[1].replace(/\/{2,}/g, '/'));
    if (r.startsWith('/_next/') || /\.[a-z0-9]+\/$/i.test(r)) continue;
    if (r === '/cursos/alfabetizacao/') r = '/curso-de-hebraico/';
    achados.add(r);
  }
  return [...achados];
}

const { listadas } = classificar(rotas());
const distancia = new Map([['/', 0]]);
let fronteira = ['/'];
for (const passo of [1, 2]) {
  const proxima = [];
  for (const r of fronteira) for (const l of links(r)) {
    if (!distancia.has(l)) { distancia.set(l, passo); proxima.push(l); }
  }
  fronteira = proxima;
}

const longe = listadas.filter(r => !distancia.has(r));
for (const r of listadas) {
  const d = distancia.get(r);
  console.log(`  ${d === undefined ? '✗' : '✓'} ${r.padEnd(34)} ${d === undefined ? 'mais de 2 cliques' : `${d} clique(s)`}`);
}
if (longe.length) {
  console.log(`\n✗ ${longe.length} página(s) pública(s) a mais de 2 cliques da capa: ${longe.join(' ')}`);
  process.exit(1);
}
console.log(`\n✓ as ${listadas.length} páginas do sitemap estão a no máximo 2 cliques da capa`);
