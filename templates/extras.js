/* Modules 6 and 7 - the two units of the teaching plan that introduce no new
   letter and are, for that reason, the easiest to skip and the worst to skip.

   Module 6 (lessons 16-18) is the soft side of the three dotted letters plus
   the five final forms. The guide teaches בּ כּ פּ with the dot first, because
   that is the shape a Brazilian recognises inside a loanword - אמבולנס,
   סופרמרקט - and only then takes the dot away. Real Hebrew almost never
   prints the dot, so this is where reading actually starts.

   Module 7 (lessons 19-21) is the gerech: three sounds the language needed and
   built without inventing a letter.

   THE CONTENT LIVES IN data/extras.json, not here. It used to be three consts
   at the top of this file, which was fine while the book was the only product;
   the interactive course needs exactly the same words, and two copies of a
   word list is two chances to have different words. */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { he, heList, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { badge, callout, exercise } from './partials.js';

const ROOT = new URL('..', import.meta.url).pathname;
const EXTRAS = JSON.parse(readFileSync(join(ROOT, 'data/extras.json'), 'utf8'));

/* מֶלֶךְ and דֶּרֶךְ carry their kaf as the final ך, so highlighting the base
   letter alone would leave those rows unmarked - the same trap as the bridge
   words on the module openers. */
const FINAL_OF = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };
const markFor = (word, base) =>
  word.includes(base) ? base : (FINAL_OF[base] && word.includes(FINAL_OF[base]) ? FINAL_OF[base] : base);

