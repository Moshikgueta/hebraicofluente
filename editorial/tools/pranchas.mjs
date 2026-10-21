#!/usr/bin/env node
/* Pranchas de teste do estilo de ilustração da fase 6 (PROMPT-FASE-6.md,
   etapa 2): um mapa ilustrado, um comparativo com o Brasil e uma ficha de
   lugar. Saem em <livro>/ativos/pranchas/*.svg e, para olhar, em
   <livro>/saida/pranchas/*.png (renderizadas no Chromium com as fontes do
   livro).

   ── o que é dado e o que é desenho ──────────────────────────────────────
   Contorno de país, estado, lago e rio: Natural Earth 1:10m (domínio
   público). Posição de lugar: destinos.json, que aponta a fonte de cada
   coordenada. Número escrito na prancha: afirmação VERIFICADA, com o id ao
   lado no código. Distância "em linha reta" é conta feita aqui, a partir
   dessas coordenadas, e a prancha diz isso.

   Escolha de desenho, sem valor de dado: cores, ícones dos lugares, a
   sombra de papel recortado, as ondas do mar, o corte de Massada (fora de
   escala na horizontal, e a legenda avisa).

   Uso: node tools/pranchas.mjs israel-alem-do-roteiro [--sem-png] */

import fs from 'node:fs';
import path from 'node:path';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const RAIZ = path.join(EDITORIAL, livro);
const NE = path.join(RAIZ, 'ativos/dados/ne');
const SAIDA = path.join(RAIZ, 'ativos/pranchas');
const lerNE = f => JSON.parse(fs.readFileSync(path.join(NE, f + '.geojson'), 'utf8'));
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
fs.mkdirSync(SAIDA, { recursive: true });

