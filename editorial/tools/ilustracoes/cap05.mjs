/* Ilustrações do capítulo 5 (A vida real em Israel). Carregado por
   tools/ilustracoes.mjs. Devolve { svgs }. */

import { C } from '../lib/desenho.mjs';

export default function capitulo05({ svg, t, sombra }) {
  /* Abertura: uma rua no fim da tarde de sexta, sol baixo, portas de loja
     baixando, um ponto de ônibus vazio e janelas acesas. Desenho genérico,
     sem lugar real e sem texto. */
  function abertura() {
    const W = 1480, H = 1300;
    let s = `<rect width="${W}" height="${H}" fill="${C.noite}"/>`;
    s += `<rect y="560" width="${W}" height="200" fill="${C.navy}"/>`;
    s += `<circle cx="1180" cy="640" r="130" fill="${C.ouro}"/>`;
    s += `<rect y="700" width="${W}" height="600" fill="${C.noite}"/>`;
    /* casas e prédios baixos, com janelas acesas */
    const blocos = [[60, 380, 260, 520], [340, 300, 220, 600], [580, 420, 300, 480], [900, 340, 240, 560], [1160, 460, 280, 440]];
    for (const [x, y, w, h] of blocos) {
      s += sombra(`M${x} ${y} h${w} v${h} h-${w}Z`, 8, 10) + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.pedra}"/>`;
      for (let r = 0; r < Math.floor((h - 260) / 90); r++) for (let c = 0; c < Math.floor(w / 70); c++) {
        const acesa = (r + c + x) % 3 !== 0;
        s += `<rect x="${x + 22 + c * 68}" y="${y + 36 + r * 90}" width="30" height="46" rx="15" fill="${acesa ? C.ouro : C.pedraEsc}"/>`;
      }
    }
    /* calçada e portas de loja meio baixadas */
    s += `<rect y="1080" width="${W}" height="220" fill="${C.pedraEsc}"/><rect y="1070" width="${W}" height="14" fill="${C.neguevTinta}"/>`;
    for (const x of [100, 400, 640, 960, 1220]) {
      s += `<rect x="${x}" y="880" width="160" height="190" fill="${C.navy}"/>`;
      s += `<rect x="${x}" y="880" width="160" height="120" fill="#8E9894"/>`;
      for (let y = 892; y < 1000; y += 14) s += `<line x1="${x}" x2="${x + 160}" y1="${y}" y2="${y}" stroke="${C.suave}" stroke-width="2"/>`;
    }
    /* ponto de ônibus vazio */
    s += `<rect x="1380" y="860" width="10" height="220" fill="${C.navy}"/><rect x="1340" y="830" width="90" height="56" rx="10" fill="${C.teal}"/><rect x="1362" y="846" width="46" height="24" rx="4" fill="${C.tealSuave}"/>`;
    return svg(W, H, 'Ilustração: uma rua no fim da tarde, com o sol baixo, janelas acesas, portas de loja baixando e um ponto de ônibus vazio.', s);
  }

  /* Feriados: Israel (C05-085, C05-066, C05-103) x Brasil (C05-101,
     C05-102). Os nove de cada lado; nenhuma data israelense é desenhada,
     porque elas mudam todo ano. */
  function feriados() {
    const W = 1080, H = 1240;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += `<rect width="${W}" height="190" fill="${C.navy}"/>` + t(56, 62, 'ISRAEL X BRASIL', { s: 15, w: 700, ls: 3, f: C.tealLite }) + t(56, 118, 'Nove dias de folga por lei,', { cls: 'd', s: 42, f: '#FFFFFF' }) + t(56, 164, 'de cada lado', { cls: 'd', s: 42, f: C.ouro });
    const col = (x, titulo, sub, cor, itens) => {
      let b = `<rect x="${x}" y="230" width="460" height="830" rx="18" fill="${cor}" opacity=".14"/>`;
      b += t(x + 28, 280, titulo, { cls: 'd', s: 34, f: C.navy }) + t(x + 28, 312, sub[0], { s: 15, f: C.suave }) + t(x + 28, 332, sub[1], { s: 15, f: C.suave });
      itens.forEach(([a, bb], i) => {
        const y = 386 + i * 72;
        b += `<circle cx="${x + 46}" cy="${y + 6}" r="18" fill="${cor}"/>` + t(x + 46, y + 12, String(i + 1), { cls: 't n', s: 17, a: 'middle', f: '#FFFFFF' });
        b += t(x + 78, y + 4, a, { s: 18, w: 700, f: C.navy }) + t(x + 78, y + 26, bb, { s: 15, f: C.corpo });
      });
      return b;
    };
    s += col(56, 'Israel', ['seguem o calendário judaico:', 'mudam de data todo ano'], C.teal, [
      ['Rosh Hashaná', 'dia 1, o ano-novo'], ['Rosh Hashaná', 'dia 2'], ['Yom Kipur', 'o Dia da Expiação'], ['Sucot', 'o primeiro dia'], ['Sucot', 'o oitavo dia'],
      ['Pêssach', 'o primeiro dia'], ['Pêssach', 'o sétimo dia'], ['Shavuot', ''], ['Dia da Independência', 'também pelo calendário judaico']]);
    s += col(564, 'Brasil', ['nas leis federais:', 'sempre no mesmo dia'], C.neguev, [
      ['1º de janeiro', 'Confraternização Universal'], ['21 de abril', 'Tiradentes'], ['1º de maio', 'Dia do Trabalho'], ['7 de setembro', 'Independência'], ['12 de outubro', 'Nossa Senhora Aparecida'],
      ['2 de novembro', 'Finados'], ['15 de novembro', 'Proclamação da República'], ['20 de novembro', 'Zumbi e Consciência Negra'], ['25 de dezembro', 'Natal']]);
    s += t(56, 1100, 'Em Israel, Chanuká e Purim ficam fora; quem não é judeu descansa nas festas da sua comunidade. No Brasil, a portaria', { s: 14.5, f: C.corpo });
    s += t(56, 1122, 'federal de 2026 também pôs a Paixão de Cristo (3 de abril) entre os feriados; o Carnaval é ponto facultativo.', { s: 14.5, f: C.corpo });
    s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(56, H - 48, 'Israel: Ordenação de Lei e Administração, art. 18A. Brasil: Leis 662/1949 (redação de 2002), 6.802/1980 e 14.759/2023;', { s: 12.5, f: C.suave });
    s += t(56, H - 28, 'portaria de 2026 pela imprensa. Sem feriados estaduais e municipais. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Comparação: os nove dias de descanso oficiais de Israel, que mudam de data todo ano, e os nove feriados nacionais fixados pelas leis federais do Brasil, sempre na mesma data.', s);
  }

  /* Quem mora em Israel, no comunicado do CBS da véspera do Dia da
     Independência de 2026: C05-001 (total), C05-002 (as três partes),
     C05-003 (o que cada etiqueta reúne). */
  function quemMora() {
    const W = 1080, H = 820;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += t(56, 72, 'QUEM MORA EM ISRAEL · ABRIL DE 2026', { s: 15, w: 700, ls: 3, f: C.tealTinta });
    s += t(56, 156, '10,244 milhões', { cls: 't n', s: 76, f: C.navy }) + t(56, 194, 'de habitantes, na estimativa do CBS para a véspera do Dia da Independência', { s: 17, f: C.suave });
    const x0 = 56, larg = W - 112, y = 260, h = 110;
    const partes = [[76, 'Judeus e outros', '7,790 milhões', C.navy], [21.1, 'Árabes', '2,157 milhões', C.teal], [2.9, 'Estrangeiros', '296 mil', C.ouro]];
    let x = x0;
    s += `<rect x="${x0 + 6}" y="${y + 8}" width="${larg}" height="${h}" rx="14" fill="${C.pedraEsc}"/>`;
    s += `<clipPath id="barra"><rect x="${x0}" y="${y}" width="${larg}" height="${h}" rx="14"/></clipPath><g clip-path="url(#barra)">`;
    for (const [pc, , , cor] of partes) { const w = larg * pc / 100; s += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" fill="${cor}"/>`; x += w; }
    s += '</g>';
    s += t(x0 + 28, y + 70, '76%', { cls: 't n', s: 44, f: '#FFFFFF' });
    s += t(x0 + larg * .76 + 22, y + 70, '21,1%', { cls: 't n', s: 38, f: '#FFFFFF' });
    s += `<path d="M${x0 + larg * .985} ${y + h} V${y + h + 40} H${x0 + larg - 150}" fill="none" stroke="${C.ouroTinta}" stroke-width="2"/>` + t(x0 + larg, y + h + 46, '2,9%', { cls: 't n', s: 30, a: 'end', f: C.ouroTinta });
    const caixa = (cx, titulo, num, linhas, cor) => `<rect x="${cx}" y="450" width="300" height="250" rx="14" fill="${cor}" opacity=".12"/>` + t(cx + 20, 492, titulo, { s: 20, w: 700, f: C.navy }) + t(cx + 20, 520, num, { s: 16, f: C.suave }) + linhas.map((l, i) => t(cx + 20, 562 + i * 24, l, { s: 16, f: C.corpo })).join('');
    s += caixa(56, 'Judeus e outros', '7,790 milhões', ['"Outros": cristãos não', 'árabes, outras religiões', 'e quem está registrado', 'sem religião.'], C.navy);
    s += caixa(390, 'Árabes', '2,157 milhões', ['Muçulmanos, cristãos', 'árabes e drusos: três', 'comunidades com o', 'mesmo rótulo.'], C.teal);
    s += caixa(724, 'Estrangeiros', '296 mil', ['Entram no total do', 'país, mas fora dos', 'dois grandes grupos.'], C.ouro);
    s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(56, H - 48, 'Fonte: Escritório Central de Estatística de Israel (CBS), comunicado 117/2026, dado preliminar. Os três números são do mesmo dia.', { s: 12.5, f: C.suave });
    s += t(56, H - 28, 'Barra proporcional às porcentagens. Hebraico Fluente · Israel Além do Roteiro', { s: 12.5, f: C.suave });
    return svg(W, H, 'Gráfico: 10,244 milhões de habitantes em Israel em abril de 2026, divididos em 76% de judeus e outros, 21,1% de árabes e 2,9% de estrangeiros.', s);
  }

  /* O Shabat, do começo ao fim: C05-061 (do pôr do sol de sexta à noite de
     sábado), C08-031 (trens), C05-079 e C05-081 (ônibus e exceções), C05-082
     (ônibus gratuitos de Tel Aviv e vizinhas), C08-033 e C08-034 (táxi,
     sherut), C08-035 (+25% no táxi), C05-083 (mercearias de Tel Aviv). Sem
     relógio: o horário muda com a estação e o lugar. */
  function shabat() {
    const W = 1080, H = 1060;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/>`;
    s += t(56, 72, 'O SHABAT, DO COMEÇO AO FIM', { s: 15, w: 700, ls: 3, f: C.tealTinta });
    s += t(56, 126, 'O que roda e o que para', { cls: 'd', s: 44, f: C.navy });
    const x0 = 250, x1 = W - 56, xa = x0 + (x1 - x0) * .2, xb = x0 + (x1 - x0) * .88;
    /* faixa do tempo */
    const yT = 200;
    s += `<rect x="${x0}" y="${yT}" width="${xa - x0}" height="60" fill="${C.ouroSuave}"/><rect x="${xa}" y="${yT}" width="${xb - xa}" height="60" fill="${C.navy}"/><rect x="${xb}" y="${yT}" width="${x1 - xb}" height="60" fill="${C.ouroSuave}"/>`;
    s += t((x0 + xa) / 2, yT + 26, 'sexta', { s: 15, w: 700, a: 'middle', f: C.navy }) + t((x0 + xa) / 2, yT + 46, 'à tarde', { s: 14, a: 'middle', f: C.navy });
    s += t((xa + xb) / 2, yT + 38, 'SHABAT', { s: 20, w: 700, ls: 4, a: 'middle', f: '#FFFFFF' });
    s += t((xb + x1) / 2, yT + 26, 'sábado', { s: 15, w: 700, a: 'middle', f: C.navy }) + t((xb + x1) / 2, yT + 46, 'à noite', { s: 14, a: 'middle', f: C.navy });
    s += `<circle cx="${xa}" cy="${yT - 18}" r="14" fill="${C.ouro}"/>` + t(xa, yT - 42, 'pôr do sol', { s: 14, a: 'middle', f: C.ouroTinta });
    s += t(xb, yT - 18, 'noite de sábado', { s: 14, a: 'middle', f: C.ouroTinta });
    /* linhas: cada uma uma barra do que funciona */
    const linhas = [
      ['Trens', 'param na sexta à tarde; voltam no sábado depois do pôr do sol', [[x0, xa - 40, 1], [xa - 40, xb, 0], [xb, x1, 1]]],
      ['Ônibus', 'na maior parte do país, não rodam; Haifa, parte da Galileia e localidades não judaicas têm', [[x0, xa - 40, 1], [xa - 40, xb, .5], [xb, x1, 1]]],
      ['Ônibus de fim', 'de semana gratuitos, criados em 2019 por Tel Aviv e três vizinhas', [[x0, xa, 0], [xa, xb, 1], [xb, x1, 0]], 'de semana'],
      ['Táxi', 'roda; a tarifa tem acréscimo de 25% no Shabat', [[x0, xa, 1], [xa, xb, 1], [xb, x1, 1]]],
      ['Sherut', 'as vans amarelas de Tel Aviv circulam, com tarifa mais alta', [[x0, xa, 1], [xa, xb, 1], [xb, x1, 1]]],
      ['Mercearias', 'em Tel Aviv, cerca de 160 podem abrir, por lei municipal', [[x0, x1, 1]]],
    ];
    let y = 330;
    for (const [nome, nota, faixas, nome2] of linhas) {
      s += t(56, y + 24, nome, { s: 19, w: 700, f: C.navy }); if (nome2) s += t(56, y + 46, nome2, { s: 19, w: 700, f: C.navy });
      s += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="40" rx="8" fill="${C.areia}"/>`;
      for (const [a, b, v] of faixas) if (v) s += `<rect x="${a}" y="${y}" width="${b - a}" height="40" fill="${v === 1 ? C.teal : 'url(#parcial)'}"/>`;
      s += t(x0, y + 66, nota, { s: 14.5, f: C.corpo });
      y += 112;
    }
    s += `<defs><pattern id="parcial" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="${C.tealSuave}"/><line x1="0" x2="0" y1="0" y2="10" stroke="${C.teal}" stroke-width="4"/></pattern></defs>`;
    /* legenda */
    const yl = y + 4;
    s += `<rect x="56" y="${yl}" width="34" height="20" fill="${C.teal}"/>` + t(100, yl + 16, 'funciona', { s: 14.5 });
    s += `<rect x="210" y="${yl}" width="34" height="20" fill="url(#parcial)"/>` + t(254, yl + 16, 'só em alguns lugares', { s: 14.5 });
    s += `<rect x="440" y="${yl}" width="34" height="20" fill="${C.areia}" stroke="${C.linha}"/>` + t(484, yl + 16, 'não funciona', { s: 14.5 });
    s += `<line x1="56" x2="${W - 56}" y1="${H - 74}" y2="${H - 74}" stroke="${C.linha}"/>`;
    s += t(56, H - 48, 'Fontes: Israel Railways e reportagens (trens e ônibus), prefeitura de Tel Aviv (táxi e sherut), lei do táxi, Suprema Corte (2017).', { s: 12.5, f: C.suave });
    s += t(56, H - 28, 'Esquema sem horário: o Shabat acompanha o pôr do sol e muda com a estação. Confira na semana da viagem.', { s: 12.5, f: C.suave });
    return svg(W, H, 'Esquema do Shabat, do fim da tarde de sexta à noite de sábado: trens e a maior parte dos ônibus param; há ônibus em alguns lugares e ônibus gratuitos de fim de semana em Tel Aviv e vizinhas; táxi e sherut rodam com tarifa mais alta; em Tel Aviv, cerca de 160 mercearias podem abrir.', s);
  }

  return { svgs: { 'abertura-vida-real': abertura(), 'feriados-israel-brasil': feriados(), 'quem-mora-israel': quemMora(), 'shabat-do-comeco-ao-fim': shabat() } };
}
