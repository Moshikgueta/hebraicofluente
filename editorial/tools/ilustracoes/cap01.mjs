/* Ilustrações do capítulo 1 (Israel no mapa). Carregado por tools/ilustracoes.mjs.
   Recebe o contexto (dados da Natural Earth e utilitários) e devolve
   { svgs: {id: svg}, pontos: {figura: lista} }.

   O que é dado e o que é desenho:
   - contornos de país, lago e estado: Natural Earth 1:10m (domínio público);
   - posição de cidade: destinos.json (coordenadas registradas no capítulo 4);
   - posição dos números das regiões: a mesma convenção de tools/mapas.mjs
     (POS_REGIAO), perto do rótulo da região, nunca um limite;
   - todo número escrito tem o id da afirmação ao lado, no comentário. */

import fs from 'node:fs';
import path from 'node:path';
import { C, esc, projetor, projetorKm, caminho, limites, ISRAEL_1949, HACHURA, featDisp } from '../lib/desenho.mjs';

export default function capitulo01({ paises, disputa, lagos, rios, brasil, svg, t, sombra, RAIZ }) {
  const lerJSON = f => JSON.parse(fs.readFileSync(path.join(RAIZ, 'ativos/dados', f), 'utf8'));
  const destinos = lerJSON('destinos.json');

  /* ── Abertura: a paisagem de oeste a leste, em papel recortado ──────────
     Desenho, sem dado: o mar, a praia, a planície, as montanhas, o vale da
     fenda com um lago e as encostas do outro lado. Não é um corte medido
     (o corte com números é a figura corte-faixas, no corpo do capítulo). */
  function abertura() {
    const W = 1480, H = 1300;
    let s = `<rect width="${W}" height="${H}" fill="${C.ouroSuave}"/>`;
    s += `<circle cx="1130" cy="250" r="96" fill="${C.ouro}" opacity=".9"/>`;
    /* aves em migração: traços em V */
    for (const [x, y, k] of [[300, 210, 1], [370, 250, .8], [430, 190, .9], [500, 240, .7], [560, 205, .75], [640, 260, .6]]) s += `<path d="M${x} ${y} q${14 * k} ${-12 * k} ${28 * k} 0 q${14 * k} ${-12 * k} ${28 * k} 0" fill="none" stroke="${C.navy}" stroke-width="4" stroke-linecap="round"/>`;
    /* montanhas do outro lado do vale (ao fundo) */
    const fundo = `M900 700 C980 560 1060 520 1140 560 C1220 600 1300 470 1380 500 C1430 520 1460 560 1480 580 L1480 1300 L900 1300Z`;
    s += `<path d="${fundo}" fill="${C.pedraEsc}" opacity=".9"/>`;
    /* o mar, a oeste */
    const mar = `M0 770 L420 770 L420 1300 L0 1300Z`;
    s += `<path d="${mar}" fill="url(#ondas)"/>`;
    /* a terra: planície, montanhas e a descida para o vale */
    const terra = `M300 790 C360 770 420 760 470 752 C560 740 600 720 640 640 C690 520 740 430 800 420 C860 410 900 520 930 640 C960 760 990 900 1030 960 L1280 960 C1320 900 1350 800 1400 720 C1430 680 1460 670 1480 668 L1480 1300 L170 1300Z`;
    s += sombra(terra, 8, 12) + `<path d="${terra}" fill="${C.neguev}"/>`;
    /* camada de cima da planície e das montanhas (verde) */
    const verde = `M300 790 C360 770 420 760 470 752 C560 740 600 720 640 640 C690 520 740 430 800 420 C840 414 870 470 890 540 C840 520 790 560 740 640 C700 700 640 790 560 820 C470 850 380 850 290 836Z`;
    s += `<path d="${verde}" fill="${C.oliveira}" opacity=".85"/>`;
    /* oliveiras na encosta: círculos com tronco */
    for (const [x, y] of [[480, 760], [560, 738], [650, 640], [730, 548]]) s += `<rect x="${x - 5}" y="${y}" width="10" height="34" fill="${C.neguevTinta}"/><circle cx="${x}" cy="${y - 10}" r="30" fill="${C.oliveira}" stroke="${C.ouroSuave}" stroke-width="3"/>`;
    /* o lago no fundo do vale */
    const lago = `M1030 960 L1280 960 C1270 1000 1240 1020 1155 1022 C1070 1020 1040 1000 1030 960Z`;
    s += `<path d="${lago}" fill="${C.mar}"/><path d="M1060 982 q12 -8 24 0 t24 0 M1160 995 q12 -8 24 0 t24 0" fill="none" stroke="${C.tealLite}" stroke-width="3" stroke-linecap="round"/>`;
    /* faixa de sal na margem */
    s += `<path d="M1030 960 L1280 960" stroke="${C.papel}" stroke-width="6" stroke-linecap="round"/>`;
    /* a praia */
    s += `<path d="M300 790 L340 784 L216 1300 L170 1300Z" fill="${C.areiaClara}"/>`;
    /* estrada tracejada da costa ao lago */
    s += `<path d="M380 860 C520 840 640 800 720 720 C800 640 880 640 920 760 C950 850 990 930 1030 948" fill="none" stroke="${C.papel}" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round"/>`;
    /* estratos da terra */
    for (const y of [1060, 1130, 1200, 1260]) s += `<path d="M${(340 - (y - 784) * 0.24).toFixed(0)} ${y} C600 ${y - 18} 900 ${y + 14} 1480 ${y - 10}" fill="none" stroke="${C.neguevTinta}" stroke-width="3" opacity=".45"/>`;
    return svg(W, H, 'Ilustração: a paisagem de oeste a leste, do mar à praia, à planície, às montanhas e à descida até um lago no fundo de um vale, com aves migrando no céu.', s);
  }

  /* ── Israel x Sergipe, na mesma escala (prancha aprovada, tools/pranchas.mjs) ──
     C01-001 (22.072 km², CBS), C01-201 (21.938 km², IBGE), C01-202 (134 km²,
     menos de 1%), C01-005 (20.700 km² dentro das linhas de 1949). */
  function israelSergipe() {
    const W = 1080, H = 1350, PX = 1.42;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<rect x="0" y="0" width="${W}" height="300" fill="${C.navy}"/>`;
    s += t(56, 78, 'ISRAEL X BRASIL', { s: 15, w: 700, ls: 3, f: C.tealLite });
    s += t(56, 160, 'Do tamanho', { cls: 'd', s: 74, f: '#FFFFFF' });
    s += t(56, 240, 'de Sergipe', { cls: 'd', s: 74, f: C.ouro });
    s += t(W - 56, 240, 'Israel e Sergipe, lado a lado,', { s: 19, a: 'end', f: C.areiaClara }) + t(W - 56, 266, 'na mesma escala', { s: 19, a: 'end', f: C.areiaClara });
    const isr = featDisp(disputa, [...ISRAEL_1949, ...HACHURA]);
    const bI = limites(isr.map(f => f.geometry));
    const PI = projetorKm(bI[3], bI[0], PX, 90, 350);
    s += `<g transform="translate(6 8)">${isr.map(f => `<path d="${caminho(f.geometry, PI.p)}" fill="${C.pedraEsc}"/>`).join('')}</g>`;
    for (const f of featDisp(disputa, ISRAEL_1949)) s += `<path d="${caminho(f.geometry, PI.p)}" fill="${C.navy}" stroke="${C.navy}" stroke-width="1.5" stroke-linejoin="round"/>`;
    for (const f of featDisp(disputa, ['B98'])) s += `<path d="${caminho(f.geometry, PI.p)}" fill="url(#hachura)" stroke="${C.ouro}" stroke-width="1.5"/>`;
    for (const f of featDisp(disputa, ['B16'])) s += `<path d="${caminho(f.geometry, PI.p)}" fill="url(#hachura-golan)" stroke="${C.ouroTinta}" stroke-width="1.5"/>`;
    const [, iyMax] = PI.p([bI[2], bI[1]]);
    s += t(280, ((350 + iyMax) / 2 + 40).toFixed(0), 'Israel', { cls: 'd', s: 30, f: C.navy });
    const se = brasil.features.find(f => f.properties.postal === 'SE');
    const bS = limites([se.geometry]);
    const PS = projetorKm(bS[3], bS[0], PX, 520, 360);
    s += `<g transform="translate(6 8)"><path d="${caminho(se.geometry, PS.p)}" fill="${C.pedraEsc}"/></g>`;
    s += `<path d="${caminho(se.geometry, PS.p)}" fill="${C.teal}" stroke="${C.tealTinta}" stroke-width="1.5" stroke-linejoin="round"/>`;
    const [, syMax] = PS.p([bS[2], bS[1]]);
    const [sxC, syC] = PS.p([(bS[0] + bS[2]) / 2, (bS[1] + bS[3]) / 2]);
    s += t(sxC.toFixed(0), (syC + 10).toFixed(0), 'Sergipe', { cls: 'd', s: 30, a: 'middle', f: '#FFFFFF' });
    let y = syMax + 70;
    s += `<line x1="520" x2="${W - 56}" y1="${y - 40}" y2="${y - 40}" stroke="${C.navy}" stroke-width="1.5"/>`;
    s += t(520, y + 20, '22.072 km²', { cls: 'n', s: 50, f: C.navy }) + t(520, y + 50, 'Israel, pelo CBS, contando Jerusalém Oriental e o Golã', { s: 16, f: C.suave });
    y += 110;
    s += t(520, y + 20, '21.938 km²', { cls: 'n', s: 50, f: C.tealTinta }) + t(520, y + 50, 'Sergipe, pelo IBGE (área territorial 2022)', { s: 16, f: C.suave });
    y += 100;
    s += `<rect x="520" y="${y}" width="${W - 56 - 520}" height="128" rx="16" fill="${C.ouroSuave}"/>`;
    s += t(546, y + 56, '134 km²', { cls: 'n', s: 42, f: C.neguevTinta }) + t(546, y + 86, 'de diferença: menos de 1%.', { s: 17 }) + t(546, y + 110, 'Dentro das linhas de 1949, cerca de 20.700 km².', { s: 15, f: C.suave });
    const yL = Math.max(iyMax + 50, y + 170);
    s += `<rect x="90" y="${(yL - 17).toFixed(0)}" width="30" height="20" fill="url(#hachura)" stroke="${C.ouro}"/><rect x="126" y="${(yL - 17).toFixed(0)}" width="30" height="20" fill="url(#hachura-golan)" stroke="${C.ouroTinta}"/>`;
    s += t(170, yL.toFixed(0), 'Jerusalém Oriental e Golã entram na conta do CBS.', { s: 16 });
    const y50 = yL + 70, w100 = 100 * PX;
    s += `<rect x="90" y="${y50}" width="${(w100 / 2).toFixed(1)}" height="8" fill="${C.navy}"/><rect x="${(90 + w100 / 2).toFixed(1)}" y="${y50}" width="${(w100 / 2).toFixed(1)}" height="8" fill="${C.papel}" stroke="${C.navy}"/>`;
    s += t(90, y50 - 10, '0', { s: 13, f: C.suave }) + t((90 + w100).toFixed(1), y50 - 10, '100 km', { s: 13, a: 'end', f: C.suave }) + t((110 + w100).toFixed(1), y50 + 8, 'a mesma escala para os dois', { s: 13, f: C.suave });
    const bB = limites(brasil.features.map(f => f.geometry));
    const PB = projetor(bB, 150, 875, 350);
    for (const f of brasil.features) s += `<path d="${caminho(f.geometry, PB.p)}" fill="${f.properties.postal === 'SE' ? C.teal : C.pedra}" stroke="${C.pedraEsc}" stroke-width=".6"/>`;
    s += t(950, (350 + PB.altura + 22).toFixed(0), 'Sergipe no Brasil', { s: 13, a: 'middle', f: C.suave });
    s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(56, H - 46, 'Áreas: CBS de Israel e IBGE (Área territorial brasileira 2022); 20.700 km²: Biblioteca do Congresso dos EUA. Contornos: Natural Earth.', { s: 12.5, f: C.suave });
    s += t(56, H - 26, 'Os dois contornos estão na mesma escala, em quilômetros. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Israel e Sergipe lado a lado, na mesma escala: 22.072 km² e 21.938 km², uma diferença de 134 km², menos de 1%.', s);
  }

  /* ── Mapa ilustrado das regiões, tocável na web ─────────────────────────
     Contornos: Natural Earth. As regiões não têm limite: cada uma leva um
     número perto do rótulo, na posição de POS_REGIAO (tools/mapas.mjs). O
     texto de cada ponto vem de ativos/dados/mapa-regioes-pontos.json
     (regioes.json, só com afirmação VERIFICADO); o vale do Hula abre a ficha
     do capítulo. Cidades: destinos.json. */
  const POS_REGIAO = { golan: [35.8, 32.86], galileia: [35.22, 32.9], 'vale-do-hula': [35.6, 33.1], kineret: [35.58, 32.82], 'planicie-costeira': [34.9, 32.32], 'montes-centrais': [35.18, 32.12], 'vale-do-jordao': [35.5, 32.05], 'mar-morto': [35.47, 31.25], neguev: [34.75, 30.9], arava: [35.05, 30.4] };
  const FICHA_DA_REGIAO = { 'vale-do-hula': 'vale-do-hula' };
  const regioes = lerJSON('mapa-regioes-pontos.json').filter(r => POS_REGIAO[r.id]);
  const MW = 640, MX = 40, MY = 150;
  const PR = projetor([34.05, 29.4, 36.05, 33.45], MW, MX, MY);
  const RW = 1080, RH = Math.round(MY + PR.altura + 110);
  const numeros = regioes.map((r, i) => { const [x, y] = PR.p(POS_REGIAO[r.id]); return { ...r, n: i + 1, px: x, py: y }; });
  function regioesIlustrado() {
    const W = RW, H = RH, p = PR.p;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<clipPath id="moldura"><rect x="${MX}" y="${MY}" width="${MW}" height="${PR.altura.toFixed(0)}" rx="18"/></clipPath><g clip-path="url(#moldura)">`;
    s += `<rect x="${MX}" y="${MY}" width="${MW}" height="${PR.altura.toFixed(0)}" fill="url(#ondas)"/>`;
    for (const f of paises.features) if (!['ISR', 'PSX'].includes(f.properties.a3)) s += `<path d="${caminho(f.geometry, p)}" fill="${C.pedra}" stroke="${C.pedraEsc}" stroke-width="1"/>`;
    const todos = featDisp(disputa, [...ISRAEL_1949, ...HACHURA, 'B54', 'B53', 'B58']);
    s += `<g transform="translate(5 7)">${todos.map(f => `<path d="${caminho(f.geometry, p)}" fill="${C.pedraEsc}"/>`).join('')}</g>`;
    for (const f of featDisp(disputa, ISRAEL_1949)) s += `<path d="${caminho(f.geometry, p)}" fill="#FFFFFF" stroke="${C.navy}" stroke-width="2.2" stroke-linejoin="round"/>`;
    for (const f of featDisp(disputa, ['B54', 'B98', 'B53'])) s += `<path d="${caminho(f.geometry, p)}" fill="url(#hachura)" stroke="${C.ouro}" stroke-width="1.4"/>`;
    for (const f of featDisp(disputa, ['B16', 'B58'])) s += `<path d="${caminho(f.geometry, p)}" fill="url(#hachura-golan)" stroke="${C.ouroTinta}" stroke-width="1.4"/>`;
    for (const f of rios.features) if (/Jordan/.test(f.properties.nome || f.properties.name || '')) s += `<path d="${caminho(f.geometry, p)}" fill="none" stroke="#7FB8AE" stroke-width="2.6" stroke-linecap="round"/>`;
    for (const f of lagos.features) s += `<path d="${caminho(f.geometry, p)}" fill="${C.mar}" fill-opacity=".85" stroke="${C.mar}" stroke-width="1"/>`;
    s += '</g>';
    s += `<rect x="${MX}" y="${MY}" width="${MW}" height="${PR.altura.toFixed(0)}" rx="18" fill="none" stroke="${C.navy}" stroke-width="2"/>`;
    const [mx, my] = p([34.3, 32.75]);
    s += `<text class="d" x="${mx.toFixed(0)}" y="${my.toFixed(0)}" font-size="24" font-style="italic" fill="${C.mar}" transform="rotate(-72 ${mx.toFixed(0)} ${my.toFixed(0)})">Mar Mediterrâneo</text>`;
    /* cidades de referência (destinos.json) */
    const cid = { jerusalem: ['Jerusalém', 'start'], 'tel-aviv': ['Tel Aviv', 'end'], haifa: ['Haifa', 'end'], 'beer-sheva': ["Be'er Sheva", 'end'] };
    for (const d of destinos.filter(d => cid[d.id])) {
      const [x, y] = p([d.lon, d.lat]); const [nome, a] = cid[d.id];
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="${C.navy}" stroke="#FFFFFF" stroke-width="2"/>` + t((a === 'end' ? x - 11 : x + 11).toFixed(1), (y + 5).toFixed(1), nome, { s: 15, w: 600, a, f: C.navy });
    }
    /* números das regiões */
    for (const r of numeros) s += `<circle cx="${r.px.toFixed(1)}" cy="${(r.py + 3).toFixed(1)}" r="17" fill="${C.pedraEsc}"/><circle cx="${r.px.toFixed(1)}" cy="${r.py.toFixed(1)}" r="17" fill="${FICHA_DA_REGIAO[r.id] ? C.ouro : C.navy}" stroke="${C.papel}" stroke-width="3"/>` + t(r.px.toFixed(1), (r.py + 6.5).toFixed(1), String(r.n), { cls: 'n', s: 18, a: 'middle', f: FICHA_DA_REGIAO[r.id] ? C.noite : '#FFFFFF' });
    /* escala e norte */
    const px50 = 50 * (PR.escala / 110.57);
    s += `<g transform="translate(${MX + 30} ${(MY + PR.altura - 36).toFixed(0)})"><rect x="-12" y="-26" width="${(px50 + 24).toFixed(0)}" height="44" rx="8" fill="${C.papel}" fill-opacity=".92"/><rect width="${(px50 / 2).toFixed(1)}" height="7" fill="${C.navy}"/><rect x="${(px50 / 2).toFixed(1)}" width="${(px50 / 2).toFixed(1)}" height="7" fill="${C.papel}" stroke="${C.navy}"/>${t(0, -8, '0', { s: 12, f: C.suave })}${t(px50.toFixed(1), -8, '50 km', { s: 12, a: 'end', f: C.suave })}</g>`;
    s += `<g transform="translate(${MX + MW - 40} ${MY + 44})"><circle r="22" fill="${C.papel}" stroke="${C.navy}" stroke-width="1.5"/><path d="M0 -16 L6 6 L0 2 L-6 6Z" fill="${C.navy}"/>${t(0, -28, 'N', { s: 13, w: 700, a: 'middle', f: C.navy })}</g>`;
    /* cabeçalho */
    s += t(40, 58, 'MAPA ILUSTRADO · CAPÍTULO 1', { s: 15, w: 700, ls: 3, f: C.tealTinta });
    s += t(40, 112, 'As regiões, de norte a sul', { cls: 'd', s: 46, f: C.navy });
    /* coluna da direita: a chave */
    const cx = 712; let cy = MY + 24;
    s += t(cx, cy, 'AS REGIÕES', { s: 13, w: 700, ls: 2.4, f: C.navy }); cy += 34;
    for (const r of numeros) {
      const ficha = FICHA_DA_REGIAO[r.id];
      s += `<circle cx="${cx + 14}" cy="${cy - 6}" r="14" fill="${ficha ? C.ouro : C.navy}"/>` + t(cx + 14, cy - 0.5, String(r.n), { cls: 'n', s: 15, a: 'middle', f: ficha ? C.noite : '#FFFFFF' });
      const nome = r.nome.replace(/\s*\(com o Carmelo e o Sharon\)/, '').replace(/\s*\(Samaria e Judeia\)/, '');
      s += t(cx + 38, cy, nome, { s: 16, w: 600, f: C.navy });
      cy += 36;
    }
    cy += 20;
    s += `<rect x="${cx}" y="${cy - 16}" width="34" height="22" fill="url(#hachura)" stroke="${C.ouro}"/>` + t(cx + 46, cy, 'Judeia e Samaria', { s: 15 }) + t(cx + 46, cy + 21, '(Cisjordânia) e Gaza', { s: 15 }); cy += 54;
    s += `<rect x="${cx}" y="${cy - 16}" width="34" height="22" fill="url(#hachura-golan)" stroke="${C.ouroTinta}"/>` + t(cx + 46, cy, 'Colinas de Golã', { s: 15 }); cy += 46;
    s += `<circle cx="${cx + 14}" cy="${cy - 6}" r="12" fill="${C.ouro}"/>` + t(cx + 38, cy, 'tem ficha de lugar', { s: 15 }) + t(cx + 38, cy + 21, 'neste capítulo', { s: 15 }); cy += 60;
    s += t(cx, cy, 'Os números ficam perto do', { s: 15, f: C.suave }) + t(cx, cy + 21, 'nome de cada região: as', { s: 15, f: C.suave }) + t(cx, cy + 42, 'regiões não têm limite traçado.', { s: 15, f: C.suave });
    s += `<line x1="40" x2="${W - 40}" y1="${H - 66}" y2="${H - 66}" stroke="${C.linha}"/>`;
    s += t(40, H - 40, 'Contornos: Natural Earth (domínio público). Regiões: Ministério das Relações Exteriores de Israel e o capítulo 1. Cidades: coordenadas do capítulo 4.', { s: 12.5, f: C.suave });
    s += t(40, H - 20, 'Números, cores e posição dos rótulos são desenho. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Mapa ilustrado de Israel com as regiões numeradas de norte a sul: Golã, Galileia, vale do Hula, Mar da Galileia, planície costeira, montes centrais, vale do Jordão, Mar Morto, Neguev e Arava.', s);
  }

  /* ── Chuva: Israel x Brasília ──────────────────────────────────────────
     C01-021 (Alta Galileia, cerca de 1.100 mm; extremo sul, menos de 100 mm,
     por ano); C01-203 (Brasília, normal de janeiro 1991-2020, 206,0 mm);
     C01-204 (Brasília, média do verão 1991-2020, 621,7 mm); C01-205 (a conta). */
  function chuvaBrasil() {
    const W = 1080, H = 990, X0 = 56, LMAX = 640, k = LMAX / 1100;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<rect width="${W}" height="210" fill="${C.navy}"/>`;
    s += t(56, 66, 'ISRAEL X BRASIL', { s: 15, w: 700, ls: 3, f: C.tealLite });
    s += t(56, 136, 'Quanto chove', { cls: 'd', s: 54, f: '#FFFFFF' });
    s += t(56, 180, 'Um ano inteiro em Israel ao lado de um mês e de um verão em Brasília, em milímetros.', { s: 19, f: C.areiaClara });
    const linhas = [
      { v: 100, menos: true, num: 'menos de 100 mm', l1: 'Extremo sul de Israel', l2: 'o ano inteiro', cor: C.neguev },
      { v: 206.0, num: '206 mm', l1: 'Brasília', l2: 'só o mês de janeiro', cor: C.teal },
      { v: 621.7, num: '621,7 mm', l1: 'Brasília', l2: 'só o verão', cor: C.teal },
      { v: 1100, num: 'cerca de 1.100 mm', l1: 'Alta Galileia, a parte mais chuvosa de Israel', l2: 'o ano inteiro', cor: C.navy },
    ];
    let y = 270;
    for (const l of linhas) {
      const w = l.v * k;
      s += t(X0, y, l.l1, { s: 18, w: 700, f: C.navy }) + t(X0, y + 22, l.l2, { s: 15, f: C.suave });
      const yb = y + 38;
      s += `<rect x="${X0 + 6}" y="${yb + 8}" width="${w.toFixed(1)}" height="46" rx="6" fill="${C.pedraEsc}"/>`;
      s += `<rect x="${X0}" y="${yb}" width="${w.toFixed(1)}" height="46" rx="6" fill="${l.cor}"${l.menos ? ` stroke="${C.neguevTinta}" stroke-width="2" stroke-dasharray="6 5"` : ''}/>`;
      s += t((X0 + w + 16).toFixed(1), yb + 33, l.num, { cls: 'n', s: 28, f: l.cor === C.teal ? C.tealTinta : l.cor === C.neguev ? C.neguevTinta : C.navy });
      y += 140;
    }
    s += `<rect x="${X0}" y="${y - 30}" width="${W - 2 * X0}" height="96" rx="16" fill="${C.ouroSuave}"/>`;
    s += t(X0 + 24, y + 4, 'Um ano de chuva no extremo sul de Israel é menos da metade', { s: 19, w: 600, f: C.neguevTinta });
    s += t(X0 + 24, y + 32, 'de um só janeiro em Brasília.', { s: 19, w: 600, f: C.neguevTinta });
    s += `<line x1="56" x2="${W - 56}" y1="${H - 66}" y2="${H - 66}" stroke="${C.linha}"/>`;
    s += t(56, H - 40, 'Israel: médias anuais de longo prazo (Climate Centre, com dados da FAO; Britannica). Brasília: INMET, médias 1991-2020 da estação de Brasília.', { s: 12.5, f: C.suave });
    s += t(56, H - 20, 'Barras na mesma escala. A barra tracejada é um teto: a média fica abaixo dela. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Gráfico de barras: menos de 100 mm por ano no extremo sul de Israel; 206 mm só em janeiro em Brasília; 621,7 mm no verão de Brasília; cerca de 1.100 mm por ano na Alta Galileia.', s);
  }

  return {
    svgs: {
      'abertura-israel-no-mapa': abertura(),
      'israel-sergipe': israelSergipe(),
      'regioes-ilustrado': regioesIlustrado(),
      'chuva-israel-brasilia': chuvaBrasil(),
    },
    pontos: {
      'regioes-ilustrado': numeros.map(r => {
        const pt = { id: r.id, nome: `${r.n}. ${r.nome}`, x: +(r.px / RW * 100).toFixed(1), y: +(r.py / RH * 100).toFixed(1) };
        if (FICHA_DA_REGIAO[r.id]) pt.ficha = FICHA_DA_REGIAO[r.id]; else pt.texto = r.texto;
        return pt;
      }),
    },
  };
}
