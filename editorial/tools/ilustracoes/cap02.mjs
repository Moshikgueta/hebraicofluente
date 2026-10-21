/* Ilustrações do capítulo 2 (Milhares de anos de história). Carregado por
   tools/ilustracoes.mjs. Devolve { svgs: {id: svg} }.

   Cada data e número desenhado tem o id da afirmação no comentário. O que não
   tem registro não entra: as faixas de "quem governou" mostram só as
   passagens registradas, e a legenda diz que são simplificadas. */

import { C } from '../lib/desenho.mjs';

export default function capitulo02({ svg, t, sombra }) {
  /* ── Quem governou Jerusalém, em faixas ────────────────────────────────
     Judá até 586 a.C. (C02-091, C02-018); Babilônia 586-539 (C02-018,
     C02-020); Persas 539-c. 332 (C02-020, C02-022, C02-100); reinos gregos
     c. 332-164 (C02-100, C02-025); hasmoneus 164-63 (C02-025, C02-092);
     Roma, depois Bizâncio, 63 a.C.-638 (C02-092, C02-031); califas 638-1099
     (C02-031, C02-040); cruzados 1099-1187 (C02-040); Saladino e os
     sultanatos seguintes, até os mamelucos, 1187-1516/17 (C02-040, C02-042);
     otomanos 1516/17-1917 (C02-042, C02-044); britânicos 1917-1948 (C02-044,
     C02-053, C02-067); cidade dividida 1949-1967 (C03-103); Israel desde
     1967 (C02-525). */
  const FAIXAS = [
    { nome: 'Reis de Judá', datas: 'até 586 a.C.', a: -650, b: -586, cor: C.oliveira, aberta: true },
    { nome: 'Babilônia', datas: '586-539 a.C.', a: -586, b: -539, cor: C.neguevTinta },
    { nome: 'Persas', datas: '539-c. 332 a.C.', a: -539, b: -332, cor: C.mar },
    { nome: 'Reinos gregos', datas: 'c. 332-164 a.C.', a: -332, b: -164, cor: C.teal },
    { nome: 'Hasmoneus', datas: '164-63 a.C.', a: -164, b: -63, cor: C.oliveira },
    { nome: 'Roma, depois Bizâncio', datas: '63 a.C.-638 d.C.', a: -63, b: 638, cor: C.neguev },
    { nome: 'Califas muçulmanos', datas: '638-1099', a: 638, b: 1099, cor: C.tealTinta },
    { nome: 'Cruzados', datas: '1099-1187', a: 1099, b: 1187, cor: C.ouroTinta },
    { nome: 'Saladino e os sultanatos seguintes', datas: '1187-1516/17', a: 1187, b: 1517, cor: C.teal },
    { nome: 'Otomanos', datas: '1516/17-1917', a: 1517, b: 1917, cor: C.mar },
    { nome: 'Britânicos', datas: '1917-1948', a: 1917, b: 1948, cor: C.neguevTinta },
    { nome: 'Cidade dividida: Jordânia e Israel', datas: '1949-1967', a: 1949, b: 1967, cor: C.ouro },
    { nome: 'Israel', datas: 'desde 1967', a: 1967, b: 2026, cor: C.navy },
  ];
  function quemGovernou() {
    const W = 1080, X1 = 372, XA = 830, XB = 856, X2 = 1036, ANO_QUEBRA = 1500;
    const x = ano => ano <= ANO_QUEBRA ? X1 + (ano + 650) / (ANO_QUEBRA + 650) * (XA - X1) : XB + (ano - ANO_QUEBRA) / (2026 - ANO_QUEBRA) * (X2 - XB);
    const Y0 = 300, RH = 64, H = Y0 + FAIXAS.length * RH + 150;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<defs><linearGradient id="esmaece" x1="0" x2="1"><stop offset="0" stop-color="${C.papel}" stop-opacity="1"/><stop offset="1" stop-color="${C.papel}" stop-opacity="0"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="200" fill="${C.navy}"/>`;
    s += t(56, 66, 'LINHA DO TEMPO · CAPÍTULO 2', { s: 15, w: 700, ls: 3, f: C.tealLite });
    s += t(56, 134, 'Quem governou Jerusalém', { cls: 'd', s: 54, f: '#FFFFFF' });
    s += t(56, 176, 'De 586 a.C. até hoje, em faixas. A escala muda em 1500, para caber o último século.', { s: 18, f: C.areiaClara });
    /* grade */
    const marcas = [[-500, '500 a.C.'], [1, '1 d.C.'], [500, '500'], [1000, '1000'], [1500, '1500'], [1700, '1700'], [1900, '1900']];
    for (const [ano, rot] of marcas) {
      const gx = x(ano).toFixed(1);
      s += `<line x1="${gx}" x2="${gx}" y1="${Y0 - 20}" y2="${Y0 + FAIXAS.length * RH}" stroke="${C.linha}" stroke-width="1.5"/>` + t(gx, Y0 - 30, rot, { s: 13, a: 'middle', f: C.suave });
    }
    FAIXAS.forEach((f, i) => {
      const y = Y0 + i * RH;
      if (i % 2 === 0) s += `<rect x="40" y="${y + 2}" width="${W - 80}" height="${RH - 4}" rx="8" fill="${C.areia}" opacity=".7"/>`;
      s += t(56, y + 30, f.nome, { s: 17, w: 700, f: C.navy }) + t(56, y + 51, f.datas, { s: 14.5, f: C.suave });
      const xa = x(f.a), w = Math.max(9, x(f.b) - xa);
      const d = `M${(xa + 4).toFixed(1)} ${y + 16} h${(w - 8).toFixed(1)} a4 4 0 0 1 4 4 v24 a4 4 0 0 1 -4 4 h${(-(w - 8)).toFixed(1)} a4 4 0 0 1 -4 -4 v-24 a4 4 0 0 1 4 -4Z`;
      s += sombra(d, 3, 4) + `<path d="${d}" fill="${f.cor}"/>`;
      if (f.aberta) s += `<rect x="${(xa - 1).toFixed(1)}" y="${y + 14}" width="${(w * 0.75).toFixed(1)}" height="36" fill="url(#esmaece)"/>`;
    });
    /* a quebra da escala, por cima das faixas */
    const xq = (XA + XB) / 2;
    s += `<rect x="${XA + 3}" y="${Y0 - 16}" width="${XB - XA - 6}" height="${FAIXAS.length * RH + 20}" fill="${C.papel}"/>`;
    s += `<path d="M${XA + 3} ${Y0 - 16} V${Y0 + FAIXAS.length * RH + 4} M${XB - 3} ${Y0 - 16} V${Y0 + FAIXAS.length * RH + 4}" stroke="${C.suave}" stroke-width="1.5" stroke-dasharray="3 5"/>`;
    s += t(xq, Y0 + FAIXAS.length * RH + 24, 'a escala muda', { s: 12.5, a: 'middle', f: C.suave });
    const yF = Y0 + FAIXAS.length * RH + 56;
    s += `<line x1="56" x2="${W - 56}" y1="${yF - 12}" y2="${yF - 12}" stroke="${C.linha}"/>`;
    s += t(56, yF + 14, 'Faixas simplificadas: só as passagens de poder registradas neste capítulo (a cidade dividida, no capítulo 3). Datas antigas', { s: 13, f: C.suave });
    s += t(56, yF + 34, 'aproximadas; "c." quer dizer "cerca de". O começo dos reis de Judá é debatido e fica esmaecido. Hebraico Fluente · Israel Além do Roteiro', { s: 13, f: C.suave });
    return svg(W, H, 'Faixas de quem governou Jerusalém: reis de Judá até 586 a.C., Babilônia, persas, reinos gregos, hasmoneus, Roma e depois Bizâncio até 638, califas muçulmanos, cruzados de 1099 a 1187, Saladino e os sultanatos seguintes, otomanos de 1516/17 a 1917, britânicos até 1948, a cidade dividida de 1949 a 1967 e Israel desde 1967.', s);
  }

  /* ── As três estelas, em silhueta ──────────────────────────────────────
     Merneptah: c. 1207 a.C., o nome Israel, Museu Egípcio do Cairo (C02-004).
     Mesha: basalto, cerca de 1,25 m, 34 linhas, pouco depois de 842 a.C.,
     Louvre (C02-005, C02-006). Tel Dan: século IX a.C., aramaico, bytdwd,
     Museu de Israel (C02-007). As silhuetas são desenho: fora de escala e
     sem proporção entre si; só a altura da de Mesha é medida da fonte. */
  function estelas() {
    const W = 1080, H = 1000;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += t(56, 72, 'TRÊS INSCRIÇÕES', { s: 15, w: 700, ls: 3, f: C.tealTinta });
    s += t(56, 130, 'As estelas, lado a lado', { cls: 'd', s: 50, f: C.navy });
    s += `<rect x="0" y="200" width="${W}" height="420" fill="${C.ouroSuave}"/>`;
    const linhas = (x0, x1, y0, y1, passo) => { let r = ''; for (let y = y0; y <= y1; y += passo) r += `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${C.pedra}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`; return r; };
    /* Merneptah: placa alta de topo arredondado */
    const m = 'M110 600 V320 C110 240 290 240 290 320 V600Z';
    s += sombra(m, 8, 10) + `<path d="${m}" fill="#6E6A66" stroke="${C.navy}" stroke-width="2"/>`;
    s += `<path d="M130 330 C140 278 260 278 270 330" fill="none" stroke="${C.pedra}" stroke-width="3" opacity=".6"/>` + linhas(132, 268, 360, 580, 16);
    /* Mesha: topo arredondado, pedra escura com as linhas de fratura dos fragmentos */
    const me = 'M430 600 V360 C430 286 650 286 650 360 V600Z';
    s += sombra(me, 8, 10) + `<path d="${me}" fill="#2C2F33" stroke="${C.navy}" stroke-width="2"/>`;
    s += linhas(452, 628, 352, 582, 14);
    s += `<path d="M445 420 L520 445 L560 410 L640 440 M440 520 L500 500 L580 540 L645 515" fill="none" stroke="${C.ouro}" stroke-width="2.5" stroke-dasharray="7 5"/>`;
    /* Tel Dan: fragmento de contorno irregular */
    const td = 'M790 600 L780 470 L812 400 L870 372 L930 392 L962 450 L948 520 L972 600Z';
    s += sombra(td, 8, 10) + `<path d="${td}" fill="#8E8A80" stroke="${C.navy}" stroke-width="2"/>`;
    s += linhas(800, 950, 420, 585, 15);
    /* fichas embaixo */
    const col = (x, nome, data, lista) => t(x, 668, nome, { s: 22, w: 700, f: C.navy }) + t(x, 698, data, { cls: 'n', s: 20, f: C.neguevTinta }) + lista.map((l, i) => t(x, 736 + i * 25, l, { s: 16.5, f: i % 3 === 2 ? C.tealTinta : C.corpo })).join('');
    s += col(80, 'Merneptah', 'c. 1207 a.C.', ['O nome Israel num texto', 'egípcio.', 'Museu Egípcio do Cairo']);
    s += col(410, 'Mesha', 'pouco depois de 842 a.C.', ['Basalto, cerca de 1,25 m,', '34 linhas em moabita.', 'Louvre, Paris']);
    s += col(760, 'Tel Dan', 'século IX a.C.', ['Aramaico; a sequência bytdwd,', '"casa de Davi" para a maioria.', 'Museu de Israel, Jerusalém']);
    s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(56, H - 46, 'Silhuetas esquemáticas, fora de escala e sem proporção entre si: só a altura da estela de Mesha vem da fonte (Louvre).', { s: 12.5, f: C.suave });
    s += t(56, H - 26, 'Fontes: Museu Egípcio do Cairo, Louvre e Museu de Israel, pelos registros do capítulo 2. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Silhuetas esquemáticas das três estelas: Merneptah, de cerca de 1207 a.C., no Cairo; Mesha, de basalto e cerca de 1,25 m, no Louvre; o fragmento de Tel Dan, do século IX a.C., no Museu de Israel.', s);
  }

  /* ── Brasil: Oswaldo Aranha e a votação de 1947 ────────────────────────
     Aranha, nascido em Alegrete (RS) em 1894, presidente da segunda sessão
     da Assembleia Geral (C02-101); 29 nov. 1947, Resolução 181 (II), 33 a
     favor, 13 contra, 10 abstenções (C02-063); 57 membros, 1 sem voto, o
     Brasil a favor (C02-102); na sessão que ele presidia (C02-103). */
  function aranha() {
    const W = 1080, H = 1080;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<rect width="${W}" height="330" fill="${C.navy}"/>`;
    s += t(56, 72, 'BRASIL NA ONU · 1947', { s: 15, w: 700, ls: 3, f: C.tealLite });
    s += t(56, 150, 'Um brasileiro', { cls: 'd', s: 64, f: '#FFFFFF' });
    s += t(56, 222, 'na presidência', { cls: 'd', s: 64, f: C.ouro });
    s += t(56, 272, 'Oswaldo Aranha, nascido em Alegrete (RS) em 1894, presidiu a segunda sessão', { s: 19, f: C.areiaClara });
    s += t(56, 300, 'da Assembleia Geral da ONU: a que votou a partilha da Palestina.', { s: 19, f: C.areiaClara });
    /* martelo de presidente de mesa, desenho */
    s += `<g transform="translate(900 170) rotate(-30)"><rect x="-70" y="-26" width="140" height="52" rx="10" fill="${C.ouro}"/><rect x="-80" y="-30" width="18" height="60" rx="5" fill="${C.ouroTinta}"/><rect x="62" y="-30" width="18" height="60" rx="5" fill="${C.ouroTinta}"/><rect x="-8" y="26" width="16" height="130" rx="6" fill="${C.ouroTinta}"/></g>`;
    s += t(56, 400, '29 DE NOVEMBRO DE 1947 · RESOLUÇÃO 181', { s: 15, w: 700, ls: 2.4, f: C.navy });
    /* 56 votos em pontos; o do Brasil marcado entre os 33 a favor */
    const cores = [...Array(33).fill(C.teal), ...Array(13).fill(C.neguev), ...Array(10).fill(C.pedraEsc)];
    const BR = 3; // posição do Brasil na lista em ordem alfabética dos votos a favor (Austrália, Bélgica, Bolívia, Brasil)
    cores.forEach((cor, i) => {
      const cx = 86 + (i % 14) * 66, cy = 460 + Math.floor(i / 14) * 66;
      s += `<circle cx="${cx + 3}" cy="${cy + 4}" r="24" fill="${C.pedraEsc}" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="24" fill="${cor}"${i === BR ? ` stroke="${C.ouro}" stroke-width="7"` : ''}/>`;
      if (i === BR) s += t(cx, cy + 6, 'BR', { s: 15, w: 700, a: 'middle', f: '#FFFFFF' });
    });
    const yN = 460 + 4 * 66 + 30;
    const tile = (x, num, rot, cor) => t(x, yN + 50, num, { cls: 'n', s: 64, f: cor }) + t(x, yN + 84, rot, { s: 18, f: C.corpo });
    s += tile(56, '33', 'a favor', C.tealTinta) + tile(316, '13', 'contra', C.neguevTinta) + tile(576, '10', 'abstenções', C.suave);
    s += `<rect x="770" y="${yN}" width="${W - 56 - 770}" height="104" rx="14" fill="${C.ouroSuave}"/>` + t(792, yN + 44, 'O Brasil', { s: 20, w: 700, f: C.neguevTinta }) + t(792, yN + 74, 'votou a favor.', { s: 20, w: 700, f: C.neguevTinta });
    s += t(56, yN + 150, 'Na Assembleia havia 57 membros: um deles não votou. Cada ponto é um voto; o círculo dourado é o do Brasil.', { s: 15, f: C.suave });
    s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(56, H - 46, 'Fontes: ONU (biografia oficial dos presidentes da Assembleia Geral; registro de votação na Biblioteca Digital da ONU, 128ª sessão plenária).', { s: 12.5, f: C.suave });
    s += t(56, H - 26, 'O martelo é desenho. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Oswaldo Aranha, brasileiro, presidiu a segunda sessão da Assembleia Geral da ONU, que aprovou a Resolução 181 em 29 de novembro de 1947 por 33 votos a 13, com 10 abstenções; o Brasil votou a favor.', s);
  }

  return { svgs: { 'quem-governou-jerusalem': quemGovernou(), 'tres-estelas': estelas(), 'aranha-1947': aranha() } };
}
