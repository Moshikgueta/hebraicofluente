#!/usr/bin/env node
/* Ilustrações do livro no estilo "papel recortado" (DESIGN-SYSTEM.md, seção
   8; aprovado pelo dono em 21/10/2026, só desenho SVG, nada gerado por IA).
   Saem em <livro>/ativos/ilustracoes/<id>.svg; o PDF e a web as acham pelo id,
   como as figuras de ativos/mapas e ativos/infograficos.

   Cada desenho diz no código de onde vem cada número e cada posição (id da
   afirmação). Esquema "fora de escala" quer dizer: a posição RELATIVA dos
   lugares é a das fontes; distâncias e formas não são medidas.

   Cada capítulo tem o seu módulo em tools/ilustracoes/capNN.mjs, que exporta
   uma função (ctx) => { svgs: {id: svg}, pontos?: {figura: [...]} }. Os
   pontos viram ativos/dados/<figura>-pontos.json (mapas tocáveis da web).

   Uso: node tools/ilustracoes.mjs israel-alem-do-roteiro [--so=cap03,cap05] */

import fs from 'node:fs';
import path from 'node:path';
import { C, esc, estilo, defs, prefixo, carregarNE } from './lib/desenho.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const livro = process.argv.slice(2).find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const RAIZ = path.join(AQUI, '..', livro);
const SAIDA = path.join(RAIZ, 'ativos/ilustracoes');
fs.mkdirSync(SAIDA, { recursive: true });
const { disputa } = carregarNE(RAIZ);
const svg = (W, H, rotulo, corpo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(rotulo)}">${estilo()}${defs()}<g fill="${C.tinta}">${corpo}</g></svg>`;
const t = (x, y, txt, o = {}) => `<text class="${o.cls || 't'}" x="${x}" y="${y}" font-size="${o.s || 16}"${o.w ? ` font-weight="${o.w}"` : ''}${o.a ? ` text-anchor="${o.a}"` : ''}${o.i ? ' font-style="italic"' : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''} fill="${o.f || C.corpo}">${esc(txt)}</text>`;
const sombra = (d, dx = 6, dy = 8) => `<path d="${d}" transform="translate(${dx} ${dy})" fill="${C.pedraEsc}"/>`;


const so = (process.argv.find(a => a.startsWith('--so=')) || '').slice(5).split(',').filter(Boolean);
const DIR = path.join(AQUI, 'ilustracoes');
const ctx = { ...carregarNE(RAIZ), disputa, svg, t, sombra, C, esc, RAIZ };
for (const arq of fs.readdirSync(DIR).filter(f => /^cap\d+\.mjs$/.test(f)).sort()) {
  if (so.length && !so.includes(arq.replace('.mjs', ''))) continue;
  const { svgs = {}, pontos = {} } = (await import(path.join(DIR, arq))).default(ctx);
  for (const [id, s] of Object.entries(svgs)) fs.writeFileSync(path.join(SAIDA, id + '.svg'), prefixo(s, id));
  for (const [fig, lista] of Object.entries(pontos)) fs.writeFileSync(path.join(RAIZ, 'ativos/dados', fig + '-pontos.json'), JSON.stringify(lista, null, 1) + '\n');
  console.log(arq + ':', Object.keys(svgs).join(', '));
}