export function renderDagesh(M, ctx) {
  const D_ALL = EXTRAS.dagesh;
  const bdg = cont => badge(`Módulo ${M.n} · sem o ponto${cont ? ' · continuação' : ''}`);
  const sheets = [];

  sheets.push(`
    ${bdg()}
    <h1>${`Módulo ${M.n} - ${esc(M.titlePt)}`}</h1>
    <p class="lead">${prose(M.subPt)}</p>
    <p>${prose(M.introPt)}</p>

    <h2>A regra, em uma frase</h2>
    <p>${mixed(['Três letras - ', H('ב'), ', ', H('כ'), ' e ', H('פ'), ' - têm dois sons. '])}${prose(D_ALL.rulePt)}</p>

    ${callout('warn', '⚠️', `
      <h3>Isto não é detalhe de acabamento</h3>
      <p>${prose(D_ALL.warningPt)}</p>`)}

    <h2>Ao terminar este módulo você vai conseguir</h2>
    <ul class="ticks">
      ${M.goalsPt.map(g => `<li>${prose(g)}</li>`).join('\n')}
    </ul>`);

  for (const D of D_ALL.letters) {
    const L = ctx.letters.find(l => l.id === D.id);
    const hard = D.hardWords.map(w => w.he);
    const soft = D.softWords.map(w => w.he);

    sheets.push(`
    ${bdg(true)}
    <h1>${mixed([H(D.hard), ' e ', H(D.soft), ` - ${esc(L ? L.namePt : D.namePt)}`])}</h1>

    <table>
      <thead><tr><th>Forma</th><th>Impressa</th><th>Cursiva</th><th>Som</th><th>Palavras</th></tr></thead>
      <tbody>
        <tr>
          <td>Com daguesh</td>
          <td class="center">${he(D.hard, { size: 'big' })}</td>
          <td class="center">${he(D.soft, { size: 'big', cursive: true })}</td>
          <td><strong class="kbd">${esc(D.hardPt)}</strong></td>
          <td>${heList(hard, { size: 'word' })}</td>
        </tr>
        <tr>
          <td>Sem daguesh</td>
          <td class="center">${he(D.soft, { size: 'big' })}</td>
          <td class="center">${he(D.soft, { size: 'big', cursive: true })}</td>
          <td><strong class="kbd">${esc(D.softPt)}</strong></td>
          <td>${heList(soft, { size: 'word' })}</td>
        </tr>
      </tbody>
    </table>
    <p class="hint">A cursiva é a mesma nos dois casos - à mão ninguém escreve o
       daguesh. Só o contexto distingue.</p>
    <p>${prose(D.notePt)}</p>

    ${exercise(1, mixed([`Leia e marque: ${D.hardPt} ou ${D.softPt}?`]), `
      <p>Leia cada palavra em voz alta e marque com X o som que a letra tem nela.</p>
      <table>
        <thead><tr><th>Palavra</th><th>${esc(D.hardPt)}</th><th>${esc(D.softPt)}</th></tr></thead>
        <tbody>${[...hard, ...soft].map(w => `<tr>
          <td class="he-cell">${he(w, { size: 'word', mark: markFor(w, D.soft) })}</td>
          <td class="center">( )</td><td class="center">( )</td></tr>`).join('')}</tbody>
      </table>`)}

    ${exercise(2, 'Escreva, e diga qual som escolheu', `
      <p>Copie cada palavra em cursiva e anote ao lado, em português, o som que a
         letra tem nela. Como a cursiva não marca o daguesh, a sua anotação é a
         única prova de que você leu e não copiou.</p>
      <table>
        <thead><tr><th>Modelo</th><th>Copie em cursiva</th><th>Som</th></tr></thead>
        <tbody>${[hard[0], soft[0]].filter(Boolean).map(w => `<tr>
          <td class="he-cell">${he(w, { size: 'word' })}</td>
          <td class="write-cell"></td>
          <td class="write-cell"></td></tr>`).join('')}</tbody>
      </table>`)}`);
  }

  /* ── the five finals, consolidated ─────────────────────────────────── */
  const F = EXTRAS.finals;
  sheets.push(`
    ${bdg(true)}
    <h1>As cinco formas finais</h1>
    <p class="lead">Você conheceu cada uma junto com a sua letra. Aqui elas estão
       juntas pela primeira vez - e é assim, em bloco, que elas se fixam.</p>
    <table>
      <thead><tr><th>No meio</th><th>No fim</th><th>Cursiva final</th><th>Nome</th><th>Exemplo</th><th>Significado</th></tr></thead>
      <tbody>${F.map(x => `<tr>
        <td class="center">${he(x.base, { size: 'big' })}</td>
        <td class="center">${he(x.fin, { size: 'big' })}</td>
        <td class="center">${he(x.fin, { size: 'big', cursive: true })}</td>
        <td>${esc(x.namePt)}</td>
        <td class="he-cell">${he(x.word, { size: 'word', mark: x.fin })}</td>
        <td>${esc(x.pt)}</td>
      </tr>`).join('')}</tbody>
    </table>

    ${callout('tip', '💡', `<p>Quatro das cinco descem abaixo da linha
      ${mixed([' - ', H(F.filter(x => x.descends).map(x => x.fin).join(' ')), ' - '])} e só
      ${mixed([H(F.filter(x => !x.descends).map(x => x.fin).join(' '))])} fecha em cima.
      Esse é o atalho visual: se desceu, é fim de palavra.</p>`)}

    ${exercise(3, 'Circule apenas as formas finais', `
      <p class="ex-task">${heList(F.flatMap(x => [x.fin, x.base]), { size: 'word' })}</p>`)}

    ${exercise(4, 'Escreva a palavra inteira', `
      <p>Cada palavra abaixo termina em forma final. Copie-as em cursiva.</p>
      <table>
        <thead><tr><th>Modelo</th><th>Significado</th><th>Copie</th></tr></thead>
        <tbody>${F.map(x => `<tr>
          <td class="he-cell">${he(x.word, { size: 'word' })}</td>
          <td>${esc(x.pt)}</td>
          <td class="write-cell"></td></tr>`).join('')}</tbody>
      </table>`)}`);

  const U = EXTRAS.unpointed;
  sheets.push(`
    ${bdg(true)}
    <h1>Lição 18 - ler sem nikud</h1>
    <p class="lead">${esc(U.introPt)}</p>

    ${exercise(5, 'Leia sem os pontos', `
      <p>Leia em voz alta. Depois confira na lista pontuada da direita.</p>
      <table>
        <thead><tr><th>Sem nikud</th><th>Significado</th><th>Com nikud</th></tr></thead>
        <tbody>${U.words.map(w => `<tr>
          <td class="he-cell">${he(w.bare, { size: 'word' })}</td>
          <td>${esc(w.pt)}</td>
          <td class="he-cell">${he(w.pointed, { size: 'word' })}</td></tr>`).join('')}</tbody>
      </table>`)}

    ${callout('note', '🌟', `<p>${prose(M.milestonePt)}</p>`)}`);

  return sheets;
}

