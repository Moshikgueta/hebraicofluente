/* O relatório do teste A/B da capa (28/09/2026).
 * Lê de stdin a saída de `wrangler d1 execute --json` com as linhas de
 * `ab_contagens` e escreve uma tabela em markdown: totais por versão, as
 * taxas e se a diferença já é confiável (teste de duas proporções).
 *
 *   ... --json --command "SELECT variante, evento, SUM(n) AS n FROM ab_contagens
 *        WHERE exp = 'hero-2026-09' GROUP BY variante, evento" | node tools/relatorio-ab.mjs
 */

import { readFileSync } from 'node:fs';

const entrada = readFileSync(0, 'utf8');
let linhas = [];
try {
  const j = JSON.parse(entrada);
  linhas = (Array.isArray(j) ? j : [j]).flatMap(r => r.results || []);
} catch {
  console.log('Não consegui ler o resultado da consulta.');
  process.exit(1);
}

const t = { a: {}, b: {} };
for (const { variante, evento, n } of linhas) if (t[variante]) t[variante][evento] = Number(n) || 0;
const v = (x, e) => t[x][e] || 0;
const pct = (num, den) => (den ? `${(100 * num / den).toFixed(1)}%` : '-');

/* Duas proporções: z e o p bilateral. Devolve null quando não há dados. */
function compara(ka, na, kb, nb) {
  if (!na || !nb) return null;
  const pa = ka / na, pb = kb / nb, p = (ka + kb) / (na + nb);
  const se = Math.sqrt(p * (1 - p) * (1 / na + 1 / nb));
  if (!se) return null;
  const z = (pb - pa) / se;
  const phi = x => 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)));
  return { z, p: 2 * (1 - phi(Math.abs(z))) };
}

const out = [];
out.push('## Teste A/B do hero da capa (`hero-2026-09`)', '');
out.push('A = híbrido ("Ler e escrever hebraico, do zero." + os três desejos). B = as perguntas ("Quer viajar para Israel? Ler as letras da Bíblia no original?").', '');
out.push('| | A | B |', '|---|---:|---:|');
out.push(`| Viram o hero | ${v('a', 'visto')} | ${v('b', 'visto')} |`);
out.push(`| Clicaram no botão | ${v('a', 'clique')} (${pct(v('a', 'clique'), v('a', 'visto'))}) | ${v('b', 'clique')} (${pct(v('b', 'clique'), v('b', 'visto'))}) |`);
out.push(`| Chegaram ao checkout | ${v('a', 'checkout')} (${pct(v('a', 'checkout'), v('a', 'visto'))}) | ${v('b', 'checkout')} (${pct(v('b', 'checkout'), v('b', 'visto'))}) |`);
out.push(`| Compraram | ${v('a', 'compra')} (${pct(v('a', 'compra'), v('a', 'visto'))}) | ${v('b', 'compra')} (${pct(v('b', 'compra'), v('b', 'visto'))}) |`);
out.push('');

for (const [evento, nome] of [['clique', 'clique no botão'], ['checkout', 'chegada ao checkout'], ['compra', 'compra']]) {
  const c = compara(v('a', evento), v('a', 'visto'), v('b', evento), v('b', 'visto'));
  if (!c) { out.push(`- **${nome}:** ainda sem dados.`); continue; }
  const lado = c.z > 0 ? 'B' : 'A';
  const veredito = c.p < 0.05
    ? `diferença confiável a favor de **${lado}** (p = ${c.p.toFixed(3)})`
    : `ainda sem diferença confiável (p = ${c.p.toFixed(2)}); é preciso mais visitas`;
  out.push(`- **${nome}:** ${veredito}.`);
}
out.push('', '_Confiável = p < 0,05. Com poucas compras, decida pelo clique e pelo checkout e confirme pelas compras._');
console.log(out.join('\n'));
