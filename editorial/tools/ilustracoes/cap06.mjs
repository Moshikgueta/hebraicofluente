/* Ilustrações do capítulo 6 (Sabores de Israel). Carregado por
   tools/ilustracoes.mjs. Estilo "papel recortado" (DESIGN-SYSTEM.md, seção 8).
   Todo rótulo de ingrediente e todo número vêm de uma afirmação VERIFICADA,
   citada no comentário de cada desenho. Os pratos são esquemas, não receita. */

import { C, esc } from '../lib/desenho.mjs';

export default function capitulo06({ svg, t, sombra }) {
  /* hebraico: x é a borda direita (direction rtl, anchor start) ou o centro */
  const he = (x, y, txt, o = {}) => `<text class="he" x="${x}" y="${y}" font-size="${o.s || 30}" fill="${o.f || C.navy}" direction="rtl" unicode-bidi="embed" text-anchor="${o.a || 'start'}">${esc(txt)}</text>`;
  const num = (x, y, n) => `<circle cx="${x}" cy="${y + 2}" r="15" fill="${C.pedraEsc}"/><circle cx="${x}" cy="${y}" r="15" fill="${C.ouro}" stroke="${C.papel}" stroke-width="2.5"/>` + t(x, y + 6, String(n), { cls: 't n', s: 16, a: 'middle', f: C.noite });
  const fio = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.navy}" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round" fill="none"/>`;
  const cabeca = (W, kicker, titulo) => `<rect width="${W}" height="140" fill="${C.navy}"/>` + t(56, 58, kicker, { s: 15, w: 700, ls: 3, f: C.tealLite }) + t(56, 112, titulo, { cls: 'd', s: 42, f: '#FFFFFF' });
  const BERINJELA = '#6E4B7A';

  /* pita aberta, em corte (bolso em U) */
  const pita = (cx, topo, larg, alt) => {
    const d = `M${cx - larg / 2} ${topo} Q${cx - larg / 2} ${topo + alt} ${cx} ${topo + alt} Q${cx + larg / 2} ${topo + alt} ${cx + larg / 2} ${topo} Q${cx} ${topo + 40} ${cx - larg / 2} ${topo}Z`;
    return sombra(d, 7, 9) + `<path d="${d}" fill="${C.areiaClara}" stroke="${C.neguevTinta}" stroke-width="2.5"/>` + `<path d="M${cx - larg / 2 + 18} ${topo + 20} Q${cx - larg / 2 + 22} ${topo + alt - 30} ${cx} ${topo + alt - 18}" fill="none" stroke="${C.ouro}" stroke-width="2" opacity=".6"/>`;
  };
  const ovo = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="${C.pedraEsc}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r * .45}" fill="${C.ouro}"/>`;
  const berinjela = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="44" ry="20" fill="${BERINJELA}"/><ellipse cx="${x}" cy="${y}" rx="34" ry="13" fill="${C.areiaClara}"/><ellipse cx="${x}" cy="${y}" rx="34" ry="13" fill="${C.neguev}" opacity=".35"/></g>`;
  const bolinho = (x, y, r = 26) => `<circle cx="${x + 3}" cy="${y + 4}" r="${r}" fill="${C.pedraEsc}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${C.neguevTinta}"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .45}" fill="${C.neguev}"/>` + [0, 1, 2, 3].map(k => `<circle cx="${(x + Math.cos(k * 1.7) * r * .55).toFixed(1)}" cy="${(y + Math.sin(k * 1.7) * r * .55).toFixed(1)}" r="2.6" fill="${C.oliveira}"/>`).join('');
  const salada = (x, y) => [[0, 0, C.oliveira], [22, -8, C.tealLite], [-20, -6, C.neguev], [10, 12, C.oliveira], [-8, 14, C.tealLite], [30, 10, C.neguev]].map(([dx, dy, c]) => `<rect x="${x + dx - 9}" y="${y + dy - 9}" width="18" height="18" rx="3" fill="${c}" transform="rotate(${dx} ${x + dx} ${y + dy})"/>`).join('');

  /* ── Abertura: uma mesa vista de cima, com pratos. Sem marca, sem pessoa,
     sem dado: é desenho. ─────────────────────────────────────────────── */
  function abertura() {
    const W = 1480, H = 1300;
    let s = `<rect width="${W}" height="${H}" fill="${C.tealTinta}"/>`;
    /* toalha em xadrez largo */
    for (let x = 0; x < W; x += 120) s += `<rect x="${x}" y="0" width="60" height="${H}" fill="${C.teal}" opacity=".45"/>`;
    for (let y = 0; y < H; y += 120) s += `<rect x="0" y="${y}" width="${W}" height="60" fill="${C.teal}" opacity=".3"/>`;
    /* prato de homus, ao centro */
    const prato = (cx, cy, r, fundo = C.papel) => `<circle cx="${cx + 9}" cy="${cy + 12}" r="${r}" fill="${C.noite}" opacity=".35"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fundo}" stroke="${C.pedraEsc}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="${r * .8}" fill="none" stroke="${C.linha}" stroke-width="3"/>`;
    s += prato(740, 640, 300);
    s += `<circle cx="740" cy="640" r="220" fill="${C.areiaClara}"/><path d="M740 640 m-170 0 a170 170 0 1 0 340 0 a170 170 0 1 0 -340 0" fill="none" stroke="${C.pedraEsc}" stroke-width="10" opacity=".7"/><circle cx="740" cy="640" r="95" fill="${C.ouro}" opacity=".55"/>`;
    for (const [dx, dy] of [[-30, -20], [10, 15], [35, -25], [-10, 30], [20, -45], [-45, 15]]) s += `<circle cx="${740 + dx}" cy="${640 + dy}" r="13" fill="${C.ouroSuave}" stroke="${C.ouroTinta}" stroke-width="2"/>`;
    for (const [dx, dy] of [[60, -120], [-140, 60], [110, 110], [-90, -130]]) s += `<circle cx="${740 + dx}" cy="${640 + dy}" r="6" fill="${C.neguev}"/>`;
    /* pratinho de falafel, em cima à esquerda */
    s += prato(300, 300, 190);
    for (const [dx, dy] of [[-60, -40], [40, -60], [70, 30], [-20, 50], [-80, 60], [10, -5]]) s += bolinho(300 + dx, 300 + dy, 42);
    /* pitas empilhadas, embaixo à esquerda */
    for (let k = 0; k < 3; k++) s += `<ellipse cx="${330 + k * 16}" cy="${1010 - k * 18}" rx="210" ry="150" fill="${k % 2 ? C.areiaClara : C.pedra}" stroke="${C.neguevTinta}" stroke-width="3"/>`;
    s += `<ellipse cx="362" cy="974" rx="150" ry="100" fill="none" stroke="${C.ouro}" stroke-width="3" opacity=".6"/>`;
    /* tigelinha de salada e tigelinha de picles, à direita */
    s += prato(1220, 300, 150);
    s += salada(1200, 290) + salada(1250, 330) + salada(1180, 340);
    s += prato(1230, 960, 170);
    for (let k = 0; k < 7; k++) s += berinjela(1230 + Math.cos(k) * 70, 960 + Math.sin(k) * 60, k * 40);
    /* copo d'água, guardanapo e talheres */
    s += `<circle cx="1000" cy="1140" r="70" fill="${C.marClaro}" stroke="#FFFFFF" stroke-width="8" opacity=".9"/><circle cx="1000" cy="1140" r="44" fill="#FFFFFF" opacity=".4"/>`;
    s += `<rect x="560" y="1050" width="220" height="180" rx="10" fill="${C.papel}" transform="rotate(-8 670 1140)"/>`;
    s += `<rect x="620" y="1070" width="16" height="170" rx="8" fill="${C.pedraEsc}" transform="rotate(-8 670 1140)"/><rect x="690" y="1060" width="16" height="170" rx="8" fill="${C.pedraEsc}" transform="rotate(-8 670 1140)"/>`;
    return svg(W, H, 'Ilustração: uma mesa vista de cima, com um prato grande de homus no centro, um pratinho de falafel, pitas empilhadas, salada, berinjela e um copo de água.', s);
  }

  /* ── Sabich e falafel por dentro.
     Sabich: pita com berinjela e ovo, "entre outras coisas" (C06-010).
     Falafel: o trio pita, falafel e salada, combinação do século XX segundo
     Stampfer (C06-009); bolinho frito, de fava na hipótese egípcia (C06-008). */
  function anatomiaSabichFalafel() {
    const W = 1080, H = 1060;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + cabeca(W, 'ANATOMIA DO BALCÃO', 'O sabich e o falafel, por dentro');
    s += `<line x1="540" x2="540" y1="190" y2="900" stroke="${C.linha}" stroke-width="2"/>`;
    /* sabich */
    s += t(280, 210, 'Sabich', { cls: 'd', s: 34, a: 'middle', f: C.navy }) + he(280, 252, 'סַבִּיח', { s: 28, a: 'middle', f: C.ouroTinta });
    s += pita(280, 360, 300, 330);
    s += berinjela(220, 362, -12) + berinjela(330, 352, 14) + berinjela(270, 392, 4);
    s += ovo(250, 330, 26) + ovo(310, 322, 24) + ovo(290, 372, 22);
    s += num(110, 560, 1) + fio(126, 560, 160, 560) + num(460, 330, 2) + fio(444, 334, 370, 352) + num(120, 300, 3) + fio(136, 304, 226, 326);
    const leg = (x, y, n, a, b) => num(x, y - 6, n) + t(x + 26, y, a, { s: 19, w: 700, f: C.navy }) + (b ? t(x + 26, y + 24, b, { s: 15, f: C.suave }) : '');
    s += leg(70, 760, 1, 'Pita', 'o pão de bolso') + leg(70, 820, 2, 'Berinjela') + leg(70, 870, 3, 'Ovo');
    s += t(70, 930, '...entre outras coisas, segundo as reportagens.', { s: 15, i: true, f: C.suave });
    /* falafel */
    s += t(800, 210, 'Falafel na pita', { cls: 'd', s: 34, a: 'middle', f: C.navy });
    s += pita(800, 360, 300, 330);
    s += bolinho(745, 345) + bolinho(805, 330) + bolinho(860, 352) + bolinho(775, 395, 24) + bolinho(835, 400, 24);
    s += salada(720, 300) + salada(880, 300);
    s += num(630, 560, 1) + fio(646, 560, 680, 560) + num(990, 420, 2) + fio(974, 420, 860, 402) + num(980, 260, 3) + fio(964, 264, 900, 296);
    s += leg(590, 760, 1, 'Pita') + leg(590, 820, 2, 'Falafel', 'bolinhos fritos') + leg(590, 880, 3, 'Salada');
    s += t(590, 930, 'O trio é uma combinação do século XX,', { s: 15, i: true, f: C.suave }) + t(590, 952, 'segundo o historiador Shaul Stampfer.', { s: 15, i: true, f: C.suave });
    /* nota da fava */
    s += `<rect x="56" y="975" width="${W - 112}" height="48" rx="10" fill="${C.ouroSuave}"/>` + t(76, 1006, 'Na hipótese que põe a origem no Egito, o bolinho original era de fava, a taamíya; a origem segue em aberto.', { s: 15, f: C.neguevTinta });
    s += t(56, H - 12, 'Desenho esquemático, não é receita. Fontes: Ynetnews e The Jewish Independent (sabich); History Today e S. Stampfer (falafel).', { s: 12.5, f: C.suave });
    return svg(W, H, 'Anatomia, em desenho: o sabich é pita com berinjela e ovo, entre outras coisas; o falafel na pita junta pita, bolinhos fritos e salada, um trio que o historiador Shaul Stampfer data do século XX.', s);
  }

  /* ── Homus e jachnun.
     Homus: grão-de-bico cozido e amassado, tahine, alho e suco de limão
     (C06-052, Britannica e Dictionary.com). Jachnun: massa enrolada que
     assa a noite inteira, servida em Israel com tomate ralado, zhug e ovo
     (C06-044). */
  function anatomiaHomusJachnun() {
    const W = 1080, H = 1060;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>` + cabeca(W, 'ANATOMIA DA MESA', 'O homus e o jachnun, por partes');
    s += `<line x1="540" x2="540" y1="190" y2="920" stroke="${C.linha}" stroke-width="2"/>`;
    /* homus: os ingredientes em cima, a tigela embaixo */
    s += t(280, 210, 'Homus', { cls: 'd', s: 34, a: 'middle', f: C.navy }) + he(280, 252, 'חוּמוּס', { s: 28, a: 'middle', f: C.ouroTinta });
    const ing = (x, y, desenho, nome) => desenho + t(x, y + 74, nome, { s: 16, w: 700, a: 'middle', f: C.navy });
    let grao = ''; for (const [dx, dy] of [[-22, 6], [0, -12], [22, 6], [-10, 22], [12, 22], [0, 4]]) grao += `<circle cx="${130 + dx}" cy="${330 + dy}" r="13" fill="${C.ouroSuave}" stroke="${C.ouroTinta}" stroke-width="2"/>`;
    s += ing(130, 330, grao, 'grão-de-bico');
    s += ing(230, 330, `<path d="M205 300 h50 v58 q0 10 -10 10 h-30 q-10 0 -10 -10z" fill="${C.areiaClara}" stroke="${C.neguevTinta}" stroke-width="2.5"/><rect x="201" y="290" width="58" height="14" rx="4" fill="${C.pedraEsc}"/>`, 'tahine');
    s += ing(330, 330, `<path d="M330 300 q28 10 26 40 q-4 28 -26 30 q-22 -2 -26 -30 q-2 -30 26 -40z" fill="#FFFFFF" stroke="${C.pedraEsc}" stroke-width="2.5"/><path d="M330 300 v-14" stroke="${C.oliveira}" stroke-width="4" stroke-linecap="round"/><path d="M330 312 v52" stroke="${C.linha}" stroke-width="2"/>`, 'alho');
    s += ing(430, 330, `<ellipse cx="430" cy="335" rx="32" ry="26" fill="${C.ouro}" opacity=".85"/><ellipse cx="430" cy="335" rx="22" ry="17" fill="${C.ouroSuave}"/>` + [0, 1, 2, 3, 4, 5].map(k => `<line x1="430" y1="335" x2="${(430 + Math.cos(k * 1.05) * 20).toFixed(1)}" y2="${(335 + Math.sin(k * 1.05) * 15).toFixed(1)}" stroke="${C.ouro}" stroke-width="1.6"/>`).join(''), 'limão');
    s += t(430, 425, '(o suco)', { s: 13, a: 'middle', f: C.suave });
    s += `<path d="M280 450 v60" stroke="${C.neguev}" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round" marker-end="url(#ponta)"/>`;
    s += `<ellipse cx="288" cy="650" rx="200" ry="110" fill="${C.pedraEsc}"/><ellipse cx="280" cy="640" rx="200" ry="110" fill="#FFFFFF" stroke="${C.mar}" stroke-width="4"/><ellipse cx="280" cy="630" rx="160" ry="80" fill="${C.areiaClara}"/>`;
    s += `<ellipse cx="280" cy="630" rx="110" ry="50" fill="none" stroke="${C.pedraEsc}" stroke-width="8"/><ellipse cx="280" cy="630" rx="56" ry="24" fill="${C.ouro}" opacity=".5"/>`;
    s += t(280, 800, 'Grão-de-bico cozido e amassado,', { s: 17, a: 'middle', f: C.corpo }) + t(280, 824, 'misturado com tahine, alho', { s: 17, a: 'middle', f: C.corpo }) + t(280, 848, 'e suco de limão.', { s: 17, a: 'middle', f: C.corpo });
    s += t(280, 884, 'Tahine: o condimento de gergelim tostado.', { s: 14.5, i: true, a: 'middle', f: C.suave });
    /* jachnun */
    s += t(800, 210, 'Jachnun', { cls: 'd', s: 34, a: 'middle', f: C.navy });
    s += t(800, 246, 'o pão da manhã de sábado', { s: 16, a: 'middle', f: C.suave });
    const rolo = (x, y) => { const d = `M${x - 110} ${y - 34} h220 a34 34 0 0 1 0 68 h-220 a34 34 0 0 1 0 -68z`; return sombra(d, 5, 7) + `<path d="${d}" fill="${C.ouro}"/>` + [0, 1, 2, 3, 4].map(k => `<path d="M${x - 80 + k * 40} ${y - 32} q-14 32 0 64" fill="none" stroke="${C.ouroTinta}" stroke-width="2.5"/>`).join('') + `<circle cx="${x + 110}" cy="${y}" r="26" fill="${C.ouroSuave}" stroke="${C.ouroTinta}" stroke-width="2.5"/><path d="M${x + 110} ${y} m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a14 14 0 1 1 28 0" fill="none" stroke="${C.ouroTinta}" stroke-width="2"/>`; };
    s += rolo(780, 340) + rolo(800, 420);
    const tigela = (cx, cy, cor, nome) => `<path d="M${cx - 50} ${cy} h100 q0 50 -50 50 q-50 0 -50 -50z" fill="${C.pedraEsc}" transform="translate(4 5)"/><path d="M${cx - 50} ${cy} h100 q0 50 -50 50 q-50 0 -50 -50z" fill="#FFFFFF" stroke="${C.mar}" stroke-width="3"/><ellipse cx="${cx}" cy="${cy}" rx="50" ry="13" fill="${cor}"/>` + t(cx, cy + 86, nome, { s: 16, w: 700, a: 'middle', f: C.navy });
    s += tigela(670, 570, C.neguev, 'tomate ralado') + tigela(800, 570, C.oliveira, 'zhug');
    s += `<ellipse cx="934" cy="592" rx="36" ry="46" fill="${C.pedraEsc}"/><ellipse cx="930" cy="586" rx="36" ry="46" fill="${C.areiaClara}" stroke="${C.neguevTinta}" stroke-width="2.5"/>` + t(930, 656, 'ovo', { s: 16, w: 700, a: 'middle', f: C.navy });
    s += t(800, 730, 'Massa fina, amanteigada e enrolada,', { s: 17, a: 'middle', f: C.corpo }) + t(800, 754, 'que assa devagar durante a noite.', { s: 17, a: 'middle', f: C.corpo });
    s += t(800, 790, 'Em Israel, vem com tomate ralado,', { s: 17, a: 'middle', f: C.corpo }) + t(800, 814, 'zhug (molho picante iemenita) e ovo.', { s: 17, a: 'middle', f: C.corpo });
    s += t(800, 850, 'Associado aos judeus do Iêmen, em especial de Aden.', { s: 14.5, i: true, a: 'middle', f: C.suave });
    s += `<rect x="56" y="945" width="${W - 112}" height="48" rx="10" fill="${C.ouroSuave}"/>` + t(76, 976, 'A receita tradicional, segundo as obras de referência; cada casa tem a sua medida.', { s: 15, f: C.neguevTinta });
    s += t(56, H - 12, 'Desenho esquemático. Fontes: Encyclopaedia Britannica e Dictionary.com (homus); My Jewish Learning e Hadassah (jachnun).', { s: 12.5, f: C.suave });
    return svg(W, H, 'Anatomia, em desenho: o homus leva grão-de-bico cozido e amassado, tahine, alho e suco de limão; o jachnun é massa enrolada assada a noite inteira, servida em Israel com tomate ralado, zhug e ovo.', s);
  }

  /* ── Guia visual de cardápio: só palavras que o capítulo 6 (e o 7) já
     trazem, com o mesmo nikud e a mesma transliteração. Sem dado. */
  const PALAVRAS = [
    ['Ao chegar', [['מִסְעָדָה', 'missadá', 'restaurante'], ['תַּפְרִיט', 'tafrít', 'cardápio'], ['מֶלְצַר', 'meltsár', 'garçom'], ['בְּבַקָשָׁה', 'bevakashá', 'por favor']]],
    ['No prato', [['פִּיתָה', 'píta', 'pita'], ['חוּמוּס', 'chúmus', 'homus'], ['מַיִם', 'máyim', 'água'], ['בְּתֵאָבוֹן', 'beteavón', 'bom apetite']]],
    ['Na kashrut', [['כָּשֵׁר', 'kashér', 'kosher'], ['בְּשָׂרִי', 'bsarí', 'de carne'], ['חָלָבִי', 'chalaví', 'de leite']]],
    ['Para fechar', [['חֶשְׁבּוֹן', 'cheshbón', 'a conta'], ['תוֹדָה', 'todá', 'obrigado']]],
  ];
  function guiaCardapio() {
    const W = 1080, H = 1500;
    let s = `<rect width="${W}" height="${H}" fill="${C.tealTinta}"/>`;
    const card = `M70 70 H1010 V1430 H70Z`;
    s += sombra(card, 10, 12) + `<path d="${card}" fill="${C.papel}"/>` + `<rect x="92" y="92" width="896" height="1316" fill="none" stroke="${C.ouro}" stroke-width="2"/>`;
    s += he(540, 190, 'תַּפְרִיט', { s: 64, a: 'middle', f: C.navy }) + t(540, 236, 'TAFRÍT · O CARDÁPIO', { s: 16, w: 700, ls: 4, a: 'middle', f: C.ouroTinta });
    s += t(540, 276, 'Treze palavras para pedir, entender a kashrut e pagar', { s: 18, i: true, a: 'middle', f: C.suave });
    let y = 340;
    for (const [grupo, itens] of PALAVRAS) {
      s += `<line x1="130" x2="380" y1="${y - 6}" y2="${y - 6}" stroke="${C.linha}" stroke-width="2"/><line x1="700" x2="950" y1="${y - 6}" y2="${y - 6}" stroke="${C.linha}" stroke-width="2"/>` + t(540, y, grupo.toUpperCase(), { s: 15, w: 700, ls: 3, a: 'middle', f: C.tealTinta });
      y += 50;
      for (const [h, tr, pt] of itens) {
        s += t(140, y, pt, { s: 21, w: 600, f: C.navy });
        s += `<line x1="${150 + pt.length * 11}" x2="560" y1="${y - 6}" y2="${y - 6}" stroke="${C.pedraEsc}" stroke-width="2" stroke-dasharray="2 6"/>`;
        s += t(580, y, tr, { s: 19, i: true, f: C.neguevTinta });
        s += he(940, y + 2, h, { s: 32, f: C.navy });
        y += 58;
      }
      y += 18;
    }
    s += t(540, 1388, 'Como neste livro: hebraico com os sinais de vogal; no cardápio de verdade, eles costumam faltar.', { s: 14, a: 'middle', f: C.suave });
    return svg(W, H, 'Guia visual de cardápio: treze palavras em hebraico com transliteração e tradução, agrupadas em ao chegar, no prato, na kashrut e para fechar.', s);
  }

  /* ── A conta, em Israel e no Brasil (par do compare).
     Israel: gorjeta costumeira de 10% a 15%, costume e não lei; ver se a conta
     já inclui o serviço (C06-043). Brasil: a Lei 13.419/2017 trata como
     gorjeta também o valor cobrado como serviço e diz que ele não é receita
     do empregador (C06-053); a taxa costuma ser de 10% e é opcional, segundo
     o Procon-ES e o Idec (C06-054). A comparação: C06-055. As linhas dos
     pratos não têm valor de propósito: preço nenhum foi pesquisado. */
  function conta(qual) {
    const W = 1080, H = 1080, il = qual === 'israel';
    let s = `<rect width="${W}" height="${H}" fill="${il ? C.ouroSuave : C.tealSuave}"/>`;
    const rec = `M300 110 H780 V880 L765 900 L750 880 L735 900 L720 880 L705 900 L690 880 L675 900 L660 880 L645 900 L630 880 L615 900 L600 880 L585 900 L570 880 L555 900 L540 880 L525 900 L510 880 L495 900 L480 880 L465 900 L450 880 L435 900 L420 880 L405 900 L390 880 L375 900 L360 880 L345 900 L330 880 L315 900 L300 880Z`;
    s += sombra(rec, 9, 11) + `<path d="${rec}" fill="#FFFFFF" stroke="${C.pedraEsc}" stroke-width="2"/>`;
    s += t(540, 180, il ? 'ISRAEL' : 'BRASIL', { s: 18, w: 700, ls: 5, a: 'middle', f: il ? C.ouroTinta : C.tealTinta });
    s += il ? he(540, 230, 'חֶשְׁבּוֹן', { s: 40, a: 'middle', f: C.navy }) + t(540, 262, 'cheshbón, a conta', { s: 16, i: true, a: 'middle', f: C.suave }) : t(540, 238, 'A conta', { cls: 'd', s: 40, a: 'middle', f: C.navy });
    for (let k = 0; k < 4; k++) s += `<rect x="340" y="${310 + k * 52}" width="${[200, 150, 230, 120][k]}" height="14" rx="7" fill="${C.linha}"/><rect x="${660}" y="${310 + k * 52}" width="80" height="14" rx="7" fill="${C.linha}"/>`;
    s += `<line x1="330" x2="750" y1="530" y2="530" stroke="${C.navy}" stroke-width="2" stroke-dasharray="4 6"/>`;
    s += t(340, 580, il ? 'Gorjeta' : 'Taxa de serviço', { s: 22, w: 700, f: C.navy });
    s += t(540, 680, il ? '10% a 15%' : '10%', { cls: 't n', s: il ? 84 : 110, a: 'middle', f: il ? C.neguevTinta : C.tealTinta });
    s += t(540, 730, il ? 'da conta, por costume' : 'em geral', { s: 20, a: 'middle', f: C.corpo });
    s += `<rect x="360" y="770" width="360" height="56" rx="28" fill="${il ? C.navy : C.tealTinta}"/>` + t(540, 806, il ? 'costume, não lei' : 'opcional para o cliente', { s: 20, w: 700, a: 'middle', f: '#FFFFFF' });
    const notas = il
      ? ['Jerusalem Post e Israel21c: de 10% a 15% nos restaurantes;', 'o antigo 10% subiu para cerca de 12%, e 15% em Tel Aviv.', 'Antes de calcular, veja se a conta já inclui o serviço.']
      : ['Lei 13.419/2017: o valor cobrado como serviço também é gorjeta,', 'não é receita da casa e é dividido entre os empregados.', 'O percentual e o "opcional": orientação do Procon-ES e do Idec.'];
    notas.forEach((l, i) => { s += t(540, 958 + i * 26, l, { s: 17, a: 'middle', f: i === 2 ? C.suave : C.corpo }); });
    s += t(540, H - 16, 'As linhas dos pratos ficam sem valor de propósito. Consulta em 21/10/2026.', { s: 13, a: 'middle', f: C.suave });
    return svg(W, H, il ? 'A conta em Israel: gorjeta de 10% a 15%, por costume, não por lei.' : 'A conta no Brasil: taxa de serviço, em geral de 10%, opcional para o cliente; a Lei 13.419/2017 a trata como gorjeta dos empregados.', s);
  }

  return {
    svgs: {
      'abertura-sabores': abertura(),
      'anatomia-sabich-falafel': anatomiaSabichFalafel(),
      'anatomia-homus-jachnun': anatomiaHomusJachnun(),
      'guia-cardapio': guiaCardapio(),
      'conta-israel': conta('israel'),
      'conta-brasil': conta('brasil'),
    },
  };
}
