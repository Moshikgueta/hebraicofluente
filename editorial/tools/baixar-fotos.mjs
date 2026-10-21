#!/usr/bin/env node
/* Baixa as fotografias escolhidas do Wikimedia Commons e CONFERE A LICENÇA
   NO METADADO DO PRÓPRIO ARQUIVO antes de aceitar cada uma.

   Por que existe: a pesquisa de imagens deste livro foi feita por busca, que
   mostra a licença "de segunda mão". Este script pergunta à API do Commons
   (imageinfo + extmetadata) a licença, o autor e se a atribuição é exigida,
   e só grava a foto se a licença estiver na lista das que permitem venda.
   Não precisa de chave nem de login.

   Também aceita a Library of Congress, só com "No known restrictions on
   publication" declarado na página do item.

   Precisa de internet aberta: NÃO roda no ambiente onde o livro foi escrito
   (a rede de lá bloqueia o Commons). Roda na Action "Fotos do livro"
   (.github/workflows/fotos-livro.yml) ou na sua máquina:
     cd editorial && node tools/baixar-fotos.mjs israel-alem-do-roteiro [--ids=foto-a,foto-b]

   Lê:   <livro>/manuscrito/*.md (cada ::: foto <id> é um lugar)
         <livro>/ativos/dados/fotos-escolhas.json (reservas por lugar, e as que pular)
         <livro>/ativos/dados/fotos-candidatas-capNN.json (campo url_pagina)
   Grava: <livro>/ativos/fotos/<lugar>.jpg (até 2000 px de largura)
          <livro>/ativos/fotos.json (crédito e licença CONFERIDOS de cada foto)
   Recusa: NC, ND, licença ausente, arquivo que não é foto. */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const so = (args.find(a => a.startsWith('--ids=')) || '').slice(6).split(',').filter(Boolean);
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', livro);
const DADOS = path.join(RAIZ, 'ativos/dados');
const DEST = path.join(RAIZ, 'ativos/fotos');
const REG = path.join(RAIZ, 'ativos/fotos.json');
const UA = 'HebraicoFluente-Editorial/1.0 (contato@hebraicofluente.com.br)';

/* Licenças aceitas para um e-book vendido. CC BY-SA entra marcada: o
   share-alike vale para a imagem adaptada; o dono confirma com o advogado. */
const ACEITAS = [/^public domain$/i, /^pd/i, /^cc0/i, /^cc by \d/i, /^cc by-sa \d/i];
const RECUSADAS = /\bnc\b|\bnd\b|non-?commercial|no ?deriv/i;

const candidatas = fs.readdirSync(DADOS).filter(f => /^fotos-candidatas-.*\.json$/.test(f))
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(DADOS, f), 'utf8')).candidatas || []);
const registro = fs.existsSync(REG) ? JSON.parse(fs.readFileSync(REG, 'utf8')) : { _: 'Gerado por tools/baixar-fotos.mjs a partir do metadado do Commons e da Library of Congress. Não editar à mão.', fotos: {} };
fs.mkdirSync(DEST, { recursive: true });
const limpar = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* Lugares de foto do manuscrito e, para cada um, as candidatas em ordem
   (ativos/dados/fotos-escolhas.json). A primeira cuja licença o arquivo
   confirma é a que fica; o registro guarda a foto com o id do LUGAR. */
const escolhas = fs.existsSync(path.join(DADOS, 'fotos-escolhas.json')) ? JSON.parse(fs.readFileSync(path.join(DADOS, 'fotos-escolhas.json'), 'utf8')) : { reservas: {}, pular: {} };
const lugares = fs.readdirSync(path.join(RAIZ, 'manuscrito')).filter(f => f.endsWith('.md')).sort()
  .flatMap(f => [...fs.readFileSync(path.join(RAIZ, 'manuscrito', f), 'utf8').matchAll(/^::: foto (\S+)/gm)].map(m => m[1]));
const porId = Object.fromEntries(candidatas.map(c => [c.id, c]));

