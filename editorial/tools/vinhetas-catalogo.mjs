#!/usr/bin/env node
/* Catálogo das vinhetas (tools/lib/vinhetas.mjs): uma página HTML com todas,
   e o nome de cada uma, para escolher a de cada seção.
   Uso: node tools/vinhetas-catalogo.mjs <livro>  →  <livro>/saida/vinhetas.html (+ .png) */
import fs from 'node:fs';
import path from 'node:path';
import { VINHETAS, vinheta } from './lib/vinhetas.mjs';
const AQUI = path.dirname(new URL(import.meta.url).pathname);
const livro = process.argv[2] || 'israel-alem-do-roteiro';
const SAIDA = path.join(AQUI, '..', livro, 'saida');
fs.mkdirSync(SAIDA, { recursive: true });
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:20px;background:#FBF9F5;font:14px system-ui;display:grid;grid-template-columns:repeat(8,1fr);gap:14px}div{text-align:center}svg{width:100%;height:auto}</style>${VINHETAS.map(id => `<div>${vinheta(id)}<br>${id}</div>`).join('')}`;
fs.writeFileSync(path.join(SAIDA, 'vinhetas.html'), html);
const { chromium } = await import('playwright-core');
const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
await p.goto('file://' + path.join(SAIDA, 'vinhetas.html'));
await p.screenshot({ path: path.join(SAIDA, 'vinhetas.png'), fullPage: true });
await b.close();
console.log(`${VINHETAS.length} vinhetas → ${path.relative(process.cwd(), path.join(SAIDA, 'vinhetas.png'))}`);