/* ── Module 7 · the gerech ──────────────────────────────────────────────── */

export function renderModernSounds(M) {
  const G = EXTRAS.gerech;
  const bdg = cont => badge(`Módulo ${M.n} · sons modernos${cont ? ' · continuação' : ''}`);

  const a = `
    ${bdg()}
    <h1>${`Módulo ${M.n} - ${esc(M.titlePt)}`}</h1>
    <p class="lead">${prose(M.subPt)}</p>
    <p>${prose(G.introPt)}</p>

    <h2>O sinal</h2>
    <p>${prose(G.signNotePt)}</p>

    <table>
      <thead><tr><th>Letra</th><th>Com gerech</th><th>Som</th><th>Aproximação</th></tr></thead>
      <tbody>${G.letters.map(x => `<tr>
        <td class="center">${he(x.base, { size: 'big' })}</td>
        <td class="center">${he(x.he, { size: 'big' })}</td>
        <td><strong class="kbd">${esc(x.pt)}</strong></td>
        <td>${esc(x.likePt)}</td>
      </tr>`).join('')}</tbody>
    </table>

    ${callout('note', '💡', `<p>Estes três sons quase só aparecem em nomes próprios
      e em palavras importadas - que é exatamente onde um brasileiro mais acerta,
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

    ${G.letters.map(x => `
    <h2>${mixed([H(x.he), ` - ${x.pt}`])}</h2>
    <table>
      <thead><tr><th>Palavra</th><th>Significado</th><th>Escreva em cursiva</th></tr></thead>
      <tbody>${x.words.map(w => `<tr>
        <td class="he-cell">${he(w.he, { size: 'word', mark: x.he })}</td>
        <td>${esc(w.pt)}</td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>`).join('\n')}`;

  const c = `
    ${bdg(true)}
    <h1>Lição 21 - fecho do alfabeto</h1>

    ${exercise(1, 'Com gerech ou sem?', `
      <p>Leia cada par em voz alta. O gerech muda o som - e às vezes a palavra inteira.</p>
      <table>
        <thead><tr><th>Sem gerech</th><th>Som</th><th>Com gerech</th><th>Som</th></tr></thead>
        <tbody>${G.letters.map(x => `<tr>
          <td class="center">${he(x.base, { size: 'word' })}</td>
          <td><strong class="kbd">${esc(x.basePt)}</strong></td>
          <td class="center">${he(x.he, { size: 'word' })}</td>
          <td><strong class="kbd">${esc(x.pt)}</strong></td></tr>`).join('')}</tbody>
      </table>`)}

    ${exercise(2, 'Escreva o gerech', `
      <p>${mixed(['Copie as três letras com o sinal: ', H(G.letters.map(x => x.he).join(' '))])}</p>
      <div class="free-lines"><div></div><div></div></div>`)}

    ${exercise(3, 'Ditado de nomes próprios', `
      <p>Peça a alguém para ler os nomes abaixo, ou grave-se lendo e escute depois.</p>
      <p class="ex-task">${heList(G.letters.flatMap(x => x.words.slice(0, 2).map(w => w.he)), { size: 'word' })}</p>
      <div class="dict-lines"><div>1.</div><div>2.</div><div>3.</div><div>4.</div></div>`)}

    ${callout('note', '🌟', `<p>${prose(M.milestonePt)}</p>`)}`;

  return [a, b, c];
}