async function json(url) { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
async function baixar(url, arq) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (!r.ok) throw new Error('HTTP ' + r.status + ' na imagem');
  const tipo = r.headers?.get?.('content-type') || 'image/jpeg';
  const b = Buffer.from(await r.arrayBuffer());
  if (!/^image\//.test(tipo) || b.length < 8 * 1024) throw new Error(`resposta não é uma foto (${tipo}, ${b.length} bytes)`);
  fs.writeFileSync(arq, b);
}

/* Wikimedia Commons: licença, autor e atribuição vêm do extmetadata do arquivo. */
async function doCommons(c, titulo, arq) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=2000&titles=${encodeURIComponent(titulo)}`;
  const info = Object.values((await json(api)).query.pages)[0].imageinfo?.[0];
  if (!info) return { recusa: `arquivo não existe no Commons (${titulo})` };
  const md = info.extmetadata || {};
  const licenca = limpar(md.LicenseShortName?.value);
  if (!/^image\/(jpeg|png|webp|tiff)$/.test(info.mime)) return { recusa: `${info.mime} não é foto` };
  if (!licenca || RECUSADAS.test(licenca) || !ACEITAS.some(r => r.test(licenca))) return { recusa: `licença "${licenca || 'ausente'}" recusada` };
  if (/all rights reserved/i.test(limpar(md.Artist?.value) + ' ' + limpar(md.Credit?.value))) return { recusa: `licença "${licenca}" contradita por "All rights reserved" no arquivo` };
  await baixar(info.thumburl || info.url, arq);
  const autor = limpar(md.Artist?.value) || null;
  return {
    fonte: 'Wikimedia Commons', pagina: `https://commons.wikimedia.org/wiki/${encodeURIComponent(titulo.replace(/ /g, '_'))}`, original: info.url,
    autor, licenca, licenca_url: md.LicenseUrl?.value || null, atribuicao_exigida: md.AttributionRequired?.value === 'true',
    credito: limpar(md.Attribution?.value) || [autor, licenca, 'via Wikimedia Commons'].filter(Boolean).join(', '),
    largura: info.thumbwidth || info.width, altura: info.thumbheight || info.height,
  };
}

/* Library of Congress: a página tem uma versão JSON (?fo=json). Só entra o
   que a própria página declara "No known restrictions on publication". */
async function doLoc(c, arq) {
  const url = c.url_pagina.replace(/^https?:\/\/(www\.)?loc\.gov/, 'https://www.loc.gov').replace(/\/PP$/, '/').replace(/\/?$/, '/');
  const j = await json(url + '?fo=json');
  const texto = JSON.stringify(j);
  if (!/no known restrictions/i.test(texto)) return { recusa: 'a Library of Congress não declara "no known restrictions" para o item' };
  const jpgs = [...new Set(texto.match(/https:\/\/tile\.loc\.gov\/[^"\\]+?\.jpg/g) || [])];
  const tam = u => { const m = u.match(/pct:(\d+)|_(\d+)px|(\d{3,4})v\.jpg|(\d{3,4})r\.jpg/); return m ? +(m[1] || m[2] || m[3] || m[4]) : (/\/full\//.test(u) ? 1000 : 0); };
  const melhor = jpgs.sort((a, b) => tam(b) - tam(a))[0];
  if (!melhor) return { recusa: 'item sem imagem JPEG na Library of Congress' };
  await baixar(melhor, arq);
  const item = j.item || {};
  const titulo = limpar(Array.isArray(item.title) ? item.title[0] : item.title) || c.titulo_arquivo;
  const autor = limpar([].concat(item.contributor_names || item.creator || [])[0]) || null;
  return {
    fonte: 'Library of Congress', pagina: url, original: melhor, autor, licenca: 'Sem restrições conhecidas de publicação (Library of Congress)', licenca_url: 'https://www.loc.gov/rr/print/res/rights.html',
    atribuicao_exigida: false, credito: [autor, `"${titulo}"`, 'Library of Congress, Prints and Photographs Division'].filter(Boolean).join(', '),
  };
}

let ok = 0; const faltam = [];
for (const lugar of lugares) {
  if (so.length && !so.includes(lugar)) continue;
  const fila = [lugar, ...(escolhas.reservas?.[lugar] || [])].filter(id => !escolhas.pular?.[id]);
  let feito = false;
  for (const id of fila) {
    const c = porId[id]; if (!c) { console.log(`  ${lugar}: candidata ${id} não existe`); continue; }
    const arq = path.join(DEST, `${lugar}.jpg`);
    const m = String(c.url_pagina || '').match(/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/);
    let r;
    try { r = m ? await doCommons(c, decodeURIComponent(m[1]).replace(/_/g, ' '), arq) : /loc\.gov/.test(c.url_pagina) ? await doLoc(c, arq) : { recusa: 'fonte desconhecida' }; }
    catch (e) { r = { recusa: `falha: ${e.message}` }; }
    if (r.recusa) { console.log(`✗ ${lugar} ← ${id}: ${r.recusa}`); continue; }
    registro.fotos[lugar] = { arquivo: `ativos/fotos/${lugar}.jpg`, candidata: id, assunto: c.assunto, ...r, share_alike: /\bsa\b|-sa\b/i.test(r.licenca), conferido_em: new Date().toISOString().slice(0, 10) };
    console.log(`✓ ${lugar} ← ${id}: ${r.licenca} · ${r.autor || 'sem autor'}`); ok++; feito = true; break;
  }
  if (!feito) faltam.push(lugar);
}
console.log(`\n${ok} lugares com foto conferida; sem foto aceitável: ${faltam.length ? faltam.join(', ') : 'nenhum'}`);
fs.writeFileSync(REG, JSON.stringify(registro, null, 2) + '\n');
console.log(`registro: ${path.relative(process.cwd(), REG)} (${Object.keys(registro.fotos).length} fotos)`);
