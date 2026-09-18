/* Modules 6 and 7 — the two units of the teaching plan that introduce no new
   letter and are, for that reason, the easiest to skip and the worst to skip.

   Module 6 (lessons 16–18) is the soft side of the three dotted letters plus
   the five final forms. The guide teaches בּ כּ פּ with the dot first, because
   that is the shape a Brazilian recognises inside a loanword — אמבולנס,
   סופרמרקט — and only then takes the dot away. Real Hebrew almost never
   prints the dot, so this is where reading actually starts.

   Module 7 (lessons 19–21) is the gerech: three sounds the language needed and
   built without inventing a letter.

   Both modules are rendered from data/letters.json, so the example words are
   the same ones the reader already met. */

import { he, heList, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { badge, callout, exercise } from './partials.js';

/* מֶלֶךְ and דֶּרֶךְ carry their kaf as the final ך, so highlighting the base
   letter alone would leave those rows unmarked — the same trap as the bridge
   words on the module openers. */
const FINAL_OF = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };
const finalOf = ch => FINAL_OF[ch] || ch;

/* The three letters whose sound turns on one dot, with the words from their
   own modules used as evidence. */
const DAGESH = [
  { id: 'bet', hard: 'בּ', soft: 'ב', hardPt: 'b', softPt: 'v',
    hardWords: ['בַּיִת', 'אַבָּא', 'בֹּקֶר'], softWords: ['טוֹב', 'לֵב'],
    notePt: 'O som suave é o V do português, idêntico ao de {{ו}}. Duas letras, um som só — e é por isso que o hebraico se escreve com dicionário na cabeça.' },
  { id: 'kaf', hard: 'כּ', soft: 'כ', hardPt: 'k', softPt: 'ch',
    hardWords: ['כּוֹס', 'כֶּלֶב', 'כַּדּוּר'], softWords: ['אֹכֶל', 'מֶלֶךְ', 'דֶּרֶךְ'],
    notePt: 'O som suave é o mesmo raspado de {{ח}}, feito no fundo da garganta. Na forma final {{ך}} ele é sempre suave.' },
  { id: 'pe', hard: 'פּ', soft: 'פ', hardPt: 'p', softPt: 'f',
    hardWords: ['מִשְׁפָּחָה'], softWords: ['סֵפֶר', 'יָפֶה', 'סוֹף', 'כֶּסֶף'],
    notePt: 'O par mais fácil de ouvir dos três: P e F são tão distintos em hebraico quanto em português.' }
];

const FINALS = [
  { base: 'מ', fin: 'ם', namePt: 'Mem sofit', word: 'יוֹם', pt: 'dia' },
  { base: 'נ', fin: 'ן', namePt: 'Nun sofit', word: 'מִן', pt: 'de' },
  { base: 'כ', fin: 'ך', namePt: 'Chaf sofit', word: 'מֶלֶךְ', pt: 'rei' },
  { base: 'פ', fin: 'ף', namePt: 'Fe sofit', word: 'סוֹף', pt: 'fim' },
  { base: 'צ', fin: 'ץ', namePt: 'Tsadi sofit', word: 'אֶרֶץ', pt: 'terra / país' }
];

