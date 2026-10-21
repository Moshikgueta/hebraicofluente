#!/usr/bin/env node
/* Infográficos e esquemas do livro, em SVG, a partir de <livro>/ativos/dados.

   Regra: só se desenha o que tem afirmação VERIFICADO por trás. Um dado
   marcado como parcial ou pendente no JSON não vira barra, número nem
   rótulo; se não sobrar nada, o arquivo não é gerado e o livro mostra que a
   figura falta, em vez de mostrar um desenho bonito e errado.

   Uso: node tools/infograficos.mjs israel-alem-do-roteiro */

import fs from 'node:fs';
import path from 'node:path';

const livro = process.argv[2] || 'israel-alem-do-roteiro';
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', livro);
const DADOS = path.join(RAIZ, 'ativos/dados');
const lerDados = f => { const p = path.join(DADOS, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const afirmacoes = new Map();
for (const f of fs.readdirSync(path.join(RAIZ, 'afirmacoes')).filter(f => f.endsWith('.json'))) {
  for (const a of JSON.parse(fs.readFileSync(path.join(RAIZ, 'afirmacoes', f), 'utf8')).afirmacoes || []) afirmacoes.set(a.id, a);
}
const verificado = ids => Array.isArray(ids) && ids.length > 0 && ids.every(id => ['VERIFICADO', 'CONTESTADO'].includes(afirmacoes.get(id)?.status));
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

const ESTILO = `<style>
  .t{font-family:'Instrument Sans',sans-serif;fill:#1B211F}
  .tit{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:15px;fill:#0E3B43}
  .peq{font-size:10px;fill:#5F6A66}
  .rot{font-size:11px;font-weight:600}
  .num{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:22px;fill:#0E3B43}
  .mes{font-size:9.5px;font-weight:600;fill:#5F6A66}
</style>`;

const gerados = {};

/* ── clima ─────────────────────────────────────────────────────────── */
function clima() {
  const d = lerDados('clima.json');
  if (!d) return null;
  const cidades = (d.cidades || []).filter(c => verificado(c.afirmacoes || (c.afirmacao ? [c.afirmacao] : [])) && c.precipitacao_mm_ano != null);
  const pv = d.padrao_verificado;
  if (!cidades.length && !(pv && verificado(pv.afirmacoes))) return null;
  const W = 640, H = 330;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${ESTILO}
  <defs><linearGradient id="chuva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F8A7D"/><stop offset=".55" stop-color="#8FD6C8"/><stop offset="1" stop-color="#E9D3A6"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="#FBF9F5"/>`;
  if (pv) {
    /* Coluna da esquerda: o gradiente norte-sul da chuva anual. */
    s += `<text class="t tit" x="24" y="34">Chuva por ano, de norte a sul</text>
    <rect x="40" y="56" width="34" height="230" rx="6" fill="url(#chuva)"/>
    <text class="t num" x="88" y="78">até ~${pv.precipitacao_norte_mm_ano_ate.toLocaleString('pt-BR')} mm</text>
    <text class="t peq" x="88" y="94">montanhas da Alta Galileia, no norte</text>
    <text class="t num" x="88" y="270">menos de ${pv.precipitacao_extremo_sul_mm_ano_abaixo_de} mm</text>
    <text class="t peq" x="88" y="286">extremo sul (região de Eilat)</text>
    <text class="t rot" x="57" y="50" text-anchor="middle" style="font-size:10px;fill:#12665C">N</text>
    <text class="t rot" x="57" y="302" text-anchor="middle" style="font-size:10px;fill:#8A6520">S</text>`;
    /* Coluna da direita: em que meses chove. */
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const chuvosa = new Set([10, 11, 0, 1, 2]); const seca = new Set([5, 6, 7]);
    s += `<text class="t tit" x="340" y="34">Quando chove</text>`;
    meses.forEach((m, i) => {
      const x = 340 + (i % 6) * 46, y = 60 + Math.floor(i / 6) * 74;
      const cor = chuvosa.has(i) ? '#1F8A7D' : seca.has(i) ? '#E9D3A6' : '#F3F0E9';
      const tinta = chuvosa.has(i) ? '#fff' : '#5F6A66';
      s += `<rect x="${x}" y="${y}" width="40" height="52" rx="6" fill="${cor}" stroke="#E4E0D6"/><text class="t mes" x="${x + 20}" y="${y + 31}" text-anchor="middle" style="fill:${tinta}">${m}</text>`;
    });
    s += `<rect x="340" y="222" width="14" height="10" rx="2" fill="#1F8A7D"/><text class="t peq" x="360" y="231">estação chuvosa: ${esc(pv.estacao_chuvosa)}</text>
    <rect x="340" y="242" width="14" height="10" rx="2" fill="#E9D3A6"/><text class="t peq" x="360" y="251">em geral sem chuva: ${esc(pv.meses_em_geral_sem_chuva)}</text>
    <rect x="340" y="262" width="14" height="10" rx="2" fill="#F3F0E9" stroke="#E4E0D6"/><text class="t peq" x="360" y="271">meses de transição</text>`;
  }
  s += `<text class="t peq" x="24" y="${H - 10}">Valores aproximados; anos isolados variam muito.</text></svg>`;
  return s;
}

/* ── semana ─────────────────────────────────────────────────────────── */
function semana() {
  const d = lerDados('semana.json');
  if (!d || /bloquead/i.test(d.status || '')) return null;
  const dias = (d.dias || []).filter(x => verificado(x.afirmacoes_rotulo));
  if (dias.length !== 7) return null;
  const W = 640, H = 250; const w = 84;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${ESTILO}<rect width="${W}" height="${H}" fill="#FBF9F5"/>`;
  dias.forEach((x, i) => {
    const X = 14 + i * (w + 4.5);
    const notas = (x.notas || []).filter(n => verificado(n.afirmacoes));
    const shabat = i === 6;
    s += `<rect x="${X}" y="16" width="${w}" height="${H - 32}" rx="8" fill="${shabat ? '#0E3B43' : i === 5 ? '#F7EFDF' : '#fff'}" stroke="#E4E0D6"/>
      <text class="t rot" x="${X + w / 2}" y="40" text-anchor="middle" style="fill:${shabat ? '#fff' : '#1B211F'}">${esc(x.dia_pt)}</text>
      <text x="${X + w / 2}" y="66" text-anchor="middle" style="font-family:'Noto Serif Hebrew';font-size:15px;fill:${shabat ? '#B8862F' : '#0E3B43'}">${esc(x.rotulo_he)}</text>
      <text class="t peq" x="${X + w / 2}" y="84" text-anchor="middle" style="fill:${shabat ? '#8FD6C8' : '#5F6A66'}">${esc(x.rotulo_translit)}</text>`;
    notas.slice(0, 4).forEach((n, k) => {
      s += `<text class="t peq" x="${X + 6}" y="${110 + k * 26}" style="fill:${shabat ? '#E7F0EE' : '#414A47'}">${esc(n.texto_curto || n.texto).slice(0, 22)}</text>`;
    });
  });
  return s + '</svg>';
}

/* ── esquema da Cidade Antiga de Jerusalém ───────────────────────────── */
function jerusalem() {
  const d = lerDados('jerusalem.json');
  if (!d) return null;
  /* Cada lista pode vir como array ou como bloco {exibir, itens}; um bloco
     com exibir:false é lista de trabalho e não entra no desenho. */
  const lista = v => Array.isArray(v) ? v : (v && v.exibir && Array.isArray(v.itens) ? v.itens : []);
  const ok = x => x && typeof x === 'object' && x.exibir !== false && verificado(x.afirmacoes || []);
  const bairros = lista(d.bairros).filter(ok);
  const portoes = lista(d.portoes).filter(ok);
  const pontos = lista(d.pontos).filter(ok).filter(p => p.x != null && p.y != null);
  if (!bairros.length && !pontos.length) return null;
  const W = 600, H = 520;
  /* A muralha como um quadrilátero esquemático; os bairros como quadrantes:
     NO cristão, NE muçulmano, SO armênio, SE judeu (posição relativa
     conforme jerusalem.json; o esquema não tem escala). */
  const X0 = 90, Y0 = 70, X1 = 470, Y1 = 430, CX = 290, CY = 250;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${ESTILO}<rect width="${W}" height="${H}" fill="#FBF9F5"/>`;
  const quad = { noroeste: [X0, Y0, CX, CY], nordeste: [CX, Y0, X1, CY], sudoeste: [X0, CY, CX - 40, Y1], sudeste: [CX - 40, CY, X1, Y1] };
  const cores = { noroeste: '#E4F1EE', nordeste: '#F7EFDF', sudoeste: '#EDE7F3', sudeste: '#F3F0E9' };
  for (const b of bairros) {
    const q = quad[b.posicao]; if (!q) continue;
    s += `<rect x="${q[0]}" y="${q[1]}" width="${q[2] - q[0]}" height="${q[3] - q[1]}" fill="${cores[b.posicao]}"/>`;
    s += `<text class="t rot" x="${(q[0] + q[2]) / 2}" y="${(q[1] + q[3]) / 2}" text-anchor="middle" style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;fill:#0E3B43">${esc(b.nome)}</text>`;
  }
  s += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="none" stroke="#8A6520" stroke-width="7" stroke-linejoin="round"/>`;
  const lado = { norte: (t) => [X0 + t * (X1 - X0), Y0, 0, -14], sul: (t) => [X0 + t * (X1 - X0), Y1, 0, 22], oeste: (t) => [X0, Y0 + t * (Y1 - Y0), -10, 4], leste: (t) => [X1, Y0 + t * (Y1 - Y0), 10, 4] };
  for (const p of portoes) {
    const f = lado[p.lado]; if (!f) continue;
    const [x, y, dx, dy] = f(p.posicao_relativa ?? .5);
    s += `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" fill="#fff" stroke="#0E3B43" stroke-width="2"/>`;
    const anchor = p.lado === 'oeste' ? 'end' : p.lado === 'leste' ? 'start' : 'middle';
    s += `<text class="t peq" x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" style="font-weight:600;fill:#1B211F">${esc(p.nome)}</text>`;
  }
  for (const p of pontos) {
    if (p.x == null || p.y == null) continue;
    const x = X0 + p.x * (X1 - X0), y = Y0 + p.y * (Y1 - Y0);
    s += `<circle cx="${x}" cy="${y}" r="5" fill="#1F8A7D" stroke="#fff" stroke-width="1.5"/><text class="t peq" x="${x + 8}" y="${y + 4}" style="fill:#1B211F">${esc(p.nome)}</text>`;
  }
  s += `<text class="t peq" x="${W - 16}" y="${H - 12}" text-anchor="end">Esquema fora de escala</text>`;
  s += `<g transform="translate(${W - 30} 34)"><path d="M0 -14 L6 6 L0 2 L-6 6Z" fill="#0E3B43"/><text class="t peq" x="0" y="18" text-anchor="middle" style="font-weight:700">N</text></g>`;
  return s + '</svg>';
}


