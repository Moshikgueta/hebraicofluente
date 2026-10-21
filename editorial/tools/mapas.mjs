#!/usr/bin/env node
/* Gera os mapas do livro em SVG a partir da Natural Earth (1:10m, domínio
   público), recortada em <livro>/ativos/dados/ne/.

   ── por que não desenhar à mão ─────────────────────────────────────────
   Fronteira de memória é fronteira errada, e num livro sobre Israel um
   traço errado é uma declaração política. Todo contorno daqui sai dos
   arquivos da Natural Earth. As áreas de status disputado vêm da camada
   `admin_0_disputed_areas`, que separa Israel dentro das linhas de 1949,
   Cisjordânia, Jerusalém Oriental, Faixa de Gaza e Colinas de Golã - e é ela
   que o mapa pinta, cada uma com a legenda que a nota do mapa explica.

   O que é escolha nossa, e está dito na legenda: a posição dos RÓTULOS de
   país, de mar e de região (rótulo não é dado) e as cores. As coordenadas de
   cidade vêm da Natural Earth ou de <livro>/ativos/dados/destinos.json, que
   aponta a fonte de cada uma.

   Uso: node tools/mapas.mjs israel-alem-do-roteiro */

import fs from 'node:fs';
import path from 'node:path';

const livro = process.argv[2] || 'israel-alem-do-roteiro';
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', livro);
const NE = path.join(RAIZ, 'ativos/dados/ne');
const SAIDA = path.join(RAIZ, 'ativos/mapas');
const ler = f => JSON.parse(fs.readFileSync(path.join(NE, f + '.geojson'), 'utf8'));
const lerDados = f => { const p = path.join(RAIZ, 'ativos/dados', f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };

const paises = ler('ne_10m_admin_0_countries');
const disputa = ler('ne_10m_admin_0_disputed_areas');
const lagos = ler('ne_10m_lakes');
const rios = ler('ne_10m_rivers_lake_centerlines');

/* A paleta do Hebraico Fluente (app/src/styles/tokens.css), em tons de mapa. */
const COR = {
  mar: '#DCEBE8', terra: '#F3F0E9', vizinho: '#ECE7DC', borda: '#C9C1B0',
  israel: '#FFFFFF', israelBorda: '#0E3B43', disputa: '#B8862F', golan: '#8A6520',
  lago: '#BFDCD6', rio: '#7FB8AE', tinta: '#1B211F', muda: '#5F6A66', navy: '#0E3B43', teal: '#1F8A7D',
};

function projetor(bbox, largura) {
  const [x0, y0, x1, y1] = bbox;
  const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
  const escala = largura / ((x1 - x0) * k);
  const altura = Math.round((y1 - y0) * escala);
  const p = ([x, y]) => [((x - x0) * k * escala), ((y1 - y) * escala)];
  return { p, largura, altura, escala, k };
}

function caminho(geom, p) {
  const anel = a => a.map((c, i) => { const [x, y] = p(c); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join('') + 'Z';
  const linha = a => a.map((c, i) => { const [x, y] = p(c); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join('');
  switch (geom.type) {
    case 'Polygon': return geom.coordinates.map(anel).join('');
    case 'MultiPolygon': return geom.coordinates.flatMap(pol => pol.map(anel)).join('');
    case 'LineString': return linha(geom.coordinates);
    case 'MultiLineString': return geom.coordinates.map(linha).join('');
    default: return '';
  }
}

/* Várias figuras moram no mesmo HTML do livro: um id repetido (a moldura, a
   hachura) faria uma figura usar o recorte da outra. Cada id ganha o nome da
   figura como prefixo. */
const comPrefixo = (svg, id) => svg
  .replace(/id="([\w-]+)"/g, `id="${id}--$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${id}--$1)`)
  /* O <style> de um SVG inline vale para a página inteira: cada seletor fica
     preso à figura, senão a classe .nota do mapa encolhe as notas do livro. */
  .replace(/<svg /, `<svg class="fig-${id}" `)
  .replace(/<style>([\s\S]*?)<\/style>/, (_, css) => `<style>${css.replace(/(^|\})\s*([^{}]+)\{/g, (m, a, sel) => `${a}\n${sel.split(',').map(x => `.fig-${id} ${x.trim()}`).join(',')}{`)}</style>`);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function estilo() {
  return `<style>
    .rot{font-family:'Instrument Sans','DM Sans',sans-serif;fill:${COR.tinta}}
    .pais{font-size:13px;letter-spacing:.14em;text-transform:uppercase;fill:${COR.muda};font-weight:600}
    .mar{font-size:13px;font-style:italic;fill:#4F7F78;letter-spacing:.06em}
    .cid{font-size:11.5px;font-weight:600}
    .reg{font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;fill:${COR.navy}}
    .nota{font-size:9.5px;fill:${COR.muda}}
    .he{font-family:'Noto Sans Hebrew',sans-serif}
  </style>`;
}

function hachura() {
  return `<defs>
    <pattern id="h-disputa" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#FBF3E2"/><line x1="0" y1="0" x2="0" y2="6" stroke="${COR.disputa}" stroke-width="1.6"/>
    </pattern>
    <pattern id="h-golan" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <rect width="6" height="6" fill="#F4EEE2"/><line x1="0" y1="0" x2="0" y2="6" stroke="${COR.golan}" stroke-width="1.2"/>
    </pattern>
  </defs>`;
}

/* As áreas da camada de disputa e como cada uma é pintada. */
const AREAS = {
  B91: { fill: COR.israel, stroke: COR.israelBorda, w: 1.3 },          // Israel dentro das linhas de 1949
  B78: { fill: COR.israel, stroke: 'none', w: 0 },                      // terra de ninguém de Latrun
  B79: { fill: COR.israel, stroke: 'none', w: 0 },                      // terra de ninguém de Jerusalém
  B99: { fill: COR.israel, stroke: 'none', w: 0 },                      // Monte Scopus
  B54: { fill: 'url(#h-disputa)', stroke: COR.disputa, w: 1 },          // Cisjordânia
  B98: { fill: 'url(#h-disputa)', stroke: COR.disputa, w: 0.8 },        // Jerusalém Oriental
  B53: { fill: 'url(#h-disputa)', stroke: COR.disputa, w: 1 },          // Faixa de Gaza
  B16: { fill: 'url(#h-golan)', stroke: COR.golan, w: 1 },              // Colinas de Golã
  B58: { fill: 'url(#h-golan)', stroke: COR.golan, w: 0.8 },            // Fazendas de Shebaa
};

function base(bbox, largura, { rios: comRios = true } = {}) {
  const P = projetor(bbox, largura);
  const { p } = P;
  let s = `<rect width="${P.largura}" height="${P.altura}" fill="${COR.mar}"/>`;
  for (const f of paises.features) {
    if (['ISR', 'PSX'].includes(f.properties.a3)) continue;
    s += `<path d="${caminho(f.geometry, p)}" fill="${COR.vizinho}" stroke="${COR.borda}" stroke-width=".8" stroke-linejoin="round"/>`;
  }
  for (const f of disputa.features) {
    const a = AREAS[f.properties.a3];
    if (!a) continue;
    s += `<path d="${caminho(f.geometry, p)}" fill="${a.fill}" stroke="${a.stroke}" stroke-width="${a.w}" stroke-linejoin="round"/>`;
  }
  if (comRios) for (const f of rios.features) {
    if (!/Jordan/.test(f.properties.nome || '')) continue;
    s += `<path d="${caminho(f.geometry, p)}" fill="none" stroke="${COR.rio}" stroke-width="1.3" stroke-linecap="round"/>`;
  }
  for (const f of lagos.features) {
    s += `<path d="${caminho(f.geometry, p)}" fill="${COR.lago}" stroke="#8FBFB5" stroke-width=".6"/>`;
  }
  return { P, s };
}

function rotulo(P, [lon, lat], texto, cls, { dx = 0, dy = 0, anchor = 'middle', rot = 0 } = {}) {
  const [x, y] = P.p([lon, lat]);
  const t = rot ? ` transform="rotate(${rot} ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)})"` : '';
  return `<text class="rot ${cls}" x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}"${t}>${esc(texto)}</text>`;
}

function ponto(P, [lon, lat], { r = 3.2, cor = COR.navy, anel = false } = {}) {
  const [x, y] = P.p([lon, lat]);
  return anel
    ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r + 2}" fill="#fff" stroke="${cor}" stroke-width="1.4"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r - .6}" fill="${cor}"/>`
    : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${cor}" stroke="#fff" stroke-width="1"/>`;
}

/* Barra de escala: 1 grau de latitude ~ 111,32 km. */
function escala(P, km, [x, y]) {
  const pxPorKm = P.escala / 111.32;
  const w = km * pxPorKm;
  return `<g><rect x="${x}" y="${y}" width="${(w / 2).toFixed(1)}" height="4" fill="${COR.navy}"/><rect x="${(x + w / 2).toFixed(1)}" y="${y}" width="${(w / 2).toFixed(1)}" height="4" fill="#fff" stroke="${COR.navy}" stroke-width=".8"/>
    <text class="rot nota" x="${x}" y="${y - 4}">0</text><text class="rot nota" x="${(x + w).toFixed(1)}" y="${y - 4}" text-anchor="end">${km} km</text></g>`;
}

function norte(x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M0 -14 L6 6 L0 2 L-6 6Z" fill="${COR.navy}"/><text class="rot nota" x="0" y="18" text-anchor="middle" style="font-weight:700">N</text></g>`;
}

function svg(P, corpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P.largura} ${P.altura}" width="${P.largura}" height="${P.altura}" role="img">${estilo()}${hachura()}<clipPath id="moldura"><rect width="${P.largura}" height="${P.altura}"/></clipPath><g clip-path="url(#moldura)">${corpo}</g><rect width="${P.largura}" height="${P.altura}" fill="none" stroke="${COR.borda}" stroke-width="1"/></svg>`;
}

/* Cidades: coordenadas da Natural Earth (populated places), anotadas aqui com
   a origem. As que não estão na Natural Earth vêm de destinos.json. */
const CIDADES_NE = {
  Jerusalém: [35.207, 31.778], 'Tel Aviv': [34.768, 32.082], Haifa: [34.978, 32.822],
  "Be'er Sheva": [34.83, 31.25], Nazaré: [35.296, 32.704], Amã: [35.931, 31.952],
  Beirute: [35.508, 33.872], Damasco: [36.298, 33.502], Cairo: [31.25, 30.05],
};

function legenda(x, y, itens, largura = 250) {
  let s = `<g transform="translate(${x} ${y})"><rect x="-8" y="-14" width="${largura}" height="${itens.length * 19 + 14}" rx="6" fill="#fff" fill-opacity=".92" stroke="${COR.borda}"/>`;
  itens.forEach(([fill, stroke, texto], i) => {
    s += `<rect x="0" y="${i * 19 - 6}" width="16" height="11" fill="${fill}" stroke="${stroke}" stroke-width="1"/><text class="rot nota" style="font-size:10px;fill:${COR.tinta}" x="24" y="${i * 19 + 3}">${esc(texto)}</text>`;
  });
  return s + '</g>';
}

const ITENS_LEGENDA = [
  [COR.israel, COR.israelBorda, 'Israel (linhas de armistício de 1949)'],
  ['url(#h-disputa)', COR.disputa, 'Cisjordânia (com Jerusalém Oriental) e Gaza'],
  ['url(#h-golan)', COR.golan, 'Colinas de Golã'],
];

/* 1. Mapa regional: o Mediterrâneo Oriental. */
function mapaRegional() {
  const { P, s } = base([29.0, 27.0, 39.6, 36.6], 720, { rios: false });
  let c = s;
  c += rotulo(P, [32.2, 34.0], 'Mar Mediterrâneo', 'mar');
  c += rotulo(P, [33.0, 35.15], 'Chipre', 'pais', { dy: 4 });
  c += rotulo(P, [31.0, 29.0], 'Egito', 'pais');
  c += rotulo(P, [37.3, 31.1], 'Jordânia', 'pais');
  c += rotulo(P, [37.8, 34.6], 'Síria', 'pais');
  c += rotulo(P, [35.95, 33.95], 'Líbano', 'pais', { anchor: 'start', dx: 10 });
  c += rotulo(P, [38.5, 28.3], 'Arábia Saudita', 'pais');
  c += rotulo(P, [33.9, 29.5], 'Sinai', 'pais', { dy: 0 });
  c += rotulo(P, [34.78, 30.55], 'Israel', 'pais', { rot: -68 });
  c += rotulo(P, [35.1, 28.15], 'Golfo de Aqaba', 'mar', { rot: -72, dx: -6 });
  c += rotulo(P, [33.05, 28.4], 'Golfo de Suez', 'mar', { rot: -55 });
  for (const n of ['Jerusalém', 'Tel Aviv', 'Amã', 'Beirute', 'Damasco', 'Cairo']) {
    c += ponto(P, CIDADES_NE[n], { r: 2.8 });
    const lado = ['Tel Aviv', 'Beirute'].includes(n) ? { anchor: 'end', dx: -7, dy: 4 } : { anchor: 'start', dx: 7, dy: 4 };
    c += rotulo(P, CIDADES_NE[n], n, 'cid', lado);
  }
  c += legenda(P.largura - 262, P.altura - 66, ITENS_LEGENDA);
  c += escala(P, 100, [24, P.altura - 22]);
  c += norte(P.largura - 26, 30);
  return svg(P, c);
}

/* 2. Regiões geográficas de Israel (rótulos esquemáticos). */
const RECORTE_PAIS = [34.05, 29.4, 36.05, 33.45];

function mapaRegioes() {
  const { P, s } = base(RECORTE_PAIS, 430);
  let c = s;
  const reg = [
    ['Galileia', [35.3, 32.98]], ['Golã', [35.75, 33.08], -70], ['Planície costeira', [34.72, 32.45], -62],
    ['Montes centrais', [35.13, 32.22], -76], ['Vale do Jordão', [35.49, 32.2], -88], ['Mar Morto', [35.62, 31.38], 0],
    ['Neguev', [34.85, 30.65]], ['Arava', [35.17, 30.25], -66],
  ];
  for (const [n, pos, rot = 0] of reg) c += rotulo(P, pos, n, 'reg', { rot });
  c += rotulo(P, [34.3, 31.95], 'Mar Mediterrâneo', 'mar', { rot: -62 });
  c += rotulo(P, [35.5, 32.82], 'Mar da', 'nota', { anchor: 'end', dx: -6, dy: -2 });
  c += rotulo(P, [35.5, 32.82], 'Galileia', 'nota', { anchor: 'end', dx: -6, dy: 9 });
  c += rotulo(P, [34.3, 31.66], 'Faixa de Gaza', 'nota', { anchor: 'middle' });
  c += rotulo(P, [35.24, 31.72], 'Cisjordânia', 'nota', { anchor: 'start', dx: 0 });
  for (const n of ['Jerusalém', 'Tel Aviv', 'Haifa', "Be'er Sheva"]) {
    c += ponto(P, CIDADES_NE[n], { r: 2.6 });
    c += rotulo(P, CIDADES_NE[n], n, 'cid', { anchor: 'end', dx: -6, dy: 4 });
  }
  const dest = lerDados('destinos.json');
  const eilat = dest && (Array.isArray(dest) ? dest : dest.destinos || []).find(d => /eilat/i.test(d.id || d.nome));
  if (eilat && eilat.lat) { c += ponto(P, [eilat.lon, eilat.lat], { r: 2.6 }); c += rotulo(P, [eilat.lon, eilat.lat], 'Eilat', 'cid', { anchor: 'end', dx: -6, dy: 4 }); }
  c += legenda(22, P.altura - 112, ITENS_LEGENDA.map(([f, b, t]) => [f, b, t.replace(' (com Jerusalém Oriental)', ', com Jer. Oriental,')]), 228);
  c += escala(P, 50, [18, P.altura - 20]);
  c += norte(P.largura - 24, 30);
  return svg(P, c);
}

/* Centro de um lago da Natural Earth (média dos vértices do maior anel):
   o rótulo do lago fica dentro do desenho do lago, sem coordenada inventada. */
function centroLago(nome) {
  const fs2 = lagos.features.filter(f => f.properties.nome === nome);
  let melhor = null;
  for (const f of fs2) {
    const aneis = f.geometry.type === 'Polygon' ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map(p => p[0]);
    for (const a of aneis) if (!melhor || a.length > melhor.length) melhor = a;
  }
  if (!melhor) return null;
  const n = melhor.length;
  return [melhor.reduce((s, c) => s + c[0], 0) / n, melhor.reduce((s, c) => s + c[1], 0) / n];
}

/* 3. Destinos do capítulo 4. */
function mapaDestinos() {
  const dest = lerDados('destinos.json');
  const lista = dest ? (Array.isArray(dest) ? dest : dest.destinos || []) : [];
  const { P, s } = base([34.15, 30.85, 35.95, 33.25], 470);
  let c = s;
  c += rotulo(P, [34.4, 32.2], 'Mar Mediterrâneo', 'mar', { rot: -62 });
  const kin = centroLago('Sea of Galilee'), morto = centroLago('Dead Sea');
  if (kin) c += rotulo(P, kin, 'Kinéret', 'mar', { dy: 4, rot: -80 });
  if (morto) c += rotulo(P, morto, 'Mar Morto', 'mar', { rot: -84, dy: 4 });
  const esquerda = /^(tel-aviv|jafa|haifa|cesareia|acre|beer)/;
  const ajuste = { 'tel-aviv': -3, jafa: 11, cafarnaum: -2 };
  for (const d of lista) {
    if (typeof d.lat !== 'number' || typeof d.lon !== 'number') continue;
    if (/^mar-/.test(d.id || '')) continue; // corpos d'água: rotulados no desenho do lago
    if (d.lat < 30.85 || d.lat > 33.25) continue;
    const anchor = esquerda.test(d.id || '') ? 'end' : 'start';
    const jer = /jerusal/i.test(d.id || '');
    const nome = String(d.nome).replace(/\s*\(.*\)\s*$/, '');
    c += ponto(P, [d.lon, d.lat], { r: 3, anel: jer });
    c += rotulo(P, [d.lon, d.lat], nome, 'cid', { anchor, dx: anchor === 'end' ? -7 : 7, dy: (ajuste[d.id] ?? 4) });
  }
  c += legenda(22, 44, ITENS_LEGENDA.map(([f, b, t]) => [f, b, t.replace(' (com Jerusalém Oriental)', ', com Jer. Oriental,')]), 228);
  c += escala(P, 25, [18, P.altura - 20]);
  c += norte(P.largura - 24, 30);
  return svg(P, c);
}

/* Pontos tocáveis do mapa de regiões (experiência digital). A POSIÇÃO é
   escolha de diagramação (perto do rótulo da região, nunca um limite); o
   TEXTO vem de regioes.json, e só entra região com afirmação VERIFICADO. */
const POS_REGIAO = [
  [/gol/i, [35.75, 32.95]], [/alta galileia|^galileia/i, [35.35, 33.0]], [/hula/i, [35.6, 33.1]], [/kin|mar da galileia/i, [35.58, 32.82]],
  [/litoral|costeir|carmelo|sharon/i, [34.8, 32.6]], [/montes|judeia|samaria/i, [35.15, 31.9]], [/jord/i, [35.52, 32.35]],
  [/mar morto/i, [35.5, 31.5]], [/neguev/i, [34.85, 30.8]], [/arava/i, [35.15, 30.35]], [/eilat|extremo sul/i, [34.97, 29.65]],
];
function pontosRegioes() {
  const reg = lerDados('regioes.json'); if (!Array.isArray(reg)) return [];
  const afs = new Map();
  for (const f of fs.readdirSync(path.join(RAIZ, 'afirmacoes')).filter(f => f.endsWith('.json'))) for (const a of JSON.parse(fs.readFileSync(path.join(RAIZ, 'afirmacoes', f), 'utf8')).afirmacoes || []) afs.set(a.id, a.status);
  const P = projetor(RECORTE_PAIS, 430);
  return reg.filter(r => (r.afirmacoes || []).length && r.afirmacoes.every(id => ['VERIFICADO', 'CONTESTADO'].includes(afs.get(id))))
    .map(r => { const pos = (POS_REGIAO.find(([re]) => re.test(r.nome) || re.test(r.id)) || [])[1]; if (!pos) return null; const [x, y] = P.p(pos); return { id: r.id, nome: r.nome, texto: r.descricao_curta, x: +(x / P.largura * 100).toFixed(1), y: +(y / P.altura * 100).toFixed(1) }; })
    .filter(Boolean);
}
fs.writeFileSync(path.join(RAIZ, 'ativos/dados/mapa-regioes-pontos.json'), JSON.stringify(pontosRegioes(), null, 1) + '\n');

fs.mkdirSync(SAIDA, { recursive: true });
const gerados = { 'mapa-regional': mapaRegional(), 'mapa-regioes': mapaRegioes(), 'mapa-destinos': mapaDestinos() };
for (const [id, conteudo] of Object.entries(gerados)) {
  fs.writeFileSync(path.join(SAIDA, id + '.svg'), comPrefixo(conteudo, id));
  console.log('mapa', id, (conteudo.length / 1024).toFixed(0) + ' KB');
}
