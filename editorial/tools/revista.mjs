#!/usr/bin/env node
/* PDF da edição redesenhada, a partir da base estruturada (tools/lib/conteudo.mjs).

   Uso: node tools/revista.mjs <livro> --capitulos=01-israel-no-mapa.md [--saida=piloto-cap01]

   Gera <livro>/saida/<saida>.pdf e <saida>.html, e um relatório dos QR codes
   (<saida>-qr.json): cada código é desenhado e LIDO DE VOLTA (jsQR) para
   provar que leva ao endereço registrado. Se abrir o endereço é outra
   pergunta: a rede deste ambiente não deixa; tools/checar-links.mjs faz isso
   fora daqui.

   Nada de texto é escrito aqui: tudo vem do JSON compilado. */

import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { compilarCapitulo, registros, esc } from './lib/conteudo.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const RAIZ = path.join(EDITORIAL, livro);
const SAIDA = path.join(RAIZ, 'saida');
const nome = opt.saida || 'piloto';
const arquivos = String(opt.capitulos || '01-israel-no-mapa.md').split(',');
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const existe = p => fs.existsSync(p);

const regs = registros(RAIZ);
const ativos = existe(path.join(RAIZ, 'ativos/registro-de-ativos.json')) ? lerJSON(path.join(RAIZ, 'ativos/registro-de-ativos.json')).ativos : [];
const fotosOk = existe(path.join(RAIZ, 'ativos/fotos.json')) ? lerJSON(path.join(RAIZ, 'ativos/fotos.json')).fotos : {};
const candidatas = fs.readdirSync(path.join(RAIZ, 'ativos/dados')).filter(f => /^fotos-candidatas-.*\.json$/.test(f)).flatMap(f => lerJSON(path.join(RAIZ, 'ativos/dados', f)).candidatas || []);
const relQR = [];

const svgDe = id => {
  const arq = ['ativos/mapas', 'ativos/infograficos'].map(d => path.join(RAIZ, d, id + '.svg')).find(existe);
  return arq ? fs.readFileSync(arq, 'utf8').replace(/<\?xml[^>]*>/, '') : null;
};

function foto(id, { classe = '', assunto = '' } = {}) {
  const ok = fotosOk[id];
  if (ok && existe(path.join(RAIZ, ok.arquivo))) return { html: `<img src="file://${path.join(RAIZ, ok.arquivo)}" alt="${esc(ok.assunto || '')}">`, credito: `Foto: ${esc(ok.credito)}` };
  const c = candidatas.find(x => x.id === id);
  if (c) return { html: `<div class="foto-pendente ${classe}"><span class="etiqueta">Fotografia a inserir</span><span class="assunto">${assunto ? assunto.replace(/<[^>]+>/g, '') : esc(c.assunto || c.titulo_arquivo)}</span><span class="cand">Escolhida: ${esc(c.titulo_arquivo)} · ${esc(c.autor || 'autor a confirmar')} · ${esc(c.licenca_declarada || 'licença a confirmar')} · Wikimedia Commons</span></div>`, credito: 'Licença a conferir com tools/baixar-fotos.mjs antes de usar.' };
  return { html: `<div class="foto-pendente ${classe}"><span class="etiqueta">Fotografia a escolher</span><span class="assunto">${esc(id)}</span></div>`, credito: '' };
}

async function qr(url) {
  const svg = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0E3B43', light: '#0000' } });
  /* Prova de leitura: desenha em PNG e decodifica. */
  const png = PNG.sync.read(await QRCode.toBuffer(url, { margin: 2, scale: 6, errorCorrectionLevel: 'M' }));
  const lido = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data || null;
  relQR.push({ url, lido, confere: lido === url });
  return svg;
}

