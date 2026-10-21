#!/usr/bin/env node
/* Abre cada endereço do livro (fontes, links oficiais, destinos dos QR
   codes) e diz quais respondem. Precisa de internet aberta: no ambiente onde
   o livro foi escrito, a rede bloqueia as páginas, e o resultado seria só
   "bloqueado". Rode na sua máquina ou numa Action antes de publicar.

   Uso: node tools/checar-links.mjs <livro>
   Saída: <livro>/auditoria/links.md */

import fs from 'node:fs';
import path from 'node:path';

const livro = process.argv[2] || 'israel-alem-do-roteiro';
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', livro);
const urls = new Map();
for (const d of ['fontes']) for (const f of fs.readdirSync(path.join(RAIZ, d)).filter(f => f.endsWith('.json'))) for (const x of JSON.parse(fs.readFileSync(path.join(RAIZ, d, f), 'utf8')).fontes || []) if (x.url) urls.set(x.url, `${x.id}`);
for (const f of fs.readdirSync(path.join(RAIZ, 'ativos/dados')).filter(f => /^links-.*\.json$/.test(f))) for (const x of JSON.parse(fs.readFileSync(path.join(RAIZ, 'ativos/dados', f), 'utf8'))) if (x.url) urls.set(x.url, `link ${x.titulo} (QR)`);

const linhas = ['# Verificação de links', '', `Executado em ${new Date().toISOString().slice(0, 10)}.`, '', '| Situação | Código | Endereço | Uso |', '| --- | --- | --- | --- |'];
let ruins = 0;
for (const [url, uso] of urls) {
  let cod = 'erro';
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (HebraicoFluente-checar-links)' } });
    cod = r.status;
  } catch (e) { cod = e.name === 'TimeoutError' ? 'tempo esgotado' : 'erro de rede'; }
  const ok = typeof cod === 'number' && cod < 400;
  if (!ok) ruins++;
  linhas.push(`| ${ok ? 'ok' : 'VERIFICAR'} | ${cod} | ${url} | ${uso} |`);
  process.stdout.write(ok ? '.' : 'x');
}
fs.writeFileSync(path.join(RAIZ, 'auditoria/links.md'), linhas.join('\n') + '\n');
console.log(`\n${urls.size} endereços, ${ruins} a verificar → auditoria/links.md`);
process.exit(ruins ? 1 : 0);
