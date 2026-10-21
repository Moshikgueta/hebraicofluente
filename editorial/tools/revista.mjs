#!/usr/bin/env node
/* PDF da edição redesenhada, a partir da base estruturada (tools/lib/conteudo.mjs).

   Uso: node tools/revista.mjs <livro> --capitulos=01-israel-no-mapa.md [--saida=piloto-cap01]
        node tools/revista.mjs <livro> --livro [--saida=livro-revista]

   --livro monta o livro inteiro na ordem de livro.json: capa, créditos, nota
   metodológica, sumário com página, introdução, capítulos, glossário (das
   faixas "Em hebraico" e de ativos/dados/glossario-*.json), bibliografia
   (todas as fontes citadas, por nível), notas finais e créditos das figuras.

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
import { marked } from 'marked';
import { compilarCapitulo, registros, esc } from './lib/conteudo.mjs';
import { vinheta } from './lib/vinhetas.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const RAIZ = path.join(EDITORIAL, livro);
const SAIDA = path.join(RAIZ, 'saida');
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const existe = p => fs.existsSync(p);
const LIVRO = !!opt.livro;
const meta = lerJSON(path.join(RAIZ, 'livro.json'));
const nome = opt.saida || (LIVRO ? 'livro-revista' : 'piloto');
const arquivos = LIVRO
  ? meta.capitulos.map(c => c.arquivo).filter(a => existe(path.join(RAIZ, 'manuscrito', a)))
  : String(opt.capitulos || '01-israel-no-mapa.md').split(',');
/* A identificação da empresa vem de data/empresa.json, como no site. */
const empresa = lerJSON(path.resolve(EDITORIAL, '../data/empresa.json'));
const comEmpresa = t => String(t).replace(/\{razaoSocial\}/g, empresa.razaoSocial).replace(/\{cnpj\}/g, empresa.cnpj);

const regs = registros(RAIZ);
const ativos = existe(path.join(RAIZ, 'ativos/registro-de-ativos.json')) ? lerJSON(path.join(RAIZ, 'ativos/registro-de-ativos.json')).ativos : [];
const fotosOk = existe(path.join(RAIZ, 'ativos/fotos.json')) ? lerJSON(path.join(RAIZ, 'ativos/fotos.json')).fotos : {};
const candidatas = fs.readdirSync(path.join(RAIZ, 'ativos/dados')).filter(f => /^fotos-candidatas-.*\.json$/.test(f)).flatMap(f => lerJSON(path.join(RAIZ, 'ativos/dados', f)).candidatas || []);
const relQR = [];

const svgDe = id => {
  const arq = ['ativos/mapas', 'ativos/infograficos', 'ativos/ilustracoes'].map(d => path.join(RAIZ, d, id + '.svg')).find(existe);
  return arq ? fs.readFileSync(arq, 'utf8').replace(/<\?xml[^>]*>/, '') : null;
};

