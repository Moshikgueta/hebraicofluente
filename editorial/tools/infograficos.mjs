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
const comPrefixo = (svg, id) => svg.replace(/id="([\w-]+)"/g, `id="${id}--$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${id}--$1)`);
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
  if (!d || d.status === 'bloqueado') return null;
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
  const ok = x => verificado(x.afirmacoes || []);
  const bairros = (d.bairros || []).filter(ok);
  const portoes = (d.portoes || []).filter(ok);
  const pontos = (d.pontos || []).filter(ok);
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

const SAIDA_INF = path.join(RAIZ, 'ativos/infograficos'), SAIDA_MAP = path.join(RAIZ, 'ativos/mapas');
fs.mkdirSync(SAIDA_INF, { recursive: true });
for (const [id, dir, fn] of [['infografico-clima', SAIDA_INF, clima], ['infografico-semana', SAIDA_INF, semana], ['mapa-jerusalem', SAIDA_MAP, jerusalem]]) {
  const arq = path.join(dir, id + '.svg');
  const svg = fn();
  if (svg) { fs.writeFileSync(arq, comPrefixo(svg, id)); console.log('gerado', id); }
  else { if (fs.existsSync(arq)) fs.unlinkSync(arq); console.log('NÃO gerado (sem dado verificado):', id); }
}
