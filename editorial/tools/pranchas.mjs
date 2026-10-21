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
import { C, esc, projetor, projetorKm, caminho, limites, km, pino, etiqueta, ISRAEL_1949, HACHURA, featDisp as featDispBase, estilo, defs, prefixo, carregarNE } from './lib/desenho.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const RAIZ = path.join(EDITORIAL, livro);
const SAIDA = path.join(RAIZ, 'ativos/pranchas');
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
fs.mkdirSync(SAIDA, { recursive: true });
const { paises, disputa, lagos, rios, brasil } = carregarNE(RAIZ);
const destinos = lerJSON(path.join(RAIZ, 'ativos/dados/destinos.json'));
const featDisp = ids => featDispBase(disputa, ids);

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
  s += `<rect x="${cx}" y="${cy - 16}" width="34" height="22" fill="url(#hachura)" stroke="${C.ouro}"/><text class="t" x="${cx + 46}" y="${cy}" font-size="16" fill="${C.corpo}">Judeia e Samaria</text>`; cy += 23;
  s += `<text class="t" x="${cx + 46}" y="${cy}" font-size="16" fill="${C.corpo}">(Cisjordânia) e Gaza</text>`; cy += 34;
  s += `<rect x="${cx}" y="${cy - 16}" width="34" height="22" fill="url(#hachura-golan)" stroke="${C.ouroTinta}"/><text class="t" x="${cx + 46}" y="${cy}" font-size="16" fill="${C.corpo}">Colinas de Golã</text>`; cy += 28;
  cy += 30;
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
  s += `<text class="t" x="170" y="${yL.toFixed(0)}" font-size="16" fill="${C.corpo}">Jerusalém Oriental e Golã entram na conta do CBS.</text>`;
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
