#!/usr/bin/env node
/* Monta o livro: Markdown + registros JSON → HTML paginado (Paged.js) → PDF
   pelo Chromium já instalado no ambiente.

   Uso:
     node tools/build.mjs <livro> [--formato=digital|a4|amostra|todos] [--final]

   ── as duas edições ───────────────────────────────────────────────────
   Sem --final sai um RASCUNHO: as caixas que dependem do autor aparecem
   tracejadas, uma marca de afirmação que não pode ir ao texto aparece
   destacada, e o rodapé diz "rascunho". É o arquivo de revisão.

   Com --final o gerador RECUSA se faltar qualquer aprovação registrada em
   <livro>/revisao/aprovacoes.json (hebraico, caixas do autor, revisão
   humana) ou se o validador acusar erro. Isso é de propósito: a publicação
   depende de gente, e o gerador não é quem decide que ela aconteceu.

   ── rastreabilidade ────────────────────────────────────────────────────
   O manuscrito marca cada afirmação com [[C01-003]]. Aqui a marca vira um
   número discreto que leva à nota de fonte do fim do capítulo; as notas
   saem das fontes que o registro da afirmação aponta, e a bibliografia sai
   de todas as notas. Ninguém escreve referência à mão. */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const opt = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const FINAL = !!opt.final;
const FORMATO = opt.formato || 'todos';
const RAIZ = path.join(EDITORIAL, livro);
const SAIDA = path.join(RAIZ, 'saida');
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const existe = p => fs.existsSync(p);

const empresa = lerJSON(path.join(EDITORIAL, '..', 'data/empresa.json'));
const comEmpresa = s => String(s).replace(/\{(razaoSocial|cnpj|nomeFantasia)\}/g, (_, k) => empresa[k] ?? '');
const meta = JSON.parse(comEmpresa(fs.readFileSync(path.join(RAIZ, 'livro.json'), 'utf8')));

/* ── registros ───────────────────────────────────────────────────────── */
function carregarRegistros() {
  const fontes = new Map(), afirmacoes = new Map();
  for (const f of fs.readdirSync(path.join(RAIZ, 'fontes')).filter(f => f.endsWith('.json')).sort()) {
    for (const x of lerJSON(path.join(RAIZ, 'fontes', f)).fontes || []) fontes.set(x.id, x);
  }
  for (const f of fs.readdirSync(path.join(RAIZ, 'afirmacoes')).filter(f => f.endsWith('.json')).sort()) {
    for (const x of lerJSON(path.join(RAIZ, 'afirmacoes', f)).afirmacoes || []) afirmacoes.set(x.id, x);
  }
  return { fontes, afirmacoes };
}
const { fontes, afirmacoes } = carregarRegistros();
const PUBLICAVEL = new Set(['VERIFICADO', 'CONTESTADO']);

/* A mesma obra pode ter um id por capítulo: a chave de identidade é a URL
   (sem barra final e sem protocolo) ou, sem URL, o texto ABNT. */
const chaveFonte = f => (f.url ? f.url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase() : (f.abnt || f.titulo || f.id).toLowerCase());

/* ── utilidades de texto ─────────────────────────────────────────────── */
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const he = html => html.replace(/<he>/g, '<span class="he" lang="he" dir="rtl">').replace(/<\/he>/g, '</span>');
const md = s => he(marked.parse(s, { async: false }));
const mdInline = s => he(marked.parseInline(s, { async: false }));

function frontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, corpo: texto };
  const meta = {};
  for (const linha of m[1].split('\n')) { const i = linha.indexOf(':'); if (i > 0) meta[linha.slice(0, i).trim()] = linha.slice(i + 1).trim().replace(/^["']|["']$/g, ''); }
  return { meta, corpo: texto.slice(m[0].length) };
}

/* ── marcas de afirmação → notas ─────────────────────────────────────── */
function Notas() {
  const ordem = []; const idx = new Map(); const problemas = [];
  return {
    ordem, problemas,
    marca(lista) {
      const nums = new Set(); let ruim = [];
      for (const id of lista.split(',').map(s => s.trim()).filter(Boolean)) {
        const a = afirmacoes.get(id);
        if (!a) { ruim.push(id + ' (não registrada)'); continue; }
        if (!PUBLICAVEL.has(a.status)) { ruim.push(id + ' (' + a.status + ')'); continue; }
        for (const fid of a.fontes || []) {
          const f = fontes.get(fid);
          if (!f) { ruim.push(id + ' → ' + fid + ' (fonte ausente)'); continue; }
          const k = chaveFonte(f);
          if (!idx.has(k)) { ordem.push(f); idx.set(k, ordem.length); }
          nums.add(idx.get(k));
        }
      }
      problemas.push(...ruim);
      let s = '';
      if (nums.size) s += '<sup class="fn">' + [...nums].sort((a, b) => a - b).map(n => `<a href="#nota-${this.prefixo}-${n}">${n}</a>`).join(',') + '</sup>';
      if (ruim.length && !FINAL) s += `<span class="pendente-marca">${esc(ruim.join('; '))}</span>`;
      return s;
    },
  };
}

/* ── caixas ::: ────────────────────────────────────────────────────── */
const ROTULOS = {
  'voce-sabia': 'Você sabia?', observar: 'O que observar', 'em-hebraico': 'Em hebraico',
  'historia-ou-tradicao': 'História ou tradição?', 'olhar-israelense': 'O olhar de um israelense',
  'entenda-melhor': 'Entenda melhor', aviso: 'Atenção: informação sujeita a mudança',
};

const registroAtivos = existe(path.join(RAIZ, 'ativos/registro-de-ativos.json')) ? lerJSON(path.join(RAIZ, 'ativos/registro-de-ativos.json')) : { ativos: [] };
const aprov = existe(path.join(RAIZ, 'revisao/aprovacoes.json')) ? lerJSON(path.join(RAIZ, 'revisao/aprovacoes.json')) : {};
const olharesAprovados = new Set((aprov.olhar_israelense || []).filter(o => o.aprovado).map(o => o.id));

function figura(id, legendaMd, notas) {
  const ativo = registroAtivos.ativos.find(a => a.id === id);
  const arq = ['ativos/mapas', 'ativos/infograficos'].map(d => path.join(RAIZ, d, id + '.svg')).find(existe);
  const corpo = arq ? fs.readFileSync(arq, 'utf8').replace(/<\?xml[^>]*>/, '') : `<div class="figura-ausente">Figura “${esc(id)}” ainda não gerada.</div>`;
  const leg = legendaMd.trim() ? mdInline(legendaMd.trim().replace(/\[\[([^\]]+)\]\]/g, (_, l) => notas.marca(l))) : '';
  const titulo = ativo ? `<b>${esc(ativo.titulo)}.</b> ` : '';
  const cred = ativo ? `<span class="credito">${mdInline(ativo.credito_curto || '')}</span>` : '';
  return `<figure id="fig-${esc(id)}" class="${ativo?.pagina_cheia ? 'cheia' : ''}">${corpo}<figcaption>${titulo}${leg}${cred}</figcaption></figure>`;
}

function processarCaixas(corpo, notas) {
  /* Comentários HTML do manuscrito (figura pendente, nota de revisão) saem
     antes de tudo: nada dentro deles vira caixa nem marca de fonte. */
  const linhas = corpo.replace(/<!--[\s\S]*?-->/g, '').split('\n'); const saida = []; let i = 0;
  const marcas = s => s.replace(/\[\[([^\]]+)\]\]/g, (_, l) => notas.marca(l));
  while (i < linhas.length) {
    const m = linhas[i].match(/^:::\s*([a-z-]+)\s*(.*)$/);
    if (!m) { saida.push(linhas[i]); i++; continue; }
    const [, tipo, resto] = m; const miolo = []; i++;
    while (i < linhas.length && !/^:::\s*$/.test(linhas[i])) { miolo.push(linhas[i]); i++; }
    i++;
    const texto = miolo.join('\n');
    let html = '';
    if (tipo === 'figura') html = figura(resto.trim(), texto, notas);
    else if (tipo === 'linha-do-tempo') {
      const itens = miolo.filter(l => l.includes('|')).map(l => { const [d, ...ev] = l.replace(/^\s*-\s*/, '').split('|'); return `<li><span class="ld-data">${mdInline(d.trim())}</span><span class="ld-ev">${mdInline(marcas(ev.join('|').trim()))}</span></li>`; });
      html = (resto.trim() ? `<div class="ld-titulo">${esc(resto.trim())}</div>` : '') + `<ol class="linha-do-tempo">${itens.join('')}</ol>`;
    } else if (tipo === 'checklist') {
      const itens = miolo.filter(l => /^\s*-\s+/.test(l)).map(l => `<li>${mdInline(marcas(l.replace(/^\s*-\s+/, '')))}</li>`);
      html = (resto.trim() ? `<h3>${esc(resto.trim())}</h3>` : '') + `<ul class="checklist">${itens.join('')}</ul>`;
    } else if (tipo === 'diario') {
      const nl = Number((texto.match(/linhas:\s*(\d+)/) || [])[1] || 12);
      const resto2 = texto.replace(/linhas:\s*\d+/, '').trim();
      html = `<section class="diario"><h3>${esc(resto.trim())}</h3>${resto2 ? `<div class="instrucao">${md(marcas(resto2))}</div>` : ''}<div class="pauta">${'<div></div>'.repeat(nl)}</div></section>`;
    } else if (tipo === 'em-hebraico') {
      const vocab = miolo.filter(l => /^\s*-\s+.*\|/.test(l));
      const outros = miolo.filter(l => !/^\s*-\s+.*\|/.test(l)).join('\n').trim();
      const itens = vocab.map(l => {
        const [h, tr, pt, ...nota] = l.replace(/^\s*-\s+/, '').split('|').map(s => s.trim());
        const hePuro = h.replace(/<\/?he>/g, '');
        return `<li><span class="v-he" lang="he" dir="rtl">${esc(hePuro)}</span><span class="v-tr">${mdInline(tr)} <em>· ${mdInline(pt)}</em></span>${nota.length ? `<span class="v-nota">${mdInline(marcas(nota.join(' | ')))}</span>` : ''}</li>`;
      });
      const titulo = resto.trim();
      html = `<aside class="caixa em-hebraico"><span class="rotulo">${ROTULOS['em-hebraico']}</span>${titulo ? `<span class="titulo-caixa">${mdInline(titulo)}</span>` : ''}${outros ? md(marcas(outros)) : ''}<ul class="vocab">${itens.join('')}</ul></aside>`;
    } else if (ROTULOS[tipo]) {
      const pendente = /\bpendente\b/.test(resto) || (tipo === 'olhar-israelense' && !/\baprovado\b/.test(resto));
      const idCaixa = (resto.match(/#([\w-]+)/) || [])[1];
      const titulo = resto.replace(/\bpendente\b|\baprovado\b|#[\w-]+/g, '').trim();
      if (tipo === 'olhar-israelense' && pendente && FINAL && !olharesAprovados.has(idCaixa)) { saida.push(''); continue; }
      html = `<aside class="caixa ${tipo}${pendente ? ' rascunho-autor' : ''}"><span class="rotulo">${ROTULOS[tipo]}</span>${titulo ? `<span class="titulo-caixa">${mdInline(titulo)}</span>` : ''}${md(marcas(texto))}</aside>`;
    } else {
      html = `<div class="${esc(tipo)}">${md(marcas(texto))}</div>`;
    }
    saida.push('', html, '');
  }
  return saida.join('\n');
}

/* ── capítulos ──────────────────────────────────────────────────────── */
function renderCapitulo(arquivo, n) {
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const { meta: fm, corpo } = frontmatter(bruto);
  const notas = Notas(); notas.prefixo = 'c' + n;
  let texto = processarCaixas(corpo, notas);
  texto = texto.replace(/\[\[([^\]]+)\]\]/g, (_, l) => notas.marca(l));
  let html = md(texto);
  const secoes = [];
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, t) => { const id = `c${n}-${slug(t.replace(/<[^>]+>/g, ''))}`; secoes.push({ id, t }); return `<h2 id="${id}">${t}</h2>`; });
  const idCap = 'cap-' + n;
  const lista = secoes.length ? `<ul class="secoes">${secoes.map((s, k) => `<li><span>${String(k + 1).padStart(2, '0')}</span>${s.t.replace(/<sup[\s\S]*?<\/sup>/g, '')}</li>`).join('')}</ul>` : '';
  const notasHtml = notas.ordem.length ? `<section class="notas"><h4>Fontes deste capítulo</h4><ol>${notas.ordem.map((f, k) => `<li id="nota-c${n}-${k + 1}">${esc(f.abnt || [f.autor, f.titulo, f.ano, f.url].filter(Boolean).join('. '))}</li>`).join('')}</ol></section>` : '';
  const paisagem = fs.readFileSync(path.join(EDITORIAL, 'templates/paisagem.svg'), 'utf8');
  return {
    n, titulo: fm.titulo, subtitulo: fm.subtitulo, id: idCap, notas,
    html: `<section class="capitulo" id="${idCap}"><div class="abertura"><div class="num">${String(n).padStart(2, '0')}</div><div class="faixa"></div><h1>${esc(fm.titulo)}</h1>${fm.subtitulo ? `<div class="subtitulo">${esc(fm.subtitulo)}</div>` : ''}${lista}<div class="paisagem">${paisagem}</div></div><div class="texto">${html}</div>${notasHtml}</section>`,
  };
}

