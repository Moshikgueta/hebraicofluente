/* The generators: one function per exercise kind.
 * ─────────────────────────────────────────────────────────────────────────
 * Each takes a letter, the context of what the learner has met, a seeded
 * random source and a round number, and returns an exercise or null. Returning
 * null is normal and load-bearing: at letter 1 there is no word to build and no
 * final form to find, and a generator that invented one would break the order
 * rule or the truth.
 *
 * Distractors are chosen with intent, never at random. `confusableWith` holds
 * the letters that actually get mixed up - ד against ר, מ against ס, ב against
 * ו - so a wrong option teaches the distinction the learner needs instead of
 * being obviously wrong.
 */

import type { Letter, Syllable, Word } from '@/lib/content';
import {
  BASE_TO_FINAL, clusters, containsLetter, gapAtLetter, gappedGlyph, onCarrier,
  splitSyllable
} from '@/lib/hebrew';
import { shuffled, take, type Rand } from './rng';
import type { Exercise } from './types';

export type Ctx = {
  /** The letters taught so far, in order - the pool WORD distractors come from. */
  history: Letter[];
  /** Glyphs (base + final) the learner has met. Governs reading material. */
  alphabet: string[];
  /** Every glyph in the language, for single-letter distractors. */
  allGlyphs: string[];
};

export type Gen = (L: Letter, ctx: Ctx, rand: Rand, round: number) => Exercise | null;

/* ── shared helpers ─────────────────────────────────────────────────────── */

/** Deduped, shuffled, with the index of the right answer. */
function optionsWith<T>(correct: T, wrong: T[], rand: Rand): { options: T[]; answer: number } {
  const unique = [...new Set([correct, ...wrong])];
  const options = shuffled(unique, rand);
  return { options, answer: options.indexOf(correct) };
}

function letterDistractors(L: Letter, ctx: Ctx, rand: Rand, n: number): string[] {
  const confusable = L.confusableWith.filter(c => c !== L.letter);
  const learned = ctx.alphabet.filter(c => c !== L.letter && !confusable.includes(c));
  const rest = ctx.allGlyphs.filter(
    c => c !== L.letter && c !== L.finalForm && !confusable.includes(c) && !learned.includes(c)
  );
  return [...shuffled(confusable, rand), ...shuffled(learned, rand), ...shuffled(rest, rand)].slice(0, n);
}

const wordDistractors = (target: Word, pool: readonly Word[], rand: Rand, n: number): Word[] =>
  take(pool.filter(w => w.he !== target.he), n, rand);

/** Syllables that spell a vowel. Shevá is excluded: it is the absence of one. */
const vowelSyllables = (L: Letter): Syllable[] => L.syllables.filter(s => s.vowel !== 'sheva');

const at = <T,>(arr: readonly T[], i: number): T | undefined =>
  arr.length ? arr[i % arr.length] : undefined;

/** The five vowel sounds, in the order the course teaches them. */
const VOWEL_ORDER = ['a', 'e', 'i', 'o', 'u'] as const;

/* ── recognition ────────────────────────────────────────────────────────── */

export const exLetterRecognition: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-rec-${i}`, kind: 'letter-recognition', letterId: L.id, skill: 'rec',
    promptPt: `Qual destas é a letra ${L.namePt}?`,
    letter: L.letter, options, answer,
    whyPt: options.map(o => o === L.letter ? null : `Essa não é ${L.namePt}.`),
    hintsPt: [L.soundNotePt],
    explainPt: `${L.namePt} faz o som ${L.sound}.`
  };
};

export const exPrintVsCursive: Gen = (L, ctx, rand, i) => {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-cur-${i}`, kind: 'print-vs-cursive', letterId: L.id, skill: 'rec',
    promptPt: 'Qual destas é a mesma letra, escrita à mão?',
    letter: L.letter, options, answer,
    explainPt: 'A cursiva é o que se escreve à mão; a de imprensa é o que se lê.'
  };
};

