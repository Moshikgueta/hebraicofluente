/* The exercise generator.
 * ─────────────────────────────────────────────────────────────────────────
 * One engine, 22 letters. Exercises are GENERATED from a letter's content plus
 * the alphabet available at that point in the course — they are not authored
 * per lesson, for three reasons:
 *
 *   1. It is the only way the order rule can be guaranteed. A generator that
 *      is only ever handed `alphabetSoFar` cannot produce a distractor with an
 *      unlearned letter; a human authoring 22 × 8 questions by hand can, and
 *      eventually will. tests/order-rule.test.ts enumerates every exercise the
 *      course will ever generate and proves it.
 *
 *   2. The same primitives serve the lesson quiz, the checkpoint, the quick
 *      review and the final challenge. They differ in which items they draw
 *      from, not in what an exercise is.
 *
 *   3. Adding a word to data/letters.json adds it to every exercise type that
 *      can use it, in both the book and the app, with nothing else to touch.
 *
 * Distractors are chosen with intent, not at random: `confusableWith` holds the
 * letters that actually get mixed up (ד/ר, מ/ס, ב/ו), so the wrong options
 * teach the distinction the learner needs rather than being obviously wrong.
 */

import type { Letter, Word } from '@/lib/content';
import { ALL_GLYPHS, BASE_TO_FINAL, containsLetter, gapAtLetter, gappedGlyph, isReadableWith } from '@/lib/hebrew';
import { rng, shuffled, take, type Rand } from './rng';

export type Exercise =
  | { id: string; kind: 'letter-recognition'; promptPt: string; letter: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'print-vs-cursive'; promptPt: string; letter: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'final-form'; promptPt: string; letter: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'syllable-reading'; promptPt: string; he: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'word-meaning'; promptPt: string; he: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'meaning-to-word'; promptPt: string; pt: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'complete-word'; promptPt: string; parts: (string | null)[]; hintPt: string; options: string[]; answer: number; explainPt: string }
  | { id: string; kind: 'audio-recognition'; promptPt: string; audioId: string; options: string[]; answer: number; explainPt: string };

export type ExerciseKind = Exercise['kind'];

/* ── two different rules, and conflating them was a bug ──────────────────
   The order rule governs what the learner must READ: a word or a syllable may
   only use letters already taught, or the exercise is unanswerable and the
   course's central promise breaks.

   It does NOT govern a single-letter DISTRACTOR. "Qual destas é מ?" with ס as
   a wrong option is the exercise working as intended — telling מ from ס is
   precisely the skill, and it needs no knowledge of ס. The printed workbook
   does the same thing from its first page (templates/letter.js draws
   distractors from confusableWith, falling back to the whole alefbet).

   Enforcing the strict rule on both left letter 1 with three questions,
   because with only מ and ם in hand there was no legal distractor to offer.
   So the two are separated here, and the tests check each one. */

/** Strings the learner is asked to READ. Subject to the order rule. */
export function readingUsedBy(ex: Exercise): string[] {
  const out: string[] = [];
  if ('he' in ex) out.push(ex.he);
  if ('parts' in ex) out.push(...ex.parts.filter((p): p is string => p != null));
  /* Options are reading material only when they are whole words. */
  if (ex.kind === 'meaning-to-word' || ex.kind === 'audio-recognition') out.push(...ex.options);
  return out;
}

/** Single glyphs offered as options. Must be real letters; may be untaught. */
export function glyphOptionsOf(ex: Exercise): string[] {
  switch (ex.kind) {
    case 'letter-recognition':
    case 'print-vs-cursive':
    case 'final-form':
    case 'complete-word':
      return ex.options;
    default:
      return [];
  }
}

type Ctx = {
  /** The letters taught so far, in order — the pool WORD distractors come from. */
  history: Letter[];
  /** Glyphs (base + final) the learner has met. Governs reading material. */
  alphabet: string[];
  /** Every glyph in the language, for single-letter distractors. */
  allGlyphs: string[];
};

/* ── distractor selection ───────────────────────────────────────────────── */

function letterDistractors(L: Letter, ctx: Ctx, rand: Rand, n: number): string[] {
  /* Confusables first — they are the whole point of a recognition exercise:
     ד against ר, מ against ס, ב against ו. Then letters already learned, which
     make the question feel connected to the course. Then the rest of the
     alphabet, which is what keeps letter 1 answerable at all. */
  const confusable = L.confusableWith.filter(c => c !== L.letter);
  const learned = ctx.alphabet.filter(c => c !== L.letter && !confusable.includes(c));
  const rest = ctx.allGlyphs.filter(
    c => c !== L.letter && c !== L.finalForm && !confusable.includes(c) && !learned.includes(c)
  );
  const pool = [
    ...shuffled(confusable, rand), ...shuffled(learned, rand), ...shuffled(rest, rand)
  ];
  return pool.slice(0, n);
}

