#!/usr/bin/env node
/* Experiência digital (protótipo) a partir da MESMA base do PDF.

   Uso: node tools/web.mjs <livro> [--capitulos=01-israel-no-mapa.md] [--diario=10-diario.md]
   Saída: <livro>/saida/web/ (index.html + assets/), abre direto no navegador.

   É um protótipo para aprovação, não a integração na plataforma: guarda
   progresso, favoritos, respostas e diário no próprio aparelho
   (localStorage). Na plataforma, o mesmo JSON sai de uma rota com sessão e
   direito de acesso, e o estado vai para a conta (ver redesenho/ARQUITETURA.md).

   Áudio: só gravação humana do curso (audio/<id>.mp3). Palavra sem gravação
   mostra o botão desligado, nunca voz sintética. */

import fs from 'node:fs';
import path from 'node:path';
import { compilarCapitulo, registros } from './lib/conteudo.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const RAIZ = path.join(EDITORIAL, livro);
const OUT = path.join(RAIZ, 'saida/web');
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const existe = p => fs.existsSync(p);
const arquivos = String(opt.capitulos || '01-israel-no-mapa.md').split(',');
const regs = registros(RAIZ);
const meta = lerJSON(path.join(RAIZ, 'livro.json'));
const ativos = lerJSON(path.join(RAIZ, 'ativos/registro-de-ativos.json')).ativos;
const candidatas = fs.readdirSync(path.join(RAIZ, 'ativos/dados')).filter(f => /^fotos-candidatas-.*\.json$/.test(f)).flatMap(f => lerJSON(path.join(RAIZ, 'ativos/dados', f)).candidatas || []);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets/audio'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets/fontes'), { recursive: true });

const svgs = {};
const svgDe = id => {
  const arq = ['ativos/mapas', 'ativos/infograficos'].map(d => path.join(RAIZ, d, id + '.svg')).find(existe);
  if (arq && !svgs[id]) svgs[id] = fs.readFileSync(arq, 'utf8').replace(/<\?xml[^>]*>/, '');
  return arq ? id : null;
};

const caps = arquivos.map(a => compilarCapitulo(RAIZ, a, regs));
const diario = opt.diario !== false && existe(path.join(RAIZ, 'manuscrito', String(opt.diario || '10-diario.md'))) ? compilarCapitulo(RAIZ, String(opt.diario || '10-diario.md'), regs) : null;

/* Áudio: copia só as gravações que existem; o resto fica sem src. Os itens
   do vocabulário do capítulo são os mesmos objetos dos blocos. */
for (const c of [...caps]) for (const v of c.vocabulario) if (v.audio?.gravado) { fs.copyFileSync(v.audio.arquivo, path.join(OUT, 'assets/audio', v.audio.id + '.mp3')); v.audio = { src: `assets/audio/${v.audio.id}.mp3` }; } else v.audio = null;
for (const c of caps) for (const s of c.secoes) for (const b of s.blocos) {
  if (['figura', 'visual'].includes(b.tipo)) { b.svg = svgDe(b.id); b.ativo = ativos.find(a => a.id === b.id) || null; }
  if (b.tipo === 'foto') b.candidata = candidatas.find(x => x.id === b.id) || null;
}
for (const c of caps) if (c.abertura.imagem) svgDe(c.abertura.imagem);

const pontos = {};
for (const f of fs.readdirSync(path.join(RAIZ, 'ativos/dados')).filter(f => /-pontos\.json$/.test(f))) pontos[f.replace(/-pontos\.json$/, '')] = lerJSON(path.join(RAIZ, 'ativos/dados', f));

const indice = meta.capitulos.map((c, k) => {
  const disp = caps.find(x => x.numero === k + 1);
  let titulo = null; try { titulo = fs.readFileSync(path.join(RAIZ, 'manuscrito', c.arquivo), 'utf8').match(/^titulo:\s*(.*)$/m)?.[1]; } catch {}
  return { n: k + 1, titulo, disponivel: !!disp, id: disp?.id || null };
});

