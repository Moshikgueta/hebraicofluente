/* Ilustrações do capítulo 3 (Jerusalém). Carregado por tools/ilustracoes.mjs.
   Recebe o contexto (dados da Natural Earth e utilitários) e devolve
   { svgs: {id: svg}, pontos: {arquivo: lista} }. */

import { C, esc, projetor, caminho, ISRAEL_1949, featDisp } from '../lib/desenho.mjs';

export default function capitulo03({ disputa, svg, t, sombra }) {
  /* ── Capítulo 3 ───────────────────────────────────────────────────────── */

  /* Abertura: a muralha com ameias, uma porta, casas, uma cúpula e uma torre.
     Desenho genérico da Cidade Antiga, não retrato de um ponto de vista real. */
  function aberturaJerusalem() {
    const W = 1480, H = 1300;
    let s = '';
    s += `<path d="M0 520 C200 440 360 470 520 430 C700 385 860 450 1040 410 C1220 370 1360 420 1480 400 L1480 1300 L0 1300Z" fill="#155059"/>`;
    s += `<path d="M0 640 C260 580 480 620 700 590 C940 556 1180 610 1480 580 L1480 1300 L0 1300Z" fill="#1A6A6F" opacity=".75"/>`;
    /* casas de telhado plano, atrás da muralha */
    const casas = [[120, 640, 150, 120], [250, 610, 120, 150], [360, 650, 170, 110], [940, 630, 140, 130], [1060, 600, 160, 160], [1210, 640, 150, 120], [1330, 620, 150, 140]];
    for (const [x, y, w, h] of casas) {
      s += `<rect x="${x + 7}" y="${y + 9}" width="${w}" height="${h}" fill="${C.noite}" opacity=".35"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.pedraEsc}"/>`;
      for (let k = 0; k < Math.floor(w / 48); k++) s += `<rect x="${x + 18 + k * 46}" y="${y + 30}" width="16" height="26" rx="8" fill="${C.neguevTinta}" opacity=".55"/>`;
    }
    /* torre esguia (à esquerda) */
    s += `<rect x="560" y="300" width="70" height="420" fill="${C.noite}" opacity=".35" transform="translate(8 10)"/><rect x="560" y="300" width="70" height="420" fill="${C.pedra}"/><rect x="548" y="290" width="94" height="22" fill="${C.pedraEsc}"/><path d="M572 290 V250 h46 V290" fill="${C.pedra}"/><path d="M572 250 L595 200 L618 250Z" fill="${C.pedraEsc}"/>`;
    for (let k = 0; k < 4; k++) s += `<rect x="586" y="${340 + k * 80}" width="18" height="34" rx="9" fill="${C.neguevTinta}" opacity=".6"/>`;
    /* cúpula dourada sobre tambor octogonal */
    s += `<rect x="738" y="470" width="300" height="180" fill="${C.noite}" opacity=".35" transform="translate(8 10)"/><rect x="738" y="470" width="300" height="180" fill="${C.pedra}"/>`;
    s += `<rect x="790" y="410" width="196" height="70" fill="${C.tealTinta}"/><path d="M780 412 C780 300 996 300 996 412Z" fill="${C.ouro}"/><path d="M780 412 C780 300 996 300 996 412" fill="none" stroke="${C.ouroTinta}" stroke-width="4"/><rect x="884" y="268" width="8" height="40" fill="${C.ouroTinta}"/>`;
    for (let k = 0; k < 5; k++) s += `<rect x="${756 + k * 56}" y="520" width="20" height="40" rx="10" fill="${C.tealTinta}" opacity=".7"/>`;
    /* a muralha, com ameias e uma porta em arco */
    const yM = 760;
    let ameias = `M0 ${yM}`;
    for (let x = 0; x < W; x += 60) ameias += ` h30 v-34 h30 v34`;
    const muro = `${ameias} L${W} 1300 L0 1300Z`;
    s += sombra(muro, 0, 14) + `<path d="${muro}" fill="${C.pedra}"/>`;
    for (let y = yM + 40; y < 1300; y += 46) s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="${C.pedraEsc}" stroke-width="2"/>`;
    s += `<path d="M640 1300 V1010 C640 900 840 900 840 1010 V1300Z" fill="${C.noite}"/><path d="M640 1010 C640 900 840 900 840 1010" fill="none" stroke="${C.pedraEsc}" stroke-width="10"/>`;
    s += `<rect x="1120" y="${yM - 120}" width="150" height="160" fill="${C.pedra}"/><path d="M1120 ${yM - 120} h25 v-28 h25 v28 h25 v-28 h25 v28 h25 v-28 h25 v28" fill="${C.pedra}"/>`;
    s += `<rect x="1170" y="${yM - 70}" width="20" height="44" rx="10" fill="${C.neguevTinta}" opacity=".6"/>`;
    return svg(W, H, 'Ilustração: a muralha da Cidade Antiga, com ameias e uma porta em arco, e atrás dela casas, uma torre e uma cúpula dourada.', s);
  }

  /* Mapa esquemático da Cidade Antiga. Posições relativas das fontes:
     Porta de Jafa no oeste (C03-112); Damasco e Herodes no norte (C03-113);
     Leões no leste, com Santa Ana e o começo da Via Dolorosa (C03-114); Sião
     entre os bairros armênio e judeu (C03-115); Esterco junto da praça do Muro
     Ocidental (C03-116, C03-092). Armênio no sudoeste, muçulmano no nordeste
     (C03-117); judeu a oeste do Monte do Templo; Santo Sepulcro no bairro
     cristão, junto da Porta de Jafa (C03-118). Muro Ocidental no lado oeste da
     esplanada (C03-012); Arco de Robinson perto da quina sudoeste (C03-015);
     Torre de Davi junto da Porta de Jafa (C03-111); Mercado do Algodão com
     portão para a esplanada (C03-110); Monte das Oliveiras logo a leste
     (C03-108); Cidade de Davi logo ao sul do Monte do Templo (C03-105). */
  const LUGARES_CIDADE_ANTIGA = [
    { n: 1, id: 'muro-ocidental', nome: 'Muro Ocidental', x: 646, y: 700 },
    { n: 2, id: 'monte-do-templo', nome: 'Monte do Templo / Haram al-Sharif', x: 870, y: 500 },
    { n: 3, id: 'santo-sepulcro', nome: 'Santo Sepulcro', x: 372, y: 452 },
    { n: 4, id: 'via-dolorosa', nome: 'Via Dolorosa', x: 700, y: 384 },
    { n: 5, id: 'torre-de-davi', nome: 'Torre de Davi', x: 228, y: 600 },
    { n: 6, id: 'mercado-do-algodao', nome: 'Mercado do Algodão', x: 610, y: 548 },
    { n: 7, id: 'monte-das-oliveiras', nome: 'Monte das Oliveiras', x: 1012, y: 470 },
    { n: 8, id: 'cidade-de-davi', nome: 'Cidade de Davi', x: 780, y: 980 },
  ];
  function mapaCidadeAntiga() {
    const W = 1080, H = 1080;
    let s = `<rect width="${W}" height="${H}" fill="${C.ouroSuave}"/>`;
    /* fora da muralha: o vale e o Monte das Oliveiras (a leste) e a Cidade de Davi (ao sul) */
    s += `<path d="M960 120 C1040 260 1060 420 1020 600 C1000 700 1040 820 1080 900 L1080 0 L980 0Z" fill="${C.oliveira}" opacity=".35"/>`;
    s += `<path d="M700 870 C740 930 760 990 800 1060 L880 1060 C850 990 830 920 800 870Z" fill="${C.pedraEsc}"/>`;
    /* muralha: quadrilátero arredondado, de propósito não geográfico */
    const muro = 'M150 230 L880 160 Q930 160 930 210 L940 820 Q940 860 900 862 L190 880 Q150 880 148 840 Z';
    s += sombra(muro, 8, 10) + `<path d="${muro}" fill="${C.papel}" stroke="${C.neguevTinta}" stroke-width="14" stroke-linejoin="round"/>`;
    s += `<path d="${muro}" fill="none" stroke="${C.pedra}" stroke-width="4" stroke-dasharray="6 10"/>`;
    /* bairros: manchas sem fronteira (os limites não têm fonte) */
    const mancha = (cx, cy, rx, ry, cor) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${cor}" opacity=".5"/>`;
    s += mancha(360, 400, 170, 130, C.tealSuave) + mancha(640, 320, 220, 120, C.pedra) + mancha(320, 740, 140, 100, '#EFE3F0') + mancha(500, 740, 110, 100, '#E8EEDB');
    s += t(300, 330, 'BAIRRO CRISTÃO', { s: 15, w: 700, ls: 2, f: C.tealTinta, a: 'middle' });
    s += t(640, 260, 'BAIRRO MUÇULMANO', { s: 15, w: 700, ls: 2, f: C.neguevTinta, a: 'middle' });
    s += t(300, 820, 'BAIRRO ARMÊNIO', { s: 15, w: 700, ls: 2, f: '#6E4B7A', a: 'middle' });
    s += t(510, 820, 'BAIRRO JUDEU', { s: 15, w: 700, ls: 2, f: C.oliveira, a: 'middle' });
    /* a esplanada, com o Domo e al-Aqsa */
    const espl = 'M660 470 L900 455 L905 790 L668 800 Z';
    s += sombra(espl) + `<path d="${espl}" fill="${C.pedra}" stroke="${C.navy}" stroke-width="2.5"/>`;
    s += `<rect x="752" y="560" width="76" height="40" fill="${C.tealTinta}"/><path d="M748 562 C748 512 832 512 832 562Z" fill="${C.ouro}" stroke="${C.ouroTinta}" stroke-width="2"/>`;
    s += `<rect x="752" y="720" width="76" height="34" fill="${C.pedraEsc}"/><path d="M770 722 C770 696 810 696 810 722Z" fill="#8E9894"/>`;
    s += t(790, 640, 'Domo da Rocha', { s: 13, a: 'middle', w: 600, f: C.navy }) + t(790, 778, 'al-Aqsa', { s: 13, a: 'middle', w: 600, f: C.navy });
    /* Muro Ocidental: o lado oeste da esplanada, em destaque */
    s += `<line x1="666" y1="640" x2="669" y2="790" stroke="${C.ouro}" stroke-width="9" stroke-linecap="round"/>`;
    /* Via Dolorosa: da Porta dos Leões ao Santo Sepulcro, tracejada */
    s += `<path d="M930 372 C820 380 760 392 690 392 C600 392 520 420 410 446" fill="none" stroke="${C.neguev}" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/>`;
    /* portas: posição pelo lado da muralha que a fonte dá */
    const porta = (x, y, nome, dx, dy, a = 'middle') => `<rect x="${x - 15}" y="${y - 15}" width="30" height="30" rx="5" fill="${C.navy}" stroke="${C.papel}" stroke-width="3"/><path d="M${x - 7} ${y + 9} V${y - 1} a7 7 0 0 1 14 0 V${y + 9}" fill="none" stroke="${C.papel}" stroke-width="2.4"/>` + t(x + dx, y + dy, nome, { s: 14.5, w: 700, f: C.navy, a });
    s += porta(150, 540, 'Porta de Jafa', 26, 6, 'start');
    s += porta(470, 197, 'Porta de Damasco', 0, -24);
    s += porta(700, 175, 'Porta de Herodes', 0, -24);
    s += porta(934, 372, 'Porta dos Leões', -26, 46, 'end');
    s += porta(420, 875, 'Porta de Sião', 0, 46);
    s += porta(630, 868, 'Porta do Esterco', 0, 46);
    /* lugares numerados (as fichas) */
    for (const l of LUGARES_CIDADE_ANTIGA) s += `<circle cx="${l.x}" cy="${l.y + 3}" r="19" fill="${C.pedraEsc}"/><circle cx="${l.x}" cy="${l.y}" r="19" fill="${C.ouro}" stroke="${C.papel}" stroke-width="3"/>` + t(l.x, l.y + 7, String(l.n), { cls: 't n', s: 20, a: 'middle', f: C.noite });
    s += t(1040, 330, 'Monte das', { s: 14, a: 'end', w: 700, f: C.oliveira }) + t(1040, 348, 'Oliveiras', { s: 14, a: 'end', w: 700, f: C.oliveira });
    s += t(870, 1030, 'Cidade de Davi', { s: 14, w: 700, f: C.neguevTinta });
    /* norte e aviso */
    s += `<g transform="translate(70 90)"><circle r="26" fill="${C.papel}" stroke="${C.navy}" stroke-width="1.5"/><path d="M0 -18 L7 7 L0 2 L-7 7Z" fill="${C.navy}"/>${t(0, -34, 'N', { s: 14, w: 700, a: 'middle', f: C.navy })}</g>`;
    s += t(120, 1040, 'Esquema fora de escala: mostra onde cada lugar fica em relação aos outros. Os bairros', { s: 13.5, f: C.suave });
    s += t(120, 1060, 'não têm fronteira nítida. Porta Nova e Porta Dourada ficam fora: as fontes não deram o lado.', { s: 13.5, f: C.suave });
    return svg(W, H, 'Esquema da Cidade Antiga de Jerusalém, fora de escala: a muralha com seis portas, os quatro bairros sem fronteira desenhada, a esplanada com o Domo da Rocha e al-Aqsa, o Muro Ocidental e oito lugares numerados.', s);
  }

  /* Jerusalém dividida (1949-1967) e hoje: os mesmos contornos da Natural
     Earth, pintados de dois jeitos. C03-103 (a divisão), C02-525 (1967),
     C03-059 e C03-060 (a lei de 1980 e a Resolução 478). */
  function jerusalemPar(qual) {
    const W = 1080, H = 1080;
    const P = projetor([35.13, 31.70, 35.31, 31.885], 1080, 0, 0);
    let s = `<rect width="${W}" height="${H}" fill="${C.areia}"/>`;
    for (const f of featDisp(disputa, ['B54'])) s += `<path d="${caminho(f.geometry, P.p)}" fill="${C.pedra}" stroke="${C.pedraEsc}" stroke-width="2"/>`;
    for (const f of featDisp(disputa, ISRAEL_1949.filter(x => x === 'B91'))) s += `<path d="${caminho(f.geometry, P.p)}" fill="#FFFFFF" stroke="${C.navy}" stroke-width="3" stroke-linejoin="round"/>`;
    for (const f of featDisp(disputa, ['B98'])) s += `<path d="${caminho(f.geometry, P.p)}" fill="${qual === 'antes' ? C.areiaClara : 'url(#hachura)'}" stroke="${C.ouro}" stroke-width="3" stroke-linejoin="round"/>`;
    for (const f of featDisp(disputa, ['B79', 'B99'])) s += `<path d="${caminho(f.geometry, P.p)}" fill="${qual === 'antes' ? '#C9C1B0' : '#FFFFFF'}" stroke="${qual === 'antes' ? C.suave : C.navy}" stroke-width="1.5"/>`;
    /* a Cidade Antiga, pela coordenada da UNESCO (C04-083) */
    const [x, y] = P.p([35.23, 31.78]);
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="16" fill="${C.neguev}" stroke="${C.papel}" stroke-width="4"/>` + t((x + 26).toFixed(0), (y + 6).toFixed(0), 'Cidade Antiga', { s: 22, w: 700, f: C.noite });
    const rot = (lon, lat, a, b, cor) => { const [rx, ry] = P.p([lon, lat]); return t(rx.toFixed(0), ry.toFixed(0), a, { s: 24, w: 700, ls: 3, f: cor }) + (b ? b.map((l, i) => t(rx.toFixed(0), (ry + 28 + i * 24).toFixed(0), l, { s: 17, f: C.corpo })).join('') : ''); };
    /* Israel: Jerusalém Ocidental, no corredor que vem do oeste; Cisjordânia ao norte e ao sul dele */
    s += rot(35.145, 31.785, 'ISRAEL', qual === 'antes' ? ['Jerusalém Ocidental'] : ['Jerusalém Ocidental'], C.navy);
    s += rot(35.14, 31.865, 'JUDEIA E SAMARIA', ['(Cisjordânia)'], C.suave);
    if (qual === 'antes') s += rot(35.245, 31.86, 'JORDÂNIA', ['o leste da cidade,', 'com a Cidade Antiga'], C.neguevTinta);
    else s += rot(35.243, 31.862, 'JERUSALÉM ORIENTAL', ['o leste da cidade,', 'com a Cidade Antiga'], C.ouroTinta);
    if (qual === 'antes') s += `<rect x="40" y="${H - 170}" width="26" height="18" fill="#C9C1B0" stroke="${C.suave}"/>` + t(76, H - 156, 'áreas especiais da linha de armistício (Natural Earth)', { s: 15, f: C.suave });
    s += `<rect x="0" y="${H - 110}" width="${W}" height="110" fill="${qual === 'antes' ? C.noite : C.navy}"/>`;
    s += t(40, H - 48, qual === 'antes' ? '1949-1967' : 'Desde 1967', { cls: 'd', s: 50, f: '#FFFFFF' });
    s += t(W - 40, H - 52, qual === 'antes' ? 'cidade dividida pelo armistício' : 'a cidade sob administração de Israel', { s: 20, a: 'end', f: C.areiaClara });
    s += t(W - 40, H - 26, 'Contornos: Natural Earth', { s: 13, a: 'end', f: C.areiaClara });
    return svg(W, H, qual === 'antes' ? 'Jerusalém de 1949 a 1967: Israel no oeste, Jordânia no leste com a Cidade Antiga.' : 'Jerusalém desde 1967: a cidade inteira sob administração de Israel.', s);
  }

  /* Um monte, dois nomes. C03-012, C03-013, C03-014 (o muro); C03-018,
     C03-020, C03-027 (os nomes e os edifícios); C03-029, C03-030 (status quo). */
  function monteDoisNomes() {
    const W = 1080, H = 960;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += t(56, 72, 'UM MONTE, DOIS NOMES', { s: 15, w: 700, ls: 3, f: C.tealTinta });
    /* faixas dos nomes */
    s += `<rect x="56" y="104" width="470" height="120" rx="14" fill="${C.navy}"/>` + t(80, 146, 'Para judeus e para o Estado de Israel', { s: 15, f: C.tealLite }) + t(80, 192, 'Monte do Templo', { cls: 'd', s: 36, f: '#FFFFFF' });
    s += `<text class="he" x="504" y="196" font-size="32" fill="${C.ouro}" direction="rtl" unicode-bidi="embed" text-anchor="start">הַר הַבַּיִת</text>`;
    s += `<rect x="554" y="104" width="470" height="120" rx="14" fill="${C.tealTinta}"/>` + t(578, 146, 'Para muçulmanos', { s: 15, f: C.tealSuave }) + t(578, 192, 'Haram al-Sharif', { cls: 'd', s: 36, f: '#FFFFFF' });
    /* o corte: plataforma sobre muros de contenção */
    const base = 760, topo = 470;
    s += `<rect x="0" y="${base}" width="${W}" height="${H - base}" fill="${C.ouroSuave}"/>`;
    const muro = `M150 ${base} L190 ${topo} L890 ${topo} L930 ${base} Z`;
    s += sombra(muro, 8, 10) + `<path d="${muro}" fill="${C.pedra}" stroke="${C.neguevTinta}" stroke-width="2.5"/>`;
    s += `<clipPath id="corte"><path d="${muro}"/></clipPath><g clip-path="url(#corte)">`;
    for (let y = topo + 36, k = 0; y <= base + 30; y += 36, k++) for (let x = 120 + (k % 2) * 45; x < 960; x += 90) s += `<rect x="${x}" y="${y - 30}" width="84" height="30" rx="2" fill="none" stroke="${C.pedraEsc}" stroke-width="2"/>`;
    s += '</g>';
    /* Domo e al-Aqsa sobre a plataforma */
    s += `<rect x="420" y="${topo - 90}" width="140" height="90" fill="${C.tealTinta}"/><path d="M410 ${topo - 88} C410 ${topo - 200} 570 ${topo - 200} 570 ${topo - 88}Z" fill="${C.ouro}" stroke="${C.ouroTinta}" stroke-width="3"/>`;
    s += `<rect x="680" y="${topo - 60}" width="160" height="60" fill="${C.pedraEsc}"/><path d="M730 ${topo - 58} C730 ${topo - 106} 790 ${topo - 106} 790 ${topo - 58}Z" fill="#8E9894"/>`;
    s += t(490, topo - 216, 'Domo da Rocha', { s: 17, w: 700, a: 'middle', f: C.navy }) + t(760, topo - 120, 'Mesquita de al-Aqsa', { s: 17, w: 700, a: 'middle', f: C.navy });
    /* o Muro Ocidental, a face oeste (à esquerda no corte) */
    s += `<path d="M150 ${base} L190 ${topo}" stroke="${C.ouro}" stroke-width="12" stroke-linecap="round"/>`;
    s += `<path d="M168 ${topo + 120} L116 ${topo - 40}" stroke="${C.navy}" stroke-width="1.5"/>`;
    s += t(56, topo - 120, 'Muro Ocidental', { s: 19, w: 700, f: C.navy }) + t(56, topo - 96, 'a face oeste, a mais comprida:', { s: 15 }) + t(56, topo - 60, '485 m', { cls: 't n', s: 30, f: C.neguevTinta });
    s += t(540, base - 30, 'Muros de contenção de Herodes, sobre a rocha; cada pedra, cerca de 5 toneladas', { s: 16, a: 'middle', f: C.neguevTinta });
    /* quem reza, quem visita */
    s += `<line x1="56" x2="${W - 56}" y1="${base + 46}" y2="${base + 46}" stroke="${C.navy}" stroke-width="1.5"/>`;
    s += t(56, base + 90, 'O status quo, nas palavras do governo de Israel (2015):', { s: 15, w: 700, f: C.navy });
    s += t(56, base + 122, '"os muçulmanos rezam no Monte do Templo; os não muçulmanos visitam o Monte do Templo".', { s: 17, i: true });
    s += t(56, base + 152, 'A administração é do Waqf jordaniano; a segurança, de Israel; o visitante não muçulmano entra em horários limitados.', { s: 14.5, f: C.suave });
    s += t(56, H - 18, 'Corte esquemático, fora de escala. Fontes: Autoridade de Antiguidades de Israel; Gabinete do Primeiro-Ministro de Israel (2015).', { s: 12.5, f: C.suave });
    return svg(W, H, 'Corte esquemático do Monte do Templo, ou Haram al-Sharif: a plataforma sobre os muros de contenção de Herodes, com o Muro Ocidental no lado oeste, o Domo da Rocha e a mesquita de al-Aqsa em cima, os dois nomes e a regra do status quo.', s);
  }

  /* Brasil: a muralha (C03-008, cerca de 4.300 m) e o contorno da Lagoa
     Rodrigo de Freitas (C03-119, 7,8 km). Anéis com o comprimento na mesma
     proporção (C03-120); não são os contornos reais. */
  function muralhaLagoa() {
    const W = 1080, H = 720, k = 300 / (2 * Math.PI * 7.8 / 7.8); // raio 300 px/(2π) por km normalizado
    const r = km => (km / 7.8) * 170;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<rect width="${W}" height="150" fill="${C.navy}"/>` + t(56, 62, 'JERUSALÉM X RIO DE JANEIRO', { s: 15, w: 700, ls: 3, f: C.tealLite }) + t(56, 118, 'Uma volta na muralha', { cls: 'd', s: 44, f: '#FFFFFF' });
    void k;
    const anel = (cx, cy, raio, cor, fundo, tracejado) => `<circle cx="${cx + 6}" cy="${cy + 8}" r="${raio}" fill="none" stroke="${C.pedraEsc}" stroke-width="22"/><circle cx="${cx}" cy="${cy}" r="${raio}" fill="${fundo}" stroke="${cor}" stroke-width="22"${tracejado ? ' stroke-dasharray="14 6"' : ''}/>`;
    s += anel(290, 410, r(4.3), C.neguevTinta, C.ouroSuave, true);
    s += anel(740, 410, r(7.8), C.mar, C.marClaro, false);
    s += t(290, 420, '4,3 km', { cls: 't n', s: 40, a: 'middle', f: C.neguevTinta });
    s += t(740, 420, '7,8 km', { cls: 't n', s: 48, a: 'middle', f: C.mar });
    s += t(290, 640, 'Muralha da Cidade Antiga', { s: 18, w: 700, a: 'middle', f: C.navy }) + t(290, 664, 'Autoridade de Antiguidades de Israel', { s: 14, a: 'middle', f: C.suave });
    s += t(740, 640, 'Contorno da Lagoa Rodrigo de Freitas', { s: 18, w: 700, a: 'middle', f: C.navy }) + t(740, 664, 'Fundação Rio-Águas, 2012', { s: 14, a: 'middle', f: C.suave });
    s += t(56, H - 18, 'Os anéis têm comprimento proporcional aos números; não são o desenho dos lugares. A muralha tem pouco mais da metade da volta da Lagoa.', { s: 13, f: C.suave });
    return svg(W, H, 'Comparação: a muralha da Cidade Antiga de Jerusalém tem cerca de 4,3 km; o contorno da Lagoa Rodrigo de Freitas, no Rio, 7,8 km.', s);
  }


  return {
    svgs: {
      'abertura-jerusalem': aberturaJerusalem(),
      'mapa-cidade-antiga': mapaCidadeAntiga(),
      'jerusalem-1949': jerusalemPar('antes'),
      'jerusalem-hoje': jerusalemPar('depois'),
      'monte-dois-nomes': monteDoisNomes(),
      'muralha-lagoa': muralhaLagoa(),
    },
    /* pontos tocáveis: cada um abre a ficha do lugar */
    pontos: { 'mapa-cidade-antiga': LUGARES_CIDADE_ANTIGA.map(l => ({ id: l.id, nome: l.nome, ficha: l.id, x: +(l.x / 10.8).toFixed(1), y: +(l.y / 10.8).toFixed(1) })) },
  };
}