function renderSecao(arquivo, id, classe = '') {
  const { meta: fm, corpo } = frontmatter(fs.readFileSync(arquivo, 'utf8'));
  const notas = Notas(); notas.prefixo = id;
  let texto = processarCaixas(corpo, notas);
  texto = texto.replace(/\[\[([^\]]+)\]\]/g, (_, l) => notas.marca(l));
  const notasHtml = notas.ordem.length ? `<section class="notas"><h4>Fontes</h4><ol>${notas.ordem.map((f, k) => `<li id="nota-${id}-${k + 1}">${esc(f.abnt)}</li>`).join('')}</ol></section>` : '';
  return { titulo: fm.titulo, id, notas, html: `<section class="secao-livro ${classe}" id="${id}"><h1>${esc(fm.titulo)}</h1>${md(texto)}${notasHtml}</section>` };
}

/* ── partes geradas ──────────────────────────────────────────────────── */
function capa() {
  const arte = fs.readFileSync(path.join(EDITORIAL, 'templates/capa-arte.svg'), 'utf8');
  return `<section class="capa"><div class="topo"><span>${esc(meta.colecao)}</span><span>${esc(meta.categoria)}</span></div><div class="titulo">${meta.titulo_he ? `<span class="he-capa" lang="he">${esc(meta.titulo_he)}</span>` : ''}<h1>${esc(meta.titulo).replace(' Além', '<br>Além')}</h1><div class="sub">${esc(meta.subtitulo)}</div></div><div class="arte">${arte}</div><div class="marca">Hebraico Fluente<span>${esc(meta.edicao)}</span></div></section>`;
}