/* ── perfil de altitude: do Mediterrâneo ao Mar Morto ────────────────────
   Só os pontos com afirmação VERIFICADO entram. O traçado ENTRE os pontos é
   esquemático (uma curva suave), e a legenda diz isso; sem distância
   verificada, os pontos ficam igualmente espaçados e a legenda também diz. */
function perfil(escuro = true) {
  const d = lerDados('perfil.json');
  if (!d || /bloquead/i.test(d.status || '')) return null;
  const pts = (d.pontos || []).filter(p => typeof p.altitude_m === 'number' && verificado(p.afirmacoes));
  if (pts.length < 2) return null;
  const W = 900, H = 1200, X0 = 70, X1 = W - 70, TOPO = 430, BASE = 1010;
  const max = Math.max(...pts.map(p => p.altitude_m)), min = Math.min(0, ...pts.map(p => p.altitude_m));
  const y = a => TOPO + (max - a) / (max - min) * (BASE - TOPO);
  const temDist = pts.every(p => typeof p.dist_km_desde_tel_aviv === 'number');
  const dmax = temDist ? Math.max(...pts.map(p => p.dist_km_desde_tel_aviv)) : pts.length - 1;
  const x = (p, i) => X0 + (temDist ? p.dist_km_desde_tel_aviv : i) / dmax * (X1 - X0);
  const P = pts.map((p, i) => [x(p, i), y(p.altitude_m)]);
  /* curva suave (Catmull-Rom → Bézier) */
  let path = `M${P[0][0]},${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    path += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  const fundo = escuro ? '#0B2A31' : '#FBF9F5', tinta = escuro ? '#FFFFFF' : '#1B211F', suave = escuro ? '#E9DCC0' : '#5F6A66';
  const zero = y(0);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Perfil de altitude do Mediterrâneo ao Mar Morto">
  <style>.a{font-family:'Bricolage Grotesque',sans-serif;font-weight:700}.l{font-family:'Instrument Sans',sans-serif;font-weight:600;letter-spacing:.14em;text-transform:uppercase}.n{font-family:'Instrument Sans',sans-serif}</style>
  <defs><linearGradient id="terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A36A"/><stop offset=".55" stop-color="#B9773E"/><stop offset="1" stop-color="#6E4423"/></linearGradient>
  <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F7F8C"/><stop offset="1" stop-color="#1E5A73"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="${fundo}"/>`;
  /* o mar à esquerda, no nível zero */
  s += `<rect x="0" y="${zero}" width="${X0 + 6}" height="${H - zero}" fill="url(#agua)" opacity=".9"/>`;
  s += `<path d="${path} L${P[P.length - 1][0]},${H} L${P[0][0]},${H} Z" fill="url(#terra)"/>`;
  /* a água do Mar Morto no último ponto, se for ele */
  const ult = pts[pts.length - 1]; const pu = P[P.length - 1];
  if (/morto/i.test(ult.nome)) s += `<rect x="${pu[0] - 10}" y="${pu[1]}" width="${W - pu[0] + 10}" height="${H - pu[1]}" fill="url(#agua)"/>`;
  else s += `<rect x="${pu[0]}" y="${pu[1]}" width="${W - pu[0]}" height="${H - pu[1]}" fill="url(#terra)"/>`;
  s += `<path d="${path}" fill="none" stroke="${escuro ? '#FBF3E2' : '#0E3B43'}" stroke-width="3"/>`;
  s += `<line x1="0" x2="${W}" y1="${zero}" y2="${zero}" stroke="${suave}" stroke-dasharray="6 7" stroke-width="1.5" opacity=".8"/>
  <text class="l" x="${W - 24}" y="${zero - 10}" text-anchor="end" font-size="15" fill="${suave}">nível do mar · 0 m</text>`;
  pts.forEach((p, i) => {
    const [px, py] = P[i]; const acima = p.altitude_m >= 0;
    const ty = acima ? py - 70 : py + 64;
    const anchor = i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle';
    const tx = i === 0 ? px - 10 : i === pts.length - 1 ? px + 10 : px;
    s += `<circle cx="${px}" cy="${py}" r="9" fill="${fundo}" stroke="${escuro ? '#FBF3E2' : '#0E3B43'}" stroke-width="3"/>`;
    s += `<line x1="${px}" x2="${px}" y1="${acima ? py - 14 : py + 14}" y2="${acima ? ty + 16 : ty - 40}" stroke="${suave}" stroke-width="1.2" opacity=".6"/>`;
    s += `<text class="a" x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="46" fill="${acima ? tinta : '#F7EFDF'}">${p.altitude_m > 0 ? '+' : ''}${p.altitude_m.toLocaleString('pt-BR')} m</text>`;
    s += `<text class="l" x="${tx}" y="${ty + 30}" text-anchor="${anchor}" font-size="17" fill="${acima ? suave : '#E9DCC0'}">${esc(p.nome)}</text>`;
  });
  s += `<text class="n" x="${X0}" y="${H - 28}" font-size="16" fill="${suave}" opacity=".85">Corte esquemático, fora de escala horizontal${temDist ? '' : ' (pontos igualmente espaçados)'}; altitudes conforme as fontes do capítulo 1.</text>`;
  return s + '</svg>';
}