export const exFinalForm: Gen = (L, ctx, rand, i) => {
  if (!L.finalForm) return null;
  const otherFinals = Object.values(BASE_TO_FINAL).filter(f => f !== L.finalForm);
  const plain = ctx.allGlyphs.filter(
    c => c !== L.letter && c !== L.finalForm && !otherFinals.includes(c)
  );
  const wrong = [...new Set([...shuffled(otherFinals, rand), ...shuffled(plain, rand)])];
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.finalForm, wrong.slice(0, 3), rand);
  return {
    id: `${L.id}-fin-${i}`, kind: 'final-form', letterId: L.id, skill: 'rec',
    promptPt: `Qual é a forma final de ${L.namePt}, a que aparece no fim da palavra?`,
    letter: L.letter, options, answer,
    hintsPt: ['Quase todas as formas finais descem abaixo da linha.'],
    explainPt: 'Mesmo som, outro desenho - e quase sempre descendo abaixo da linha.'
  };
};

/**
 * A row of the same letter with one intruder.
 *
 * This is the drill for the thing Brazilian learners actually lose time on:
 * ד and ר differ by one corner, ב and כ by one, ה and ח by a gap. Reading them
 * apart is a visual skill, and it is trained by looking, not by reasoning.
 */
export const exOddOneOut: Gen = (L, _ctx, rand, i) => {
  const intruder = L.confusableWith.filter(c => c !== L.letter)[i % Math.max(1, L.confusableWith.length)];
  if (!intruder) return null;
  const size = 6;
  const answer = Math.floor(rand() * size);
  const options = Array.from({ length: size }, (_, k) => (k === answer ? intruder : L.letter));
  return {
    id: `${L.id}-odd-${i}`, kind: 'odd-one-out', letterId: L.id, skill: 'rec',
    promptPt: `Uma destas não é ${L.namePt}. Qual?`,
    options, answer,
    whyPt: options.map((o, k) => k === answer ? null : `Essa é ${L.namePt}.`),
    explainPt: `A intrusa era ${intruder} - repare no que muda no desenho.`
  };
};

/* ── the vowels ─────────────────────────────────────────────────────────── */

/**
 * The syllable is on screen; which vowel is it?
 *
 * The course had 132 syllables in its data and tested them once, with
 * transliterations as the options - which asks about the whole syllable. This
 * asks about the SIGN, which is the half a learner has to generalise: the
 * patach under מ is the same patach under ק.
 */
export const exVowelSound: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i);
  if (!target) return null;
  const present = new Set(pool.map(s => s.vowel));
  const options: string[] = VOWEL_ORDER.filter(v => present.has(v));
  if (options.length < 3) return null;
  const answer = options.indexOf(target.vowel);
  if (answer < 0) return null;
  const byVowel = new Map(pool.map(s => [s.vowel, s]));
  return {
    id: `${L.id}-vow-${i}`, kind: 'vowel-sound', letterId: L.id, skill: 'som',
    promptPt: 'Que vogal está escrita aqui?',
    he: target.he,
    options, answer,
    audioId: target.audioId,
    whyPt: options.map(v => v === target.vowel ? null
      : `${byVowel.get(v)?.translit ?? v} se escreve de outro jeito.`),
    hintsPt: ['Olhe só o sinal, ignore a consoante.'],
    explainPt: `${target.translit} - ${target.ptApprox}.`
  };
};

/** The sound is given; find the spelling. The direction the course never asked. */
export const exSoundToSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i + 1);
  if (!target || pool.length < 3) return null;
  const wrong = pool.filter(s => s.he !== target.he).map(s => s.he);
  const { options, answer } = optionsWith(target.he, take(wrong, 3, rand), rand);
  const byHe = new Map(pool.map(s => [s.he, s]));
  return {
    id: `${L.id}-s2s-${i}`, kind: 'sound-to-syllable', letterId: L.id, skill: 'ler',
    promptPt: `Qual destas se lê “${target.translit}”?`,
    sound: target.translit,
    options, answer,
    whyPt: options.map(o => o === target.he ? null : `Essa lê-se “${byHe.get(o)?.translit ?? '?'}”.`),
    explainPt: `${target.translit} - ${target.ptApprox}.`
  };
};

/**
 * Two syllables of the same consonant, differing only in the vowel, played.
 *
 * Needs a recording, and is withheld without one: a listening exercise
 * answered from a synthetic voice teaches the wrong sound and the learner
 * never finds out.
 */
