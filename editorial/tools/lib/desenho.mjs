/* Biblioteca de desenho do estilo "papel recortado" (DESIGN-SYSTEM.md,
   seção 8): paleta, projeções, contornos, padrões, ícones e o prefixo que
   isola cada SVG dentro do livro. Usada por tools/pranchas.mjs e
   tools/ilustracoes.mjs. Nada aqui é dado: os dados entram por quem chama. */

import fs from 'node:fs';
import path from 'node:path';

export function carregarNE(raiz) {
  const NE = path.join(raiz, 'ativos/dados/ne');
  const ler = f => JSON.parse(fs.readFileSync(path.join(NE, f + '.geojson'), 'utf8'));
  return { paises: ler('ne_10m_admin_0_countries'), disputa: ler('ne_10m_admin_0_disputed_areas'), lagos: ler('ne_10m_lakes'), rios: ler('ne_10m_rivers_lake_centerlines'), brasil: ler('ne_10m_admin_1_brasil') };
}

/* Paleta da marca (templates/tokens-editorial.css). */
export const C = {
  navy: '#0E3B43', noite: '#0B2A31', teal: '#1F8A7D', tealTinta: '#12665C', tealSuave: '#E4F1EE', tealLite: '#8FD6C8',
  ouro: '#B8862F', ouroTinta: '#8A6520', ouroSuave: '#F7EFDF', papel: '#FBF9F5', areia: '#F3F0E9', linha: '#E4E0D6',
  pedra: '#EFE7D6', pedraEsc: '#D9CCB0', mar: '#1E5A73', marClaro: '#D3E6E8', neguev: '#B9773E', neguevTinta: '#8C5426',
  oliveira: '#6B7444', tinta: '#1B211F', corpo: '#2E3633', suave: '#5F6A66', areiaClara: '#E9DCC0',
};
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');


/* Projeção equirretangular local (a mesma de tools/mapas.mjs). */
export function projetor(bbox, largura, ox = 0, oy = 0) {
  const [x0, y0, x1, y1] = bbox;
  const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
  const escala = largura / ((x1 - x0) * k);
  return { p: ([x, y]) => [ox + (x - x0) * k * escala, oy + (y1 - y) * escala], escala, k, altura: (y1 - y0) * escala, largura };
}
/* Projeção em quilômetros, para comparar dois lugares na MESMA escala. */
export function projetorKm(lat0, lon0, pxPorKm, ox, oy) {
  const k = Math.cos(lat0 * Math.PI / 180);
  return { p: ([x, y]) => [ox + (x - lon0) * k * 111.32 * pxPorKm, oy + (lat0 - y) * 110.57 * pxPorKm] };
}
export function caminho(geom, p) {
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
export function limites(geoms) {
  let b = [180, 90, -180, -90];
  const v = c => { if (typeof c[0] === 'number') { b = [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[0]), Math.max(b[3], c[1])]; } else c.forEach(v); };
  geoms.forEach(g => v(g.coordinates));
  return b;
}
/* Distância em linha reta (haversine), em km. */
export function km([lat1, lon1], [lat2, lon2]) {
  const r = Math.PI / 180, R = 6371;
  const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* Israel como o CBS conta (C01-001): dentro das linhas de 1949 + Jerusalém
   Oriental + Golã. As duas últimas vão hachuradas, porque a ONU as trata como
   território ocupado (C01-039, C01-040). */
export const ISRAEL_1949 = ['B91', 'B78', 'B79', 'B99'];
export const HACHURA = ['B98', 'B16'];
export const featDisp = (disputa, ids) => disputa.features.filter(f => ids.includes(f.properties.a3));

export const estilo = id => `<style>
  .t{font-family:'Instrument Sans',system-ui,sans-serif}
  .d{font-family:'Literata Display','Literata',Georgia,serif}
  .n{font-family:'Bricolage Grotesque','Instrument Sans',sans-serif;font-weight:700}
  .he{font-family:'Noto Serif Hebrew',serif}
  .k{font-size:15px;letter-spacing:.22em;text-transform:uppercase;font-weight:600}
</style>`;
export const defs = () => `<defs>
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
export const ICONE = {
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
export function pino(x, y, id, r = 17) {
  return `<g><circle cx="${x.toFixed(1)}" cy="${(y + 2.5).toFixed(1)}" r="${r}" fill="${C.pedraEsc}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${C.navy}" stroke="${C.papel}" stroke-width="2.5"/>`
    + `<path transform="translate(${(x - 10.8).toFixed(1)} ${(y - 10.8).toFixed(1)}) scale(.9)" d="${ICONE[id] || 'M12 12h.01'}" fill="none" stroke="${C.papel}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
export function etiqueta(x, y, nome, sub, anchor = 'start') {
  const w = Math.max(nome.length * 9.6, sub ? sub.length * 7.4 : 0) + 18;
  const h = sub ? 42 : 26;
  const rx = anchor === 'start' ? x : x - w;
  return `<g><rect x="${rx.toFixed(1)}" y="${(y - 15).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="7" fill="${C.papel}" stroke="${C.linha}"/>`
    + `<text class="t" x="${(rx + 9).toFixed(1)}" y="${(y + 3).toFixed(1)}" font-size="16" font-weight="600" fill="${C.navy}">${esc(nome)}</text>`
    + (sub ? `<text class="t" x="${(rx + 9).toFixed(1)}" y="${(y + 21).toFixed(1)}" font-size="12.5" fill="${C.suave}">${esc(sub)}</text>` : '') + '</g>';
}
export const prefixo = (svg, id) => svg.replace(/id="([\w-]+)"/g, `id="${id}--$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${id}--$1)`)
  .replace(/<svg /, `<svg class="fig-${id}" `)
  .replace(/<style>([\s\S]*?)<\/style>/, (_, css) => `<style>${css.replace(/(^|\})\s*([^{}]+)\{/g, (m, a, sel) => `${a}\n${sel.split(',').map(x => `.fig-${id} ${x.trim()}`).join(',')}{`)}</style>`);