async function bloco(b, cap, ctx) {
  switch (b.tipo) {
    case 'p': return `<p>${b.html}</p>`;
    case 'h3': return `<h3>${b.html}</h3>`;
    case 'lista': return `<ul class="lista">${b.itens.map(i => `<li>${i}</li>`).join('')}</ul>`;
    case 'citacao': return `<blockquote class="citacao">${b.html}</blockquote>`;
    case 'figura': {
      const svg = svgDe(b.id); const a = ativos.find(x => x.id === b.id); ctx.fig++;
      if (!svg) return `<figure><div class="foto-pendente"><span class="etiqueta">Figura pendente</span><span class="assunto">${esc(b.id)}</span></div></figure>`;
      return `<figure class="larga" id="fig-${b.id}">${svg}<figcaption><span class="num">Fig. ${cap.numero}.${ctx.fig}</span>${a ? `<b>${esc(a.titulo)}.</b> ` : ''}${b.legenda}<span class="credito">${esc(a?.credito_curto || '')}</span></figcaption></figure>`;
    }
    case 'foto': {
      const f = foto(b.id, { classe: b.formato === 'vertical' ? 'vertical' : '', assunto: b.legenda });
      /* Vertical: grade de duas colunas (legenda em destaque | foto). Float
         não serve: o Paged.js descarta a figura flutuante na quebra. */
      if (b.formato === 'vertical') return `<figure class="par"><figcaption><span class="grande">${b.legenda}</span><span class="credito">${f.credito}</span></figcaption>${f.html}</figure>`;
      return `<figure class="larga">${f.html}<figcaption>${b.legenda}<span class="credito">${f.credito}</span></figcaption></figure>`;
    }
    case 'visual': {
      const svg = svgDe(b.id); const f = svg ? { html: svg, credito: ativos.find(x => x.id === b.id)?.credito_curto || '' } : foto(b.id);
      return `<section class="visual${b.escuro ? ' escuro' : ''}"><div class="alvo">${f.html}</div><div class="legenda">${b.legenda} <span>${esc(f.credito)}</span></div></section>`;
    }
    case 'dado': return `<div class="dado"><span class="numero">${esc(b.numero)}</span><span class="rotulo">${b.rotulo}${b.nota ? `<span class="nota">${b.nota}</span>` : ''}</span></div>`;
    case 'vocabulario': return `<div class="vocab"><div class="cab"><span>${b.titulo ? esc(b.titulo) : 'Em hebraico'}</span><span class="he">עִבְרִית</span></div><ol>${b.itens.map(i => `<li><span class="p-he" lang="he" dir="rtl">${esc(i.he)}</span><span class="p-tr">${esc(i.translit)}<em>${esc(i.pt)}</em>${i.audio?.gravado ? '<span class="audio">· áudio na versão digital</span>' : ''}</span>${i.nota ? `<span class="p-nota">${i.nota}</span>` : ''}</li>`).join('')}</ol></div>`;
    case 'caixa': {
      const corpo = (await Promise.all(b.blocos.map(x => bloco(x, cap, ctx)))).join('');
      const fundo = ['historia-ou-tradicao', 'aviso', 'olhar-israelense'].includes(b.variante);
      const pend = b.pendente ? ' pendente-autor' : '';
      return fundo
        ? `<aside class="caixa-fundo ${b.variante}${pend}"><span class="rot">${esc(b.rotulo)}</span>${b.titulo ? `<span class="tit">${b.titulo}</span>` : ''}${corpo}</aside>`
        : `<aside class="nota-lateral ${b.variante}${pend}"><span class="rot">${esc(b.rotulo)}</span>${b.titulo ? `<span class="tit">${b.titulo}</span>` : ''}${corpo}</aside>`;
    }
    case 'link': {
      if (!b.link?.url) return '';
      return `<div class="link-qr">${await qr(b.link.url)}<div><div class="inst">${esc(b.link.instituicao || '')}</div><div class="tit"><a href="${esc(b.link.url)}">${esc(b.link.titulo)}</a></div><div class="url">${esc(b.link.url.replace(/^https?:\/\//, ''))}</div>${b.texto ? `<div class="desc">${b.texto}</div>` : b.link.para_que_serve ? `<div class="desc">${esc(b.link.para_que_serve)}</div>` : ''}</div></div>`;
    }
    case 'observacao': return `<div class="observacao"><b>${b.titulo}</b>${b.texto}</div>`;
    case 'quiz': case 'vf': return ''; // vão para "Perguntas e descobertas"
    case 'linha-do-tempo': {
      /* Antes de Cristo em dourado, depois em teal: a divisão do calendário
         é informação, não enfeite. */
      const ac = d => /a\.\s?C\./.test(d.replace(/<[^>]+>/g, ''));
      return `<section class="ldt">${b.titulo ? `<div class="ldt-tit">${esc(b.titulo)}</div>` : ''}<ol>${b.itens.map(i => `<li class="${ac(i.data) ? 'ac' : 'dc'}"><span class="ldt-data">${i.data}</span><span class="ldt-ev">${i.evento}</span></li>`).join('')}</ol></section>`;
    }
    default: return b.html ? `<p>${b.html}</p>` : '';
  }
}

