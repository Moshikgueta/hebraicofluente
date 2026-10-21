// Monta o HTML de um guia a partir do conteúdo estruturado.
// ─────────────────────────────────────────────────────────────────────────
// Nada aqui sabe o que é uma página: o HTML sai como uma fila de blocos
// (`.bloco`) dentro de seções de fluxo, e quem decide onde cada página
// termina é o paginador (paginar.js), rodando no navegador com as fontes
// já carregadas. É isso que deixa trocar uma tradução sem rediagramar nada.
//
// Páginas fixas (capa, rosto, sumário, aberturas, contracapa) saem prontas.

import path from 'node:path';
import { RAIZ_REPO, rascunho } from './dados.mjs';
import { ilustracao, figura as desenharFigura } from './figuras.mjs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n3 = n => String(n).padStart(3, '0');
const n2 = n => String(n).padStart(2, '0');

/** Hebraico: sempre por aqui, com direção isolada. Pontuação de frase
 *  portuguesa nunca entra no span. */
const he = (txt, cls = 'he') => `<span class="${cls}" lang="he" dir="rtl">${esc(txt)}</span>`;

/** Marcação dos textos: {{hebraico}}, **negrito**, [texto](url). */
function inline(s) {
  let out = esc(s);
  out = out.replace(/\{\{(.+?)\}\}/g, (_, h) => he(h.replace(/&quot;/g, '"')));
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[(.+?)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  return out;
}
const paragrafos = ps => (ps ?? []).map(p => `<p>${inline(p)}</p>`).join('');

const bloco = (html, { cls = '', junto = false, id = '' } = {}) =>
  `<div class="bloco ${cls}"${junto ? ' data-junto' : ''}${id ? ` id="${id}"` : ''}>${html}</div>`;

export function montar(produto, formato) {
  const { meta, textos, itens, capitulos } = produto;
  const ctx = {
    produto, formato,
    ehRascunho: rascunho(meta),
    audioOk: meta.audio.status === 'disponivel' && !!meta.audio.base,
    itemPorId: new Map(itens.map(i => [i.id, i]))
  };
  if (meta.audio.status === 'disponivel' && !meta.audio.base) {
    throw new Error('audio.status = disponivel exige audio.base (a URL verificada das páginas de áudio).');
  }

  const partes = [
    capa(ctx),
    rosto(ctx),
    sumario(ctx),
    introducao(ctx),
    ...capitulos.map(c => capitulo(ctx, c)),
    gabarito(ctx),
    indice(ctx),
    contracapa(ctx)
  ];

  const fontes = path.join(RAIZ_REPO, 'assets/fonts');
  const css = path.join(path.dirname(new URL(import.meta.url).pathname), 'estilo/guia.css');
  return `<!doctype html>
<html lang="pt-BR" class="fmt-${formato}">
<head>
<meta charset="utf-8">
<title>${esc(meta.titulo)}</title>
<meta name="author" content="${esc(textos.capa.autor)}">
<meta name="description" content="${esc(meta.descricaoCurta)}">
<style>${fontFaces(fontes)}</style>
<link rel="stylesheet" href="file://${css}">
</head>
<body data-rascunho="${ctx.ehRascunho ? '1' : ''}" data-titulo-curto="${esc(meta.titulo.replace(/ em Israel$/, ''))}">
${partes.join('\n')}
</body>
</html>`;
}

function fontFaces(dir) {
  const f = (fam, arq, peso) => `@font-face{font-family:'${fam}';src:url('file://${dir}/${arq}') format('woff2');font-weight:${peso};font-style:normal;font-display:block}`;
  return [
    ...[400, 500, 600, 700].map(p => f('Bricolage', `bricolage-grotesque-latin-${p}-normal.woff2`, p)),
    ...[400, 500, 600].map(p => f('Instrument', `instrument-sans-latin-${p}-normal.woff2`, p)),
    f('Instrument', 'instrument-sans-latin-600-normal.woff2', 700),
    ...[400, 500, 600].map(p => f('HeSerif', `noto-serif-hebrew-hebrew-${p}-normal.woff2`, p)),
    ...[400, 500, 700].map(p => f('HeSans', `noto-sans-hebrew-hebrew-${p}-normal.woff2`, p))
  ].join('\n');
}

// ── páginas fixas ──────────────────────────────────────────────────────
function capa({ produto, ehRascunho }) {
  const c = produto.textos.capa;
  return `<div class="pagina fixa capa" id="capa" data-sem-numero>
  ${ehRascunho ? '<div class="faixa-rascunho">Rascunho</div>' : ''}
  <div class="marca"><span class="selo-ayin" lang="he">ע</span><span>${esc(c.marca)}</span></div>
  <div class="arte">${arcos()}<span class="palavra" lang="he" dir="rtl">שָׁלוֹם</span><span class="palavra-tr">shalóm · olá</span></div>
  <div class="tipo">Guia de viagem</div>
  <h1>${esc(c.titulo)}</h1>
  <p class="sub">${esc(c.subtitulo)}</p>
  <div class="selos">${c.selos.map(s => `<span>${esc(s)}</span>`).join('')}</div>
  <p class="autor">por <b>${esc(c.autor)}</b> · ${esc(c.marca)}</p>
  <div class="bilhete">
    <div class="esq">
      <div><div class="rot">De</div><div class="cod">${esc(c.bilhete.de)}</div><div class="nome">${esc(c.bilhete.deNome)}</div></div>
      ${aviao()}
      <div style="text-align:right"><div class="rot">Para</div><div class="cod">${esc(c.bilhete.para)}</div><div class="nome">${esc(c.bilhete.paraNome)}</div></div>
    </div>
    <div class="dir"><span class="rot">${esc(c.bilhete.bagagem)}</span><b>${esc(c.bilhete.itens)}</b></div>
  </div>
</div>`;
}

// Arcos apontados, em traço fino: o portal de pedra de Jerusalém reduzido a
// linha. Desenho próprio, sem foto de terceiros.
function arcos() {
  const arco = (w, h, y) => {
    const x0 = 50 - w / 2, x1 = 50 + w / 2;
    return `<path d="M${x0} 100 V${y + h * .55} Q${x0} ${y + h * .12} 50 ${y} Q${x1} ${y + h * .12} ${x1} ${y + h * .55} V100" fill="none"/>`;
  };
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <g stroke="#B8862F" stroke-width=".35" opacity=".75">${arco(78, 70, 8)}${arco(62, 58, 20)}</g>
  <g stroke="#8FD6C8" stroke-width=".25" opacity=".35">${arco(94, 82, 0)}${arco(46, 44, 33)}</g>
  <line x1="2" y1="99.6" x2="98" y2="99.6" stroke="#8FD6C8" stroke-width=".25" opacity=".35"/>
</svg>`;
}
const aviao = () => `<svg class="aviao" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z" transform="rotate(90 12 12)"/></svg>`;

function rosto({ produto }) {
  const r = produto.textos.rosto;
  const ano = new Date().getFullYear();
  return `<div class="pagina fixa rosto" data-sem-numero>
  <div class="corpo">
    <div>
      <div class="kicker">${esc(produto.meta.categoria)} · versão ${esc(produto.meta.versao)}</div>
      <p class="titulo-rosto" style="margin-top:3mm">${esc(r.linhas[0])}</p>
      <p class="sub">${esc(r.linhas[1])}</p>
    </div>
    <div class="creditos">${r.creditos.map(c => `<p>${esc(c)}</p>`).join('')}</div>
    <div class="miudo">${r.direitos.map(d => `<p>${esc(d.replace('{{ano}}', ano))}</p>`).join('')}</div>
  </div>
</div>`;
}

function sumario({ produto }) {
  const ent = [
    ['', 'Introdução', 'introducao'],
    ...produto.capitulos.map(c => [n2(c.n), c.titulo, `cap-${c.n}`]),
    ['', produto.textos.gabarito.titulo, 'gabarito'],
    ['', produto.textos.indice.titulo, 'indice']
  ];
  return `<div class="pagina fixa sumario" id="sumario">
  <div class="corpo">
    <div class="kicker">Sumário</div>
    <h1>Nesta viagem</h1>
    <ol>${ent.map(([n, t, id]) => `<li><a href="#${id}"><span class="n">${n}</span><span class="t">${esc(t)}</span><span class="p" data-pagina-de="${id}"></span></a></li>`).join('')}</ol>
  </div>
</div>`;
}

function contracapa({ produto }) {
  const f = produto.textos.final;
  return `<div class="pagina fixa final" data-sem-numero>
  <span class="he-serif" lang="he" dir="rtl">${esc(f.nikud)}</span>
  <h1>${esc(f.titulo)}</h1>
  <p>${esc(f.pt)} ${esc(f.texto)}</p>
  <div class="marca-final">${esc(produto.textos.capa.marca)}<a href="https://hebraicofluente.com.br/">hebraicofluente.com.br</a></div>
</div>`;
}

// ── fluxo ──────────────────────────────────────────────────────────────
const fluxo = (cabeca, blocos, id = '') =>
  `<section class="fluxo"${id ? ` data-ancora="${id}"` : ''} data-cabeca="${esc(cabeca)}">${blocos.join('')}</section>`;

function introducao({ produto }) {
  const i = produto.textos.introducao;
  const b = [];
  b.push(bloco(`<h1 style="font-size:var(--h-cap)">${esc(i.titulo)}</h1>`, { junto: true }));
  i.paragrafos.forEach((p, k) => b.push(bloco(`<div class="texto texto-coluna${k === 0 ? ' lead' : ''}"><p>${inline(p)}</p></div>`)));
  for (const s of i.secoes) {
    const ps = s.variante === 'audio' ? i.audio[produto.meta.audio.status] : s.paragrafos;
    if (!ps) throw new Error(`introdução: sem texto para o estado de áudio ${produto.meta.audio.status}`);
    b.push(bloco(`<h2 class="sec">${esc(s.titulo)}</h2>`, { junto: true }));
    ps.forEach(p => b.push(bloco(`<div class="texto texto-coluna"><p>${inline(p)}</p></div>`)));
  }
  b.push(bloco(`<p class="tr" style="font-family:var(--f-display);font-size:13pt;margin-top:1mm">${esc(i.assinatura)}</p>`));
  return fluxo('Introdução', b, 'introducao');
}

function abertura(ctx, c) {
  const { produto } = ctx;
  const doCap = produto.itens.filter(i => i.categoria === c.id);
  let rodape = '';
  if (doCap.length) rodape = `<span><b>${doCap.length} expressões</b></span><span>${n3(doCap[0].n)} a ${n3(doCap.at(-1).n)}</span>`;
  else if (c.id === 'dialogos') rodape = `<span><b>${produto.dialogos.length} diálogos</b></span><span>do café à despedida</span>`;
  else if (c.id === 'desafios') rodape = `<span><b>${produto.atividades.length} desafios</b></span><span>gabarito no fim do guia</span>`;
  else if (c.id === 'como-funciona') rodape = `<span><b>Leia antes de tudo</b></span><span>uns 10 minutos</span>`;
  else rodape = `<span><b>Para depois da viagem</b></span><span></span>`;
  // No celular a abertura é uma página inteira, navy. No A4 ela é o topo
  // da primeira página do capítulo: em papel, uma página navy inteira por
  // capítulo é cartucho gasto e página sem conteúdo.
  if (ctx.formato === 'a4') {
    return bloco(`<header class="abertura-a4">
  <div class="esq"><div class="numero">${n2(c.n)}</div><div><span class="kicker">Capítulo ${n2(c.n)}</span><h1>${esc(c.titulo)}</h1><p class="chamada">${esc(c.chamada)}</p><p class="rodape-ab">${rodape.replace(/<\/?span>/g, ' ')}</p></div></div>
  ${c.ilustracao ? `<div class="meio">${ilustracao(c.ilustracao, '#1F8A7D', '#B8862F')}</div>` : ''}
  <div class="dir">${he(c.simbolo.nikud, 'he-serif')}<p class="leg"><b>${esc(c.simbolo.tr)}</b> · ${esc(c.simbolo.pt)}</p></div>
</header>${c.resumo ? resumo(ctx, c.resumo, true) : ''}`, { id: `cap-${c.n}` });
  }
  return `<div class="pagina fixa abertura" id="cap-${c.n}" data-cap="${c.n}">
  <div class="topo"><span>Capítulo</span><span>${esc(produto.meta.titulo.replace(/ em Israel$/, ''))}</span></div>
  <div class="numero-linha"><div class="numero">${n2(c.n)}</div>${c.ilustracao ? ilustracao(c.ilustracao) : ''}</div>
  <h1>${esc(c.titulo)}</h1>
  <p class="chamada">${esc(c.chamada)}</p>
  <div class="simbolo">${he(c.simbolo.nikud, 'he-serif')}<p class="leg"><b>${esc(c.simbolo.tr)}</b> · ${esc(c.simbolo.pt)}</p></div>
  ${c.resumo ? resumo(ctx, c.resumo, true) : ''}
  ${audioRef(ctx, `capitulo-${n2(c.n)}`)}
  <div class="rodape-ab">${rodape}</div>
</div>`;
}

// A referência de áudio só aparece quando existe uma página de verdade para
// abrir. Sem isso, nada: um QR que leva a um 404 é pior que nenhum.
function audioRef(ctx, secao) {
  if (!ctx.audioOk) return '';
  throw new Error('Áudio disponível: falta gerar os QR codes (ver produtos/README.md, "Áudio"). Implementar antes de mudar audio.status.');
}

function capitulo(ctx, c) {
  const cab = `${n2(c.n)} · ${c.curto}`;
  const b = [];
  if (c.secoes) b.push(...secoesDeTexto(ctx, c));
  if (c.abertura) c.abertura.forEach((p, k) => b.push(bloco(`<div class="texto texto-coluna${k === 0 ? ' lead' : ''}"><p>${inline(p)}</p></div>`)));
  for (const q of (c.quadros ?? []).filter(q => !q.apos)) b.push(quadro(q));
  if (c.galeria) b.push(galeria(ctx, c.galeria));
  for (const it of ctx.produto.itens.filter(i => i.categoria === c.id)) {
    b.push(cartao(it, c.id === 'placas'));
    for (const q of (c.quadros ?? []).filter(q => q.apos === it.id)) b.push(quadro(q));
  }
  if (c.id === 'dialogos') ctx.produto.dialogos.forEach((d, k) => b.push(...dialogo(ctx, d, k)));
  if (c.id === 'desafios') ctx.produto.atividades.forEach((a, k) => b.push(...atividade(ctx, a, k)));
  if (ctx.formato === 'a4') return fluxo(cab, [abertura(ctx, c), ...b]);
  return abertura(ctx, c) + fluxo(cab, b);
}

function secoesDeTexto(ctx, c) {
  const b = [];
  for (const s of c.secoes) {
    b.push(bloco(`<h2 class="sec">${esc(s.titulo)}</h2>`, { junto: true }));
    (s.paragrafos ?? []).forEach((p, k, arr) => b.push(bloco(`<div class="texto texto-coluna"><p>${inline(p)}</p></div>`, { junto: !!s.figura && k === arr.length - 1 })));
    if (s.figura) b.push(figura(ctx, s.figura));
    if (s.link) b.push(bloco(`<div class="cta"><p>${esc('Você já deu o primeiro passo. O próximo está a um toque.')}</p><a class="link" href="${esc(s.link.url)}">${esc(s.link.texto)}</a><span class="url">${esc(s.link.url.replace('https://', ''))}</span></div>`));
  }
  return b;
}

// ── componentes ────────────────────────────────────────────────────────
function cartao(it, placa = false) {
  const variantes = (it.variantes ?? []).map(v =>
    `<div class="var"><span class="rot">${esc(v.quando)}</span>${he(v.nikud)}<span class="tr">${esc(v.tr)}</span></div>`).join('');
  const ex = it.exemplo
    ? `<div class="ex"><span class="rot">Exemplo</span>${he(it.exemplo.nikud)}<span class="tr">${esc(it.exemplo.tr)}</span><span class="ptx">${esc(it.exemplo.pt)}</span></div>` : '';
  // Nas placas, a forma sem vogais vai grande e a com nikud vai no canto.
  const principal = placa ? it.he : it.nikud;
  const canto = placa ? `<span>com vogais</span>${he(it.nikud)}` : `<span>sem vogais</span>${he(it.he)}`;
  return bloco(`<article class="cartao${placa ? ' placa' : ''}">
  <div class="topo"><span class="num">${n3(it.n)}</span><span class="escrito">${canto}</span></div>
  <div class="linha"><p class="principal" lang="he" dir="rtl">${esc(principal)}</p><div class="dizer"><span class="tr">${esc(it.tr)}</span><p class="pt">${esc(it.pt)}</p></div></div>
  <p class="ctx">${inline(it.contexto)}</p>
  ${variantes}${ex}
  ${it.nota ? `<p class="nota">${inline(it.nota)}</p>` : ''}
</article>`, { cls: 'meia', id: `item-${it.id}` });
}

const ROTULO = { cultura: 'Em Israel', curiosidade: 'Curiosidade', pronuncia: 'Pronúncia', atencao: 'Atenção', referencia: 'Para consultar', emergencia: 'Importante', anotar: 'Para preencher' };

function quadro(q) {
  if (q.tipo === 'figura') {
    const f = desenharFigura(q.nome);
    return bloco(`<figure class="figura"><figcaption class="fig-tit">${esc(q.titulo ?? f.titulo)}</figcaption>${f.svg}<p class="fig-leg">${esc(q.legenda ?? f.legenda)}</p></figure>`);
  }
  let extra = '';
  if (q.palavras) extra = `<div class="palavras">${q.palavras.map(w => `<div>${he(w.nikud, 'he-serif')}<span class="tr">${esc(w.tr)}</span><span class="ptw">${esc(w.pt)}</span></div>`).join('')}</div>`;
  if (q.numeros) extra = `<div class="numeros">${q.numeros.map(x => `<div><span class="n">${esc(x.num)}</span><span class="o">${esc(x.pt)}<small>${esc(x.tr)}</small></span>${he(x.nikud, 'he-serif')}</div>`).join('')}</div>`;
  if (q.campos) extra = `<div class="campos">${q.campos.map(c => `<div>${esc(c)}</div>`).join('')}</div>`;
  return bloco(`<aside class="quadro ${q.tipo}"><span class="rot">${ROTULO[q.tipo]}</span><h3>${esc(q.titulo)}</h3><div class="texto">${paragrafos(q.texto)}</div>${extra}</aside>`);
}

// O resumo mora na abertura do capítulo: as três expressões que mais
// importam, à vista antes dos cartões e com link para cada um. No fim do
// capítulo ele caía quase sempre sozinho numa página.
function resumo(ctx, r, naAbertura = false) {
  const li = r.itens.map(id => {
    const it = ctx.itemPorId.get(id);
    return `<li><a href="#item-${id}"><span><span class="tr">${esc(it.tr)}</span><span class="ptr">${esc(it.pt)}</span></span>${he(it.nikud, 'he-serif')}</a></li>`;
  }).join('');
  const html = `<div class="resumo${naAbertura ? ' resumo-ab' : ''}"><span class="rot">${esc(r.titulo)}</span><ul>${li}</ul></div>`;
  return naAbertura ? html : bloco(html);
}

function galeria(ctx, g) {
  const placas = g.placas.map(p => {
    const it = ctx.itemPorId.get(p.ref);
    return `<a class="placa-d ${p.estilo}" href="#item-${p.ref}">${he(p.he)}<span class="en">${esc(p.en)}</span><span class="ref">item ${n3(it.n)}</span></a>`;
  }).join('');
  return bloco(`<h2 class="sec">${esc(g.titulo)}</h2>`, { junto: true }) +
    bloco(`<div class="galeria">${placas}</div><p class="galeria-nota">${esc(g.texto)}</p>`);
}

// ── capítulo 1: figuras ────────────────────────────────────────────────
function figura(ctx, tipo) {
  const ex = ctx.itemPorId.get('slicha');
  if (tipo === 'direcao') {
    return bloco(`<div class="fig fig-direcao"><div class="duas">
      <div><div class="linha" style="justify-content:flex-end">${he('שָׁלוֹם', 'he-serif')}</div>
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M98 5 H4 M10 1.5 L3 5 L10 8.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
        <p class="leg" style="text-align:right">o hebraico: da direita para a esquerda</p></div>
      <div><div class="linha"><span class="num">35 ₪</span></div>
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" style="color:var(--gold)"><path d="M2 5 H96 M90 1.5 L97 5 L90 8.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
        <p class="leg">os números: da esquerda para a direita</p></div>
    </div></div>`);
  }
  if (tipo === 'tres-formas') {
    return bloco(`<div class="fig tres">
      <div><span class="q"><b>Nas placas</b>sem vogais</span>${he('שלום', 'he v')}</div>
      <div><span class="q"><b>Com nikud</b>as vogais à mostra</span>${he('שָׁלוֹם', 'he-serif v')}</div>
      <div><span class="q"><b>Para falar</b>a transliteração</span><span class="v tr">shalóm</span></div>
    </div>`);
  }
  if (tipo === 'cartao-anotado') {
    const m = k => `<span class="marca-n">${k}</span>`;
    return bloco(`<div class="anotado">
      <article class="cartao">
        <div class="topo"><span class="num">${m(1)} ${n3(ex.n)}</span><span class="escrito">${m(2)} <span>sem vogais</span>${he(ex.he)}</span></div>
        <div class="linha"><p class="principal" lang="he" dir="rtl"><span class="marca-n" style="margin-left:2mm" dir="ltr">3</span> ${esc(ex.nikud)}</p>
        <div class="dizer"><span class="tr">${esc(ex.tr)} ${m(4)}</span><p class="pt">${esc(ex.pt)} ${m(5)}</p></div></div>
        <p class="ctx">${m(6)} ${esc(ex.contexto)}</p>
      </article>
      <ol class="legenda-anot">
        <li>${m(1)}<span>O número do item, de 001 a 100. O índice no fim do guia leva a cada um.</span></li>
        <li>${m(2)}<span>Como a palavra aparece escrita em Israel, sem vogais.</span></li>
        <li>${m(3)}<span>A palavra com nikud, as vogais à mostra.</span></li>
        <li>${m(4)}<span>A pronúncia, para você ler em voz alta.</span></li>
        <li>${m(5)}<span>O que quer dizer.</span></li>
        <li>${m(6)}<span>Quando usar. Abaixo, quando houver: a forma para mulher, um exemplo e uma nota.</span></li>
      </ol>
    </div>`);
  }
  if (tipo === 'convencao') {
    // Uma regra por bloco: a tabela inteira não cabe numa página de
    // celular, e partir entre duas regras é o lugar certo de partir.
    const t = s => `<span class="tr">${esc(s)}</span>`;
    const linhas = [
      ['ch', 'O som raspado de ח e כ. Fica no fundo da garganta, parecido com o rr carioca de <i>carro</i>, mas sem vibrar. <strong>Nunca</strong> o ch de <i>chave</i>.', `${t('cheshbón')}, ${t('lechá')}`],
      ['r', 'O ר. Também na garganta, mais suave que o ch, como o r do francês. Nunca o r de <i>caro</i>, feito com a ponta da língua.', `${t('réga')}, ${t('karóv')}`],
      ['h', 'Um sopro leve, como o h do inglês <i>house</i>. Não é mudo como em <i>hora</i>.', t('hafúch')],
      ['ts', 'O צ: t e s juntos, como em <i>pizza</i> dito em português.', t('tsimchoní')],
      ['sh', 'O שׁ: como o ch de <i>chave</i> ou o x de <i>xícara</i>.', t('shalóm')],
      ['s, ss', 'O ס e o שׂ: sempre o s de <i>sapo</i>, nunca som de z. Entre vogais, escrevo ss para você não ler z.', t('besséder')],
      ['g', 'Sempre duro, como em <i>gato</i>. Antes de e e i, escrevo gu.', t('baréguel')],
      ['y', 'Como o i de <i>iogurte</i>, encostado na vogal seguinte.', t('yashár')],
      ['ei, ai', 'Uma sílaba só, como em <i>lei</i> e <i>pai</i>.', `${t('éifo')}, ${t('beashrái')}`],
      ['á é í ó ú', 'O acento marca a <strong>sílaba forte</strong>. Não abre nem fecha a vogal. Palavra de uma sílaba não leva acento.', `${t('todá')}, ${t('bóker')}`],
      ['e, o', 'O hebraico tem um e só e um o só, entre o é e o ê, entre o ó e o ô. Não precisa escolher.', ''],
      ['aa, ea', 'Duas vogais seguidas: as duas soam.', `${t('laazór')} (la-a-zór)`],
      ['m, n', 'No fim da palavra, a boca fecha no m e a língua toca no n. Sem som de nariz.', t('shalóm')]
    ];
    const blocos = linhas.map(([g, d, exs], k) =>
      bloco(`<div class="conv${k === 0 ? ' conv-ini' : ''}"><div><span class="g">${g}</span><span class="d">${d}${exs ? ` <span class="ex">Ex.: ${exs}</span>` : ''}</span></div></div>`, { cls: 'conv-bloco' }));
    blocos.push(bloco(`<div class="conv conv-fim"><div><span class="g">finais</span><span class="d">Cinco letras mudam de forma no fim da palavra. O som não muda. Elas aparecem nas placas, então vale reconhecer:
        <span class="finais"><span>כ <small>·</small> ך</span><span>מ <small>·</small> ם</span><span>נ <small>·</small> ן</span><span>פ <small>·</small> ף</span><span>צ <small>·</small> ץ</span></span></span></div></div>`, { cls: 'conv-bloco' }));
    return blocos.join('');
  }
  throw new Error(`figura desconhecida: ${tipo}`);
}

// ── diálogos ───────────────────────────────────────────────────────────
function dialogo(ctx, d, k) {
  const pessoas = Object.entries(d.pessoas).map(([q, nome]) => `<span><span class="tag-${q}">${q}</span>${esc(nome)}</span>`).join('');
  const b = [bloco(`<div class="dlg-cab"><div class="kicker">Diálogo ${k + 1}</div><h2>${esc(d.titulo)}</h2><p class="cena">${esc(d.cena)}</p><div class="pessoas">${pessoas}</div></div>`, { junto: true, id: `dlg-${d.id}` })];
  for (const f of d.falas) {
    b.push(bloco(`<div class="fala ${f.quem}"><span class="q">${f.quem}</span><div class="bolha">${he(f.nikud, 'he-serif')}<span class="tr">${esc(f.tr)}</span><span class="ptf">${esc(f.pt)}</span></div></div>`));
  }
  const usa = d.usa.map(id => `<a href="#item-${id}">${n3(ctx.itemPorId.get(id).n)}</a>`).join(', ');
  b.push(bloco(`<div class="comentario"><span class="rot">Comentário de uso</span>${inline(d.comentario)}<p class="usa">Expressões praticadas: ${usa}</p></div>`));
  return b;
}

// ── atividades ─────────────────────────────────────────────────────────
const LETRAS = 'ABCDEF';
function atividade(ctx, a, k) {
  const b = [bloco(`<div class="atv-cab"><div class="kicker">Desafio ${k + 1}</div><h2>${esc(a.titulo)}</h2><p class="inst">${esc(a.instrucao)}</p></div>`, { junto: true, id: `atv-${a.id}` })];
  if (a.tipo === 'escolha' || a.tipo === 'situacoes') {
    a.questoes.forEach((q, i) => {
      const ops = q.opcoes ? `<div class="opcoes">${q.opcoes.map((o, j) => `<span><i>${LETRAS[j]}</i>${a.questoes[i].opcoes && q.opcoesHe ? he(o) : esc(o)}</span>`).join('')}</div>` : '<div class="linha-resp"></div>';
      b.push(bloco(`<div class="questao"><p class="enun"><span class="qn">${i + 1}</span>${esc(q.pergunta)}</p>${ops}</div>`, { cls: 'meia' }));
    });
  }
  if (a.tipo === 'associar') {
    const esq = a.pares.map((p, i) => `<li><b>${i + 1}</b><span class="he-serif" lang="he" dir="rtl">${esc(p.nikud)}<small>${esc(p.tr)}</small></span></li>`).join('');
    const dir = a.embaralhar.map((pi, j) => `<li><b>${LETRAS[j]}</b><span>${esc(a.pares[pi].pt)}</span></li>`).join('');
    b.push(bloco(`<div class="associar"><ol>${esq}</ol><ol>${dir}</ol></div>`));
  }
  if (a.tipo === 'placas') {
    a.placas.forEach((p, i) => b.push(bloco(`<div class="questao"><p class="enun"><span class="qn">${i + 1}</span>O que diz esta placa?</p>
      <div class="placa-d info" style="margin-top:2mm">${he(p.he)}</div><div class="linha-resp"></div></div>`, { cls: 'meia' })));
  }
  if (a.tipo === 'completar') {
    b.push(bloco(`<div class="banco"><span class="rot">Palavras</span>${a.banco.map(w => `<span class="p">${esc(w)}</span>`).join('')}</div>`, { junto: true }));
    b.push(bloco(a.falas.map(f => `<div class="compl"><span class="quem">${esc(f.quem)}</span><span class="txt">${esc(f.texto).replace(/____/g, '<span class="lac"></span>')}<span class="ptc">${esc(f.pt)}</span></span></div>`).join('')));
  }
  b.push(bloco(`<a class="pilula" href="#gab-${a.id}">Ver as respostas no gabarito</a>`));
  return b;
}

function gabarito({ produto }) {
  const g = produto.textos.gabarito;
  const b = [
    bloco(`<h1 style="font-size:var(--h-cap)">${esc(g.titulo)}</h1><p style="margin-top:2mm">${esc(g.chamada)}</p>`)
  ];
  produto.atividades.forEach((a, k) => {
    let li = '';
    if (a.tipo === 'escolha') li = a.questoes.map(q => `<li>${LETRAS[q.resposta]}: ${q.opcoesHe ? he(q.opcoes[q.resposta]) : esc(q.opcoes[q.resposta])}</li>`).join('');
    if (a.tipo === 'situacoes') li = a.questoes.map(q => `<li>${esc(q.resposta)}</li>`).join('');
    if (a.tipo === 'associar') li = a.pares.map((p, i) => `<li>${LETRAS[a.embaralhar.indexOf(i)]}: ${esc(p.tr)}, ${esc(p.pt)}</li>`).join('');
    if (a.tipo === 'placas') li = a.placas.map(p => `<li>${esc(p.resposta)} <span style="color:var(--ink-muted)">(${esc(p.en)})</span></li>`).join('');
    if (a.tipo === 'completar') li = a.resposta.map(r => `<li>${esc(r)}</li>`).join('');
    b.push(bloco(`<div class="gab" id="gab-${a.id}"><h3>Desafio ${k + 1} · ${esc(a.titulo)}</h3><ol>${li}</ol><a class="pilula volta" href="#atv-${a.id}">Voltar ao desafio</a></div>`, { cls: 'meia' }));
  });
  return fluxo(g.titulo, b, 'gabarito');
}

function indice({ produto }) {
  const t = produto.textos.indice;
  const b = [
    bloco(`<h1 style="font-size:var(--h-cap)">${esc(t.titulo)}</h1><p style="margin-top:2mm">${esc(t.chamada)}</p>`)
  ];
  for (const c of produto.capitulos) {
    const doCap = produto.itens.filter(i => i.categoria === c.id);
    if (!doCap.length) continue;
    b.push(bloco(`<div class="ind-cap">${n2(c.n)} · ${esc(c.titulo)}</div>`, { junto: true }));
    for (const it of doCap) {
      b.push(bloco(`<a class="ind" href="#item-${it.id}"><span class="n">${n3(it.n)}</span><span><span class="tr">${esc(it.tr)}</span> <span class="pti">${esc(it.pt)}</span></span><span class="p" data-pagina-de="item-${it.id}"></span></a>`, { cls: 'meia' }));
    }
  }
  return fluxo(t.titulo, b, 'indice');
}