/* Paleta da marca (templates/tokens-editorial.css). */
const C = {
  navy: '#0E3B43', noite: '#0B2A31', teal: '#1F8A7D', tealTinta: '#12665C', tealSuave: '#E4F1EE', tealLite: '#8FD6C8',
  ouro: '#B8862F', ouroTinta: '#8A6520', ouroSuave: '#F7EFDF', papel: '#FBF9F5', areia: '#F3F0E9', linha: '#E4E0D6',
  pedra: '#EFE7D6', pedraEsc: '#D9CCB0', mar: '#1E5A73', marClaro: '#D3E6E8', neguev: '#B9773E', neguevTinta: '#8C5426',
  oliveira: '#6B7444', tinta: '#1B211F', corpo: '#2E3633', suave: '#5F6A66', areiaClara: '#E9DCC0',
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const paises = lerNE('ne_10m_admin_0_countries');
const disputa = lerNE('ne_10m_admin_0_disputed_areas');
const lagos = lerNE('ne_10m_lakes');
const rios = lerNE('ne_10m_rivers_lake_centerlines');
const brasil = lerNE('ne_10m_admin_1_brasil');
const destinos = lerJSON(path.join(RAIZ, 'ativos/dados/destinos.json'));

/* Projeção equirretangular local (a mesma de tools/mapas.mjs). */
function projetor(bbox, largura, ox = 0, oy = 0) {
  const [x0, y0, x1, y1] = bbox;
  const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
  const escala = largura / ((x1 - x0) * k);
  return { p: ([x, y]) => [ox + (x - x0) * k * escala, oy + (y1 - y) * escala], escala, k, altura: (y1 - y0) * escala, largura };
}
/* Projeção em quilômetros, para comparar dois lugares na MESMA escala. */
function projetorKm(lat0, lon0, pxPorKm, ox, oy) {
  const k = Math.cos(lat0 * Math.PI / 180);
  return { p: ([x, y]) => [ox + (x - lon0) * k * 111.32 * pxPorKm, oy + (lat0 - y) * 110.57 * pxPorKm] };
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
function limites(geoms) {
  let b = [180, 90, -180, -90];
  const v = c => { if (typeof c[0] === 'number') { b = [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[0]), Math.max(b[3], c[1])]; } else c.forEach(v); };
  geoms.forEach(g => v(g.coordinates));
  return b;
}
/* Distância em linha reta (haversine), em km. */
function km([lat1, lon1], [lat2, lon2]) {
  const r = Math.PI / 180, R = 6371;
  const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* Israel como o CBS conta (C01-001): dentro das linhas de 1949 + Jerusalém
   Oriental + Golã. As duas últimas vão hachuradas, porque a ONU as trata como
   território ocupado (C01-039, C01-040). */
const ISRAEL_1949 = ['B91', 'B78', 'B79', 'B99'];
const HACHURA = ['B98', 'B16'];
const featDisp = ids => disputa.features.filter(f => ids.includes(f.properties.a3));

const estilo = id => `<style>
  .t{font-family:'Instrument Sans',system-ui,sans-serif}
  .d{font-family:'Literata Display','Literata',Georgia,serif}
  .n{font-family:'Bricolage Grotesque','Instrument Sans',sans-serif;font-weight:700}
  .he{font-family:'Noto Serif Hebrew',serif}
  .k{font-size:15px;letter-spacing:.22em;text-transform:uppercase;font-weight:600}
</style>`;
const defs = () => `<defs>
  <marker id="ponta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.neguev}"/></marker>
  <pattern id="ondas" width="46" height="22" patternUnits="userSpaceOnUse">
    <rect width="46" height="22" fill="${C.marClaro}"/>
    <path d="M3 13 q5.5 -5 11 0 t11 0" fill="none" stroke="#A9CDD2" stroke-width="1.6" stroke-linecap="round"/>
  </pattern>
  <pattern id="hachura" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="7" height="7" fill="#FBF3E2"/><line x1="0" y1="0" x2="0" y2="7" stroke="${C.ouro}" stroke-width="2"/>
  </pattern>
  <pattern id="hachura-golan" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
    <rect width="7" height="7" fill="#F4EEE2"/><line x1="0" y1="0" x2="0" y2="7" stroke="${C.ouroTinta}" stroke-width="1.6"/>
  </pattern>
</defs>`;

/* Ícones dos lugares (desenho, não dado), numa grade de 24. */
const ICONE = {
  jerusalem: 'M5 18h14v2H5zM6 18v-5h12v5M7 13a5 5 0 0 1 10 0M12 6v2',
  'tel-aviv': 'M6 20V6h12v14M9 9h2M13 9h2M9 12h2M13 12h2M9 15h2M13 15h2M5 20h14',
  jafa: 'M12 4v14M7 9h10M6 15a6 6 0 0 0 12 0M12 4a1.5 1.5 0 1 1 0 .01',
  haifa: 'M4 20h16M6 20v-3h12v3M8 17v-3h8v3M10 14v-3h4v3',
  acre: 'M4 20V9h3v2h3V9h4v2h3V9h3v11zM10 20v-4a2 2 0 0 1 4 0v4',
  cesareia: 'M4 20h16M5 20V9h14v11M8 20v-6a4 4 0 0 1 8 0v6M5 9h14',
  nazare: 'M5 20V12l7-6 7 6v8M10 20v-4h4v4',
  cafarnaum: 'M8 20V7M16 20V7M6 7h12M6 5h12M5 20h14',
  'mar-da-galileia': 'M4 15q4 -4 8 0t8 0M4 19q4 -4 8 0t8 0M9 12l3-7 3 7',
  massada: 'M3 19h18M5 19l3-9h8l3 9M8 10h8',
  'beer-sheva': 'M3 19h18M5 19c2-6 4-8 7-8s5 2 7 8M8 15h8',
};
function pino(x, y, id, r = 17) {
  return `<g><circle cx="${x.toFixed(1)}" cy="${(y + 2.5).toFixed(1)}" r="${r}" fill="${C.pedraEsc}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${C.navy}" stroke="${C.papel}" stroke-width="2.5"/>`
    + `<path transform="translate(${(x - 10.8).toFixed(1)} ${(y - 10.8).toFixed(1)}) scale(.9)" d="${ICONE[id] || 'M12 12h.01'}" fill="none" stroke="${C.papel}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
function etiqueta(x, y, nome, sub, anchor = 'start') {
  const w = Math.max(nome.length * 9.6, sub ? sub.length * 7.4 : 0) + 18;
  const h = sub ? 42 : 26;
  const rx = anchor === 'start' ? x : x - w;
  return `<g><rect x="${rx.toFixed(1)}" y="${(y - 15).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="7" fill="${C.papel}" stroke="${C.linha}"/>`
    + `<text class="t" x="${(rx + 9).toFixed(1)}" y="${(y + 3).toFixed(1)}" font-size="16" font-weight="600" fill="${C.navy}">${esc(nome)}</text>`
    + (sub ? `<text class="t" x="${(rx + 9).toFixed(1)}" y="${(y + 21).toFixed(1)}" font-size="12.5" fill="${C.suave}">${esc(sub)}</text>` : '') + '</g>';
}
const prefixo = (svg, id) => svg.replace(/id="([\w-]+)"/g, `id="${id}--$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${id}--$1)`)
  .replace(/<svg /, `<svg class="fig-${id}" `)
  .replace(/<style>([\s\S]*?)<\/style>/, (_, css) => `<style>${css.replace(/(^|\})\s*([^{}]+)\{/g, (m, a, sel) => `${a}\n${sel.split(',').map(x => `.fig-${id} ${x.trim()}`).join(',')}{`)}</style>`);

/* ── 1. Mapa ilustrado: os destinos do capítulo 4 ─────────────────────── */
function mapaIlustrado() {
  const W = 1080, H = 1350;
  const bbox = [34.1, 30.9, 36.0, 33.42];
  const P = projetor(bbox, 650, 40, 200);
  const p = P.p;
  const jer = destinos.find(d => d.id === 'jerusalem');
  let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
  s += `<clipPath id="moldura"><rect x="40" y="200" width="650" height="${P.altura.toFixed(0)}" rx="18"/></clipPath><g clip-path="url(#moldura)">`;
  s += `<rect x="40" y="200" width="650" height="${P.altura.toFixed(0)}" fill="url(#ondas)"/>`;
  for (const f of paises.features) if (!['ISR', 'PSX'].includes(f.properties.a3)) s += `<path d="${caminho(f.geometry, p)}" fill="${C.pedra}" stroke="${C.pedraEsc}" stroke-width="1"/>`;
  /* sombra de papel recortado: o mesmo contorno, deslocado */
  const israel = featDisp([...ISRAEL_1949, ...HACHURA, 'B54', 'B53']);
  s += `<g transform="translate(5 7)">${israel.map(f => `<path d="${caminho(f.geometry, p)}" fill="${C.pedraEsc}"/>`).join('')}</g>`;
  for (const f of featDisp(ISRAEL_1949)) s += `<path d="${caminho(f.geometry, p)}" fill="#FFFFFF" stroke="${C.navy}" stroke-width="2.2" stroke-linejoin="round"/>`;
  for (const f of featDisp(['B54', 'B98', 'B53'])) s += `<path d="${caminho(f.geometry, p)}" fill="url(#hachura)" stroke="${C.ouro}" stroke-width="1.4"/>`;
  for (const f of featDisp(['B16', 'B58'])) s += `<path d="${caminho(f.geometry, p)}" fill="url(#hachura-golan)" stroke="${C.ouroTinta}" stroke-width="1.4"/>`;
  for (const f of rios.features) if (/Jordan/.test(f.properties.nome || f.properties.name || '')) s += `<path d="${caminho(f.geometry, p)}" fill="none" stroke="#7FB8AE" stroke-width="2.4" stroke-linecap="round"/>`;
  for (const f of lagos.features) s += `<path d="${caminho(f.geometry, p)}" fill="${C.mar}" fill-opacity=".85" stroke="${C.mar}" stroke-width="1"/>`;
  s += '</g>';
  s += `<rect x="40" y="200" width="650" height="${P.altura.toFixed(0)}" rx="18" fill="none" stroke="${C.navy}" stroke-width="2"/>`;
  /* rótulos de mar e de lago (posição é escolha de desenho) */
  const [mx, my] = p([34.32, 32.55]);
  s += `<text class="d" x="${mx}" y="${my}" font-size="22" font-style="italic" fill="${C.mar}" transform="rotate(-72 ${mx} ${my})">Mar Mediterrâneo</text>`;
  const [dx, dy] = p([35.62, 31.5]);
  s += `<text class="t" x="${dx + 16}" y="${dy}" font-size="14" font-style="italic" fill="${C.mar}">Mar Morto</text>`;
  /* "da costa ao Mar Morto em cerca de 1h30 de carro" (C01-009): seta ilustrativa, não é rota */
  const [ax, ay] = p([34.8, 32.0]); const [bx, by] = p([35.45, 31.62]);
  s += `<path d="M${ax.toFixed(0)} ${ay.toFixed(0)} Q ${((ax + bx) / 2).toFixed(0)} ${(Math.min(ay, by) - 120).toFixed(0)} ${bx.toFixed(0)} ${by.toFixed(0)}" fill="none" stroke="${C.neguev}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" marker-end="url(#ponta)"/>`;
  /* pinos: posição = coordenada registrada; rótulo = nome e distância calculada */
  const lado = { 'tel-aviv': 'end', jafa: 'end', haifa: 'end', cesareia: 'end', acre: 'end', 'beer-sheva': 'end', nazare: 'end' };
  const desvio = { jafa: [-14, 48], 'tel-aviv': [0, -16], haifa: [0, -6], acre: [0, -16], cafarnaum: [0, -22], 'mar-da-galileia': [0, 30], nazare: [0, 10] };
  for (const d of destinos.filter(d => d.lat != null)) {
    const [x, y] = p([d.lon, d.lat]);
    const dist = d.id === 'jerusalem' ? null : Math.round(km([jer.lat, jer.lon], [d.lat, d.lon]));
    const [ox, oy] = desvio[d.id] || [0, 0];
    const anc = lado[d.id] || 'start';
    s += etiqueta(anc === 'start' ? x + 24 + ox : x - 24 + ox, y + oy, d.id === 'beer-sheva' ? "Tel Be'er Sheva" : d.nome, dist ? `${dist} km de Jerusalém` : 'ponto de partida', anc);
    const fora = { jafa: [-14, 46] }[d.id];
    if (fora) { s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${C.navy}"/><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + fora[0]).toFixed(1)}" y2="${(y + fora[1]).toFixed(1)}" stroke="${C.navy}" stroke-width="1.5"/>`; s += pino(x + fora[0], y + fora[1], d.id, 15); }
    else s += pino(x, y, d.id, d.id === 'jerusalem' ? 21 : 17);
  }
  /* escala (dado: a projeção) e norte */
  const kmPx = P.escala / (111.32 / P.k) * 1; // px por km na horizontal
  const pxKm = (P.escala * P.k) / (111.32 * P.k) ; void pxKm;
  const px50 = 50 * (P.escala / 110.57);
  s += `<g transform="translate(70 ${(210 + P.altura - 40).toFixed(0)})"><rect x="-12" y="-26" width="${(px50 + 24).toFixed(0)}" height="44" rx="8" fill="${C.papel}" fill-opacity=".92"/><rect width="${(px50 / 2).toFixed(1)}" height="7" fill="${C.navy}"/><rect x="${(px50 / 2).toFixed(1)}" width="${(px50 / 2).toFixed(1)}" height="7" fill="${C.papel}" stroke="${C.navy}"/><text class="t" x="0" y="-8" font-size="12" fill="${C.suave}">0</text><text class="t" x="${px50.toFixed(1)}" y="-8" font-size="12" fill="${C.suave}" text-anchor="end">50 km</text></g>`;
  void kmPx;
  s += `<g transform="translate(650 245)"><circle r="22" fill="${C.papel}" stroke="${C.navy}" stroke-width="1.5"/><path d="M0 -16 L6 6 L0 2 L-6 6Z" fill="${C.navy}"/><text class="t" y="-28" font-size="13" font-weight="700" text-anchor="middle" fill="${C.navy}">N</text></g>`;

  /* cabeçalho */
  s += `<text class="t k" x="40" y="70" fill="${C.tealTinta}">Mapa ilustrado · capítulo 4</text>`;
  s += `<text class="d" x="40" y="128" font-size="52" font-weight="420" fill="${C.navy}">Israel, de lugar em lugar</text>`;
  s += `<text class="t" x="40" y="168" font-size="19" fill="${C.suave}">Os destinos do capítulo e a distância de cada um até Jerusalém, em linha reta.</text>`;

  /* coluna da direita: como ler */
  const cx = 724; let cy = 236;
  const bloco = (titulo, linhas, cor = C.navy) => { let b = `<text class="t" x="${cx}" y="${cy}" font-size="13" font-weight="700" letter-spacing="2.4" fill="${cor}">${esc(titulo.toUpperCase())}</text>`; cy += 26; for (const l of linhas) { b += `<text class="t" x="${cx}" y="${cy}" font-size="16" fill="${C.corpo}">${esc(l)}</text>`; cy += 23; } cy += 22; return b; };
  s += bloco('Distâncias', ['Em linha reta, calculadas a partir', 'das coordenadas registradas de', 'cada lugar. De carro, a estrada', 'é sempre mais longa.']);
  s += `<path d="M${cx} ${cy - 6} h40" stroke="${C.neguev}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>`;
  s += `<text class="t" x="${cx + 52}" y="${cy}" font-size="16" fill="${C.corpo}">Da costa ao Mar Morto:</text>`; cy += 23;
  s += `<text class="t" x="${cx + 52}" y="${cy}" font-size="16" fill="${C.corpo}">cerca de 1h30 de carro.</text>`; cy += 45;
  s += `<rect x="${cx}" y="${cy - 16}" width="34" height="22" fill="url(#hachura)" stroke="${C.ouro}"/><text class="t" x="${cx + 46}" y="${cy}" font-size="16" fill="${C.corpo}">Cisjordânia, Jerusalém</text>`; cy += 23;
  s += `<text class="t" x="${cx + 46}" y="${cy}" font-size="16" fill="${C.corpo}">Oriental e Gaza</text>`; cy += 34;
  s += `<rect x="${cx}" y="${cy - 16}" width="34" height="22" fill="url(#hachura-golan)" stroke="${C.ouroTinta}"/><text class="t" x="${cx + 46}" y="${cy}" font-size="16" fill="${C.corpo}">Colinas de Golã</text>`; cy += 28;
  s += `<text class="t" x="${cx}" y="${cy}" font-size="13.5" fill="${C.suave}">O status de cada área está no</text>`; cy += 19;
  s += `<text class="t" x="${cx}" y="${cy}" font-size="13.5" fill="${C.suave}">capítulo 1, "o que diz a ONU".</text>`; cy += 44;
  s += bloco('Fora do mapa', ['O Mar Morto não tem ponto: o', 'livro fala do lago inteiro, não', 'de um lugar na margem.']);

  /* rodapé */
  s += `<line x1="40" x2="${W - 40}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
  s += `<text class="t" x="40" y="${H - 46}" font-size="12.5" fill="${C.suave}">Contornos: Natural Earth (domínio público). Coordenadas: UNESCO e registros do capítulo 4 (destinos.json). Tempo de carro: Ministério das Relações Exteriores de Israel.</text>`;
  s += `<text class="t" x="40" y="${H - 26}" font-size="12.5" fill="${C.suave}">Ícones, cores e rótulos são desenho. Hebraico Fluente · Israel Além do Roteiro</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa ilustrado de Israel com os destinos do capítulo 4 e a distância de cada um até Jerusalém, em linha reta.">${estilo()}${defs()}<g fill="${C.tinta}">${s}</g></svg>`;
}

/* ── 2. Comparativo com o Brasil: Israel x Sergipe ────────────────────── */
function comparativo() {
  const W = 1080, H = 1350, PX = 1.42; // px por km, igual para os dois
  let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
  s += `<rect x="0" y="0" width="${W}" height="300" fill="${C.navy}"/>`;
  s += `<text class="t k" x="56" y="78" fill="${C.tealLite}">Israel x Brasil</text>`;
  s += `<text class="d" x="56" y="160" font-size="74" font-weight="380" fill="#FFFFFF">Do tamanho</text>`;
  s += `<text class="d" x="56" y="240" font-size="74" font-weight="380" fill="${C.ouro}">de Sergipe</text>`;
  s += `<text class="t" x="${W - 56}" y="240" font-size="19" text-anchor="end" fill="${C.areiaClara}">Israel e Sergipe, lado a lado,</text><text class="t" x="${W - 56}" y="266" font-size="19" text-anchor="end" fill="${C.areiaClara}">na mesma escala</text>`;

  /* Israel (contagem do CBS) */
  const isr = featDisp([...ISRAEL_1949, ...HACHURA]);
  const bI = limites(isr.map(f => f.geometry));
  const PI = projetorKm(bI[3], bI[0], PX, 90, 350);
  s += `<g transform="translate(6 8)">${isr.map(f => `<path d="${caminho(f.geometry, PI.p)}" fill="${C.pedraEsc}"/>`).join('')}</g>`;
  for (const f of featDisp(ISRAEL_1949)) s += `<path d="${caminho(f.geometry, PI.p)}" fill="${C.navy}" stroke="${C.navy}" stroke-width="1.5" stroke-linejoin="round"/>`;
  for (const f of featDisp(['B98'])) s += `<path d="${caminho(f.geometry, PI.p)}" fill="url(#hachura)" stroke="${C.ouro}" stroke-width="1.5"/>`;
  for (const f of featDisp(['B16'])) s += `<path d="${caminho(f.geometry, PI.p)}" fill="url(#hachura-golan)" stroke="${C.ouroTinta}" stroke-width="1.5"/>`;
  const [, iyMax] = PI.p([bI[2], bI[1]]);
  s += `<text class="d" x="280" y="${((350 + iyMax) / 2 + 40).toFixed(0)}" font-size="30" fill="${C.navy}">Israel</text>`;

  /* Sergipe */
  const se = brasil.features.find(f => f.properties.postal === 'SE');
  const bS = limites([se.geometry]);
  const PS = projetorKm(bS[3], bS[0], PX, 520, 360);
  s += `<g transform="translate(6 8)"><path d="${caminho(se.geometry, PS.p)}" fill="${C.pedraEsc}"/></g>`;
  s += `<path d="${caminho(se.geometry, PS.p)}" fill="${C.teal}" stroke="${C.tealTinta}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const [, syMax] = PS.p([bS[2], bS[1]]);
  const [sxC, syC] = PS.p([(bS[0] + bS[2]) / 2, (bS[1] + bS[3]) / 2]);
  s += `<text class="d" x="${sxC.toFixed(0)}" y="${(syC + 10).toFixed(0)}" font-size="30" text-anchor="middle" fill="#FFFFFF">Sergipe</text>`;

  /* números (C01-001, C01-201, C01-202), na coluna da direita */
  let y = syMax + 70;
  s += `<line x1="520" x2="${W - 56}" y1="${y - 40}" y2="${y - 40}" stroke="${C.navy}" stroke-width="1.5"/>`;
  s += `<text class="n" x="520" y="${y + 20}" font-size="50" fill="${C.navy}">22.072 km²</text>`;
  s += `<text class="t" x="520" y="${y + 50}" font-size="16" fill="${C.suave}">Israel, pelo CBS, contando Jerusalém Oriental e o Golã</text>`;
  y += 110;
  s += `<text class="n" x="520" y="${y + 20}" font-size="50" fill="${C.tealTinta}">21.938 km²</text>`;
  s += `<text class="t" x="520" y="${y + 50}" font-size="16" fill="${C.suave}">Sergipe, pelo IBGE (área territorial 2022)</text>`;
  y += 100;
  s += `<rect x="520" y="${y}" width="${W - 56 - 520}" height="128" rx="16" fill="${C.ouroSuave}"/>`;
  s += `<text class="n" x="546" y="${y + 56}" font-size="42" fill="${C.neguevTinta}">134 km²</text>`;
  s += `<text class="t" x="546" y="${y + 86}" font-size="17" fill="${C.corpo}">de diferença: menos de 1%.</text>`;
  s += `<text class="t" x="546" y="${y + 110}" font-size="15" fill="${C.suave}">Dentro das linhas de 1949, cerca de 20.700 km².</text>`;

  /* legenda das hachuras e escala comum, embaixo de Israel */
  const yL = Math.max(iyMax + 50, y + 170);
  s += `<rect x="90" y="${(yL - 17).toFixed(0)}" width="30" height="20" fill="url(#hachura)" stroke="${C.ouro}"/><rect x="126" y="${(yL - 17).toFixed(0)}" width="30" height="20" fill="url(#hachura-golan)" stroke="${C.ouroTinta}"/>`;
  s += `<text class="t" x="170" y="${yL.toFixed(0)}" font-size="16" fill="${C.corpo}">Jerusalém Oriental e Golã entram na conta do CBS; a ONU trata as duas áreas</text>`;
  s += `<text class="t" x="170" y="${(yL + 22).toFixed(0)}" font-size="16" fill="${C.corpo}">como território ocupado (capítulo 1).</text>`;
  const y50 = yL + 70; const w100 = 100 * PX;
  s += `<rect x="90" y="${y50}" width="${(w100 / 2).toFixed(1)}" height="8" fill="${C.navy}"/><rect x="${(90 + w100 / 2).toFixed(1)}" y="${y50}" width="${(w100 / 2).toFixed(1)}" height="8" fill="${C.papel}" stroke="${C.navy}"/>`;
  s += `<text class="t" x="90" y="${y50 - 10}" font-size="13" fill="${C.suave}">0</text><text class="t" x="${(90 + w100).toFixed(1)}" y="${y50 - 10}" font-size="13" text-anchor="end" fill="${C.suave}">100 km</text>`;
  s += `<text class="t" x="${(110 + w100).toFixed(1)}" y="${y50 + 8}" font-size="13" fill="${C.suave}">a mesma escala para os dois</text>`;

  /* localizador: o Brasil inteiro, Sergipe em destaque */
  const bB = limites(brasil.features.map(f => f.geometry));
  const PB = projetor(bB, 150, 875, 350);
  for (const f of brasil.features) s += `<path d="${caminho(f.geometry, PB.p)}" fill="${f.properties.postal === 'SE' ? C.teal : C.pedra}" stroke="${C.pedraEsc}" stroke-width=".6"/>`;
  s += `<text class="t" x="950" y="${(350 + PB.altura + 22).toFixed(0)}" font-size="13" text-anchor="middle" fill="${C.suave}">Sergipe no Brasil</text>`;

  s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
  s += `<text class="t" x="56" y="${H - 46}" font-size="12.5" fill="${C.suave}">Áreas: CBS de Israel e IBGE (Área territorial brasileira 2022); 20.700 km²: Biblioteca do Congresso dos EUA. Contornos: Natural Earth.</text>`;
  s += `<text class="t" x="56" y="${H - 26}" font-size="12.5" fill="${C.suave}">Os dois contornos estão na mesma escala, em quilômetros. Hebraico Fluente · Israel Além do Roteiro</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Israel e Sergipe lado a lado, na mesma escala: 22.072 km² e 21.938 km².">${estilo()}${defs()}<g fill="${C.tinta}">${s}</g></svg>`;
}

/* ── 3. Ficha de lugar: Massada ───────────────────────────────────────── */
function fichaMassada() {
  const W = 1080, H = 1350;
  const mas = destinos.find(d => d.id === 'massada'), jer = destinos.find(d => d.id === 'jerusalem');
  const dist = Math.round(km([jer.lat, jer.lon], [mas.lat, mas.lon]));
  let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
  /* faixa de título */
  s += `<rect width="${W}" height="250" fill="${C.navy}"/>`;
  s += `<text class="t k" x="56" y="74" fill="${C.tealLite}">Ficha de lugar · capítulo 4</text>`;
  s += `<text class="d" x="56" y="160" font-size="84" font-weight="380" fill="#FFFFFF">Massada</text>`;
  s += `<text class="he" x="${W - 56}" y="150" font-size="60" text-anchor="start" fill="${C.ouro}" direction="rtl" unicode-bidi="embed">מְצָדָה</text>`;
  s += `<text class="t" x="${W - 56}" y="192" font-size="18" text-anchor="end" fill="${C.areiaClara}">Metsadá</text>`;
  s += `<text class="t" x="56" y="210" font-size="19" fill="${C.areiaClara}">Palácio-fortaleza de Herodes e o cerco romano mais completo que se conhece.</text>`;

  /* corte esquemático: rampa a oeste, penhasco a leste, Mar Morto (C04-034, C04-036, C04-044) */
  const y0 = 330, base = 640;
  s += `<rect x="0" y="250" width="${W}" height="${base - 250 + 40}" fill="${C.ouroSuave}"/>`;
  s += `<circle cx="300" cy="320" r="36" fill="${C.ouro}" opacity=".85"/>`;
  const plato = `M0 ${base} L120 ${base} C220 ${base - 20} 330 ${y0 + 150} 430 ${y0 + 40} L470 ${y0} L700 ${y0} L716 ${y0 + 22} L730 ${base - 60} L760 ${base - 6} L${W} ${base - 6} L${W} ${base + 40} L0 ${base + 40}Z`;
  s += `<path d="${plato}" transform="translate(6 8)" fill="${C.pedraEsc}"/>`;
  s += `<path d="${plato}" fill="${C.neguev}" stroke="${C.neguevTinta}" stroke-width="2" stroke-linejoin="round"/>`;
  s += `<path d="M120 ${base} C220 ${base - 20} 330 ${y0 + 150} 430 ${y0 + 40}" fill="none" stroke="${C.ouroSuave}" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round"/>`;
  s += `<rect x="760" y="${base - 6}" width="${W - 760}" height="46" fill="${C.mar}"/>`;
  s += `<path d="M780 ${base + 10} q8 -6 16 0 t16 0 M860 ${base + 22} q8 -6 16 0 t16 0 M960 ${base + 12} q8 -6 16 0 t16 0" fill="none" stroke="#7FB4C4" stroke-width="2"/>`;
  /* trilha em zigue-zague e teleférico no lado leste */
  s += `<path d="M736 ${base - 20} L708 ${base - 70} L726 ${base - 120} L706 ${base - 170} L720 ${base - 220} L704 ${y0 + 24}" fill="none" stroke="${C.ouroSuave}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>`;
  s += `<path d="M700 ${y0 + 4} L880 ${base - 30}" stroke="${C.navy}" stroke-width="2"/><rect x="782" y="${(y0 + base) / 2 - 6}" width="22" height="16" rx="3" fill="${C.navy}"/>`;
  /* cota de 450 m */
  s += `<path d="M1010 ${y0} V${base - 6}" stroke="${C.navy}" stroke-width="2"/><path d="M1000 ${y0} h20 M1000 ${base - 6} h20" stroke="${C.navy}" stroke-width="2"/>`;
  s += `<line x1="700" x2="1000" y1="${y0}" y2="${y0}" stroke="${C.navy}" stroke-width="1" stroke-dasharray="4 5"/>`;
  s += `<text class="n" x="996" y="${(y0 + base) / 2 + 52}" font-size="38" text-anchor="end" fill="${C.navy}">450 m</text>`;
  s += `<text class="t" x="996" y="${(y0 + base) / 2 + 76}" font-size="14" text-anchor="end" fill="${C.corpo}">acima do Mar Morto</text>`;
  s += `<text class="t" x="40" y="${y0 + 120}" font-size="16" font-weight="600" fill="${C.navy}">Oeste: a rampa romana</text>`;
  s += `<text class="t" x="40" y="${y0 + 142}" font-size="14" fill="${C.corpo}">pela estrada 3199,</text><text class="t" x="40" y="${y0 + 160}" font-size="14" fill="${C.corpo}">a partir de Arad</text>`;
  s += `<text class="t" x="470" y="${y0 - 16}" font-size="16" font-weight="600" fill="${C.navy}">O platô</text>`;
  s += `<text class="t" x="772" y="${y0 + 40}" font-size="16" font-weight="600" fill="${C.navy}">Leste:</text>`;
  s += `<text class="t" x="772" y="${y0 + 60}" font-size="14" fill="${C.corpo}">Trilha da Serpente</text><text class="t" x="772" y="${y0 + 78}" font-size="14" fill="${C.corpo}">ou teleférico</text>`;
  s += `<text class="t" x="1060" y="${base + 30}" font-size="15" font-style="italic" text-anchor="end" fill="#FFFFFF">Mar Morto</text>`;
  s += `<text class="t" x="56" y="${base + 68}" font-size="12.5" fill="${C.suave}">Corte esquemático, de oeste para leste. A altura é a do registro; a largura está fora de escala. Não há estrada entre os dois lados.</text>`;

  /* números */
  const yN = base + 112;
  const tile = (x, num, l1, l2) => `<text class="n" x="${x}" y="${yN + 44}" font-size="50" fill="${C.neguevTinta}">${num}</text><text class="t" x="${x}" y="${yN + 76}" font-size="15.5" fill="${C.corpo}">${esc(l1)}</text><text class="t" x="${x}" y="${yN + 97}" font-size="15.5" fill="${C.corpo}">${esc(l2)}</text>`;
  s += `<line x1="56" x2="${W - 56}" y1="${yN - 4}" y2="${yN - 4}" stroke="${C.navy}" stroke-width="1.5"/>`;
  s += tile(56, '2001', 'Patrimônio Mundial', 'da UNESCO');
  s += tile(306, '1966', 'parque nacional', 'desde');
  s += tile(556, '8', 'acampamentos romanos', 'em volta do rochedo');
  s += tile(806, `${dist} km`, 'de Jerusalém,', 'em linha reta');
  s += `<line x1="56" x2="${W - 56}" y1="${yN + 124}" y2="${yN + 124}" stroke="${C.linha}"/>`;

  /* três blocos de texto */
  const yB = yN + 170;
  const col = (x, rot, cor, linhas) => `<text class="t" x="${x}" y="${yB}" font-size="13" font-weight="700" letter-spacing="2.4" fill="${cor}">${esc(rot.toUpperCase())}</text>` + linhas.map((l, i) => `<text class="t" x="${x}" y="${yB + 30 + i * 24}" font-size="17" fill="${C.corpo}">${esc(l)}</text>`).join('');
  s += col(56, 'O que observar', C.tealTinta, ['Em volta do rochedo, os oito', 'acampamentos romanos e o muro', 'de cerco; a rampa, no lado oeste.']);
  s += col(396, 'Calor', C.neguevTinta, ['Em dias muito quentes, a última', 'subida pela Trilha da Serpente', 'é antecipada. Os horários', 'mudam com a estação.']);
  s += col(736, 'Você sabia?', C.ouroTinta, ['Uma semente de tâmara achada', 'aqui nos anos 1960 germinou', 'em 2005. A planta ganhou', 'o apelido de Matusalém.']);

  /* localizador: Israel inteiro, Jerusalém e Massada (C04-047, C04-083).
     História: C04-035, C02-027, C04-036, C04-037; debate: C04-042 e cap. 4. */
  const yM = yB + 132;
  const isr = featDisp([...ISRAEL_1949, 'B98', 'B16', 'B54', 'B53']);
  const PL = projetor([34.2, 29.45, 35.9, 33.4], 64, 96, yM - 10);
  for (const f of isr) s += `<path d="${caminho(f.geometry, PL.p)}" fill="${['B54', 'B98', 'B53', 'B16'].includes(f.properties.a3) ? C.pedra : C.pedraEsc}" stroke="${C.navy}" stroke-width=".8"/>`;
  const [jx, jy] = PL.p([jer.lon, jer.lat]); const [mx2, my2] = PL.p([mas.lon, mas.lat]);
  s += `<line x1="${jx.toFixed(1)}" y1="${jy.toFixed(1)}" x2="${mx2.toFixed(1)}" y2="${my2.toFixed(1)}" stroke="${C.neguev}" stroke-width="2.5" stroke-dasharray="2 5" stroke-linecap="round"/>`;
  s += `<circle cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="5" fill="${C.navy}"/><circle cx="${mx2.toFixed(1)}" cy="${my2.toFixed(1)}" r="7" fill="${C.neguev}" stroke="${C.papel}" stroke-width="2"/>`;
  s += `<text class="t" x="${(jx + 10).toFixed(1)}" y="${(jy - 6).toFixed(1)}" font-size="13" font-weight="600" fill="${C.navy}">Jerusalém</text><text class="t" x="${(mx2 + 12).toFixed(1)}" y="${(my2 + 5).toFixed(1)}" font-size="13" font-weight="600" fill="${C.neguevTinta}">Massada</text>`;
  s += `<text class="t" x="306" y="${yM + 24}" font-size="13" font-weight="700" letter-spacing="2.4" fill="${C.navy}">A HISTÓRIA EM POUCAS LINHAS</text>`;
  ['Herodes, rei da Judeia de 37 a 4 a.C., construiu no rochedo um', 'palácio-fortaleza. Na revolta contra Roma, Massada foi o último', 'reduto rebelde. O cerco deixou a rampa e os acampamentos que', 'se veem até hoje. Flávio Josefo é a única fonte antiga sobre o fim.', 'Mais no capítulo 4, e o debate sobre o símbolo, na mesma seção.']
    .forEach((l, i) => { s += `<text class="t" x="306" y="${yM + 56 + i * 25}" font-size="17" fill="${i === 4 ? C.tealTinta : C.corpo}">${esc(l)}</text>`; });

  s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
  s += `<text class="t" x="56" y="${H - 46}" font-size="12.5" fill="${C.suave}">Fontes: Autoridade de Natureza e Parques de Israel; Centro do Patrimônio Mundial da UNESCO; Science News e Associated Press (a tâmara).</text>`;
  s += `<text class="t" x="56" y="${H - 26}" font-size="12.5" fill="${C.suave}">Distância calculada das coordenadas da UNESCO. Hebraico Fluente · Israel Além do Roteiro</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ficha de Massada: corte do rochedo com a rampa romana a oeste e a trilha e o teleférico a leste, 450 metros acima do Mar Morto, e os principais números do lugar.">${estilo()}${defs()}<g fill="${C.tinta}">${s}</g></svg>`;
}

const pranchas = { 'prancha-mapa-ilustrado': mapaIlustrado(), 'prancha-israel-sergipe': comparativo(), 'prancha-ficha-massada': fichaMassada() };
for (const [id, svg] of Object.entries(pranchas)) fs.writeFileSync(path.join(SAIDA, id + '.svg'), prefixo(svg, id));
console.log('pranchas:', Object.keys(pranchas).join(', '));

/* PNG para olhar: uma página com as fontes do livro, uma prancha por vez. */
if (!args.includes('--sem-png')) {
  const tokens = fs.readFileSync(path.join(EDITORIAL, 'templates/tokens-editorial.css'), 'utf8');
  const faces = (fs.readFileSync(path.join(EDITORIAL, 'templates/revista.css'), 'utf8').match(/@font-face[^}]+\}/g) || []).join('\n')
    .replace(/url\('([^']+)'\)/g, (_, u) => `url('file://${path.resolve(EDITORIAL, 'templates', u)}')`);
  const dir = path.join(RAIZ, 'saida/pranchas'); fs.mkdirSync(dir, { recursive: true });
  const { chromium } = await import('playwright-core');
  const b = await chromium.launch({ executablePath: process.env.HF_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const id of Object.keys(pranchas)) {
    const html = path.join(dir, id + '.html');
    fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${tokens}${faces}body{margin:0}svg{display:block;width:1080px;height:1350px}</style>${fs.readFileSync(path.join(SAIDA, id + '.svg'), 'utf8')}`);
    await pg.goto('file://' + html); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(dir, id + '.png') });
  }
  await b.close();
  console.log('png em', path.relative(EDITORIAL, dir));
}