function foto(id, { classe = '', assunto = '' } = {}) {
  const ok = fotosOk[id];
  if (ok && existe(path.join(RAIZ, ok.arquivo))) return { html: `<img class="foto ${classe}" src="file://${path.join(RAIZ, ok.arquivo)}" alt="${esc(ok.assunto || '')}">`, credito: `Foto: ${esc(ok.credito)}` };
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
    case 'quiz': case 'vf': case 'associe': case 'complete': case 'ordene': case 'aberta': return ''; // vão para "Compreensão da leitura"
    case 'curiosidade': {
      const corpo = (await Promise.all(b.blocos.map(x => bloco(x, cap, ctx)))).join('');
      return `<article class="curio"><span class="curio-n">${b.n}</span><div><h3 class="curio-t">${b.titulo}</h3>${corpo}${b.remete ? `<div class="curio-r">${b.remete}</div>` : ''}</div></article>`;
    }
    case 'ficha': return `<article class="ficha" id="ficha-${b.id}"><header><span class="f-n">${b.n}</span><span class="f-nome">${esc(b.nome)}</span>${b.he ? `<span class="f-he"><span class="he" lang="he" dir="rtl">${esc(b.he)}</span><small>${esc(b.translit || '')}</small></span>` : ''}</header>${b.regiao ? `<div class="f-reg">${esc(b.regiao)}</div>` : ''}<p class="f-res">${b.resumo}</p>${b.dados.length ? `<div class="f-dados">${b.dados.map(d => `<div><b>${esc(d.n)}</b><span>${d.l}</span></div>`).join('')}</div>` : ''}${b.observar ? `<p class="f-obs"><span>O que observar</span>${b.observar}</p>` : ''}${b.regras ? `<p class="f-reg2"><span>Antes de ir</span>${b.regras}</p>` : ''}</article>`;
    case 'compare': {
      const um = x => { const svg = svgDe(x.id); return `<div class="cmp-lado">${svg || `<div class="foto-pendente"><span class="etiqueta">Figura pendente</span><span class="assunto">${esc(x.id)}</span></div>`}<span class="cmp-rot">${esc(x.rotulo)}</span></div>`; };
      ctx.fig++;
      return `<figure class="larga compare">${um(b.a)}${um(b.b)}<figcaption><span class="num">Fig. ${cap.numero}.${ctx.fig}</span>${b.legenda}</figcaption></figure>`;
    }
    case 'checklist': return `<section class="checklist">${b.titulo ? `<div class="ck-tit">${esc(b.titulo)}</div>` : ''}<ul>${b.itens.map(i => `<li>${i}</li>`).join('')}</ul></section>`;
    case 'diario': return `<section class="diario"><div class="d-tit">${esc(b.titulo)}</div>${b.instrucao ? `<div class="d-inst">${b.instrucao}</div>` : ''}<div class="pauta">${'<i></i>'.repeat(b.linhas)}</div></section>`;
    case 'linha-do-tempo': {
      /* Antes de Cristo em dourado, depois em teal: a divisão do calendário
         é informação, não enfeite. */
      const ac = d => /a\.\s?C\./.test(d.replace(/<[^>]+>/g, ''));
      return `<section class="ldt${b.itens.length > 12 ? ' longa' : ''}">${b.titulo ? `<div class="ldt-tit">${esc(b.titulo)}</div>` : ''}<ol>${b.itens.map(i => `<li class="${ac(i.data) ? 'ac' : 'dc'}"><span class="ldt-data">${i.data}</span><span class="ldt-ev">${i.evento}</span></li>`).join('')}</ol></section>`;
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
  /* Sem imagem própria, a abertura usa a arte da coleção (faixas de
     paisagem, desenho original) na metade de baixo. */
  const arteColecao = () => fs.readFileSync(path.join(EDITORIAL, 'templates/capa-arte.svg'), 'utf8');
  const imgAb = ab.imagem ? (svgDe(ab.imagem) ? { html: svgDe(ab.imagem).replace(/preserveAspectRatio="[^"]*"/, 'preserveAspectRatio="xMidYMax slice"'), credito: ativos.find(x => x.id === ab.imagem)?.credito_curto || '' } : foto(ab.imagem)) : { html: arteColecao(), credito: '' };
  let h = `<section class="abertura" id="${cap.id}"><div class="imagem${svgDe(ab.imagem || '') ? ' baixa' : ab.imagem ? '' : ' colecao'}">${imgAb.html}</div><div class="veu"></div><div class="texto"><div class="kicker"><span>Capítulo ${String(cap.numero).padStart(2, '0')}</span><span class="he">${['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'][cap.numero] || ''}</span></div><h1 data-cap="${esc(cap.titulo)}">${esc(cap.titulo)}</h1>${ab.frase ? `<div class="frase">${ab.frase}</div>` : cap.subtitulo ? `<div class="frase">${esc(cap.subtitulo)}</div>` : ''}</div><div class="credito">${esc(ab.credito || imgAb.credito || '')}</div></section>`;

  for (const s of cap.secoes) {
    const corpo = (await Promise.all(s.blocos.map(b => bloco(b, cap, ctx)))).join('\n');
    const nums = s.fontes.map(numeroNota);
    const linhaFontes = nums.length ? `<div class="fontes-secao">Fontes desta seção: ${nums.map(n => `<a href="#nota-${cap.id}-${n}">${n}</a>`).join(', ')}</div>` : '';
    if (s.compreensao && !corpo.replace(/\s/g, '')) continue;
    const vin = s.vinheta ? vinheta(s.vinheta) : null;
    const cab = vin ? `<div class="sec-cab"><h2>${s.titulo}</h2><div class="vinheta">${vin}</div></div>` : `<h2>${s.titulo}</h2>`;
    h += s.titulo
      ? `<section class="secao" id="${s.id}"><div class="rubrica"><span class="he">${s.rubrica}</span><span>${esc(cap.titulo)}</span></div>${cab}${corpo}${linhaFontes}</section>`
      : `<section class="secao entrada" id="${s.id}">${corpo}${linhaFontes}</section>`;
  }

  /* Compreensão da leitura: todos os exercícios do capítulo (os do meio do
     texto e os da seção final), para fazer à mão, e o gabarito depois. A
     ordem de "associe" e "ordene" é embaralhada com semente fixa (o id),
     para o PDF sair sempre igual. */
  if (cap.atividades.some(a => a.tipo !== 'observacao')) {
    const letras = 'abcdefghij';
    const semente = id => [...id].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 7);
    const embaralha = (arr, id) => { let r = semente(id); const v = arr.map((x, i) => ({ x, i })); for (let i = v.length - 1; i > 0; i--) { r = (r * 1103515245 + 12345) >>> 0; const j = r % (i + 1); [v[i], v[j]] = [v[j], v[i]]; } if (v.every((o, i) => o.i === i) && v.length > 1) v.push(v.shift()); return v; };
    let n = 0; let perg = ''; const resp = [];
    for (const a of cap.atividades) {
      if (a.tipo === 'quiz') { n++; const certa = a.opcoes.findIndex(o => o.certa); perg += `<div class="pergunta">${a.pegadinha ? '<span class="pegadinha">Pegadinha do guia</span>' : ''}<div class="q"><b>${n}</b>${a.pergunta}</div><ol>${a.opcoes.map(o => `<li>${o.texto}</li>`).join('')}</ol></div>`; resp.push(`<b>${n}. ${letras[certa]}</b> ${a.opcoes[certa]?.explicacao || ''}`); }
      if (a.tipo === 'vf') { n++; perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.afirmacao}</div><div class="vf">Verdadeiro ou falso? ( V ) ( F )</div></div>`; resp.push(`<b>${n}. ${a.resposta ? 'Verdadeiro' : 'Falso'}.</b> ${a.explicacao}`); }
      if (a.tipo === 'associe') {
        n++; const dir = embaralha(a.pares.map(p => p.b), a.id);
        perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.titulo}</div><div class="assoc"><ol>${a.pares.map(p => `<li>${p.a}</li>`).join('')}</ol><ul>${dir.map((d, k) => `<li><span class="casa">( &nbsp;&nbsp; )</span> ${letras[k]}. ${d.x}</li>`).join('')}</ul></div></div>`;
        resp.push(`<b>${n}.</b> ${a.pares.map((p, i) => `${i + 1}-${letras[dir.findIndex(d => d.i === i)]}`).join(', ')}`);
      }
      if (a.tipo === 'complete') { n++; perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.frase.replace(/_{3,}/g, '<span class="lacuna"></span>')}</div></div>`; resp.push(`<b>${n}.</b> ${esc(a.respostas[0] || '')}${a.explicacao ? '. ' + a.explicacao : ''}`); }
      if (a.tipo === 'ordene') {
        n++; const v = embaralha(a.itens, a.id);
        perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.titulo}</div><ul class="ordem">${v.map(o => `<li><span class="casa">( &nbsp;&nbsp; )</span> ${o.x}</li>`).join('')}</ul></div>`;
        resp.push(`<b>${n}.</b> ${v.map(o => o.i + 1).join(', ')} (de cima para baixo)`);
      }
      if (a.tipo === 'aberta') { n++; perg += `<div class="pergunta"><div class="q"><b>${n}</b>${a.pergunta}</div><div class="linhas"><i></i><i></i><i></i></div></div>`; resp.push(`<b>${n}. Resposta sugerida:</b> ${a.resposta}`); }
    }
    h += `<section class="perguntas" id="${cap.id}-perguntas"><div class="rubrica"><span class="he">?</span><span>${esc(cap.titulo)}</span></div><div class="sec-cab"><div class="cab">Compreensão da leitura</div><div class="vinheta">${vinheta('lupa')}</div></div><div class="sub">Exercícios para depois de ler o capítulo. Responda sem olhar; o gabarito vem no fim, com a explicação.</div>${perg}<div class="respostas"><span class="rot">Gabarito</span>${resp.join('<br>')}</div></section>`;
  }


  /* Meu roteiro: as fichas do capítulo numa lista de marcar, impressa. */
  if (cap.fichas.length) h += `<section class="roteiro-impresso"><div class="rubrica"><span class="he">✓</span><span>${esc(cap.titulo)}</span></div><div class="cab">Meu roteiro</div><div class="sub">Marque o que você quer ver. Na versão digital, a mesma lista vira o seu roteiro, com as regras de cada lugar.</div><ul>${cap.fichas.map(f => `<li><b>${f.n}. ${esc(f.nome)}</b>${f.regiao ? ` <span>${esc(f.regiao)}</span>` : ''}</li>`).join('')}</ul></section>`;

  /* Nota curta (autor, título, ano e o site, com link); a referência ABNT
     completa fica na bibliografia do livro e na web. */
  const curta = f => {
    const base = String(f.abnt || '').replace(/\s*Dispon[ií]vel em:[\s\S]*$/, '').replace(/\s*Acesso em:[\s\S]*$/, '').trim();
    const dom = f.url ? f.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '';
    return esc(base) + (dom ? ` <a href="${esc(f.url)}">${esc(dom)}</a>` : '');
  };
  if (notas.length) h += `<section class="notas" id="${cap.id}-notas"><h2>Fontes do capítulo ${cap.numero}</h2><ol>${notas.map((f, i) => `<li id="nota-${cap.id}-${i + 1}">${curta(f)}</li>`).join('')}</ol></section>`;
  return { cap, html: h, notas };
}