export function renderDagesh(M, ctx) {
  const bdg = cont => badge(`Módulo ${M.n} · sem o ponto${cont ? ' · continuação' : ''}`);
  const sheets = [];

  sheets.push(`
    ${bdg()}
    <h1>${`Módulo ${M.n} — ${esc(M.titlePt)}`}</h1>
    <p class="lead">${prose(M.subPt)}</p>
    <p>${prose(M.introPt)}</p>

    <h2>A regra, em uma frase</h2>
    <p>Três letras — ${mixed([H('ב'), ', ', H('כ'), ' e ', H('פ')])} — têm dois sons.
       O ponto no meio, o <strong>daguesh</strong>, escolhe qual. Ele aparece no
       começo da palavra e depois de consoante; some entre vogais e quase sempre
       no fim. E, fora dos livros didáticos e dos textos sagrados, ele
       simplesmente não é impresso: a palavra vem sem pontos e sem nikud, e é
       você quem decide.</p>

    ${callout('warn', '⚠️', `
      <h3>Isto não é detalhe de acabamento</h3>
      <p>${mixed(['Ler ', H('סֵפֶר'), ' como "séper" em vez de "séfer" não é sotaque: é outra palavra, ou palavra nenhuma. As três letras deste módulo aparecem em quase toda frase do hebraico, e na rua elas vêm sem o ponto.'])}</p>`)}

    <h2>Ao terminar este módulo você vai conseguir</h2>
    <ul class="ticks">
      ${M.goalsPt.map(g => `<li>${prose(g)}</li>`).join('\n')}
    </ul>`);

  for (const D of DAGESH) {
    const L = ctx.letters.find(l => l.id === D.id);
    sheets.push(`
    ${bdg(true)}
    <h1>${mixed([H(D.hard), ' e ', H(D.soft), ` — ${esc(L.namePt)}`])}</h1>

    <table>
      <thead><tr><th>Forma</th><th>Impressa</th><th>Cursiva</th><th>Som</th><th>Palavras</th></tr></thead>
      <tbody>
        <tr>
          <td>Com daguesh</td>
          <td class="center">${he(D.hard, { size: 'big' })}</td>
          <td class="center">${he(D.soft, { size: 'big', cursive: true })}</td>
          <td><strong class="kbd">${esc(D.hardPt)}</strong></td>
          <td>${heList(D.hardWords, { size: 'word' })}</td>
        </tr>
        <tr>
          <td>Sem daguesh</td>
          <td class="center">${he(D.soft, { size: 'big' })}</td>
          <td class="center">${he(D.soft, { size: 'big', cursive: true })}</td>
          <td><strong class="kbd">${esc(D.softPt)}</strong></td>
          <td>${heList(D.softWords, { size: 'word' })}</td>
        </tr>
      </tbody>
    </table>
    <p class="hint">A cursiva é a mesma nos dois casos — à mão ninguém escreve o
       daguesh. Só o contexto distingue.</p>
    <p>${prose(D.notePt)}</p>

    ${exercise(1, mixed([`Leia e marque: ${D.hardPt} ou ${D.softPt}?`]), `
      <p>Leia cada palavra em voz alta e marque com X o som que a letra tem nela.</p>
      <table>
        <thead><tr><th>Palavra</th><th>${esc(D.hardPt)}</th><th>${esc(D.softPt)}</th></tr></thead>
        <tbody>${[...D.hardWords, ...D.softWords].map(w => `<tr>
          <td class="he-cell">${he(w, { size: 'word', mark: w.includes(D.soft) ? D.soft : finalOf(D.soft) })}</td>
          <td class="center">( )</td><td class="center">( )</td></tr>`).join('')}</tbody>
      </table>`)}

    ${exercise(2, 'Escreva, e diga qual som escolheu', `
      <p>Copie cada palavra em cursiva e anote ao lado, em português, o som que a
         letra tem nela. Como a cursiva não marca o daguesh, a sua anotação é a
         única prova de que você leu e não copiou.</p>
      <table>
        <thead><tr><th>Modelo</th><th>Copie em cursiva</th><th>Som</th></tr></thead>
        <tbody>${[D.hardWords[0], D.softWords[0]].filter(Boolean).map(w => `<tr>
          <td class="he-cell">${he(w, { size: 'word' })}</td>
          <td class="write-cell"></td>
          <td class="write-cell"></td></tr>`).join('')}</tbody>
      </table>`)}`);
  }

  /* ── the five finals, consolidated ─────────────────────────────────── */
  sheets.push(`
    ${bdg(true)}
    <h1>As cinco formas finais</h1>
    <p class="lead">Você conheceu cada uma junto com a sua letra. Aqui elas estão
       juntas pela primeira vez — e é assim, em bloco, que elas se fixam.</p>
    <table>
      <thead><tr><th>No meio</th><th>No fim</th><th>Cursiva final</th><th>Nome</th><th>Exemplo</th><th>Significado</th></tr></thead>
      <tbody>${FINALS.map(F => `<tr>
        <td class="center">${he(F.base, { size: 'big' })}</td>
        <td class="center">${he(F.fin, { size: 'big' })}</td>
        <td class="center">${he(F.fin, { size: 'big', cursive: true })}</td>
        <td>${esc(F.namePt)}</td>
        <td class="he-cell">${he(F.word, { size: 'word', mark: F.fin })}</td>
        <td>${esc(F.pt)}</td>
      </tr>`).join('')}</tbody>
    </table>

    ${callout('tip', '💡', `<p>Quatro das cinco descem abaixo da linha
      ${mixed([' — ', H('ן ך ף ץ'), ' — '])} e só ${mixed([H('ם')])} fecha em cima.
      Esse é o atalho visual: se desceu, é fim de palavra.</p>`)}

    ${exercise(3, 'Circule apenas as formas finais', `
      <p class="ex-task">${heList(['ם', 'מ', 'ך', 'כ', 'ן', 'נ', 'ץ', 'צ', 'ף', 'פ'], { size: 'word' })}</p>`)}

    ${exercise(4, 'Escreva a palavra inteira', `
      <p>Cada palavra abaixo termina em forma final. Copie-as em cursiva.</p>
      <table>
        <thead><tr><th>Modelo</th><th>Significado</th><th>Copie</th></tr></thead>
        <tbody>${FINALS.map(F => `<tr>
          <td class="he-cell">${he(F.word, { size: 'word' })}</td>
          <td>${esc(F.pt)}</td>
          <td class="write-cell"></td></tr>`).join('')}</tbody>
      </table>`)}`);

  sheets.push(`
    ${bdg(true)}
    <h1>Lição 18 — ler sem nikud</h1>
    <p class="lead">O teste real deste módulo. As palavras abaixo estão como
       aparecem num jornal israelense: sem nikud, sem daguesh, sem nenhuma
       ajuda. Você já conhece todas elas.</p>

    ${exercise(5, 'Leia sem os pontos', `
      <p>Leia em voz alta. Depois confira na lista pontuada da direita.</p>
      <table>
        <thead><tr><th>Sem nikud</th><th>Significado</th><th>Com nikud</th></tr></thead>
        <tbody>${[
          ['ספר', 'סֵפֶר', 'livro'], ['בית', 'בַּיִת', 'casa'],
          ['מלך', 'מֶלֶךְ', 'rei'], ['כסף', 'כֶּסֶף', 'dinheiro'],
          ['טוב', 'טוֹב', 'bom'], ['דרך', 'דֶּרֶךְ', 'caminho'],
          ['שלום', 'שָׁלוֹם', 'paz / olá'], ['ארץ', 'אֶרֶץ', 'terra / país']
        ].map(([bare, pointed, pt]) => `<tr>
          <td class="he-cell">${he(bare, { size: 'word' })}</td>
          <td>${esc(pt)}</td>
          <td class="he-cell">${he(pointed, { size: 'word' })}</td></tr>`).join('')}</tbody>
      </table>`)}

    ${callout('note', '🌟', `<p>${prose(M.milestonePt)}</p>`)}`);

  return sheets;
}