export const exListenSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L).filter(s => s.audioId);
  const target = at(pool, i);
  if (!target || pool.length < 3) return null;
  const wrong = pool.filter(s => s.he !== target.he).map(s => s.he);
  const { options, answer } = optionsWith(target.he, take(wrong, 2, rand), rand);
  const byHe = new Map(pool.map(s => [s.he, s]));
  return {
    id: `${L.id}-lsy-${i}`, kind: 'listen-syllable', letterId: L.id, skill: 'ouvir',
    promptPt: 'Qual destas sílabas você ouviu?',
    audioId: target.audioId,
    options, answer,
    whyPt: options.map(o => o === target.he ? null
      : `Você escolheu “${byHe.get(o)?.translit}”, mas o som era “${target.translit}”.`),
    hintsPt: ['Ouça de novo e preste atenção só na vogal.'],
    explainPt: `${target.he} - ${target.translit}. ${target.ptApprox}.`
  };
};

/* ── construction ───────────────────────────────────────────────────────── */

/**
 * Consonant plus vowel, assembled by the learner.
 *
 * This is the operation the whole course is about, and it was the one thing
 * nobody was ever asked to perform. Tapping a vowel composes it onto the
 * consonant on screen, so the learner watches the sign attach rather than
 * being told that it does.
 */
export const exBuildSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const target = at(pool, i);
  if (!target || pool.length < 3) return null;
  const { consonant } = splitSyllable(target.he);
  const parts = pool.map(s => splitSyllable(s.he).vowel);
  const correct = splitSyllable(target.he).vowel;
  const wrong = parts.filter(v => v !== correct);
  const { options, answer } = optionsWith(correct, take(wrong, 3, rand), rand);
  if (options.length < 3) return null;
  return {
    id: `${L.id}-bsy-${i}`, kind: 'build-syllable', letterId: L.id, skill: 'ler',
    promptPt: `Monte a sílaba “${target.translit}”.`,
    target: target.he, consonant, vowels: options, answer, sound: target.translit,
    audioId: target.audioId,
    hintsPt: [`${target.ptApprox}.`],
    explainPt: `${target.he} - ${target.translit}. O sinal vale o mesmo em qualquer consoante.`
  };
};

/**
 * The word, in pieces, in the wrong order.
 *
 * Right to left is not a decoration here: a learner who assembles שָׁלוֹם from
 * the left has not read it. The tiles are CLUSTERS - consonant plus its own
 * marks - because anything smaller would put a vowel sign on the table with
 * nothing to sit on.
 */
export const exBuildWord: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => {
    const n = clusters(w.he).length;
    return n >= 2 && n <= 5;
  });
  const target = at(usable, i);
  if (!target) return null;
  const tiles = clusters(target.he);
  /* A two-tile word has exactly one wrong order, which makes the exercise a
     coin toss rather than a reading. */
  if (tiles.length < 3) return null;
  let shuffledTiles = shuffled(tiles, rand);
  if (shuffledTiles.join('') === tiles.join('')) shuffledTiles = [...shuffledTiles].reverse();
  return {
    id: `${L.id}-bwd-${i}`, kind: 'build-word', letterId: L.id, skill: 'ler',
    promptPt: `Monte a palavra “${target.pt}”.`,
    target: target.he, tiles: shuffledTiles, hintPt: target.translit,
    audioId: target.audioId,
    hintsPt: ['Comece pela direita - a primeira letra da palavra fica desse lado.'],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

/* ── pairing ────────────────────────────────────────────────────────────── */

/**
 * Tap one, tap its pair. Never drag.
 *
 * Drag-and-drop on a phone is a precision task performed with the blunt end of
 * a finger, and a learner who drops a tile two pixels off gets punished for
 * their hand rather than their Hebrew. Two taps work at any size and are also
 * the only version that works with a keyboard or a screen reader.
 */
export const exMatchLetterSound: Gen = (L, ctx, rand, i) => {
  const pool = [L, ...ctx.history.filter(x => x.id !== L.id).slice(-5)];
  const chosen = take(pool, 4, rand);
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-mls-${i}`, kind: 'match', letterId: L.id, skill: 'som',
    promptPt: 'Ligue cada letra ao seu som.',
    pairs: chosen.map(x => ({ left: x.letter, right: x.sound })),
    leftKind: 'glyph', rightKind: 'text',
    labelLeft: 'Letra', labelRight: 'Som',
    explainPt: 'O som é a única coisa que a forma da letra não mostra - é o que precisa ser decorado.'
  };
};

export const exMatchWordMeaning: Gen = (L, ctx, rand, i) => {
  const pool = [...L.wordsToRead, ...ctx.history.flatMap(x => x.wordsToRead)];
  const seen = new Set<string>();
  const unique = pool.filter(w => !seen.has(w.he) && seen.add(w.he));
  const chosen = take(unique, 4, rand);
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-mwm-${i}`, kind: 'match', letterId: L.id, skill: 'ler',
    promptPt: 'Ligue cada palavra ao seu significado.',
    pairs: chosen.map(w => ({ left: w.he, right: w.pt })),
    leftKind: 'reading', rightKind: 'text',
    labelLeft: 'Hebraico', labelRight: 'Português',
    explainPt: 'Ler é reconhecer o bloco inteiro, não uma letra de cada vez.'
  };
};

