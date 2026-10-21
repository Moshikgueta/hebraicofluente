// As figuras dos guias: desenho próprio, em SVG, no traço da capa.
// ─────────────────────────────────────────────────────────────────────────
// Duas famílias:
//   · ILUSTRACOES: um desenho de linha por capítulo, na abertura. Orienta
//     quem folheia (o capítulo do café tem uma xícara) sem pesar a página.
//   · FIGURAS: diagramas que ensinam alguma coisa (o dia, a semana, o café
//     hafúch, as direções, o dinheiro). Cada uma é chamada pelo nome a partir
//     de textos/guia.json, como um quadro: { "tipo": "figura", "nome": ... }.
//
// Nenhuma foto, nenhuma imagem de terceiros: tudo aqui é traço e texto, e
// sai vetorial no PDF (nítido em qualquer zoom, leve no download).
// Texto dentro do SVG usa as mesmas famílias do guia (Instrument, HeSerif).

const C = {
  navy: '#0E3B43', navy2: '#155059', teal: '#1F8A7D', tealSoft: '#E4F1EE', tealInk: '#12665C', tealLite: '#8FD6C8',
  gold: '#B8862F', goldSoft: '#F7EFDF', goldInk: '#8A6520', cream: '#FBF9F5', sand: '#F3F0E9', line: '#E4E0D6',
  ink: '#1B211F', muted: '#5F6A66'
};
// Como no CSS: toda pilha termina numa fonte nossa (o ₪ só existe nas hebraicas).
const PILHA = { Instrument: 'Instrument, HeSans', Bricolage: 'Bricolage, Instrument, HeSans' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const txt = (x, y, s, { size = 3.4, cor = C.ink, peso = 500, ancora = 'middle', fam = 'Instrument', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${PILHA[fam] ?? fam}" font-size="${size}" font-weight="${peso}" fill="${cor}" text-anchor="${ancora}"${ls ? ` letter-spacing="${ls}"` : ''}>${esc(s)}</text>`;

// ── ilustrações de abertura (viewBox 64 x 64, traço 1.6) ───────────────
const traco = (corpo, cor) => `<svg class="ilustra" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="${cor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${corpo}</g></svg>`;

const DESENHOS = {
  // um livro aberto, com a seta da direita para a esquerda por cima
  livro: `<path d="M8 20c8-3 16-3 24 2 8-5 16-5 24-2v30c-8-3-16-3-24 2-8-5-16-5-24-2z"/><path d="M32 22v30"/><path d="M42 11H22M27 7l-5 4 5 4"/>`,
  // mala com etiqueta: as primeiras palavras, na chegada
  mala: `<rect x="12" y="22" width="40" height="30" rx="4"/><path d="M25 22v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6"/><path d="M12 33h40"/><path d="M44 33v8l5 3"/><circle cx="49" cy="46" r="3"/><path d="M20 52v3M44 52v3"/>`,
  // duas pessoas conversando
  pessoas: `<circle cx="22" cy="22" r="7"/><path d="M9 50c1-9 6-14 13-14s12 5 13 14"/><circle cx="44" cy="24" r="6"/><path d="M33 50c1-7 5-11 11-11s10 4 11 11"/><path d="M36 9h14a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-8l-4 3v-3h-2a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z"/>`,
  // xícara com vapor
  xicara: `<path d="M12 28h32v8a14 14 0 0 1-14 14h-4a14 14 0 0 1-14-14z"/><path d="M44 31h3a6 6 0 0 1 0 12h-4"/><path d="M8 55h40"/><path d="M22 21c-2-3 2-5 0-8M30 21c-2-3 2-5 0-8M38 21c-2-3 2-5 0-8"/>`,
  // toldo listrado de banca de mercado
  banca: `<path d="M8 22l4-10h40l4 10"/><path d="M8 22c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6"/><path d="M12 28v26M52 28v26M8 54h48"/><path d="M20 12l-2 10M32 12v10M44 12l2 10"/><circle cx="24" cy="44" r="4"/><circle cx="33" cy="45" r="3.5"/><circle cx="41" cy="44" r="4"/><path d="M18 49h28"/>`,
  // frente de ônibus
  onibus: `<rect x="14" y="8" width="36" height="42" rx="6"/><path d="M14 30h36"/><rect x="19" y="14" width="26" height="12" rx="2"/><path d="M24 8v-3h16v3"/><circle cx="21" cy="40" r="2.5"/><circle cx="43" cy="40" r="2.5"/><path d="M18 50v5h6v-5M40 50v5h6v-5"/>`,
  // moeda de shekel
  moeda: `<circle cx="28" cy="34" r="18"/><circle cx="28" cy="34" r="13"/><circle cx="44" cy="24" r="13"/><circle cx="44" cy="24" r="9"/>`,
  // poste com duas placas de direção
  placa: `<path d="M32 8v48M24 56h16"/><path d="M14 14h24l5 5-5 5H14z"/><path d="M50 28H26l-5 5 5 5h24z"/><path d="M18 19h12M30 33h14"/>`,
  // boia: ajuda
  boia: `<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="9"/><path d="M18 18l8 8M46 18l-8 8M18 46l8-8M46 46l-8-8"/>`,
  // dois balões de fala
  baloes: `<path d="M8 12h30a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H20l-7 6v-6H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"/><path d="M26 36h30a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-5v6l-7-6H26a4 4 0 0 1-4-4V40a4 4 0 0 1 4-4z"/><path d="M12 22h20M30 45h22"/>`,
  // lápis e caixa marcada
  lapis: `<rect x="8" y="18" width="20" height="20" rx="3"/><path d="M13 28l4 4 7-8"/><rect x="8" y="44" width="20" height="12" rx="3"/><path d="M36 50l18-18 4 4-18 18-6 2z"/><path d="M50 36l4 4"/>`,
  // a letra álef sobre uma página
  alef: `<rect x="12" y="8" width="40" height="48" rx="4"/><path d="M20 18h24M20 48h24"/>`
};

export function ilustracao(nome, cor = C.tealLite, destaque = C.gold) {
  const d = DESENHOS[nome];
  if (!d) throw new Error(`ilustração desconhecida: ${nome}`);
  // O álef é texto, na fonte hebraica do guia: a letra é a que o curso ensina.
  const extra = nome === 'alef' ? `</g><text x="32" y="42" font-family="HeSerif" font-size="22" font-weight="500" fill="${destaque}" text-anchor="middle">א</text><g>` : '';
  return traco(d + extra, cor);
}

// ── figuras que ensinam ────────────────────────────────────────────────
const svg = (w, h, corpo, rotulo) => `<svg class="figura-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(rotulo)}">${corpo}</svg>`;

/** O dia: quando se diz bóker tov, érev tov e láyla tov. */
function dia() {
  const W = 100, H = 46;
  const sol = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.gold}"/>` +
    [...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<path d="M${x + Math.cos(a) * (r + 1.4)} ${y + Math.sin(a) * (r + 1.4)}L${x + Math.cos(a) * (r + 3)} ${y + Math.sin(a) * (r + 3)}" stroke="${C.gold}" stroke-width=".7" stroke-linecap="round"/>`; }).join('');
  const lua = (x, y) => `<path d="M${x + 2} ${y - 4.5}a5 5 0 1 0 2.6 8.4a4 4 0 0 1-2.6-8.4z" fill="${C.cream}"/>`;
  const corpo = `
  <defs><linearGradient id="ceu" x1="0" x2="1"><stop offset="0" stop-color="#F7EFDF"/><stop offset=".45" stop-color="#EBD9B4"/><stop offset=".7" stop-color="${C.navy2}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient></defs>
  <rect x="0" y="2" width="${W}" height="22" rx="3" fill="url(#ceu)"/>
  <path d="M0 21 Q 25 17 50 20 T 100 19 V24 H0z" fill="${C.sand}" opacity=".55"/>
  ${sol(16, 11, 3.6)}
  <circle cx="50" cy="17" r="3.4" fill="${C.gold}"/>
  ${lua(84, 11)}
  <path d="M8 29 H92" stroke="${C.line}" stroke-width=".5"/>
  ${[16, 50, 84].map(x => `<circle cx="${x}" cy="29" r="1.3" fill="${C.teal}"/>`).join('')}
  ${txt(16, 35.5, 'bóker tov', { cor: C.tealInk, peso: 600, size: 3.6 })}${txt(16, 40, 'manhã, até o meio-dia', { cor: C.muted, size: 3.2 })}
  ${txt(50, 35.5, 'érev tov', { cor: C.tealInk, peso: 600, size: 3.6 })}${txt(50, 40, 'fim da tarde e noite,', { cor: C.muted, size: 3.2 })}${txt(50, 43.6, 'ao chegar', { cor: C.muted, size: 3.2 })}
  ${txt(84, 35.5, 'láyla tov', { cor: C.tealInk, peso: 600, size: 3.6 })}${txt(84, 40, 'noite, ao se', { cor: C.muted, size: 3.2 })}${txt(84, 43.6, 'despedir', { cor: C.muted, size: 3.2 })}`;
  return { titulo: 'Bom dia e as duas boas-noites', legenda: 'Em hebraico, o cumprimento muda com a hora, e a noite tem dois: um para chegar, outro para ir embora.', svg: svg(W, H, corpo, 'Linha do dia: bóker tov de manhã, érev tov ao chegar à noite, láyla tov ao se despedir à noite') };
}

/** A semana: domingo é dia útil, sexta é meio dia, sábado é shabat. */
function semana() {
  const dias = [['Dom', 'útil'], ['Seg', 'útil'], ['Ter', 'útil'], ['Qua', 'útil'], ['Qui', 'útil'], ['Sex', 'até a tarde'], ['Sáb', 'shabat']];
  const W = 100, w = 13, g = (W - 7 * w) / 6;
  const corpo = dias.map(([d, s], i) => {
    const x = i * (w + g);
    const sab = i === 6, sex = i === 5;
    const fundo = sab ? C.navy : sex ? C.goldSoft : C.tealSoft;
    const cor = sab ? C.cream : sex ? C.goldInk : C.tealInk;
    const metade = sex ? `<rect x="${x}" y="14" width="${w}" height="9" rx="0" fill="${C.navy}" opacity=".9"/><path d="M${x} 14 h${w}" stroke="${C.gold}" stroke-width=".5"/>` : '';
    return `<rect x="${x}" y="2" width="${w}" height="21" rx="2.4" fill="${fundo}"/>${metade}` +
      txt(x + w / 2, 9, d, { cor, peso: 700, size: 3.6, fam: 'Bricolage' }) +
      txt(x + w / 2, sex ? 12.4 : 18.5, s, { cor, size: sex ? 2.2 : 2.5, peso: 500 });
  }).join('') +
    `<path d="M${5 * (w + g) + w * .5} 25 v2.4 H${W - w / 2} v-2.4" fill="none" stroke="${C.gold}" stroke-width=".5"/>` +
    txt(W, 33, 'shabat: do pôr do sol de sexta à noite de sábado', { cor: C.goldInk, size: 3.0, peso: 600, ancora: 'end' }) +
    txt(0, 27.6, 'a semana começa no domingo', { cor: C.tealInk, size: 3.0, peso: 600, ancora: 'start' });
  return { titulo: 'A semana em Israel', legenda: 'O fim de semana é sexta e sábado. Na sexta, o comércio fecha cedo; no shabat, quase tudo para.', svg: svg(W, 36, corpo, 'A semana: domingo a quinta são dias úteis, sexta até a tarde, sábado é shabat') };
}

/** O hafúch: leite primeiro, café por cima. */
function hafuch() {
  // Copo deslocado para o meio; o café é rotulado à esquerda para a linha
  // não cruzar a alça.
  const corpo = `<g transform="translate(26 0)">
  <path d="M20 10 h36 l-4 40 a6 6 0 0 1-6 5 h-16 a6 6 0 0 1-6-5z" fill="${C.cream}" stroke="${C.ink}" stroke-width=".8"/>
  <clipPath id="copo"><path d="M20.4 10.5 h35.2 l-4 39.5 a6 6 0 0 1-6 4.5 h-16 a6 6 0 0 1-6-4.5z"/></clipPath>
  <g clip-path="url(#copo)">
    <rect x="18" y="34" width="40" height="22" fill="#EFE6D6"/>
    <rect x="18" y="20" width="40" height="15" fill="#8B5E3C"/>
    <rect x="18" y="13" width="40" height="8" fill="#F6EFE4"/>
    <path d="M18 34 q10 -2 20 0 t20 0" fill="none" stroke="#C9A982" stroke-width="1.4"/>
  </g>
  <path d="M56 22 h4 a5 5 0 0 1 0 12 h-5" fill="none" stroke="${C.ink}" stroke-width=".8"/>
  </g>
  <path d="M85 15 H74" stroke="${C.muted}" stroke-width=".35"/>${txt(87, 16, 'espuma', { ancora: 'start', size: 3.2, cor: C.muted })}
  <path d="M43 27 H52" stroke="${C.muted}" stroke-width=".35"/>${txt(41, 28, '2. o café, por cima', { ancora: 'end', size: 3.4, cor: C.ink, peso: 600 })}
  <path d="M85 43 H76" stroke="${C.muted}" stroke-width=".35"/>${txt(87, 44, '1. o leite, primeiro', { ancora: 'start', size: 3.4, cor: C.ink, peso: 600 })}`;
  return { titulo: 'Por que hafúch quer dizer virado', legenda: 'No café com leite comum, o leite vai no café. No hafúch é o contrário: o café cai sobre o leite.', svg: svg(120, 58, corpo, 'Copo de hafúch: leite embaixo, café por cima, espuma no topo') };
}

/** As direções, como a pessoa vai ouvir na rua. */
function direcoes() {
  const seta = (d, cor) => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  const corpo = `
  <circle cx="50" cy="44" r="3" fill="${C.navy}"/><path d="M45 54 q5 -7 10 0" fill="${C.navy}"/>
  ${seta('M50 38 V12 M45.5 16.5 L50 12 L54.5 16.5', C.teal)}
  ${seta('M45 44 H26 M30.5 39.5 L26 44 L30.5 48.5', C.gold)}
  ${seta('M55 44 H74 M69.5 39.5 L74 44 L69.5 48.5', C.gold)}
  ${txt(50, 7, 'yashár', { cor: C.tealInk, peso: 700, size: 4.2 })}${txt(50, 10.6, 'em frente', { cor: C.muted, size: 3.2 })}
  ${txt(22, 43, 'smóla', { cor: C.goldInk, peso: 700, size: 4.2, ancora: 'end' })}${txt(22, 47.4, 'à esquerda', { cor: C.muted, size: 3.2, ancora: 'end' })}
  ${txt(78, 43, 'yamína', { cor: C.goldInk, peso: 700, size: 4.2, ancora: 'start' })}${txt(78, 47.4, 'à direita', { cor: C.muted, size: 3.2, ancora: 'start' })}
  <path d="M14 62 H86" stroke="${C.line}" stroke-width=".8"/>
  <circle cx="14" cy="62" r="1.4" fill="${C.teal}"/><circle cx="86" cy="62" r="1.4" fill="${C.gold}"/>
  ${txt(14, 67.5, 'karóv, perto', { cor: C.tealInk, peso: 600, size: 3, ancora: 'start' })}${txt(86, 67.5, 'rachók, longe', { cor: C.goldInk, peso: 600, size: 3, ancora: 'end' })}
  ${txt(50, 60.5, 'ze karóv? ze rachók?', { cor: C.muted, size: 3.2 })}`;
  return { titulo: 'O que você vai ouvir', legenda: 'Na resposta, preste atenção nestas cinco palavras. O resto, o gesto costuma explicar.', svg: svg(100, 70, corpo, 'Direções: yashár em frente, smóla à esquerda, yamína à direita; karóv perto, rachók longe') };
}

/** O dinheiro: moedas e notas do shekel. */
function dinheiro() {
  const moedas = [['10', 'agorót', 4.6], ['½', 'shékel', 5.2], ['1', 'shékel', 5], ['2', 'shkalím', 5.6], ['5', 'shkalím', 6.2], ['10', 'shkalím', 6.4]];
  let x = 4;
  const m = moedas.map(([v, u, r], i) => {
    const cx = x + r; x += 2 * r + 2.6;
    // Cor neutra para todas: a cor real de cada moeda não foi verificada
    // em fonte oficial, e um guia não deve ensinar o que não conferiu.
    return `<circle cx="${cx}" cy="12" r="${r}" fill="${C.sand}" stroke="${C.muted}" stroke-width=".45"/>` +
      `<circle cx="${cx}" cy="12" r="${r - 1.1}" fill="none" stroke="${C.muted}" stroke-width=".22"/>` +
      txt(cx, 13.4, v, { peso: 700, size: r * .78, fam: 'Bricolage', cor: C.ink }) +
      txt(cx, 12 + r + 4, u, { size: 2.88, cor: C.muted });
  }).join('');
  const notas = [['20', '#3E8E7E'], ['50', '#3E7DB0'], ['100', '#C98B2F'], ['200', '#B05A5A']];
  const n = notas.map(([v, cor], i) => {
    const nx = 4 + i * 23.5;
    return `<rect x="${nx}" y="30" width="21" height="11" rx="1.2" fill="${cor}" opacity=".18" stroke="${cor}" stroke-width=".5"/>` +
      `<circle cx="${nx + 15.5}" cy="35.5" r="3.4" fill="none" stroke="${cor}" stroke-width=".4" opacity=".7"/>` +
      txt(nx + 2, 37.2, `${v} ₪`, { peso: 700, size: 4, fam: 'Bricolage', cor: C.ink, ancora: 'start' });
  }).join('');
  const corpo = `${txt(4, 2.6, 'MOEDAS', { ancora: 'start', size: 2.75, cor: C.tealInk, peso: 600, ls: .4 })}${m}
  ${txt(4, 28, 'NOTAS', { ancora: 'start', size: 2.75, cor: C.tealInk, peso: 600, ls: .4 })}${n}`;
  return { titulo: 'O dinheiro de Israel', legenda: 'O shekel (₪) se divide em 100 agorót. Desenho esquemático: as cores e os tamanhos das moedas e das notas de verdade são outros.', svg: svg(100, 44, corpo, 'Moedas de 10 agorót, meio, 1, 2, 5 e 10 shekels; notas de 20, 50, 100 e 200 shekels') };
}

/** Atá e at: o você muda com quem ouve. */
function voce() {
  const pessoa = (x, cor) => `<circle cx="${x}" cy="22" r="5.4" fill="none" stroke="${cor}" stroke-width="1.2"/><path d="M${x - 10} 42 q10 -16 20 0" fill="none" stroke="${cor}" stroke-width="1.2"/>`;
  const balao = (x, t, cor) => `<rect x="${x - 11}" y="2" width="22" height="9" rx="3" fill="${cor}"/><path d="M${x - 2} 11 l2 3 l2 -3z" fill="${cor}"/>` + txt(x, 8.2, t, { cor: '#fff', peso: 700, size: 4 });
  const corpo = `${pessoa(25, C.teal)}${balao(25, 'atá', C.tealInk)}${txt(25, 47, 'para um homem', { cor: C.muted, size: 3 })}
  ${pessoa(75, C.gold)}${balao(75, 'at', C.goldInk)}${txt(75, 47, 'para uma mulher', { cor: C.muted, size: 3 })}`;
  return { titulo: 'Atá ou at?', legenda: 'O você muda com quem ouve. Por isso algumas perguntas têm duas formas, e o cartão mostra as duas. Se trocar, vão entender, e provavelmente sorrir. Sem vogais, as duas se escrevem igual: את.', svg: svg(100, 50, corpo, 'Atá para um homem, at para uma mulher') };
}

const FIGURAS = { dia, semana, hafuch, direcoes, dinheiro, voce };
export function figura(nome) {
  const f = FIGURAS[nome];
  if (!f) throw new Error(`figura desconhecida: ${nome}`);
  return f();
}
