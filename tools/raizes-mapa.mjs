/* O contorno do mapa de Raízes Sefarditas, a partir da Natural Earth.
 * ─────────────────────────────────────────────────────────────────────────
 * Uso (uma vez, quando o recorte mudar):
 *   curl -o ne_50m_land.geojson \
 *     https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson
 *   node tools/raizes-mapa.mjs ne_50m_land.geojson
 *
 * Escreve data/raizes/mapa-peninsula.json: o caminho SVG da terra, o quadro e a
 * projeção, para o mapa do módulo 1 (components/raizes/MapaHistorico.tsx).
 *
 * Por que a camada `land` e não a de países: ela é só terra e mar, sem
 * fronteira nenhuma. Um mapa da Ibéria medieval desenhado com as fronteiras de
 * hoje ensinaria um anacronismo (Espanha e Portugal com o contorno atual
 * durante o califado de Córdoba). Os reinos medievais mudaram muitas vezes e
 * não são desenhados; a legenda do mapa diz isso.
 *
 * Natural Earth é domínio público. A projeção é equiretangular com a
 * longitude corrigida pelo cosseno de 40° N: suficiente para um mapa de
 * localização, não para medir distância.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const entrada = process.argv[2];
if (!entrada) {
  console.error('uso: node tools/raizes-mapa.mjs <ne_50m_land.geojson>');
  process.exit(1);
}

/* O recorte: a península, o sul da França e o norte do Marrocos. */
const QUADRO = { oeste: -10.6, leste: 4.6, sul: 35.4, norte: 44.2 };
const LARGURA = 1000;
const COS = Math.cos((40 * Math.PI) / 180);
const ESCALA = LARGURA / ((QUADRO.leste - QUADRO.oeste) * COS);
const ALTURA = Math.round((QUADRO.norte - QUADRO.sul) * ESCALA);

const projetar = ([lon, lat]) => [
  (lon - QUADRO.oeste) * COS * ESCALA,
  (QUADRO.norte - lat) * ESCALA
];

/* Sutherland-Hodgman contra o retângulo do quadro, em graus. */
function recortar(anel) {
  const lados = [
    p => p[0] >= QUADRO.oeste, p => p[0] <= QUADRO.leste,
    p => p[1] >= QUADRO.sul, p => p[1] <= QUADRO.norte
  ];
  const cortes = [
    (a, b) => corte(a, b, 0, QUADRO.oeste), (a, b) => corte(a, b, 0, QUADRO.leste),
    (a, b) => corte(a, b, 1, QUADRO.sul), (a, b) => corte(a, b, 1, QUADRO.norte)
  ];
  let saida = anel;
  for (let i = 0; i < 4 && saida.length; i++) {
    const dentro = lados[i], entra = cortes[i];
    const novo = [];
    for (let j = 0; j < saida.length; j++) {
      const atual = saida[j], antes = saida[(j + saida.length - 1) % saida.length];
      if (dentro(atual)) {
        if (!dentro(antes)) novo.push(entra(antes, atual));
        novo.push(atual);
      } else if (dentro(antes)) {
        novo.push(entra(antes, atual));
      }
    }
    saida = novo;
  }
  return saida;
}
function corte(a, b, eixo, valor) {
  const t = (valor - a[eixo]) / (b[eixo] - a[eixo]);
  return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
}

/* Douglas-Peucker, em unidades do desenho. */
function simplificar(pts, tol) {
  if (pts.length < 4) return pts;
  const manter = new Uint8Array(pts.length);
  manter[0] = manter[pts.length - 1] = 1;
  const pilha = [[0, pts.length - 1]];
  while (pilha.length) {
    const [i, j] = pilha.pop();
    let maior = 0, k = -1;
    for (let m = i + 1; m < j; m++) {
      const d = distancia(pts[m], pts[i], pts[j]);
      if (d > maior) { maior = d; k = m; }
    }
    if (maior > tol && k > 0) { manter[k] = 1; pilha.push([i, k], [k, j]); }
  }
  return pts.filter((_, i) => manter[i]);
}
function distancia(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / n;
}

const geo = JSON.parse(readFileSync(entrada, 'utf8'));
const aneis = [];
for (const f of geo.features) {
  const g = f.geometry;
  const polis = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const poli of polis) {
    for (const anel of poli) {
      const r = recortar(anel);
      if (r.length < 3) continue;
      /* Anel fechado: o primeiro ponto repete no fim, e o Douglas-Peucker
         mediria tudo contra uma "reta" de comprimento zero e apagaria a ilha
         inteira. Abre-se o anel e corta-se no ponto mais distante do início. */
      const aberto = r.map(projetar);
      const [x0, y0] = aberto[0], [xn, yn] = aberto[aberto.length - 1];
      if (x0 === xn && y0 === yn) aberto.pop();
      let longe = 0;
      for (let i = 1; i < aberto.length; i++) {
        if (Math.hypot(aberto[i][0] - x0, aberto[i][1] - y0) > Math.hypot(aberto[longe][0] - x0, aberto[longe][1] - y0)) longe = i;
      }
      const p = longe > 0
        ? [...simplificar(aberto.slice(0, longe + 1), 0.9), ...simplificar([...aberto.slice(longe), aberto[0]], 0.9).slice(1, -1)]
        : aberto;
      if (p.length < 3) continue;
      /* Ilhota de menos de um pixel quadrado é ruído na tela de um telefone. */
      let area = 0;
      for (let i = 0; i < p.length; i++) {
        const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
        area += x1 * y2 - x2 * y1;
      }
      if (Math.abs(area / 2) < 4) continue;
      aneis.push(p);
    }
  }
}

const d = aneis.map(p => 'M' + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z').join('');

const saida = {
  _: [
    'Gerado por tools/raizes-mapa.mjs a partir de Natural Earth ne_50m_land (v5.1.2, domínio público).',
    'Só terra e mar: nenhuma fronteira, de propósito (ver o comentário do gerador). Não editar à mão.'
  ],
  fonte: 'FR-035',
  quadro: QUADRO,
  largura: LARGURA,
  altura: ALTURA,
  projecao: { tipo: 'equiretangular', latitudePadrao: 40, escala: Number(ESCALA.toFixed(4)) },
  terra: d
};
writeFileSync(join(RAIZ, 'data/raizes/mapa-peninsula.json'), JSON.stringify(saida, null, 1) + '\n');
console.log(`${aneis.length} contornos, ${d.length} caracteres, quadro ${LARGURA}x${ALTURA}`);