async function capitulo(arq) {
  const cap = compilarCapitulo(RAIZ, arq, regs);
  const ctx = { fig: 0 };
  const notas = []; const idxNota = new Map();
  const numeroNota = f => { if (!idxNota.has(f.id)) { notas.push(f); idxNota.set(f.id, notas.length); } return idxNota.get(f.id); };

  const ab = cap.abertura;
  const imgAb = ab.imagem ? (svgDe(ab.imagem) ? { html: svgDe(ab.imagem).replace(/preserveAspectRatio="[^"]*"/, 'preserveAspectRatio="xMidYMax slice"'), credito: ativos.find(x => x.id === ab.imagem)?.credito_curto || '' } : foto(ab.imagem)) : { html: '', credito: '' };
  let h = `<section class="abertura" id="${cap.id}"><div class="imagem${svgDe(ab.imagem || '') ? ' baixa' : ''}">${imgAb.html}</div><div class="veu"></div><div class="texto"><div class="kicker"><span>Capítulo ${String(cap.numero).padStart(2, '0')}</span><span class="he">${['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'][cap.numero] || ''}</span></div><h1 data-cap="${esc(cap.titulo)}">${esc(cap.titulo)}</h1>${ab.frase ? `<div class="frase">${ab.frase}</div>` : cap.subtitulo ? `<div class="frase">${esc(cap.subtitulo)}</div>` : ''}</div><div class="credito">${esc(ab.credito || imgAb.credito || '')}</div></section>`;

  for (const s of cap.secoes) {
    const corpo = (await Promise.all(s.blocos.map(b => bloco(b, cap, ctx)))).join('\n');
    const nums = s.fontes.map(numeroNota);
    const linhaFontes = nums.length ? `<div class="fontes-secao">Fontes desta seção: ${nums.map(n => `<a href="#nota-${cap.id}-${n}">${n}</a>`).join(', ')}</div>` : '';
    h += s.titulo
      ? `<section class="secao" id="${s.id}"><div class="rubrica"><span class="he">${s.rubrica}</span><span>${esc(cap.titulo)}</span></div><h2>${s.titulo}</h2>${corpo}${linhaFontes}</section>`
      : `<section class="secao entrada" id="${s.id}">${corpo}${linhaFontes}</section>`;
  }

  if (cap.atividades.some(a => a.tipo !== 'observacao')) {
    const letras = 'abcdefgh';
    let n = 0; let perg = ''; const resp = [];
    for (const a of cap.atividades) {
      if (a.tipo === 'quiz') { n++; const certa = a.opcoes.findIndex(o => o.certa); perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.pergunta}</div><ol>${a.opcoes.map(o => `<li>${o.texto}</li>`).join('')}</ol></div>`; resp.push(`<b>${n}. ${letras[certa]}</b> ${a.opcoes[certa]?.explicacao || ''}`); }
      if (a.tipo === 'vf') { n++; perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.afirmacao}</div><div class="vf">Verdadeiro ou falso?</div></div>`; resp.push(`<b>${n}. ${a.resposta ? 'Verdadeiro' : 'Falso'}.</b> ${a.explicacao}`); }
    }
    const obs = '';
    h += `<section class="perguntas" id="${cap.id}-perguntas"><div class="rubrica"><span class="he">?</span><span>${esc(cap.titulo)}</span></div><div class="cab">Perguntas e descobertas</div><div class="sub">Para testar o olhar antes da viagem, e para levar na estrada. As respostas vêm logo depois, com a explicação.</div>${perg}${obs}<div class="respostas"><span class="rot">Respostas</span>${resp.join('<br>')}</div></section>`;
  }

  h += `<section class="notas" id="${cap.id}-notas"><h2>Fontes do capítulo ${cap.numero}</h2><ol>${notas.map((f, i) => `<li id="nota-${cap.id}-${i + 1}">${esc(f.abnt)}</li>`).join('')}</ol></section>`;
  return { cap, html: h };
}

const tokens = fs.readFileSync(path.join(EDITORIAL, 'templates/tokens-editorial.css'), 'utf8');
const css = fs.readFileSync(path.join(EDITORIAL, 'templates/revista.css'), 'utf8').replace(/url\('([^']+)'\)/g, (_, u) => `url('file://${path.resolve(EDITORIAL, 'templates', u)}')`);
const caps = []; for (const a of arquivos) caps.push(await capitulo(a));
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Israel Além do Roteiro</title><style>${tokens}\n${css}</style>
<script>window.PagedConfig = { auto: true, after: () => {
  const pgs = [...document.querySelectorAll('.pagedjs_page')]; let cap = '';
  pgs.forEach((pg, i) => { pg.style.setProperty('--pg', '"' + (i + 1) + '"'); const t = pg.querySelector('[data-cap]'); if (t) cap = t.getAttribute('data-cap'); pg.style.setProperty('--cap', JSON.stringify(cap)); });
  window.__pronto = true; } };</script>
<script src="../../node_modules/pagedjs/dist/paged.polyfill.js"></script></head><body>${caps.map(c => c.html).join('\n')}</body></html>`;
fs.mkdirSync(SAIDA, { recursive: true });
const arqHtml = path.join(SAIDA, `${nome}.html`);
fs.writeFileSync(arqHtml, html);
fs.writeFileSync(path.join(SAIDA, `${nome}.json`), JSON.stringify(caps.map(c => c.cap), null, 1));

const { chromium } = await import('playwright-core');
const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files', '--disable-background-networking'] });
const p = await b.newPage(); const erros = [];
p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); }); p.on('pageerror', e => erros.push(String(e)));
await p.goto('file://' + arqHtml); await p.waitForFunction(() => window.__pronto === true, null, { timeout: 300000 });
const paginas = await p.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
const fim = await p.evaluate(() => !!document.querySelector('.pagedjs_page .notas'));
if (!fim || erros.some(e => /Layout repeated/.test(e))) { await b.close(); console.error('paginação truncada', erros); process.exit(1); }
const arqPdf = path.join(SAIDA, `${nome}.pdf`);
await p.pdf({ path: arqPdf, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
await b.close();
fs.writeFileSync(path.join(SAIDA, `${nome}-qr.json`), JSON.stringify(relQR, null, 1));
console.log(`${nome}: ${paginas} páginas, ${Math.round(fs.statSync(arqPdf).size / 1024)} KB · QR lidos de volta: ${relQR.filter(q => q.confere).length}/${relQR.length}`);
if (erros.length) console.log('erros no navegador:', erros.slice(0, 5));
