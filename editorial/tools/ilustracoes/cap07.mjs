/* Ilustrações do capítulo 7 (Hebraico para compreender Israel). Carregado
   por tools/ilustracoes.mjs. Estilo "papel recortado" (DESIGN-SYSTEM.md,
   seção 8). Só hebraico que o capítulo já tem; nenhum texto em árabe, porque
   o livro não registrou a grafia árabe de nenhum nome. */

import { C, esc } from '../lib/desenho.mjs';

export default function capitulo07({ svg, t, sombra }) {
  const he = (x, y, txt, o = {}) => `<text class="he" x="${x}" y="${y}" font-size="${o.s || 30}" style="font-size:${o.s || 30}px" fill="${o.f || C.navy}" direction="rtl" unicode-bidi="embed" text-anchor="${o.a || 'start'}"${o.tr ? ` transform="${o.tr}"` : ''}>${txt}</text>`;
  const cabeca = (W, kicker, titulo) => `<rect width="${W}" height="140" fill="${C.navy}"/>` + t(56, 58, kicker, { s: 15, w: 700, ls: 3, f: C.tealLite }) + t(56, 112, titulo, { cls: 'd', s: 42, f: '#FFFFFF' });

  /* ── Abertura: letras hebraicas soltas, em papel recortado. Letras
     isoladas, espalhadas e giradas, para não formar palavra. Sem dado. */
  function abertura() {
    const W = 1480, H = 1300;
    let s = `<rect width="${W}" height="${H}" fill="${C.navy}"/>`;
    for (let k = 0; k < 9; k++) s += `<rect x="${-40 + k * 180}" y="${80 + (k % 3) * 360}" width="150" height="150" rx="10" fill="${C.noite}" opacity=".5" transform="rotate(${(k % 4) * 7 - 10} ${35 + k * 180} ${155 + (k % 3) * 360})"/>`;
    const L = [
      ['א', 230, 330, 330, -8, C.papel], ['ש', 1170, 360, 300, 9, C.ouro], ['ב', 700, 560, 260, 4, C.tealLite],
      ['ק', 330, 960, 290, 10, C.ouro], ['מ', 1020, 980, 300, -7, C.papel], ['ע', 620, 1180, 200, -4, C.areiaClara],
      ['ל', 1320, 690, 220, 12, C.areiaClara], ['ת', 110, 650, 200, 6, C.tealLite], ['ר', 820, 200, 170, -12, C.areiaClara],
    ];
    for (const [l, x, y, sz, rot, cor] of L) {
      s += `<text class="he" x="${x + 10}" y="${y + 14}" font-size="${sz}" style="font-size:${sz}px" fill="${C.noite}" opacity=".55" text-anchor="middle" transform="rotate(${rot} ${x} ${y})">${l}</text>`;
      s += `<text class="he" x="${x}" y="${y}" font-size="${sz}" style="font-size:${sz}px" fill="${cor}" text-anchor="middle" font-weight="700" transform="rotate(${rot} ${x} ${y})">${l}</text>`;
    }
    for (const [x, y, r] of [[470, 180, 14], [1000, 660, 10], [520, 760, 12], [1250, 1180, 16], [140, 1180, 10], [880, 430, 8]]) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.ouro}"/>`;
    return svg(W, H, 'Ilustração: letras hebraicas soltas, recortadas em papel e espalhadas sobre fundo azul-escuro.', s);
  }

  /* ── Anatomia de uma placa trilíngue, com Acre.
     עכו: a grafia sem vogais que o capítulo dá. Akko: o nome no Antigo
     Testamento e o que voltou no período árabe; Ptolemais no período
     helenístico; capital do segundo reino cruzado de 1191 a 1291; inscrita
     pela UNESCO como "Old City of Acre" (C07-012). Hebraico e árabe da
     direita para a esquerda; letras latinas = transliteração (texto do
     capítulo). O ו fazendo papel de vogal: seção "Decifrar o hebraico sem os
     sinais de vogal". A ordem das faixas NÃO é dado (C07-009 não verificada),
     e a faixa do árabe fica sem texto. */
  function placa() {
    const W = 1080, H = 1110;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + cabeca(W, 'ANATOMIA DE UMA PLACA', 'Três escritas, um nome');
    /* poste e placa */
    s += `<rect x="530" y="660" width="26" height="90" fill="${C.pedraEsc}"/><rect x="524" y="652" width="26" height="100" fill="${C.suave}"/>`;
    const pl = 'M240 200 H840 Q860 200 860 220 V640 Q860 660 840 660 H240 Q220 660 220 640 V220 Q220 200 240 200Z';
    s += sombra(pl, 9, 11) + `<path d="${pl}" fill="${C.navy}"/><path d="M240 214 H840 Q846 214 846 220 V640 Q846 646 840 646 H240 Q234 646 234 640 V220 Q234 214 240 214Z" fill="none" stroke="#FFFFFF" stroke-width="4"/>`;
    /* faixa 1: hebraico */
    s += he(540, 330, 'עכו', { s: 104, a: 'middle', f: '#FFFFFF' });
    /* faixa 2: árabe, sem texto */
    s += `<rect x="300" y="380" width="480" height="96" rx="12" fill="none" stroke="${C.tealLite}" stroke-width="3" stroke-dasharray="10 8"/>` + t(540, 424, 'faixa do árabe', { s: 22, w: 700, a: 'middle', f: C.tealLite }) + t(540, 452, '(sem texto neste desenho)', { s: 17, a: 'middle', f: C.tealLite });
    /* faixa 3: letras latinas */
    s += t(540, 590, 'Akko', { s: 86, w: 700, a: 'middle', f: '#FFFFFF' });
    /* anotações à esquerda e à direita */
    const seta = (x1, x2, y) => `<path d="M${x1} ${y} H${x2}" stroke="${C.neguev}" stroke-width="4" marker-end="url(#ponta)"/>`;
    s += t(56, 250, 'Hebraico', { s: 20, w: 700, f: C.navy }) + t(56, 276, 'sem os sinais', { s: 15, f: C.suave }) + t(56, 296, 'de vogal', { s: 15, f: C.suave });
    s += t(56, 420, 'Árabe', { s: 20, w: 700, f: C.navy });
    s += seta(200, 70, 330) + seta(200, 70, 450);
    s += t(56, 360, 'da direita para', { s: 15, i: true, f: C.neguevTinta }) + t(56, 380, 'a esquerda', { s: 15, i: true, f: C.neguevTinta });
    s += t(56, 480, 'da direita para', { s: 15, i: true, f: C.neguevTinta }) + t(56, 500, 'a esquerda', { s: 15, i: true, f: C.neguevTinta });
    s += t(56, 560, 'Letras latinas', { s: 20, w: 700, f: C.navy }) + t(56, 586, 'transliteração:', { s: 15, f: C.suave }) + t(56, 606, 'o som do nome', { s: 15, f: C.suave });
    /* o ו como vogal */
    s += `<circle cx="472" cy="296" r="40" fill="none" stroke="${C.ouro}" stroke-width="4"/><path d="M432 280 C 380 250 920 250 880 290" fill="none" stroke="none"/>`;
    s += `<path d="M512 276 C 600 250 760 250 880 262" fill="none" stroke="${C.ouro}" stroke-width="2.5" stroke-dasharray="2 6" stroke-linecap="round"/>`;
    s += `<text class="t" x="886" y="254" font-size="16" font-weight="700" fill="${C.ouroTinta}">o <tspan class="he" font-size="20" style="font-size:20px">ו</tspan> faz o</text>` + t(886, 276, 'papel do o:', { s: 16, w: 700, f: C.ouroTinta }) + t(886, 298, 'Áko', { s: 16, i: true, f: C.ouroTinta });
    /* um nome, três épocas */
    s += `<rect x="56" y="760" width="${W - 112}" height="270" rx="16" fill="${C.ouroSuave}"/>`;
    s += t(86, 804, 'UM NOME, TRÊS ÉPOCAS, SEGUNDO O DOSSIÊ DA UNESCO', { s: 15, w: 700, ls: 2, f: C.neguevTinta });
    const etapa = (x, a, b, c) => `<circle cx="${x}" cy="872" r="12" fill="${C.navy}"/>` + t(x, 916, a, { s: 26, w: 700, a: 'middle', f: C.navy }) + t(x, 944, b, { s: 16, a: 'middle', f: C.corpo }) + (c ? t(x, 966, c, { s: 16, a: 'middle', f: C.corpo }) : '');
    s += `<line x1="200" x2="880" y1="872" y2="872" stroke="${C.navy}" stroke-width="3"/>`;
    s += etapa(200, 'Akko', 'no Antigo', 'Testamento') + etapa(540, 'Ptolemais', 'no período', 'helenístico') + etapa(880, 'Akko', 'de volta, no', 'período árabe');
    s += t(540, 1008, 'Entre 1191 e 1291, capital do segundo reino cruzado. Em português, Acre.', { s: 16, i: true, a: 'middle', f: C.neguevTinta });
    s += t(56, H - 40, 'Placa desenhada, não é retrato de uma placa real: a ordem das faixas é ilustrativa, e a faixa do árabe vai sem texto', { s: 13, f: C.suave });
    s += t(56, H - 20, 'porque este livro não registrou a grafia árabe do nome. Fonte dos nomes: dossiê de candidatura da UNESCO.', { s: 13, f: C.suave });
    return svg(W, H, 'Anatomia de uma placa trilíngue desenhada: em cima o nome de Acre em hebraico sem vogais, no meio a faixa do árabe deixada sem texto, embaixo a transliteração Akko; e, abaixo, os três nomes da cidade ao longo do tempo segundo a UNESCO.', s);
  }

  /* ── Hebraico e português: sábado. Latim sabbatum, do grego sabbaton, do
     hebraico shabbath, "dia de descanso" (C07-043, Etymonline e Lewis &
     Short); português sábado, do latim sabbatum (C07-042, Dicio). A conta
     da cadeia: C07-044. שַׁבָּת é a grafia que o capítulo já usa. */
  function sabado() {
    const W = 1080, H = 860;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + cabeca(W, 'HEBRAICO E PORTUGUÊS', 'Uma palavra que o Brasil já fala');
    const card = (x, y, w, cor, linhas) => { const d = `M${x} ${y} h${w} v210 h-${w}z`; return sombra(d, 7, 9) + `<path d="${d}" fill="${cor}"/>` + linhas; };
    const seta = (x1, x2, y) => `<path d="M${x1} ${y} H${x2}" stroke="${C.neguev}" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round" marker-end="url(#ponta)"/>`;
    const Y = 260, w = 210, gap = 52;
    const xs = [56, 56 + w + gap, 56 + 2 * (w + gap), 56 + 3 * (w + gap)];
    s += card(xs[0], Y, w, C.navy, he(xs[0] + w / 2, Y + 100, 'שַׁבָּת', { s: 56, a: 'middle', f: '#FFFFFF' }) + t(xs[0] + w / 2, Y + 146, 'shabát', { s: 20, i: true, a: 'middle', f: C.tealLite }) + t(xs[0] + w / 2, Y + 186, 'HEBRAICO', { s: 14, w: 700, ls: 3, a: 'middle', f: C.tealLite }));
    s += card(xs[1], Y, w, C.pedra, t(xs[1] + w / 2, Y + 100, 'sabbaton', { s: 30, i: true, a: 'middle', f: C.navy }) + t(xs[1] + w / 2, Y + 186, 'GREGO', { s: 14, w: 700, ls: 3, a: 'middle', f: C.suave }));
    s += card(xs[2], Y, w, C.pedra, t(xs[2] + w / 2, Y + 100, 'sabbatum', { s: 30, i: true, a: 'middle', f: C.navy }) + t(xs[2] + w / 2, Y + 186, 'LATIM', { s: 14, w: 700, ls: 3, a: 'middle', f: C.suave }));
    s += card(xs[3], Y, w, C.ouro, t(xs[3] + w / 2, Y + 104, 'sábado', { cls: 'd', s: 42, a: 'middle', f: '#FFFFFF' }) + t(xs[3] + w / 2, Y + 186, 'PORTUGUÊS', { s: 14, w: 700, ls: 3, a: 'middle', f: C.ouroSuave }));
    for (let k = 0; k < 3; k++) s += seta(xs[k] + w + 6, xs[k + 1] - 8, Y + 105);
    s += t(xs[0], Y + 270, 'Em hebraico, o dia de descanso;', { s: 18, f: C.corpo }) + t(xs[0], Y + 296, 'a raiz fala em "descansar".', { s: 18, f: C.corpo });
    s += t(xs[2], Y + 270, 'Em latim, o dia de descanso dos judeus;', { s: 18, f: C.corpo }) + t(xs[2], Y + 296, 'depois, o nome do dia da semana.', { s: 18, f: C.corpo });
    s += `<rect x="56" y="${Y + 350}" width="${W - 112}" height="120" rx="14" fill="${C.ouroSuave}"/>`;
    s += t(86, Y + 400, 'Quem diz "sábado" em português está dizendo, de longe, a mesma palavra', { s: 20, w: 600, f: C.navy });
    s += t(86, Y + 432, 'que o israelense diz no cumprimento de sexta-feira: shabát shalóm.', { s: 20, w: 600, f: C.navy });
    s += t(56, H - 36, 'Fontes: Dicio, Dicionário Online de Português (sábado); Online Etymology Dictionary (Sabbath); Lewis & Short,', { s: 13, f: C.suave });
    s += t(56, H - 16, 'A Latin Dictionary (sabbatum). O caminho resume as obras de referência; não é um estudo próprio.', { s: 13, f: C.suave });
    return svg(W, H, 'Hebraico e português: o hebraico shabát, dia de descanso, passou ao grego sabbaton e ao latim sabbatum e chegou ao português como sábado.', s);
  }

  /* ── Compare: Jerusalém com e sem os sinais de vogal. As duas grafias e a
     regra do ו estão no texto do capítulo (seção "Decifrar o hebraico sem os
     sinais de vogal" e lista "Lugares"). */
  function nikud(qual) {
    const W = 1080, H = 760, com = qual === 'com';
    let s = `<rect width="${W}" height="${H}" fill="${com ? C.ouroSuave : C.tealSuave}"/>`;
    s += t(540, 92, com ? 'COM OS SINAIS DE VOGAL' : 'SEM OS SINAIS DE VOGAL', { s: 18, w: 700, ls: 4, a: 'middle', f: com ? C.ouroTinta : C.tealTinta });
    s += t(540, 132, com ? 'como neste livro e no curso' : 'como nas placas, nos cardápios e nos jornais', { s: 20, i: true, a: 'middle', f: C.suave });
    const caixa = 'M120 180 H960 V500 H120Z';
    s += sombra(caixa, 9, 11) + `<path d="${caixa}" fill="#FFFFFF"/>`;
    const vav = `<tspan fill="${C.ouro}">${com ? 'וּ' : 'ו'}</tspan>`;
    s += he(540, 390, com ? `יְר${vav}שָׁלַיִם` : `יר${vav}שלים`, { s: 150, a: 'middle', f: C.navy });
    s += t(540, 580, 'Yerushaláyim, Jerusalém', { s: 26, w: 700, a: 'middle', f: C.navy });
    s += t(540, 620, com ? 'Os pontos e traços em volta das letras dão as vogais.' : 'Sem os pontos, quem sinaliza a vogal é a própria letra.', { s: 20, a: 'middle', f: C.corpo });
    s += `<text class="t" x="540" y="652" font-size="20" text-anchor="middle" fill="${C.ouroTinta}">Em dourado, o <tspan class="he" font-size="26" style="font-size:26px">ו</tspan>, que faz o papel de o ou u.</text>`;
    s += t(540, H - 30, 'Desenho tipográfico.', { s: 13, a: 'middle', f: C.suave });
    return svg(W, H, com ? 'Jerusalém em hebraico com os sinais de vogal, como neste livro, com a letra vav em destaque.' : 'Jerusalém em hebraico sem os sinais de vogal, como nas placas, com a letra vav em destaque fazendo o papel de vogal.', s);
  }

  return {
    svgs: {
      'abertura-hebraico': abertura(),
      'placa-trilingue': placa(),
      'sabado-shabat': sabado(),
      'nikud-com-pontos': nikud('com'),
      'nikud-sem-pontos': nikud('sem'),
    },
  };
}