function creditos() {
  const c = meta.creditos;
  return `<section class="secao-livro creditos" id="creditos"><div style="height:62mm"></div>
    <div class="bloco"><p><strong>${esc(meta.titulo)}</strong><br>${esc(meta.subtitulo)}</p></div>
    <div class="bloco">${c.linhas.map(l => `<p>${mdInline(l)}</p>`).join('')}</div>
    <div class="bloco"><p>${mdInline(c.direitos)}</p></div>
    <div class="bloco"><p>${mdInline(c.atualizacao)}</p></div>
    <div class="bloco"><p>${mdInline(c.fontes_tipograficas)}</p></div></section>`;
}

function sumario(itens) {
  return `<section class="sumario" id="sumario"><h2>Sumário</h2><ol>${itens.map(it => `<li><a href="#${it.id}"><span class="n">${it.n ?? ''}</span><span class="t">${esc(it.titulo)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span></a></li>`).join('')}</ol></section>`;
}

function glossario() {
  const dir = path.join(RAIZ, 'ativos/dados');
  const itens = [];
  for (const f of fs.readdirSync(dir).filter(f => /^glossario.*\.json$/.test(f))) itens.push(...lerJSON(path.join(dir, f)));
  const vistos = new Set();
  const lista = itens.filter(x => { const k = (x.translit || '').toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; })
    .sort((a, b) => (a.translit || '').localeCompare(b.translit || '', 'pt'));
  if (!lista.length) return '';
  return `<section class="secao-livro glossario" id="glossario"><h1>Glossário</h1><p>As palavras em hebraico que aparecem no livro, em ordem alfabética da transliteração. A sílaba com acento é a tônica.</p><dl>${lista.map(x => `<dt>${esc(x.translit)} <span class="he" lang="he" dir="rtl">${esc(x.he)}</span></dt><dd>${mdInline(x.pt ? `*${x.pt}*. ` : '')}${mdInline(x.definicao_curta || '')}</dd>`).join('')}</dl></section>`;
}

function bibliografia(todasNotas) {
  const mapa = new Map();
  for (const n of todasNotas) for (const f of n.ordem) mapa.set(chaveFonte(f), f);
  const lista = [...mapa.values()];
  const grupo = { A: 'Estudos acadêmicos', B: 'Instituições científicas e culturais', C: 'Fontes primárias', D: 'Fontes oficiais', E: 'Fontes complementares' };
  let html = `<section class="secao-livro bibliografia" id="bibliografia"><h1>Bibliografia</h1><p>Todas as obras e páginas que sustentam afirmações do livro, agrupadas pelo tipo de fonte e em ordem alfabética, no padrão da ABNT. As datas de acesso são as da consulta.</p>`;
  for (const [nivel, nome] of Object.entries(grupo)) {
    const g = lista.filter(f => f.nivel === nivel).sort((a, b) => (a.abnt || '').localeCompare(b.abnt || '', 'pt'));
    if (!g.length) continue;
    html += `<h3>${nome}</h3><ol>${g.map(f => `<li>${esc(f.abnt)}</li>`).join('')}</ol>`;
  }
  return html + '</section>';
}

function creditosImagens() {
  if (!registroAtivos.ativos.length) return '';
  return `<section class="secao-livro" id="creditos-imagens"><h1>Mapas, infográficos e créditos</h1><table><thead><tr><th>Figura</th><th>Fonte dos dados e licença</th></tr></thead><tbody>${registroAtivos.ativos.filter(a => a.no_livro !== false).map(a => `<tr><td>${esc(a.titulo)}</td><td>${mdInline(a.credito_longo || a.credito_curto || '')}</td></tr>`).join('')}</tbody></table></section>`;
}

/* ── montagem ────────────────────────────────────────────────────────── */
function montarHTML(formato) {
  const man = path.join(RAIZ, 'manuscrito');
  const caps = meta.capitulos.map((c, k) => ({ ...c, n: k + 1 })).filter(c => existe(path.join(man, c.arquivo)));
  const renderizados = caps.map(c => renderCapitulo(path.join(man, c.arquivo), c.n));
  const pre = meta.pre.filter(p => existe(path.join(man, p.arquivo))).map(p => renderSecao(path.join(man, p.arquivo), p.id, p.classe));
  const pos = meta.pos.filter(p => existe(path.join(man, p.arquivo))).map(p => renderSecao(path.join(man, p.arquivo), p.id, p.classe));
  const todasNotas = [...pre, ...renderizados, ...pos].map(x => x.notas);
  const gl = glossario();
  const itensSumario = [
    ...pre.filter(p => p.id !== 'nota-metodologica').map(p => ({ id: p.id, titulo: p.titulo })),
    ...renderizados.map(r => ({ id: r.id, n: String(r.n).padStart(2, '0'), titulo: r.titulo, sub: r.subtitulo })),
    ...(gl ? [{ id: 'glossario', titulo: 'Glossário' }] : []),
    { id: 'bibliografia', titulo: 'Bibliografia' },
    ...pos.map(p => ({ id: p.id, titulo: p.titulo })),
    ...(registroAtivos.ativos.length ? [{ id: 'creditos-imagens', titulo: 'Mapas, infográficos e créditos' }] : []),
  ];
  const nota = pre.find(p => p.id === 'nota-metodologica');
  const outrosPre = pre.filter(p => p.id !== 'nota-metodologica');
  const problemas = todasNotas.flatMap(n => n.problemas);
  const a4 = formato === 'a4';
  /* Os url() da folha são relativos a templates/; o HTML mora em saida/,
     então viram caminhos absolutos aqui. */
  const css = fs.readFileSync(path.join(EDITORIAL, 'templates/livro.css'), 'utf8')
    .replace(/url\('([^']+)'\)/g, (_, u) => `url('file://${path.resolve(EDITORIAL, 'templates', u)}')`);
  const extra = `
    ${a4 ? '@page { size: A4; margin: 22mm 21mm 24mm 21mm; } .capitulo { break-before: right; }' : '.capitulo { break-before: page; }'}
    ${FINAL ? '' : "@page { @bottom-right { content: 'rascunho para revisão'; font-family: 'Instrument Sans', sans-serif; font-size: 6.4pt; color: #C2410C; } }"}`;
  const corpo = [capa(), creditos(), nota?.html || '', sumario(itensSumario), ...outrosPre.map(p => p.html), ...renderizados.map(r => r.html), gl, bibliografia(todasNotas), ...pos.map(p => p.html), creditosImagens()].join('\n');
  const html = `<!doctype html><html lang="pt-BR" class="${a4 ? 'a4' : 'digital'}"><head><meta charset="utf-8"><title>${esc(meta.titulo)}</title>
<style>${css}\n${extra}</style>
<script>
/* O Chromium recente não propaga counter(page) para as margens do Paged.js
   (toda página sairia "1"). Depois da paginação, cada página recebe o próprio
   número numa variável, e a margem lê a variável. O sumário usa o mesmo
   número, lido do elemento de destino. */
window.PagedConfig = { auto: true, after: () => {
  const paginas = [...document.querySelectorAll('.pagedjs_page')];
  /* Cabeçalho corrente: o título da última abertura de capítulo ou de seção
     vista até esta página (string-set não acompanha os capítulos aqui). */
  let atual = '';
  paginas.forEach((pg, i) => {
    pg.style.setProperty('--pg', '"' + (i + 1) + '"');
    const t = pg.querySelector('.abertura h1, .secao-livro > h1, .sumario > h2');
    if (t) atual = t.textContent.trim();
    pg.style.setProperty('--cap', JSON.stringify(atual));
  });
  document.querySelectorAll('.sumario a[href^="#"]').forEach(a => {
    const alvo = document.getElementById(a.getAttribute('href').slice(1));
    const pg = alvo && alvo.closest('.pagedjs_page');
    if (pg) a.setAttribute('data-pg', String(paginas.indexOf(pg) + 1));
  });
  window.__pronto = true;
} };
</script>
<script src="../../node_modules/pagedjs/dist/paged.polyfill.js"></script></head><body>${corpo}</body></html>`;
  return { html, problemas, caps: renderizados };
}

async function gerarPDF(arqHtml, arqPdf) {
  const { chromium } = await import('playwright-core');
  const exe = process.env.HF_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b = await chromium.launch({ executablePath: exe, args: ['--disable-background-networking', '--no-first-run', '--allow-file-access-from-files'] });
  const p = await b.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto('file://' + arqHtml, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__pronto === true, null, { timeout: 300000 });
  const paginas = await p.evaluate(() => document.querySelectorAll('.pagedjs_page').length);
  /* O Paged.js, quando não consegue quebrar um trecho ("Layout repeated"),
     PARA e entrega um livro truncado sem erro. O fim do livro tem de estar
     dentro de uma página; se não estiver, o build falha. */
  const fimPaginado = await p.evaluate(() => !!document.querySelector('.pagedjs_page #bibliografia'));
  if (!fimPaginado || erros.some(e => /Layout repeated/.test(e))) {
    await b.close();
    throw new Error(`paginação truncada em ${path.basename(arqHtml)} (${paginas} páginas): ${erros.filter(e => /Layout/.test(e)).join('; ') || 'bibliografia fora das páginas'}. Procure um bloco que não pode quebrar e é maior que uma página.`);
  }
  await p.pdf({ path: arqPdf, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
  await b.close();
  return { paginas, erros };
}

async function amostra(pdfDigital, destino, mapaDePaginas) {
  const { PDFDocument, StandardFonts, rgb, PDFName } = await import('pdf-lib');
  const origem = await PDFDocument.load(fs.readFileSync(pdfDigital));
  const nova = await PDFDocument.create();
  const total = origem.getPageCount();
  const indices = [...new Set(mapaDePaginas.filter(i => i >= 0 && i < total))];
  const copias = await nova.copyPages(origem, indices);
  for (const pg of copias) { pg.node.delete(PDFName.of('Annots')); nova.addPage(pg); }
  const [w, h] = [copias[0].getWidth(), copias[0].getHeight()];
  const fim = nova.addPage([w, h]);
  const fonte = await nova.embedFont(StandardFonts.HelveticaBold);
  const fonte2 = await nova.embedFont(StandardFonts.Helvetica);
  fim.drawRectangle({ x: 0, y: 0, width: w, height: h, color: rgb(14 / 255, 59 / 255, 67 / 255) });
  fim.drawText('Fim da amostra', { x: 42, y: h - 160, size: 22, font: fonte, color: rgb(1, 1, 1) });
  const linhas = ['O livro completo tem os dez capitulos, os mapas,', 'o glossario, a bibliografia e o diario de descobertas.', '', 'hebraicofluente.com.br'];
  linhas.forEach((l, k) => fim.drawText(l, { x: 42, y: h - 200 - k * 16, size: 10.5, font: fonte2, color: rgb(.86, .91, .9) }));
  nova.setTitle(meta.titulo + ' - amostra');
  fs.writeFileSync(destino, await nova.save());
  return nova.getPageCount();
}

/* ── execução ────────────────────────────────────────────────────────── */
fs.mkdirSync(SAIDA, { recursive: true });
if (FINAL) {
  const faltas = [];
  if (!aprov.hebraico?.aprovado) faltas.push('hebraico do livro aprovado pelo autor (revisao/aprovacoes.json → hebraico)');
  if (!aprov.revisao_humana?.concluida) faltas.push('revisão humana registrada (revisao/aprovacoes.json → revisao_humana)');
  if (!aprov.publicacao?.autorizada) faltas.push('autorização de publicação do dono (revisao/aprovacoes.json → publicacao)');
  try { execFileSync('node', [path.join(AQUI, 'validar.mjs'), livro, '--estrito'], { stdio: 'inherit' }); } catch { faltas.push('validador em modo estrito'); }
  if (faltas.length) { console.error('\nEdição final recusada. Falta:\n - ' + faltas.join('\n - ')); process.exit(1); }
}

const sufixo = FINAL ? '' : '-RASCUNHO';
const formatos = FORMATO === 'todos' ? ['digital', 'a4', 'amostra'] : [FORMATO];
let infoDigital = null;
for (const f of formatos) {
  if (f === 'amostra') continue;
  const { html, problemas, caps } = montarHTML(f);
  const arqHtml = path.join(SAIDA, `livro-${f}.html`);
  fs.writeFileSync(arqHtml, html);
  const arqPdf = path.join(SAIDA, `${livro}-${f}${sufixo}.pdf`);
  const r = await gerarPDF(arqHtml, arqPdf);
  const kb = Math.round(fs.statSync(arqPdf).size / 1024);
  console.log(`${f}: ${r.paginas} páginas, ${kb} KB → ${path.relative(EDITORIAL, arqPdf)}`);
  if (r.erros.length) console.log('  erros no navegador:\n   ' + r.erros.slice(0, 10).join('\n   '));
  if (problemas.length) console.log(`  ${problemas.length} marca(s) que não podem ir ao texto: ${problemas.slice(0, 12).join('; ')}${problemas.length > 12 ? '...' : ''}`);
  if (f === 'digital') infoDigital = { arqHtml, arqPdf, caps };
}
if (formatos.includes('amostra')) {
  if (!infoDigital) { console.error('A amostra sai do PDF digital: rode com --formato=todos.'); process.exit(1); }
  /* Páginas da amostra: as primeiras (capa a introdução) e as primeiras de
     dois capítulos. Os índices vêm do HTML paginado. */
  const { chromium } = await import('playwright-core');
  const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  await p.goto('file://' + infoDigital.arqHtml);
  await p.waitForFunction(() => window.__pronto === true, null, { timeout: 300000 });
  const pos = await p.evaluate(ids => ids.map(id => { const el = document.getElementById(id); const pg = el && el.closest('.pagedjs_page'); return pg ? [...document.querySelectorAll('.pagedjs_page')].indexOf(pg) : -1; }), ['sumario', 'introducao', 'cap-1', 'cap-3', 'cap-7']);
  await b.close();
  const [sum, intro, c1, c3, c7] = pos;
  const paginas = [0, 1, 2, 3, sum, sum + 1, intro, intro + 1, intro + 2, c1, c1 + 1, c1 + 2, c1 + 3, c3, c3 + 1, c3 + 2, c7, c7 + 1, c7 + 2];
  const dest = path.join(SAIDA, `${livro}-amostra${sufixo}.pdf`);
  const n = await amostra(infoDigital.arqPdf, dest, paginas.filter(x => x >= 0));
  console.log(`amostra: ${n} páginas → ${path.relative(EDITORIAL, dest)}`);
}
