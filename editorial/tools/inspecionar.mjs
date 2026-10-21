#!/usr/bin/env node
/* Inspeção visual do livro paginado: folhas de contato (várias páginas por
   imagem) e páginas avulsas em tamanho de leitura, a partir do HTML que o
   build.mjs deixa em saida/. Serve para achar texto cortado, página quase
   vazia, hebraico desalinhado e figura estourada sem abrir o PDF.

   Uso:
     node tools/inspecionar.mjs <livro> [--formato=digital|a4|capitulo-03|livro-revista] [--por=24] [--paginas=1,5,9]
   --formato aceita também o nome de uma saída do revista.mjs (saida/<nome>.html).
   Saída: <livro>/saida/inspecao/ */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const formato = opt.formato || 'digital';
const POR = Number(opt.por || 24);
const RAIZ = path.resolve(AQUI, '..', livro);
const html = [`livro-${formato}.html`, `${formato}.html`].map(n => path.join(RAIZ, 'saida', n)).find(f => fs.existsSync(f)) || path.join(RAIZ, 'saida', `livro-${formato}.html`);
const dest = path.join(RAIZ, 'saida', 'inspecao');
fs.mkdirSync(dest, { recursive: true });

const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1800, height: 1200 } });
await p.goto('file://' + html);
await p.waitForFunction(() => window.__pronto === true, null, { timeout: 300000 });

/* Medidas que denunciam problema: conteúdo maior que a área da página
   (corte) e página com quase nada (sobra de quebra). */
const relatorio = await p.evaluate(() => [...document.querySelectorAll('.pagedjs_page')].map((pg, i) => {
  const area = pg.querySelector('.pagedjs_page_content');
  const r = area.getBoundingClientRect();
  let maxBottom = 0, texto = 0;
  for (const el of area.querySelectorAll('p, li, h1, h2, h3, figure, aside, table, dd, dt')) {
    const q = el.getBoundingClientRect(); if (q.height) maxBottom = Math.max(maxBottom, q.bottom);
  }
  texto = (area.innerText || '').trim().length;
  return { pagina: i + 1, transbordou: maxBottom - r.bottom > 2, caracteres: texto, ocupacao: Math.round(Math.max(0, Math.min(1, (maxBottom - r.top) / r.height)) * 100) };
}));
const problemas = relatorio.filter(x => x.transbordou || (x.caracteres > 0 && x.caracteres < 120));
fs.writeFileSync(path.join(dest, 'relatorio.json'), JSON.stringify({ paginas: relatorio.length, problemas, relatorio }, null, 1));
console.log(`${relatorio.length} páginas; transbordo em: ${relatorio.filter(x => x.transbordou).map(x => x.pagina).join(', ') || 'nenhuma'}; quase vazias: ${relatorio.filter(x => x.caracteres > 0 && x.caracteres < 120).map(x => x.pagina).join(', ') || 'nenhuma'}`);

/* Folhas de contato. */
await p.addStyleTag({ content: `
  body { background: #888 !important; }
  .pagedjs_pages { display: flex !important; flex-wrap: wrap; gap: 14px; padding: 14px; width: 1780px; }
  .pagedjs_page { margin: 0 !important; box-shadow: 0 1px 4px rgba(0,0,0,.4); }
  .pagedjs_page.oculta { display: none !important; }
  .pagedjs_page::after { content: attr(data-page-number); position: absolute; top: 2px; left: 4px; background: #000; color: #fff; font: 11px sans-serif; padding: 0 3px; }
` });
await p.evaluate(() => document.querySelectorAll('.pagedjs_page').forEach(pg => { pg.style.position = 'relative'; }));
const total = relatorio.length;
const escolhidas = opt.paginas ? String(opt.paginas).split(',').map(Number) : null;
if (escolhidas) {
  await p.evaluate(() => document.querySelectorAll('.pagedjs_page').forEach(pg => pg.classList.add('oculta')));
  for (const n of escolhidas) {
    await p.evaluate(n => { document.querySelectorAll('.pagedjs_page').forEach(pg => pg.classList.add('oculta')); document.querySelectorAll('.pagedjs_page')[n - 1].classList.remove('oculta'); }, n);
    const el = await p.$$('.pagedjs_page:not(.oculta)');
    await el[0].screenshot({ path: path.join(dest, `pagina-${String(n).padStart(3, '0')}.png`) });
  }
} else {
  await p.addStyleTag({ content: `.pagedjs_page { zoom: .42; }` });
  for (let i = 0; i < total; i += POR) {
    await p.evaluate(([a, z]) => document.querySelectorAll('.pagedjs_page').forEach((pg, k) => pg.classList.toggle('oculta', k < a || k >= z)), [i, i + POR]);
    const box = await p.$('.pagedjs_pages');
    await box.screenshot({ path: path.join(dest, `contato-${String(i + 1).padStart(3, '0')}.png`) });
  }
}
await b.close();
console.log('imagens em', path.relative(path.resolve(AQUI, '..'), dest));