function wordDistractors(target: Word, pool: readonly Word[], rand: Rand, n: number): Word[] {
  return take(pool.filter(w => w.he !== target.he), n, rand);
}

/* Deduping here rather than in each generator: the distractor pools overlap
   (a final form is both "another final" and "a letter in the alphabet"), and a
   question that offers the same option twice has two right answers. */
const optionsWith = <T,>(correct: T, wrong: T[], rand: Rand): { options: T[]; answer: number } => {
  const unique = [...new Set([correct, ...wrong])];
  const options = shuffled(unique, rand);
  return { options, answer: options.indexOf(correct) };
};

/* ── generators ─────────────────────────────────────────────────────────── */

function exLetterRecognition(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-rec-${i}`, kind: 'letter-recognition',
    promptPt: `Qual destas é a letra ${L.namePt}?`,
    letter: L.letter, options, answer,
    explainPt: `${L.namePt} faz o som ${L.sound}.`
  };
}

function exPrintVsCursive(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const wrong = letterDistractors(L, ctx, rand, 3);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.letter, wrong, rand);
  return {
    id: `${L.id}-cur-${i}`, kind: 'print-vs-cursive',
    promptPt: 'Qual destas é a mesma letra, escrita à mão?',
    letter: L.letter, options, answer,
    explainPt: 'A cursiva é o que se escreve à mão; a de imprensa é o que se lê.'
  };
}

function exFinalForm(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  if (!L.finalForm) return null;
  /* Other finals make the best distractors, then ordinary letters. Both pools
     are drawn from ctx.alphabet, which CONTAINS the finals — so they overlap,
     and without the dedupe the same glyph appeared twice as an option. The
     order-rule test caught exactly that on Nun. */
  const otherFinals = Object.values(BASE_TO_FINAL).filter(f => f !== L.finalForm);
  const plain = ctx.allGlyphs.filter(
    c => c !== L.letter && c !== L.finalForm && !otherFinals.includes(c)
  );
  const wrong = [...new Set([...shuffled(otherFinals, rand), ...shuffled(plain, rand)])];
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(L.finalForm, wrong.slice(0, 3), rand);
  return {
    id: `${L.id}-fin-${i}`, kind: 'final-form',
    promptPt: `Qual é a forma final de ${L.namePt}, a que aparece no fim da palavra?`,
    letter: L.letter, options, answer,
    explainPt: 'Mesmo som, outro desenho — e quase sempre descendo abaixo da linha.'
  };
}

function exSyllableReading(L: Letter, _ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const s = L.syllables.filter(x => x.vowel !== 'sheva');
  const target = s[i % Math.max(1, s.length)];
  if (!target) return null;
  const wrong = s.filter(x => x.translit !== target.translit).map(x => x.translit);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.translit, take(wrong, 2, rand), rand);
  return {
    id: `${L.id}-syl-${i}`, kind: 'syllable-reading',
    promptPt: 'Como se lê esta sílaba?',
    he: target.he, options, answer,
    explainPt: target.ptApprox
  };
}

function exWordMeaning(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const readable = L.wordsToRead;
  const target = readable[i % Math.max(1, readable.length)];
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.pt);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.pt, wrong, rand);
  return {
    id: `${L.id}-mean-${i}`, kind: 'word-meaning',
    promptPt: 'Leia a palavra. O que ela quer dizer?',
    he: target.he, options, answer,
    explainPt: `${target.he} — ${target.translit} — ${target.pt}`
  };
}

function exMeaningToWord(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const readable = L.wordsToRead;
  const target = readable[(i + 1) % Math.max(1, readable.length)];
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.he, wrong, rand);
  return {
    id: `${L.id}-m2w-${i}`, kind: 'meaning-to-word',
    promptPt: `Qual destas palavras quer dizer "${target.pt}"?`,
    pt: target.pt, options, answer,
    explainPt: `${target.he} — ${target.translit}`
  };
}

function exCompleteWord(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  /* Only words that actually CONTAIN the target: "complete com ה" on a word
     with no he asks for a letter that was never there. */
  const usable = L.wordsToRead.filter(w => containsLetter(w.he, L.letter));
  const target = usable[i % Math.max(1, usable.length)];
  if (!target) return null;
  const correct = gappedGlyph(target.he, L.letter);
  const wrong = letterDistractors(L, ctx, rand, 3).filter(c => c !== correct);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(correct, wrong.slice(0, 3), rand);
  return {
    id: `${L.id}-gap-${i}`, kind: 'complete-word',
    promptPt: 'Falta uma letra. Qual delas completa a palavra?',
    parts: gapAtLetter(target.he, L.letter),
    hintPt: target.pt, options, answer,
    explainPt: `${target.he} — ${target.translit} — ${target.pt}`
  };
}

function exAudio(L: Letter, ctx: Ctx, rand: Rand, i: number): Exercise | null {
  const target = L.wordsToRead[i % Math.max(1, L.wordsToRead.length)];
  if (!target) return null;
  const pool = ctx.history.flatMap(x => x.wordsToRead);
  const wrong = wordDistractors(target, pool, rand, 3).map(w => w.he);
  if (wrong.length < 2) return null;
  const { options, answer } = optionsWith(target.he, wrong, rand);
  return {
    id: `${L.id}-aud-${i}`, kind: 'audio-recognition',
    promptPt: 'Qual palavra você ouviu?',
    audioId: target.audioId, options, answer,
    explainPt: `${target.he} — ${target.translit} — ${target.pt}`
  };
}

const GENERATORS = [
  exLetterRecognition, exSyllableReading, exWordMeaning, exCompleteWord,
  exFinalForm, exMeaningToWord, exPrintVsCursive, exAudio
] as const;

/* ── the public surface ─────────────────────────────────────────────────── */

export type BuildOptions = {
  /** Audio exercises are dropped unless a recording exists. See ARCHITECTURE §6.3. */
  audioAvailable?: boolean;
  count?: number;
  seed?: string;
};

function contextFor(L: Letter, history: Letter[]): Ctx {
  return {
    history: history.filter(x => x.order <= L.order),
    alphabet: L.alphabetSoFar,
    allGlyphs: [...ALL_GLYPHS]
  };
}

/** The quiz that closes a letter lesson. 5–8 questions, mixed by design. */
export function buildLessonQuiz(
  L: Letter, history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 8, seed = `quiz-${L.id}` } = opts;
  const rand = rng(seed);
  const ctx = contextFor(L, history);
  const out: Exercise[] = [];
  const seen = new Set<string>();

  for (let round = 0; round < 3 && out.length < count; round++) {
    for (const gen of GENERATORS) {
      if (out.length >= count) break;
      if (gen === exAudio && !audioAvailable) continue;
      const ex = gen(L, ctx, rand, round);
      if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return out;
}

/** A checkpoint: the whole module, weighted toward its later letters. */
export function buildCheckpoint(
  letters: Letter[], history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 12, seed = `cp-${letters.map(l => l.id).join('-')}` } = opts;
  const rand = rng(seed);
  const out: Exercise[] = [];
  const seen = new Set<string>();

  for (let round = 0; round < 4 && out.length < count; round++) {
    for (const L of letters) {
      if (out.length >= count) break;
      const ctx = contextFor(L, history);
      const gen = GENERATORS[(round + L.order) % GENERATORS.length]!;
      if (gen === exAudio && !audioAvailable) continue;
      const ex = gen(L, ctx, rand, round);
      if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return out;
}

/**
 * The quick review, built from what this learner actually missed. `weak` is a
 * list of letter ids ordered by how much trouble they gave.
 */
export function buildReview(
  weak: string[], all: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 5, seed = `rev-${weak.join('-')}-${all.length}` } = opts;
  const rand = rng(seed);
  const target = weak
    .map(id => all.find(l => l.id === id))
    .filter((l): l is Letter => !!l);
  const pool = target.length ? target : all.slice(0, Math.max(1, all.length));
  const out: Exercise[] = [];
  const seen = new Set<string>();

  for (let round = 0; round < 5 && out.length < count; round++) {
    for (const L of pool) {
      if (out.length >= count) break;
      const ctx = contextFor(L, all);
      const gen = GENERATORS[(round * 3 + L.order) % GENERATORS.length]!;
      if (gen === exAudio && !audioAvailable) continue;
      const ex = gen(L, ctx, rand, round);
      if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return out;
}

/** Which letter an exercise belongs to, for the SRS. */
export const letterIdOf = (ex: Exercise): string => ex.id.split('-')[0] ?? '';

/** Reading material that breaks the order rule. Empty is the only valid answer. */
export function violatesOrderRule(ex: Exercise, alphabet: readonly string[]): string[] {
  return readingUsedBy(ex).filter(s => !isReadableWith(s, alphabet));
}