/* ── Module 7 · the gerech ──────────────────────────────────────────────── */

const GERECH = [
  { he: 'צ׳', base: 'צ', pt: 'tch', likePt: 'como o TCH de "tchau"',
    words: [['צ׳ילה', 'Chile'], ['צ׳כיה', 'Tchéquia'], ['ואוצ׳ר', 'voucher']] },
  { he: 'ג׳', base: 'ג', pt: 'dj', likePt: 'como o G de "gelo" ou o J de "jipe"',
    words: [['ג׳ירף', 'girafa'], ['פיג׳מה', 'pijama'], ['ג׳ל', 'gel'], ['ג׳וניור', 'júnior']] },
  { he: 'ז׳', base: 'ז', pt: 'j', likePt: 'como o J do francês "jour" — o nosso J de "jarro"',
    words: [['ז׳רגון', 'jargão'], ['ז׳סטה', 'gesto']] }
];

export function renderModernSounds(M, ctx) {
  const bdg = cont => badge(`Módulo ${M.n} · sons modernos${cont ? ' · continuação' : ''}`);

  const a = `
    ${bdg()}
    <h1>${`Módulo ${M.n} — ${esc(M.titlePt)}`}</h1>
    <p class="lead">${prose(M.subPt)}</p>
    <p>${prose(M.introPt)}</p>

    <h2>O sinal</h2>
    <p>${mixed(['O ', H('גֶּרֶשׁ'), ' é o traço que se põe à esquerda da letra, no alto. Ele não é acento nem pontuação: é parte da escrita da palavra, e sem ele a palavra tem outro som.'])}</p>

    <table>
      <thead><tr><th>Letra</th><th>Com gerech</th><th>Som</th><th>Aproximação</th></tr></thead>
      <tbody>${GERECH.map(G => `<tr>
        <td class="center">${he(G.base, { size: 'big' })}</td>
        <td class="center">${he(G.he, { size: 'big' })}</td>
        <td><strong class="kbd">${esc(G.pt)}</strong></td>
        <td>${esc(G.likePt)}</td>
      </tr>`).join('')}</tbody>
    </table>

    ${callout('note', '💡', `<p>Estes três sons quase só aparecem em nomes próprios
      e em palavras importadas — que é exatamente onde um brasileiro mais acerta,
      porque já sabe como elas soam.</p>`)}

    <h2>Ao terminar este módulo você vai conseguir</h2>
    <ul class="ticks">
      ${M.goalsPt.map(g => `<li>${prose(g)}</li>`).join('\n')}
    </ul>`;

  const b = `
    ${bdg(true)}
    <h1>Leia e escreva</h1>
    <p class="lead">Todas as palavras desta página você já conhece em português.
       Leia cada uma em voz alta antes de olhar o significado.</p>

    ${GERECH.map((G, i) => `
    <h2>${mixed([H(G.he), ` — ${G.pt}`])}</h2>
    <table>
      <thead><tr><th>Palavra</th><th>Significado</th><th>Escreva em cursiva</th></tr></thead>
      <tbody>${G.words.map(([w, pt]) => `<tr>
        <td class="he-cell">${he(w, { size: 'word', mark: G.he })}</td>
        <td>${esc(pt)}</td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>`).join('\n')}`;

  const c = `
    ${bdg(true)}
    <h1>Lição 21 — fecho do alfabeto</h1>

    ${exercise(1, 'Com gerech ou sem?', `
      <p>Leia cada par em voz alta. O gerech muda o som — e às vezes a palavra inteira.</p>
      <table>
        <thead><tr><th>Sem gerech</th><th>Som</th><th>Com gerech</th><th>Som</th></tr></thead>
        <tbody>${GERECH.map(G => `<tr>
          <td class="center">${he(G.base, { size: 'word' })}</td>
          <td><strong class="kbd">${esc(G.base === 'צ' ? 'ts' : G.base === 'ג' ? 'g' : 'z')}</strong></td>
          <td class="center">${he(G.he, { size: 'word' })}</td>
          <td><strong class="kbd">${esc(G.pt)}</strong></td></tr>`).join('')}</tbody>
      </table>`)}

    ${exercise(2, 'Escreva o gerech', `
      <p>${mixed(['Copie as três letras com o sinal: ', H('צ׳ ג׳ ז׳')])}</p>
      <div class="free-lines"><div></div><div></div></div>`)}

    ${exercise(3, 'Ditado de nomes próprios', `
      <p>Peça a alguém para ler os nomes abaixo, ou grave-se lendo e escute depois.</p>
      <p class="ex-task">${heList(['צ׳ילה', 'צ׳כיה', 'ג׳ירף', 'ז׳רגון'], { size: 'word' })}</p>
      <div class="dict-lines"><div>1.</div><div>2.</div><div>3.</div><div>4.</div></div>`)}

    ${callout('note', '🌟', `<p>${prose(M.milestonePt)}</p>`)}`;

  return [a, b, c];
}
