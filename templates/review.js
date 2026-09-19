/* Review units. One after every four letters, plus a final cumulative one.
   Content is derived from the letters in range, so a review can never test a
   letter that has not been taught - V10 re-checks it on the built data. */

import { he, heList, heCloze, esc, mixed, H } from '../scripts/lib/render.js';
import { badge, callout, chunk } from './partials.js';

function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffled = (arr, rand) => {
  const r = arr.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

/**
 * @param {object} R  { n, upTo, final, moduleN }  - review number, highest
 *                    letter order, and the module it closes
 * @param {object} ctx { letters }
 *
 * A review closes a MODULE, so "the new letters" are that module's letters,
 * however many it has - the units of the teaching plan hold between three and
 * six. Deriving them from the module instead of a fixed window is what keeps
 * the opening paragraph honest.
 */
export function renderReview(R, ctx) {
  const rand = rng('review-' + R.n);
  const learned = ctx.letters.filter(l => l.order <= R.upTo);
  const since = R.moduleN
    ? ctx.letters.filter(l => l.module === R.moduleN)
    : ctx.letters.filter(l => l.order > R.upTo - 4 && l.order <= R.upTo);
  const finals = learned.filter(l => l.finalForm);

  /* Every readable word taught so far, de-duplicated by its pointed form. */
  const seen = new Set();
  const words = [];
  for (const L of learned) {
    for (const w of L.wordsToRead || []) {
      if (seen.has(w.he)) continue;
      seen.add(w.he);
      words.push({ ...w, from: L });
    }
  }

  const title = R.final ? 'Revisão final - todo o alfabeto'
                        : `Revisão do módulo ${R.moduleN} - letras 1 a ${R.upTo}`;
  const label = R.final ? 'Revisão final · 22 letras'
                        : `Revisão do módulo ${R.moduleN} · letras 1 a ${R.upTo}`;
  const bdg = cont => badge(label + (cont ? ' · continuação' : ''));

  const sheets = [];

  /* ── the alphabet so far ─────────────────────────────────────────────
     Eight rows to a sheet: the letters print large, and at the final review
     this table is 22 rows deep. */
  const ROWS = 8;
  const groups = chunk(learned, ROWS);
  groups.forEach((g, gi) => {
    const rows = g.map(L => `<tr>
      <td class="center">${he(L.letter, { size: 'big' })}</td>
      <td class="center">${he(L.letter, { size: 'big', cursive: true })}</td>
      <td class="center">${L.finalForm ? he(L.finalForm, { size: 'big' }) : '<span class="hint">-</span>'}</td>
      <td>${esc(L.namePt)}</td>
      <td><strong class="kbd">${esc(L.translit || '-')}</strong></td>
      <td class="write-cell"></td>
    </tr>`).join('\n');

    sheets.push(`
    ${bdg(gi > 0)}
    <h1>${gi === 0 ? esc(title) : 'O alfabeto até aqui'}</h1>
    ${gi === 0 ? `<p class="lead">${R.final
      ? 'Você chegou ao fim do alfabeto. Esta revisão passa por todas as 22 letras, as 5 formas finais e todo o vocabulário que você já consegue ler.'
      : R.n === 1
        ? mixed([`Estas são as ${num(since.length)} primeiras letras do workbook: `, H(since.map(l => l.letter).join(' ')),
                 '. Revise-as com calma antes de seguir - tudo o que vem depois se apoia nelas.'])
        : mixed([`Revise tudo o que aprendeu até aqui. As ${num(since.length)} letras novas deste módulo são `,
                 H(since.map(l => l.letter).join(' ')),
                 ' - dê atenção especial a elas.'])}</p>` : ''}

    <h2>Atividade 1 - leia e escreva${groups.length > 1 ? ` (${gi + 1} de ${groups.length})` : ''}</h2>
    <p>Leia cada letra em voz alta e escreva-a em cursivo na última coluna.</p>
    <table>
      <thead><tr><th>Impressa</th><th>Cursiva</th><th>Final</th><th>Nome</th><th>Som</th><th>Escreva</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`);
  });

  /* ── names ───────────────────────────────────────────────────────────── */
  const nameOptions = shuffled(learned.map(l => l.namePt), rand);
  chunk(nameOptions, 12).forEach((g, gi, all) => {
    sheets.push(`
    ${bdg(true)}
    <h1>Atividade 2 - de que letra é este nome?${all.length > 1 ? ` (${gi + 1} de ${all.length})` : ''}</h1>
    <p class="lead">Escreva a letra hebraica ao lado de cada nome.</p>
    <div class="name-grid">
      ${g.map(n => `<div class="name-item"><span>${esc(n)}</span><span class="name-slot"></span></div>`).join('')}
    </div>`);
  });

  /* ── reading ─────────────────────────────────────────────────────────── */
  const readList = shuffled(words, rand).slice(0, 16);
  sheets.push(`
    ${bdg(true)}
    <h1>Atividade 3 - leia em voz alta</h1>
    <p class="lead">Todas estas palavras usam apenas letras que você já conhece. Leia devagar, depois mais rápido.</p>
    <p class="ex-task">${heList(readList.map(w => w.he), { size: 'word' })}</p>
    ${finals.length ? `
    <h2>Atividade 4 - as formas finais</h2>
    <p>Estas letras mudam de desenho no fim da palavra.</p>
    <table>
      <thead><tr><th>No meio da palavra</th><th>No fim da palavra</th><th>Nome</th></tr></thead>
      <tbody>${finals.map(L => `<tr>
        <td class="center">${he(L.letter, { size: 'word' })}</td>
        <td class="center">${he(L.finalForm, { size: 'word' })}</td>
        <td>${esc(L.namePt)}</td></tr>`).join('')}</tbody>
    </table>` : ''}`);

  /* ── completing and writing ──────────────────────────────────────────── */
  const gapList = shuffled(words, rand).slice(0, 5);
  const writeList = shuffled(words, rand).slice(0, 6);
  const n = finals.length ? 5 : 4;

  sheets.push(`
    ${bdg(true)}
    <h1>Atividade ${n} - complete a palavra</h1>
    <p class="lead">Falta uma letra em cada palavra. Escreva a palavra completa.</p>
    <table>
      <thead><tr><th>Incompleta</th><th>Significado</th><th>Palavra completa</th></tr></thead>
      <tbody>${gapList.map(w => `<tr>
        <td class="he-cell">${heCloze(gapFirst(w.he))}</td>
        <td>${esc(w.pt)}</td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>`);

  sheets.push(`
    ${bdg(true)}
    <h1>Atividade ${n + 1} - escreva em cursivo</h1>
    <table>
      <thead><tr><th>Leitura</th><th>Significado</th><th>Escreva em cursivo</th></tr></thead>
      <tbody>${writeList.map(w => `<tr>
        <td><strong class="kbd">${esc(w.translit)}</strong></td>
        <td>${esc(w.pt)}</td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>

    <h2>🎯 Ditado</h2>
    <p>Peça a alguém para ler cinco palavras da Atividade 3 em voz alta, ou grave a si mesmo e escute depois. Escreva o que ouvir.</p>
    <div class="dict-lines"><div>1.</div><div>2.</div><div>3.</div><div>4.</div><div>5.</div></div>

    ${callout('note', '🌟', R.final
      ? `<p><strong>Você terminou o alfabeto.</strong> Sabe reconhecer, ler e escrever as 22 letras e as 5 formas finais, e lê ${words.length} palavras inteiras. O próximo passo é a gramática - e a partir daqui você lê tudo o que encontrar pela frente.</p>`
      : `<p><strong>Bom trabalho.</strong> Se alguma letra ainda travou a leitura, volte ao módulo dela antes de seguir. Não há pressa: cada letra bem fixada torna a próxima mais fácil.</p>`)}`);

  return sheets;
}

/* Small counts read better spelled out in the opening line. */
const num = n => ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis',
                  'sete', 'oito'][n] || String(n);

/* The word with its first (rightmost) cluster blanked - a generic review gap,
   not tied to any one target letter. */
function gapFirst(word) {
  const cl = [];
  for (const ch of [...word]) {
    if (/[א-ת]/.test(ch) || !cl.length) cl.push(ch);
    else cl[cl.length - 1] += ch;
  }
  return [null, cl.slice(1).join('')];
}