/* ── partes do livro inteiro (só com --livro) ───────────────────────── */
async function secaoLivro(arq, id) {
  const cap = compilarCapitulo(RAIZ, arq, regs);
  const ctx = { fig: 0 }; const notas = [];
  let corpo = '';
  for (const s of cap.secoes) {
    for (const f of s.fontes) if (!notas.some(n => n.id === f.id)) notas.push(f);
    corpo += (s.titulo ? `<h2>${s.titulo}</h2>` : '') + (await Promise.all(s.blocos.map(b => bloco(b, cap, ctx)))).join('\n');
  }
  const fontes = notas.length ? `<div class="fontes-secao">Fontes: ${notas.map(f => esc(String(f.abnt || '').replace(/\s*Dispon[ií]vel em:[\s\S]*$/, ''))).join(' · ')}</div>` : '';
  return { id, titulo: cap.titulo, notas, html: `<section class="secao-livro" id="${id}"><h1 data-cap="${esc(cap.titulo)}">${esc(cap.titulo)}</h1>${corpo}${fontes}</section>` };
}

function capa() {
  const arte = fs.readFileSync(path.join(EDITORIAL, 'templates/capa-arte.svg'), 'utf8');
  return `<section class="capa-r"><div class="arte">${arte}</div><div class="topo"><span>${esc(meta.colecao)}</span><span>${esc(meta.categoria)}</span></div><div class="titulo"><span class="he" lang="he">${esc(meta.titulo_he || '')}</span><h1 data-cap="">${esc(meta.titulo).replace(' Além', '<br>Além')}</h1><div class="sub">${esc(meta.subtitulo)}</div></div><div class="marca">Hebraico Fluente<span>${esc(meta.edicao)}</span></div></section>`;
}

