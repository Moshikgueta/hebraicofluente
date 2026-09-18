/* Exercises for modules 6 and 7 — the two units that teach no new letter.
 *
 * They need question types the 22 letter lessons never do, and the difference
 * is not cosmetic:
 *
 *   · `dagesh-sound` asks which of two sounds a letter has IN THIS WORD. It is
 *     the only exercise in the course whose answer depends on position rather
 *     than on the glyph, which is exactly the skill module 6 exists to build.
 *   · `unpointed-read` removes the nikud. Every other reading exercise in the
 *     course is pointed, because a beginner needs the vowels; real Hebrew has
 *     none, and this is where the course admits it.
 *   · `gerech-sound` covers the three modern sounds.
 *
 * The order rule does not constrain anything here: these modules come after
 * letter 22, so the whole alphabet is available. What still holds is that the
 * words are the ones the learner already met — they come from data/extras.json,
 * which validate.js V19 checks against data/letters.json.
 */

import type { Exercise } from './exercises';
import { rng, shuffled, take, type Rand } from './rng';

export type DageshLetter = {
  id: string;
  namePt: string;
  hard: string;
  soft: string;
  hardPt: string;
  softPt: string;
  hardWords: { he: string; translit: string; pt: string; audioId: string }[];
  softWords: { he: string; translit: string; pt: string; audioId: string }[];
  notePt: string;
};

export type FinalForm = {
  base: string; fin: string; namePt: string; nameHe: string;
  word: string; translit: string; pt: string; descends: boolean; audioId: string;
};

export type GerechLetter = {
  id: string; he: string; base: string; basePt: string; pt: string; likePt: string;
  audioId: string;
  words: { he: string; pt: string; audioId: string }[];
};

export type Extras = {
  dagesh: { titlePt: string; rulePt: string; warningPt: string; letters: DageshLetter[] };
  finals: FinalForm[];
  unpointed: {
    introPt: string;
    words: { bare: string; pointed: string; translit: string; pt: string; audioId: string }[];
  };
  gerech: {
    titlePt: string; signNamePt: string; signHe: string;
    introPt: string; signNotePt: string; letters: GerechLetter[];
  };
};

/* The extra kinds, added to the shared Exercise union via the same shape the
   player already knows how to render: a prompt, options, an answer, a reason. */
export type ExtraExercise = Exercise;

const optionsWith = (correct: string, wrong: string[], rand: Rand) => {
  const unique = [...new Set([correct, ...wrong])];
  const options = shuffled(unique, rand);
  return { options, answer: options.indexOf(correct) };
};

/* ── module 6 ───────────────────────────────────────────────────────────── */

export function buildDageshQuiz(extras: Extras, count = 10, seed = 'mod6'): Exercise[] {
  const rand = rng(seed);
  const out: Exercise[] = [];

  /* One "which sound does it have here?" per word, hard and soft interleaved
     so the answer is never predictable from position in the list. */
  const rows = extras.dagesh.letters.flatMap(D => [
    ...D.hardWords.map(w => ({ D, w, isHard: true })),
    ...D.softWords.map(w => ({ D, w, isHard: false }))
  ]);

  for (const [i, row] of shuffled(rows, rand).entries()) {
    const correct = row.isHard ? row.D.hardPt : row.D.softPt;
    const wrong = row.isHard ? row.D.softPt : row.D.hardPt;
    const { options, answer } = optionsWith(correct, [wrong], rand);
    out.push({
      id: `mod6-dag-${row.D.id}-${i}`,
      kind: 'word-meaning',
      promptPt: `Nesta palavra, a letra tem que som?`,
      he: row.w.he,
      options,
      answer,
      explainPt: `${row.w.he} — ${row.w.translit} — ${row.w.pt}. ` +
        (row.isHard
          ? 'Com daguesh: no começo da palavra ou depois de consoante.'
          : 'Sem daguesh: entre vogais, ou no fim da palavra.')
    });
  }

  /* The five finals, against each other. */
  for (const [i, F] of extras.finals.entries()) {
    const wrong = extras.finals.filter(x => x.fin !== F.fin).map(x => x.fin);
    const { options, answer } = optionsWith(F.fin, take(wrong, 3, rand), rand);
    out.push({
      id: `mod6-fin-${i}`,
      kind: 'final-form',
      promptPt: `Qual destas é a forma final de ${F.namePt.replace(' sofit', '')}?`,
      letter: F.base,
      options,
      answer,
      explainPt: `${F.base} vira ${F.fin} no fim da palavra — como em ${F.word} (${F.translit}), "${F.pt}".`
    });
  }

  /* Unpointed reading: the real test of the module. */
  for (const [i, u] of extras.unpointed.words.entries()) {
    const wrong = extras.unpointed.words.filter(x => x.bare !== u.bare).map(x => x.pt);
    const { options, answer } = optionsWith(u.pt, take(wrong, 3, rand), rand);
    out.push({
      id: `mod6-unp-${i}`,
      kind: 'word-meaning',
      promptPt: 'Sem nikud, como num jornal. O que está escrito?',
      he: u.bare,
      options,
      answer,
      explainPt: `${u.bare} é ${u.pointed} — ${u.translit} — "${u.pt}".`
    });
  }

  return shuffled(out, rng(seed + '-order')).slice(0, count);
}

/* ── module 7 ───────────────────────────────────────────────────────────── */

export function buildGerechQuiz(extras: Extras, count = 8, seed = 'mod7'): Exercise[] {
  const rand = rng(seed);
  const out: Exercise[] = [];
  const G = extras.gerech.letters;

  /* With the sign versus without it: the whole point of the module. */
  for (const [i, g] of G.entries()) {
    const { options, answer } = optionsWith(g.pt, G.filter(x => x.id !== g.id).map(x => x.pt).concat(g.basePt), rand);
    out.push({
      id: `mod7-snd-${i}`,
      kind: 'syllable-reading',
      promptPt: 'Que som esta letra tem?',
      he: g.he,
      options,
      answer,
      explainPt: `${g.he} é ${g.pt} — ${g.likePt}. Sem o gerech, ${g.base} é ${g.basePt}.`
    });
    const bare = optionsWith(g.basePt, G.map(x => x.pt), rand);
    out.push({
      id: `mod7-base-${i}`,
      kind: 'syllable-reading',
      promptPt: 'E sem o sinal — que som ela tem?',
      he: g.base,
      options: bare.options,
      answer: bare.answer,
      explainPt: `Sem o gerech, ${g.base} é ${g.basePt}. Com ele, ${g.he} é ${g.pt}.`
    });
  }

  /* The loanwords: read a word you already know in Portuguese. */
  const words = G.flatMap(g => g.words.map(w => ({ g, w })));
  for (const [i, { g, w }] of shuffled(words, rand).entries()) {
    const wrong = words.filter(x => x.w.he !== w.he).map(x => x.w.pt);
    const { options, answer } = optionsWith(w.pt, take(wrong, 3, rand), rand);
    out.push({
      id: `mod7-word-${i}`,
      kind: 'word-meaning',
      promptPt: 'Leia em voz alta. Que palavra é esta?',
      he: w.he,
      options,
      answer,
      explainPt: `${w.he} — "${w.pt}". O ${g.he} faz o som ${g.pt}.`
    });
  }

  return shuffled(out, rng(seed + '-order')).slice(0, count);
}