/* Fontes tipográficas: copiadas para a pasta do protótipo. */
const FONTES = [
  ['node_modules/@fontsource-variable/literata/files/literata-latin-opsz-normal.woff2', 'literata.woff2'],
  ['node_modules/@fontsource-variable/literata/files/literata-latin-opsz-italic.woff2', 'literata-italico.woff2'],
  ['../assets/fonts/instrument-sans-latin-400-normal.woff2', 'instrument-400.woff2'],
  ['../assets/fonts/instrument-sans-latin-600-normal.woff2', 'instrument-600.woff2'],
  ['../assets/fonts/bricolage-grotesque-latin-700-normal.woff2', 'bricolage-700.woff2'],
  ['../assets/fonts/noto-serif-hebrew-hebrew-400-normal.woff2', 'noto-serif-hebrew.woff2'],
];
for (const [de, para] of FONTES) fs.copyFileSync(path.join(EDITORIAL, de), path.join(OUT, 'assets/fontes', para));
const faces = `@font-face{font-family:'Literata';font-weight:200 900;src:url(assets/fontes/literata.woff2) format('woff2');font-display:swap}
@font-face{font-family:'Literata';font-style:italic;font-weight:200 900;src:url(assets/fontes/literata-italico.woff2) format('woff2');font-display:swap}
@font-face{font-family:'Instrument Sans';font-weight:400;src:url(assets/fontes/instrument-400.woff2) format('woff2');font-display:swap}
@font-face{font-family:'Instrument Sans';font-weight:600;src:url(assets/fontes/instrument-600.woff2) format('woff2');font-display:swap}
@font-face{font-family:'Bricolage Grotesque';font-weight:700;src:url(assets/fontes/bricolage-700.woff2) format('woff2');font-display:swap}
@font-face{font-family:'Noto Serif Hebrew';src:url(assets/fontes/noto-serif-hebrew.woff2) format('woff2');font-display:swap}`;

const dados = { titulo: meta.titulo, subtitulo: meta.subtitulo, indice, capitulos: caps, diario, svgs, pontos, gerado_em: new Date().toISOString().slice(0, 10) };
const css = fs.readFileSync(path.join(EDITORIAL, 'templates/tokens-editorial.css'), 'utf8') + '\n' + fs.readFileSync(path.join(EDITORIAL, 'templates/web.css'), 'utf8');
const app = fs.readFileSync(path.join(EDITORIAL, 'templates/web-app.js'), 'utf8');
const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.titulo}</title><meta name="description" content="${meta.subtitulo}">
<style>${faces}\n${css}</style></head>
<body><a class="vis-oculto" href="#conteudo">Pular para o conteúdo</a>
<header class="topo"><div class="linha"><a class="marca" href="#inicio">${meta.titulo}</a><nav aria-label="Seções"><a href="#inicio">Início</a><a href="#glossario">Glossário</a><a href="#diario">Diário</a></nav></div><div class="progresso" aria-hidden="true"><i></i></div></header>
<main id="conteudo" tabindex="-1"></main>
<div id="folha" class="folha" role="dialog" aria-modal="false" aria-labelledby="folha-t" hidden></div>
<script type="application/json" id="dados">${JSON.stringify(dados).replace(/</g, '\\u003c')}</script>
<script>${app}</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);

/* Versão para publicar como página (Artifact): sem doctype/head/body (a
   plataforma envolve o arquivo), fontes e áudio embutidos em data: URI,
   porque a página publicada só carrega fontes do Google e não lê arquivos
   locais. Mesmo conteúdo, mesmo app. */
if (opt.artefato) {
  const b64 = f => fs.readFileSync(f).toString('base64');
  const facesEmb = faces.replace(/url\(assets\/fontes\/([\w.-]+)\)/g, (_, n) => `url(data:font/woff2;base64,${b64(path.join(OUT, 'assets/fontes', n))})`);
  const dadosEmb = JSON.parse(JSON.stringify(dados));
  for (const c of dadosEmb.capitulos) for (const v of c.vocabulario) if (v.audio) v.audio.src = `data:audio/mpeg;base64,${b64(path.join(OUT, v.audio.src))}`;
  for (const c of dadosEmb.capitulos) for (const s of c.secoes) for (const b of s.blocos) if (b.tipo === 'vocabulario') for (const i of b.itens) { const v = c.vocabulario.find(x => x.he === i.he); if (v) i.audio = v.audio; }
  const art = `<title>${meta.titulo}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${facesEmb}\n${css}</style>
<a class="vis-oculto" href="#conteudo">Pular para o conteúdo</a>
<header class="topo"><div class="linha"><a class="marca" href="#inicio">${meta.titulo}</a><nav aria-label="Seções"><a href="#inicio">Início</a><a href="#glossario">Glossário</a><a href="#diario">Diário</a></nav></div><div class="progresso" aria-hidden="true"><i></i></div></header>
<main id="conteudo" tabindex="-1"></main>
<div id="folha" class="folha" role="dialog" aria-modal="false" aria-labelledby="folha-t" hidden></div>
<script type="application/json" id="dados">${JSON.stringify(dadosEmb).replace(/</g, '\\u003c')}</script>
<script>${app}</script>`;
  fs.writeFileSync(path.join(OUT, 'artefato.html'), art);
  console.log(`artefato: ${path.relative(EDITORIAL, path.join(OUT, 'artefato.html'))} (${Math.round(art.length / 1024)} KB)`);
}
console.log(`web: ${path.relative(EDITORIAL, OUT)}/index.html (${Math.round(html.length / 1024)} KB, ${fs.readdirSync(path.join(OUT, 'assets/audio')).length} áudios)`);