function creditos() {
  const c = meta.creditos; const md = t => marked.parseInline(comEmpresa(t), { async: false });
  return `<section class="creditos-r" id="creditos"><p><strong>${esc(meta.titulo)}</strong><br>${esc(meta.subtitulo)}</p>${c.linhas.map(l => `<p>${md(l)}</p>`).join('')}<p>${md(c.direitos)}</p><p>${md(c.atualizacao)}</p><p>${md(c.fontes_tipograficas)}</p></section>`;
}

function sumario(itens) {
  return `<section class="sumario-r" id="sumario"><h1 data-cap="Sumário">Sumário</h1><ol>${itens.map(it => `<li class="${it.n ? 'cap' : ''}"><a href="#${it.id}"><span class="n">${it.n ?? ''}</span><span class="t">${esc(it.titulo)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span><span class="pg"></span></a></li>`).join('')}</ol></section>`;
}

/* Glossário: as palavras das faixas "Em hebraico" de todos os capítulos,
   mais os glossários de dados; uma entrada por transliteração. */
function glossario(caps) {
  const itens = caps.flatMap(c => c.cap.vocabulario.map(v => ({ he: v.he, translit: v.translit, pt: v.pt, cap: c.cap.numero })));
  for (const f of fs.readdirSync(path.join(RAIZ, 'ativos/dados')).filter(f => /^glossario.*\.json$/.test(f))) itens.push(...lerJSON(path.join(RAIZ, 'ativos/dados', f)));
  const vistos = new Set();
  const lista = itens.filter(x => { const k = String(x.translit || '').toLowerCase(); if (!k || vistos.has(k)) return false; vistos.add(k); return true; })
    .sort((a, b) => String(a.translit).localeCompare(String(b.translit), 'pt'));
  if (!lista.length) return '';
  return `<section class="secao-livro glossario-r" id="glossario"><h1 data-cap="Glossário">Glossário</h1><p class="intro">As palavras em hebraico que aparecem no livro, em ordem alfabética da transliteração. A sílaba com acento é a tônica.</p><dl>${lista.map(x => `<div><dt>${esc(x.translit)} <span class="he" lang="he" dir="rtl">${esc(x.he)}</span></dt><dd>${esc(x.pt || '')}${x.definicao_curta && x.definicao_curta !== x.pt ? `. ${esc(x.definicao_curta)}` : ''}${x.cap ? ` <span class="cap">cap. ${x.cap}</span>` : ''}</dd></div>`).join('')}</dl></section>`;
}

function bibliografia(listas) {
  const mapa = new Map();
  for (const l of listas) for (const f of l) mapa.set(f.id, regs.fontes.get(f.id) || f);
  const lista = [...mapa.values()];
  const grupo = { A: 'Estudos acadêmicos', B: 'Instituições científicas e culturais', C: 'Fontes primárias', D: 'Fontes oficiais', E: 'Fontes complementares' };
  let h = `<section class="secao-livro bibliografia-r" id="bibliografia"><h1 data-cap="Bibliografia">Bibliografia</h1><p class="intro">Todas as obras e páginas que sustentam afirmações do livro, agrupadas pelo tipo de fonte e em ordem alfabética, no padrão da ABNT. As datas de acesso são as da consulta.</p>`;
  for (const [nivel, nomeG] of Object.entries(grupo)) {
    const vistos = new Set();
    const g = lista.filter(f => f.nivel === nivel).filter(f => { const k = f.abnt; if (vistos.has(k)) return false; vistos.add(k); return true; }).sort((a, b) => String(a.abnt).localeCompare(String(b.abnt), 'pt'));
    if (g.length) h += `<h3>${nomeG}</h3><ol>${g.map(f => `<li>${esc(f.abnt)}</li>`).join('')}</ol>`;
  }
  return h + '</section>';
}

function creditosFiguras(usadas) {
  const lista = ativos.filter(a => usadas.has(a.id));
  if (!lista.length) return '';
  /* Fotografias: autor, licença com o endereço dela e a página de origem,
     como as licenças Creative Commons pedem (crédito, licença, fonte). */
  const fotos = Object.entries(fotosOk).filter(([, f]) => existe(path.join(RAIZ, f.arquivo)));
  const dlFotos = fotos.length ? `<h2>Fotografias</h2><dl>${fotos.map(([, f]) => `<div><dt>${esc(f.assunto)}</dt><dd>${esc(f.credito)}. Licença: ${esc(f.licenca)}${f.licenca_url ? ` (${esc(f.licenca_url.replace(/^https?:\/\//, ''))})` : ''}. Fonte: ${esc(f.pagina.replace(/^https?:\/\//, ''))}.${f.share_alike ? ' Imagem recortada para o formato da página; o recorte segue a mesma licença.' : ''}</dd></div>`).join('')}</dl>` : '';
  return `<section class="secao-livro creditos-fig" id="creditos-imagens"><h1 data-cap="Créditos">Mapas, infográficos e créditos</h1><dl>${lista.map(a => `<div><dt>${esc(a.titulo)}</dt><dd>${esc(a.credito_longo || a.credito_curto || '')}</dd></div>`).join('')}</dl>${dlFotos}</section>`;
}

const tokens = fs.readFileSync(path.join(EDITORIAL, 'templates/tokens-editorial.css'), 'utf8');
const css = fs.readFileSync(path.join(EDITORIAL, 'templates/revista.css'), 'utf8').replace(/url\('([^']+)'\)/g, (_, u) => `url('file://${path.resolve(EDITORIAL, 'templates', u)}')`);
const caps = []; for (const a of arquivos) caps.push(await capitulo(a));
let corpoHtml = caps.map(c => c.html).join('\n');
if (LIVRO) {
  const pre = []; for (const p of meta.pre || []) if (existe(path.join(RAIZ, 'manuscrito', p.arquivo))) pre.push(await secaoLivro(p.arquivo, p.id));
  const pos = []; for (const p of meta.pos || []) if (existe(path.join(RAIZ, 'manuscrito', p.arquivo))) pos.push(await secaoLivro(p.arquivo, p.id));
  const usadas = new Set(caps.flatMap(c => [c.cap.abertura.imagem, ...c.cap.secoes.flatMap(s => s.blocos.filter(b => ['figura', 'visual'].includes(b.tipo)).map(b => b.id))]).filter(Boolean));
  const gl = glossario(caps);
  const nota = pre.find(p => p.id === 'nota-metodologica');
  const outrosPre = pre.filter(p => p !== nota);
  const cf = creditosFiguras(usadas);
  const itens = [
    ...outrosPre.map(p => ({ id: p.id, titulo: p.titulo })),
    ...caps.map(c => ({ id: c.cap.id, n: String(c.cap.numero).padStart(2, '0'), titulo: c.cap.titulo, sub: c.cap.subtitulo })),
    ...(gl ? [{ id: 'glossario', titulo: 'Glossário' }] : []),
    { id: 'bibliografia', titulo: 'Bibliografia' },
    ...pos.map(p => ({ id: p.id, titulo: p.titulo })),
    ...(cf ? [{ id: 'creditos-imagens', titulo: 'Mapas, infográficos e créditos' }] : []),
  ];
  corpoHtml = [capa(), creditos(), nota?.html || '', sumario(itens), ...outrosPre.map(p => p.html), corpoHtml, gl, bibliografia([...pre, ...caps, ...pos].map(x => x.notas)), ...pos.map(p => p.html), cf].join('\n');
}
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Israel Além do Roteiro</title><style>${tokens}\n${css}</style>
<script>window.PagedConfig = { auto: true, after: () => {
  const pgs = [...document.querySelectorAll('.pagedjs_page')]; let cap = '';
  pgs.forEach((pg, i) => { pg.style.setProperty('--pg', '"' + (i + 1) + '"'); const t = pg.querySelector('[data-cap]'); if (t) cap = t.getAttribute('data-cap'); pg.style.setProperty('--cap', JSON.stringify(cap)); });
  /* Sumário: o número da página sai do elemento de destino, depois da paginação. */
  document.querySelectorAll('.sumario-r a[href^="#"]').forEach(a => { const alvo = document.getElementById(a.getAttribute('href').slice(1)); const pg = alvo && alvo.closest('.pagedjs_page'); if (pg) a.querySelector('.pg').textContent = String(pgs.indexOf(pg) + 1); });
  window.__pronto = true; } };</script>
<script src="../../node_modules/pagedjs/dist/paged.polyfill.js"></script></head><body>${corpoHtml}<div id="fim-paginacao"></div></body></html>`;
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
const fim = await p.evaluate(() => !!document.querySelector('.pagedjs_page #fim-paginacao'));
if (!fim || erros.some(e => /Layout repeated/.test(e))) { await b.close(); console.error('paginação truncada', erros); process.exit(1); }
const arqPdf = path.join(SAIDA, `${nome}.pdf`);
await p.pdf({ path: arqPdf, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
await b.close();
fs.writeFileSync(path.join(SAIDA, `${nome}-qr.json`), JSON.stringify(relQR, null, 1));
console.log(`${nome}: ${paginas} páginas, ${Math.round(fs.statSync(arqPdf).size / 1024)} KB · QR lidos de volta: ${relQR.filter(q => q.confere).length}/${relQR.length}`);
if (erros.length) console.log('erros no navegador:', erros.slice(0, 5));