export const exMatchSyllable: Gen = (L, _ctx, rand, i) => {
  const pool = vowelSyllables(L);
  const chosen = take(pool, 4, rand);
  if (chosen.length < 3) return null;
  return {
    id: `${L.id}-msy-${i}`, kind: 'match', letterId: L.id, skill: 'ler',
    promptPt: 'Ligue cada sílaba à sua leitura.',
    pairs: chosen.map(s => ({ left: s.he, right: s.translit })),
    leftKind: 'reading', rightKind: 'text',
    labelLeft: 'Sílaba', labelRight: 'Leitura',
    explainPt: 'A consoante é sempre a mesma. O que muda é o sinal.'
  };
};

/* ── production ─────────────────────────────────────────────────────────── */

/**
 * Typing, which is retrieval rather than recognition - and much harder, so it
 * is offered only where the answer is short and unambiguous, with a hint ladder
 * that starts with the first letter.
 *
 * Matching is forgiving by design (`normalizeTyped`): accents are a stress hint
 * in this course, not part of the answer, and a Brazilian on a phone keyboard
 * should never lose a question to á versus a.
 */
export const exTypeTranslit: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => w.translit.length <= 9 && !w.translit.includes(' '));
  const target = at(usable, i);
  if (!target) return null;
  return {
    id: `${L.id}-typ-${i}`, kind: 'type-answer', letterId: L.id, skill: 'ler',
    promptPt: 'Leia a palavra e escreva como ela soa.',
    he: target.he,
    accept: [target.translit],
    placeholder: 'escreva aqui',
    want: 'translit',
    audioId: target.audioId,
    hintsPt: [
      `Começa com “${target.translit[0]}”.`,
      `São ${target.translit.length} letras.`
    ],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

export const exTypeHeard: Gen = (L, _ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => w.audioId && w.translit.length <= 9);
  const target = at(usable, i);
  if (!target) return null;
  return {
    id: `${L.id}-tph-${i}`, kind: 'type-answer', letterId: L.id, skill: 'ouvir',
    promptPt: 'Escreva o que você ouviu.',
    accept: [target.translit],
    placeholder: 'escreva aqui',
    want: 'translit',
    audioId: target.audioId,
    hintsPt: [`Começa com “${target.translit[0]}”.`, `Quer dizer “${target.pt}”.`],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

/* ── reading (the original four) ────────────────────────────────────────── */

export const exSyllableReading: Gen = (L, _ctx, rand, i) => {
  const s = vowelSyllables(L);
  const target = at(s, i);
  if (!target) return null;
  const wrong = s.filter(x => x.translit !== target.translit).map(x => x.translit);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.translit, take(wrong, 2, rand), rand);
  return {
    id: `${L.id}-syl-${i}`, kind: 'syllable-reading', letterId: L.id, skill: 'ler',
    promptPt: 'Como se lê esta sílaba?',
    he: target.he, options, answer,
    audioId: target.audioId,
    explainPt: target.ptApprox
  };
};

export const exWordMeaning: Gen = (L, ctx, rand, i) => {
  const target = at(L.wordsToRead, i);
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.pt);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.pt, wrong, rand);
  return {
    id: `${L.id}-mean-${i}`, kind: 'word-meaning', letterId: L.id, skill: 'ler',
    promptPt: 'Leia a palavra. O que ela quer dizer?',
    he: target.he, options, answer,
    audioId: target.audioId,
    hintsPt: [`Começa com o som “${target.translit[0]}”.`],
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

export const exMeaningToWord: Gen = (L, ctx, rand, i) => {
  const target = at(L.wordsToRead, i + 1);
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.he, wrong, rand);
  return {
    id: `${L.id}-m2w-${i}`, kind: 'meaning-to-word', letterId: L.id, skill: 'ler',
    promptPt: `Qual destas palavras quer dizer “${target.pt}”?`,
    pt: target.pt, options, answer,
    explainPt: `${target.he} - ${target.translit}`
  };
};

