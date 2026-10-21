#!/usr/bin/env node
/* Baixa as fotografias escolhidas do Wikimedia Commons e CONFERE A LICENÇA
   NO METADADO DO PRÓPRIO ARQUIVO antes de aceitar cada uma.

   Por que existe: a pesquisa de imagens deste livro foi feita por busca, que
   mostra a licença "de segunda mão". Este script pergunta à API do Commons
   (imageinfo + extmetadata) a licença, o autor e se a atribuição é exigida,
   e só grava a foto se a licença estiver na lista das que permitem venda.
   Não precisa de chave nem de login.

   Precisa de internet aberta: NÃO roda no ambiente onde o livro foi escrito
   (a rede de lá bloqueia o Commons). Rode na sua máquina ou numa Action:
     cd editorial && node tools/baixar-fotos.mjs israel-alem-do-roteiro [--ids=foto-a,foto-b]

   Lê:   <livro>/ativos/dados/fotos-candidatas-capNN.json (campo url_pagina)
   Grava: <livro>/ativos/fotos/<id>.jpg (2400 px no lado maior)
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
const registro = fs.existsSync(REG) ? JSON.parse(fs.readFileSync(REG, 'utf8')) : { _: 'Gerado por tools/baixar-fotos.mjs a partir do metadado do Commons. Não editar à mão.', fotos: {} };
fs.mkdirSync(DEST, { recursive: true });
const limpar = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

for (const c of candidatas) {
  if (so.length && !so.includes(c.id)) continue;
  const m = String(c.url_pagina || '').match(/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/);
  if (!m) { console.log(`- ${c.id}: sem página do Commons, ignorada`); continue; }
  const titulo = decodeURIComponent(m[1]);
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=2400&titles=${encodeURIComponent(titulo)}`;
  let info;
  try { info = Object.values((await (await fetch(api, { headers: { 'User-Agent': UA } })).json()).query.pages)[0].imageinfo?.[0]; }
  catch (e) { console.log(`! ${c.id}: falha na API (${e.message})`); continue; }
  if (!info) { console.log(`! ${c.id}: arquivo não existe no Commons (${titulo})`); continue; }
  const md = info.extmetadata || {};
  const licenca = limpar(md.LicenseShortName?.value);
  if (!/^image\/(jpeg|png|webp)$/.test(info.mime)) { console.log(`- ${c.id}: ${info.mime} não é foto`); continue; }
  if (!licenca || RECUSADAS.test(licenca) || !ACEITAS.some(r => r.test(licenca))) { console.log(`✗ ${c.id}: licença "${licenca || 'ausente'}" recusada`); continue; }
  const arq = path.join(DEST, `${c.id}.jpg`);
  const img = await fetch(info.thumburl || info.url, { headers: { 'User-Agent': UA } });
  fs.writeFileSync(arq, Buffer.from(await img.arrayBuffer()));
  registro.fotos[c.id] = {
    arquivo: `ativos/fotos/${c.id}.jpg`, assunto: c.assunto, pagina: c.url_pagina, original: info.url,
    autor: limpar(md.Artist?.value) || null, licenca, licenca_url: md.LicenseUrl?.value || null,
    atribuicao_exigida: md.AttributionRequired?.value === 'true',
    credito: limpar(md.Attribution?.value) || `${limpar(md.Artist?.value)}, ${licenca}, via Wikimedia Commons`,
    share_alike: /sa/i.test(licenca), largura: info.thumbwidth || info.width, altura: info.thumbheight || info.height,
    conferido_em: new Date().toISOString().slice(0, 10),
  };
  console.log(`✓ ${c.id}: ${licenca} · ${registro.fotos[c.id].autor}`);
}
fs.writeFileSync(REG, JSON.stringify(registro, null, 2) + '\n');
console.log(`registro: ${path.relative(process.cwd(), REG)} (${Object.keys(registro.fotos).length} fotos)`);
