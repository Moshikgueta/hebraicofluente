/* The module opener — one per unit of the teaching plan.
   ─────────────────────────────────────────────────────────────────────────
   The 22 letters are not a list, they are a course: «בא לי עברית!» groups them
   into seven units of three lessons, and a unit is the unit of PROGRESS —
   what you can read at the end of it. This page is what makes that visible:
   which letters, in which lesson, what you will be able to read afterwards.

   It also carries the guide's own teaching device, the bridge words. The
   teacher writes a loanword the student already knows — טרמינל, פלאפל,
   אמבולנס — with the new syllable blanked, and the student fills it in. A
   self-study reader has no teacher at the board, so the page does it in
   print: the word, what it means, and a blank where the new letter goes.

   Bridge words are RECOGNITION, never reading practice: they are full of
   letters the reader has not met, which is exactly the point — the shape is
   already familiar even when the alphabet is not. That is why they live here,
   labelled as such, and never in `wordsToRead`, where V1 governs. */

import { he, heList, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { badge, callout, chunk } from './partials.js';

const TOTAL = 7;

/* Which glyph to highlight inside a bridge word. Marking the base letter
   blindly misses every word that carries it only in final form — קרם ends in
   ם, not מ, and came out with nothing highlighted at all. V15 guarantees one
   of the two is present. */
const markIn = (word, L) =>
  word.includes(L.letter) ? L.letter
    : (L.finalForm && word.includes(L.finalForm)) ? L.finalForm
    : L.letter;

/**
 * @param {object} M    a record from data/modules.json
 * @param {object} ctx  { letters, modules }
 */
export function renderModule(M, ctx) {
  const letters = M.letters.map(id => ctx.letters.find(l => l.id === id)).filter(Boolean);
  const bdg = cont => badge(`Módulo ${M.n} de ${TOTAL}${cont ? ' · continuação' : ''}`);
  const sheets = [];

  /* ── what this module is ─────────────────────────────────────────────── */
  const lessonRows = M.lessons.map(ls => {
    const names = (ls.letters || [])
      .map(id => ctx.letters.find(l => l.id === id))
      .filter(Boolean);
    const what = ls.kind === 'practice'
      ? '<span class="hint">Sem letra nova — jogos, correção dos exercícios e leitura em voz alta.</span>'
      : names.length
        ? mixed([H(names.map(l => l.letter).join(' ')), ` — ${names.map(l => l.namePt).join(', ')}`])
        : prose(ls.topicPt || '');
    return `<tr><td class="center"><strong>${ls.n}</strong></td><td>${what}</td></tr>`;
  }).join('\n');

  sheets.push(`
    ${bdg()}
    <h1>${`Módulo ${M.n} — ${esc(M.titlePt)}`}</h1>
    <p class="lead">${prose(M.subPt)}</p>
    <p>${prose(M.introPt)}</p>

    <h2>As três lições</h2>
    <p>Este módulo corresponde a uma unidade do plano de aulas: duas lições que
       apresentam conteúdo novo e uma terceira de prática. Estudando sozinho,
       trate cada lição como uma sessão — e não pule a terceira.</p>
    <table>
      <thead><tr><th>Lição</th><th>Conteúdo</th></tr></thead>
      <tbody>${lessonRows}</tbody>
    </table>

    <h2>Ao terminar este módulo você vai conseguir</h2>
    <ul class="ticks">
      ${M.goalsPt.map(g => `<li>${prose(g)}</li>`).join('\n')}
    </ul>`);

  /* ── the letters of the module, at a glance ──────────────────────────── */
  if (letters.length) {
    sheets.push(`
    ${bdg(true)}
    <h1>${`As letras do módulo ${M.n}`}</h1>
    <p class="lead">Você vai voltar a esta tabela. Ela é o índice do módulo: a
       letra impressa, a mesma à mão, a forma final quando existe, e o som.</p>
    <table>
      <thead><tr><th>#</th><th>Impressa</th><th>Cursiva</th><th>Final</th><th>Nome</th><th>Som</th></tr></thead>
      <tbody>${letters.map(L => `<tr>
        <td class="center">${L.order}</td>
        <td class="center">${he(L.letter, { size: 'big' })}</td>
        <td class="center">${he(L.letter, { size: 'big', cursive: true })}</td>
        <td class="center">${L.finalForm ? he(L.finalForm, { size: 'big' }) : '<span class="hint">—</span>'}</td>
        <td>${esc(L.namePt)}</td>
        <td><strong class="kbd">${esc(L.translit || '—')}</strong></td>
      </tr>`).join('\n')}</tbody>
    </table>

    ${callout('note', '🎯', `<p>${prose(M.milestonePt)}</p>`)}`);
  }

  /* ── bridge words ────────────────────────────────────────────────────── */
  const withBridge = letters.filter(L => (L.bridgeWords || []).length);
  chunk(withBridge, 3).forEach((group, gi, all) => {
    sheets.push(`
    ${bdg(true)}
    <h1>Palavras que você já conhece${all.length > 1 ? ` (${gi + 1} de ${all.length})` : ''}</h1>
    ${gi === 0 ? `<p class="lead">O hebraico moderno importou centenas de palavras do
       grego, do inglês, do espanhol e do português. Você já sabe o que elas
       querem dizer — só nunca as viu escritas assim. Use-as como porta de
       entrada: localize a letra nova dentro de uma palavra que já é sua.</p>
    <p class="hint">Não tente ler estas palavras inteiras ainda: elas usam letras
       que você ainda não aprendeu. A tarefa é só encontrar a letra do momento
       e escrevê-la na última coluna.</p>` : ''}

    ${group.map(L => `
    <h2>${mixed(['A letra ', H(L.letter), ` — ${L.namePt}`])}</h2>
    <table>
      <thead><tr><th>Palavra</th><th>Significado</th><th>Escreva a letra</th></tr></thead>
      <tbody>${L.bridgeWords.map(w => `<tr>
        <td class="he-cell">${he(w.he, { size: 'word', mark: markIn(w.he, L) })}</td>
        <td>${esc(w.pt)}</td>
        <td class="write-cell"></td>
      </tr>`).join('')}</tbody>
    </table>`).join('\n')}`);
  });

  return sheets;
}

/* The practice lesson that closes every unit. The guide gives it no new
   letters on purpose: it is where the week's letters stop being exercises and
   start being reading. */
export function practiceSheet(M, ctx) {
  const letters = M.letters.map(id => ctx.letters.find(l => l.id === id)).filter(Boolean);
  const words = [];
  const seen = new Set();
  for (const L of letters) {
    for (const w of L.wordsToRead || []) {
      if (seen.has(w.he)) continue;
      seen.add(w.he);
      words.push(w);
    }
  }
  const lesson = M.lessons.find(l => l.kind === 'practice');
  if (!lesson) return null;

  return `
    ${badge(`Módulo ${M.n} · lição ${lesson.n} — prática`)}
    <h1>${`Lição ${lesson.n} — prática`}</h1>
    <p class="lead">Nenhuma letra nova. Esta lição existe para transformar o que
       você reconhece no que você lê — e é a que mais adianta o aprendizado.</p>

    <h2>1 · Leia em voz alta, cronometrado</h2>
    <p>Leia a lista três vezes. Marque quanto tempo levou em cada passada: a
       terceira deve ser visivelmente mais rápida que a primeira.</p>
    ${words.length
      ? `<p class="ex-task">${heList(words.map(w => w.he), { size: 'word' })}</p>`
      : `<p class="ex-task">${heList(letters.flatMap(L => L.syllables.map(s => s.he)).slice(0, 12), { size: 'word' })}</p>`}
    <div class="dict-lines"><div>1ª</div><div>2ª</div><div>3ª</div></div>

    <h2>2 · Escreva de memória</h2>
    <p>${mixed(['Sem olhar a tabela, escreva em cursiva as letras deste módulo: ',
                H(letters.map(l => l.letter).join(' '))])}</p>
    <div class="free-lines"><div></div><div></div></div>

    <h2>3 · Corrija os seus próprios exercícios</h2>
    <p>Volte às páginas do módulo e confira o que escreveu. O objetivo não é ter
       acertado tudo: é saber exatamente o que errou.</p>
    <ul class="ticks">
      <li>Alguma letra saiu com o traço na direção errada?</li>
      <li>Alguma palavra ficou com a ordem das letras invertida?</li>
      <li>Alguma vogal ficou embaixo da consoante errada?</li>
    </ul>

    ${callout('tip', '💡', `<p>Estudando sozinho, grave-se lendo a lista acima e
       escute no dia seguinte. É o mais perto que dá para chegar de ter um
       professor ouvindo — e é surpreendentemente eficaz.</p>`)}`;
}