export const exCompleteWord: Gen = (L, ctx, rand, i) => {
  const usable = L.wordsToRead.filter(w => containsLetter(w.he, L.letter));
  const target = at(usable, i);
  if (!target) return null;
  const correct = gappedGlyph(target.he, L.letter);
  const wrong = letterDistractors(L, ctx, rand, 3).filter(c => c !== correct);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(correct, wrong.slice(0, 3), rand);
  return {
    id: `${L.id}-gap-${i}`, kind: 'complete-word', letterId: L.id, skill: 'ler',
    promptPt: 'Falta uma letra. Qual delas completa a palavra?',
    parts: gapAtLetter(target.he, L.letter),
    hintPt: target.pt, options, answer,
    audioId: target.audioId,
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

export const exAudioWord: Gen = (L, ctx, rand, i) => {
  const target = at(L.wordsToRead, i);
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.he, wrong, rand);
  return {
    id: `${L.id}-aud-${i}`, kind: 'audio-recognition', letterId: L.id, skill: 'ouvir',
    promptPt: 'Qual palavra você ouviu?',
    audioId: target.audioId, options, answer,
    explainPt: `${target.he} - ${target.translit} - ${target.pt}`
  };
};

/* ── the catalogue ──────────────────────────────────────────────────────── */

/** Every generator that needs a recording to be honest. */
export const NEEDS_AUDIO = new Set<Gen>([exAudioWord, exListenSyllable, exTypeHeard]);

/**
 * The order a lesson walks through. Deliberately alternating in GESTURE, not
 * just in content: recognise, then read, then assemble, then pair, then type.
 * A learner should not be able to settle into one motion.
 */
export const LESSON_GENERATORS: readonly Gen[] = [
  exLetterRecognition,
  exSyllableReading,
  exBuildSyllable,
  exWordMeaning,
  exOddOneOut,
  exVowelSound,
  exCompleteWord,
  exMatchSyllable,
  exSoundToSyllable,
  exBuildWord,
  exFinalForm,
  exListenSyllable,
  exMeaningToWord,
  exTypeTranslit,
  exMatchWordMeaning,
  exPrintVsCursive,
  exAudioWord,
  exMatchLetterSound,
  exTypeHeard
];

/** Skill → the generators that exercise it, for targeted practice. */
export const BY_SKILL: Record<string, readonly Gen[]> = {
  rec: [exLetterRecognition, exOddOneOut, exFinalForm, exPrintVsCursive],
  som: [exVowelSound, exMatchLetterSound],
  ler: [exSyllableReading, exBuildSyllable, exSoundToSyllable, exWordMeaning,
        exCompleteWord, exBuildWord, exMeaningToWord, exMatchSyllable,
        exMatchWordMeaning, exTypeTranslit],
  ouvir: [exListenSyllable, exAudioWord, exTypeHeard],
  /* Writing is produced on a canvas, not generated as a question - see
     components/learn/Tracing.tsx. The key exists so callers can ask for any
     skill without a special case. */
  escrever: []
};

export { onCarrier };
