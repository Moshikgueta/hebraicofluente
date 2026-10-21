/* Ilustrações do capítulo 9 (curiosidades). Carregado por tools/ilustracoes.mjs.
   Os cartões são formato 4:5, para a página e para compartilhar. Cada texto
   vem de uma curiosidade do capítulo, com o id da afirmação ao lado. */

import { C, esc } from '../lib/desenho.mjs';

export default function capitulo09({ svg, t }) {
  /* Abertura: 41 quadrados, um por curiosidade, na cor da categoria (a
     contagem por categoria é a do manuscrito). Desenho, sem dado externo. */
  function abertura() {
    const W = 1480, H = 1300;
    const cats = [[12, C.ouro], [5, C.teal], [6, C.tealLite], [7, C.areiaClara], [3, C.neguev], [3, C.oliveira], [5, C.pedra]];
    const cores = cats.flatMap(([n, cor]) => Array(n).fill(cor));
    let s = '';
    const lado = 130, gap = 22, cols = 8, x0 = 110, y0 = 300;
    cores.forEach((cor, i) => {
      const x = x0 + (i % cols) * (lado + gap) + (Math.floor(i / cols) % 2 ? 40 : 0), y = y0 + Math.floor(i / cols) * (lado + gap);
      s += `<rect x="${x + 7}" y="${y + 9}" width="${lado}" height="${lado}" rx="16" fill="${C.noite}" opacity=".45"/><rect x="${x}" y="${y}" width="${lado}" height="${lado}" rx="16" fill="${cor}"/>`;
      s += t(x + 20, y + 58, String(i + 1), { cls: 't n', s: 44, f: C.noite });
    });
    return svg(W, H, 'Ilustração: 41 quadrados coloridos e numerados, um para cada curiosidade do capítulo, nas cores das sete categorias.', s);
  }

  const cartao = (kicker, titulo, corpo, fonte) => {
    const W = 1080, H = 1350;
    let s = `<rect width="${W}" height="${H}" fill="${C.papel}"/><rect width="${W}" height="380" fill="${C.navy}"/>`;
    s += t(64, 92, kicker.toUpperCase(), { s: 17, w: 700, ls: 3.5, f: C.tealLite });
    titulo.forEach((l, i) => { s += t(64, 190 + i * 76, l, { cls: 'd', s: 66, f: '#FFFFFF' }); });
    s += corpo;
    s += `<line x1="64" x2="${W - 64}" y1="${H - 96}" y2="${H - 96}" stroke="${C.linha}"/>`;
    s += t(64, H - 60, fonte, { s: 15, f: C.suave }) + t(W - 64, H - 60, 'Israel Além do Roteiro · Hebraico Fluente', { s: 15, a: 'end', f: C.navy, w: 600 });
    return [W, H, s];
  };

  /* C09-032: Aracy de Carvalho Guimarães Rosa (1982) e Luiz Martins de
     Souza Dantas (2003), Justos entre as Nações pelo Yad Vashem. */
  function justos() {
    const pessoa = (y, ano, nome, linhas) => `<rect x="70" y="${y + 8}" width="940" height="300" rx="20" fill="${C.pedraEsc}"/><rect x="64" y="${y}" width="940" height="300" rx="20" fill="#FFFFFF" stroke="${C.linha}"/>`
      + t(104, y + 92, ano, { cls: 't n', s: 72, f: C.neguevTinta }) + t(330, y + 70, nome[0], { cls: 'd', s: 38, f: C.navy }) + t(330, y + 116, nome[1], { cls: 'd', s: 38, f: C.navy })
      + linhas.map((l, i) => t(330, y + 172 + i * 32, l, { s: 22 })).join('') + t(104, y + 130, 'ano da homenagem', { s: 18, f: C.suave });
    const corpo = pessoa(470, '1982', ['Aracy de Carvalho', 'Guimarães Rosa'], ['funcionária do consulado', 'brasileiro em Hamburgo'])
      + pessoa(820, '2003', ['Luiz Martins de', 'Souza Dantas'], ['embaixador do Brasil na França;', 'deu vistos a judeus depois de 1940']);
    const [W, H, s] = cartao('Brasil e Israel', ['Dois brasileiros', 'entre os Justos'], corpo, 'Fonte: Yad Vashem (Justos entre as Nações)');
    return svg(W, H, 'Cartão: dois brasileiros reconhecidos pelo Yad Vashem como Justos entre as Nações, Aracy de Carvalho Guimarães Rosa (1982) e Luiz Martins de Souza Dantas (2003).', s);
  }

  /* C09-050: as quatro vitórias no Eurovisão. */
  function eurovisao() {
    const vitorias = [['1978', 'A-Ba-Ni-Bi', 'Izhar Cohen e Alphabeta'], ['1979', 'Hallelujah', 'Milk and Honey e Gali Atari'], ['1998', 'Diva', 'Dana International'], ['2018', 'Toy', 'Netta Barzilai']];
    let corpo = '';
    vitorias.forEach(([ano, musica, quem], i) => {
      const y = 470 + i * 190;
      corpo += `<circle cx="140" cy="${y + 50}" r="62" fill="${[C.ouro, C.teal, C.neguev, C.mar][i]}"/>` + t(140, y + 64, ano.slice(2), { cls: 't n', s: 50, a: 'middle', f: '#FFFFFF' });
      corpo += t(240, y + 36, ano, { cls: 't n', s: 30, f: C.neguevTinta }) + t(240, y + 80, `"${musica}"`, { cls: 'd', s: 42, f: C.navy }) + t(240, y + 116, quem, { s: 22 });
    });
    const [W, H, s] = cartao('Cultura', ['Quatro vitórias', 'no Eurovisão'], corpo, 'Fonte: European Broadcasting Union');
    return svg(W, H, 'Cartão: as quatro vitórias de Israel no Festival Eurovisão, em 1978, 1979, 1998 e 2018.', s);
  }

  /* C09-017 e C09-018: a semente de Massada. */
  function tamareira() {
    const passos = [['c. 2.000 anos', 'a idade da semente, pelo radiocarbono'], ['anos 1960', 'achada nas escavações de Massada'], ['2005', 'plantada; uma das sementes germinou']];
    let corpo = `<line x1="150" x2="150" y1="500" y2="1060" stroke="${C.pedraEsc}" stroke-width="10" stroke-linecap="round"/>`;
    passos.forEach(([n, l], i) => { const y = 500 + i * 260; corpo += `<circle cx="150" cy="${y}" r="34" fill="${C.oliveira}" stroke="${C.papel}" stroke-width="6"/>` + t(230, y + 4, n, { cls: 't n', s: 50, f: C.neguevTinta }) + t(230, y + 52, l, { s: 26 }); });
    /* a palmeira, desenhada */
    corpo += `<path d="M880 1150 C870 1000 900 880 890 760" stroke="${C.neguevTinta}" stroke-width="22" fill="none" stroke-linecap="round"/>`;
    for (const [dx, dy] of [[-150, 40], [150, 30], [-120, -60], [130, -70], [0, -120]]) corpo += `<path d="M890 760 Q${890 + dx / 2} ${760 + dy - 70} ${890 + dx} ${760 + dy}" stroke="${C.oliveira}" stroke-width="26" fill="none" stroke-linecap="round"/>`;
    const [W, H, s] = cartao('Natureza', ['Matusalém, a', 'semente de Massada'], corpo, 'Fontes: Science News; Associated Press; Guinness World Records');
    return svg(W, H, 'Cartão: uma semente de tâmara de cerca de 2.000 anos, achada em Massada nos anos 1960, germinou em 2005; a muda se chama Matusalém.', s);
  }

  return { svgs: { 'abertura-curiosidades': abertura(), 'cartao-justos': justos(), 'cartao-eurovisao': eurovisao(), 'cartao-tamareira': tamareira() } };
}