/* ── corte esquemático das quatro faixas (oeste → leste) ────────────────
   Ilustração documental original, não fotografia: o perfil é desenhado à
   mão e só os RÓTULOS carregam informação, cada um com afirmação VERIFICADO.
   A legenda diz "esquema, fora de escala". */
function corteFaixas(escuro = true) {
  const R = { costa: ['C01-046'], montes: ['C01-047'], fenda: ['C01-051', 'C01-053'], morto: ['C01-012'] };
  if (!Object.values(R).every(verificado)) return null;
  const W = 900, H = 1200, NM = 760; /* NM: a linha do nível do mar */
  const fundo = escuro ? '#0B2A31' : '#FBF9F5', tinta = escuro ? '#FFFFFF' : '#1B211F', suave = escuro ? '#E9DCC0' : '#5F6A66', traco = escuro ? '#FBF3E2' : '#0E3B43';
  /* perfil: mar | planície | montanhas | descida | fenda com o lago | encosta leste */
  const terra = `M0,${NM + 170} L110,${NM + 60} L150,${NM - 8} L300,${NM - 40} C360,${NM - 70} 380,${NM - 230} 430,${NM - 300} C460,${NM - 345} 480,${NM - 330} 505,${NM - 300} C540,${NM - 250} 560,${NM - 110} 600,${NM + 60} C620,${NM + 150} 640,${NM + 205} 660,${NM + 215} L760,${NM + 215} C790,${NM + 200} 805,${NM + 60} 830,${NM - 120} C850,${NM - 230} 880,${NM - 260} ${W},${NM - 265}`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Corte esquemático de oeste a leste: Mediterrâneo, planície costeira, montanhas e o vale da fenda com o Mar Morto abaixo do nível do mar">
  <style>.l{font-family:'Instrument Sans',sans-serif;font-weight:600;letter-spacing:.16em;text-transform:uppercase}.t{font-family:'Literata',serif}.n{font-family:'Instrument Sans',sans-serif}.a{font-family:'Bricolage Grotesque',sans-serif;font-weight:700}</style>
  <defs><linearGradient id="terra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2B07A"/><stop offset=".45" stop-color="#B9773E"/><stop offset="1" stop-color="#5E3A1E"/></linearGradient>
  <linearGradient id="mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B8C97"/><stop offset="1" stop-color="#1E5A73"/></linearGradient>
  <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fundo}"/><stop offset="1" stop-color="${escuro ? '#155059' : '#EFE7D6'}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#ceu)"/>
  <rect x="0" y="${NM}" width="160" height="${H - NM}" fill="url(#mar)"/>
  <rect x="640" y="${NM + 150}" width="140" height="${H - NM - 150}" fill="url(#mar)"/>
  <path d="${terra} L${W},${H} L0,${H} Z" fill="url(#terra)"/>
  <path d="${terra}" fill="none" stroke="${traco}" stroke-width="3" stroke-linejoin="round"/>
  <line x1="0" x2="${W}" y1="${NM}" y2="${NM}" stroke="${suave}" stroke-width="1.6" stroke-dasharray="7 8" opacity=".85"/>
  <text class="l" x="${W - 22}" y="${NM - 12}" text-anchor="end" font-size="15" fill="${suave}">nível do mar</text>`;
  /* o leito do Mediterrâneo some sob a água à esquerda: a terra começa abaixo dela */
  const rot = (x, y, a, b, anchor = 'start', cor = tinta) => `<text class="l" x="${x}" y="${y}" text-anchor="${anchor}" font-size="17" fill="${cor}">${a}</text><text class="n" x="${x}" y="${y + 26}" text-anchor="${anchor}" font-size="18" fill="${suave}">${b}</text>`;
  s += rot(18, NM - 64, 'Mediterrâneo', 'a oeste', 'start', '#FFFFFF');
  s += `<line x1="220" x2="220" y1="${NM - 30}" y2="${NM - 150}" stroke="${suave}" stroke-width="1.2" opacity=".7"/>` + rot(150, NM - 196, 'Planície costeira', 'até ~40 km para o interior');
  s += `<line x1="478" x2="540" y1="${NM - 318}" y2="${NM - 360}" stroke="${suave}" stroke-width="1.2" opacity=".7"/>` + rot(548, NM - 392, 'Montanhas', 'na Galileia, de 500 a 1.200 m', 'start');
  s += `<line x1="710" x2="710" y1="${NM + 160}" y2="${NM - 66}" stroke="${suave}" stroke-width="1.2" opacity=".7"/>` + rot(710, NM - 128, 'Vale da fenda', 'o Mar Morto', 'middle');
  s += `<text class="a" x="710" y="${NM + 300}" text-anchor="middle" font-size="52" fill="#F7EFDF">-430 m</text><text class="n" x="710" y="${NM + 332}" text-anchor="middle" font-size="17" fill="#E9DCC0">em 2022, a superfície já estava abaixo disso</text>`;
  return s + '</svg>';
}

const SAIDA_INF = path.join(RAIZ, 'ativos/infograficos'), SAIDA_MAP = path.join(RAIZ, 'ativos/mapas');
fs.mkdirSync(SAIDA_INF, { recursive: true });
for (const [id, dir, fn] of [['corte-faixas', SAIDA_INF, () => corteFaixas(true)], ['corte-faixas-claro', SAIDA_INF, () => corteFaixas(false)], ['perfil-altitude', SAIDA_INF, () => perfil(true)], ['perfil-altitude-claro', SAIDA_INF, () => perfil(false)], ['infografico-clima', SAIDA_INF, clima], ['infografico-semana', SAIDA_INF, semana], ['mapa-jerusalem', SAIDA_MAP, jerusalem]]) {
  const arq = path.join(dir, id + '.svg');
  const svg = fn();
  if (svg) { fs.writeFileSync(arq, comPrefixo(svg, id)); console.log('gerado', id); }
  else { if (fs.existsSync(arq)) fs.unlinkSync(arq); console.log('NÃO gerado (sem dado verificado):', id); }
}
