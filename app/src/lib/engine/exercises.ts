/* The exercise engine: what to ask, and in what order.
 * ─────────────────────────────────────────────────────────────────────────
 * Exercises are GENERATED from a letter's content plus the alphabet available
 * at that point in the course — never authored per lesson — for three reasons:
 *
 *   1. It is the only way the order rule can be guaranteed. A generator that
 *      is only ever handed `alphabetSoFar` cannot produce a distractor with an
 *      unlearned letter; a human authoring 22 × 13 questions by hand can, and
 *      eventually will. tests/order-rule.test.ts enumerates every exercise the
 *      course will ever generate and proves it.
 *
 *   2. The same primitives serve the lesson quiz, the checkpoint, the quick
 *      review, the reading gym and the final challenge. They differ in which
 *      items they draw from, not in what an exercise is.
 *
 *   3. Adding a word to data/letters.json adds it to every exercise type that
 *      can use it, in both the book and the app, with nothing else to touch.
 *
 * The generators themselves live in ./generators.ts; this file decides which
 * ones a given moment in the course should use.
 */

import type { Letter } from '@/lib/content';
import type { Skill } from '@/lib/state/types';
import { ALL_GLYPHS, isReadableWith } from '@/lib/hebrew';
import { rng, shuffled, type Rand } from './rng';
import {
  BY_SKILL, LESSON_GENERATORS, NEEDS_AUDIO, type Ctx, type Gen
} from './generators';
import type { Exercise } from './types';

export type { Exercise, ExerciseKind, ChoiceBase, ExerciseBase } from './types';
export { letterIdOf, isChoice, normalizeTyped, typedIsCorrect } from './types';

/* ── two different rules, and conflating them was a bug ──────────────────
   The order rule governs what the learner must READ: a word or a syllable may
   only use letters already taught, or the exercise is unanswerable and the
   course's central promise breaks.

   It does NOT govern a single-letter DISTRACTOR. "Qual destas é מ?" with ס as
   a wrong option is the exercise working as intended — telling מ from ס is
   precisely the skill, and it needs no knowledge of ס. The printed workbook
   does the same thing from its first page.

   Enforcing the strict rule on both left letter 1 with three questions,
   because with only מ and ם in hand there was no legal distractor to offer.
   So the two are separated here, and the tests check each one. */

/** Strings the learner is asked to READ. Subject to the order rule. */
export function readingUsedBy(ex: Exercise): string[] {
  const out: string[] = [];
  switch (ex.kind) {
    case 'syllable-reading':
    case 'word-meaning':
    case 'vowel-sound':
      out.push(ex.he);
      break;
    case 'complete-word':
      out.push(...ex.parts.filter((p): p is string => p != null));
      break;
    case 'meaning-to-word':
    case 'audio-recognition':
    case 'sound-to-syllable':
    case 'listen-syllable':
      out.push(...ex.options);
      break;
    case 'build-syllable':
      out.push(ex.target);
      break;
    case 'build-word':
      /* Both: the finished word and every tile, since a tile is shown on its
         own and must be legible on its own. */
      out.push(ex.target, ...ex.tiles);
      break;
    case 'match':
      if (ex.leftKind === 'reading') out.push(...ex.pairs.map(p => p.left));
      if (ex.rightKind === 'reading') out.push(...ex.pairs.map(p => p.right));
      break;
    case 'type-answer':
      if (ex.he) out.push(ex.he);
      break;
    default:
      break;
  }
  return out;
}

/** Single glyphs offered as options. Must be real letters; may be untaught. */
export function glyphOptionsOf(ex: Exercise): string[] {
  switch (ex.kind) {
    case 'letter-recognition':
    case 'print-vs-cursive':
    case 'final-form':
    case 'complete-word':
    case 'odd-one-out':
      return ex.options;
    case 'match':
      /* A letter↔sound match puts single glyphs on the left; a word or
         syllable match puts reading material there, and that is handled by
         readingUsedBy instead. The side says which it is. */
      return [
        ...(ex.leftKind === 'glyph' ? ex.pairs.map(p => p.left) : []),
        ...(ex.rightKind === 'glyph' ? ex.pairs.map(p => p.right) : [])
      ];
    default:
      return [];
  }
}

/** Reading material that breaks the order rule. Empty is the only valid answer. */
export function violatesOrderRule(ex: Exercise, alphabet: readonly string[]): string[] {
  return readingUsedBy(ex).filter(s => !isReadableWith(s, alphabet));
}

/* ── building a set ─────────────────────────────────────────────────────── */

export type BuildOptions = {
  /** Audio exercises are dropped unless a recording exists. See ARCHITECTURE §6.3. */
  audioAvailable?: boolean;
  count?: number;
  seed?: string;
  /** Restrict to the generators that train these skills. */
  skills?: readonly Skill[];
};

function contextFor(L: Letter, history: Letter[]): Ctx {
  return {
    history: history.filter(x => x.order <= L.order),
    alphabet: L.alphabetSoFar,
    allGlyphs: [...ALL_GLYPHS]
  };
}

const generatorsFor = (skills: readonly Skill[] | undefined): readonly Gen[] => {
  if (!skills?.length) return LESSON_GENERATORS;
  const wanted = new Set(skills.flatMap(s => BY_SKILL[s] ?? []));
  /* Keep LESSON_GENERATORS' order — it is the one that alternates gestures. */
  return LESSON_GENERATORS.filter(g => wanted.has(g));
};

/**
 * Fill a set by walking the generator list in order, round after round.
 *
 * Walking IN ORDER rather than at random is what makes a lesson feel varied:
 * the list alternates gesture (recognise, read, assemble, pair, type), so the
 * first five questions are five different actions. Random selection produces
 * three multiple-choice questions in a row about one letter in eight.
 */
function fill(
  letters: readonly Letter[], history: Letter[], gens: readonly Gen[],
  rand: Rand, count: number, audioAvailable: boolean, rounds = 4
): Exercise[] {
  const out: Exercise[] = [];
  const seen = new Set<string>();
  if (!letters.length || !gens.length) return out;

  /* Both indices advance together. The generator index moves every step, so no
     two consecutive questions share a gesture; the letter index also moves
     every step, so a set covering six letters does not spend its first six
     questions on the first letter — which is what a generator-per-letter loop
     produced, and it made every checkpoint feel like a lesson about one thing. */
  const steps = gens.length * Math.max(letters.length, 1) * rounds;
  const ctxCache = new Map<string, Ctx>();
  for (let k = 0; k < steps && out.length < count; k++) {
    const gen = gens[k % gens.length]!;
    const L = letters[k % letters.length]!;
    if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
    let ctx = ctxCache.get(L.id);
    if (!ctx) { ctx = contextFor(L, history); ctxCache.set(L.id, ctx); }
    const ex = gen(L, ctx, rand, Math.floor(k / gens.length));
    if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
  }
  return out;
}

/**
 * Break up runs of the same gesture.
 *
 * The generator walk alternates kinds by construction, but the fallback pass —
 * the one that tops up a checkpoint whose rotation came up short — does not,
 * and it produced "ligue cada letra ao seu som" twice in a row at the end of a
 * checkpoint. Two identical gestures back to back is the exact thing the new
 * engine exists to prevent, so it is fixed here rather than hoped away.
 *
 * Always take the kind with the most items LEFT, skipping the one just used.
 * Taking the first available instead is the obvious version and it fails at the
 * tail: it happily spends the varied items early and leaves the last three
 * questions all typing. Emptying the biggest pile first is what guarantees a
 * gap-free arrangement whenever one exists at all.
 *
 * If every remaining item is the same kind, it stays — a set of six matches
 * really is six matches, and reordering cannot change that.
 */
const hasRun = (list: Exercise[]): boolean =>
  list.some((ex, i) => i > 0 && ex.kind === list[i - 1]!.kind);

export function spread(list: Exercise[]): Exercise[] {
  /* The generator walk usually gets this right on its own, and its order is
     also the pedagogical one — recognition early, typing late. Leave it alone
     unless it actually broke. */
  if (!hasRun(list)) return list;

  /* Stable repair first: pull forward the next item of a different kind, and
     change nothing else. */
  const rest = [...list];
  const stable: Exercise[] = [];
  while (rest.length) {
    const prevKind = stable.length ? stable[stable.length - 1]!.kind : null;
    let idx = 0;
    if (prevKind && rest[0]!.kind === prevKind) {
      const alt = rest.findIndex(e => e.kind !== prevKind);
      if (alt > 0) idx = alt;
    }
    stable.push(rest.splice(idx, 1)[0]!);
  }
  if (!hasRun(stable)) return stable;

  /* Only if that still leaves a run — which happens when the varied items were
     spent early and the tail is all one kind — fall back to emptying the
     biggest pile first, which finds an arrangement whenever one exists. */
  const byKind = new Map<string, Exercise[]>();
  for (const ex of list) {
    const bucket = byKind.get(ex.kind);
    if (bucket) bucket.push(ex); else byKind.set(ex.kind, [ex]);
  }

  const out: Exercise[] = [];
  let prev: string | null = null;
  while (out.length < list.length) {
    let pick: string | null = null;
    let most = 0;
    for (const [kind, items] of byKind) {
      if (!items.length || kind === prev) continue;
      if (items.length > most) { most = items.length; pick = kind; }
    }
    /* Nothing but the previous kind is left. */
    if (pick == null) {
      for (const [kind, items] of byKind) if (items.length) { pick = kind; break; }
    }
    if (pick == null) break;
    out.push(byKind.get(pick)!.shift()!);
    prev = pick;
  }
  return out;
}

/** The quiz that closes a letter lesson. Mixed by design. */
export function buildLessonQuiz(
  L: Letter, history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 8, seed = `quiz-${L.id}`, skills } = opts;
  return spread(fill([L], history, generatorsFor(skills), rng(seed), count, audioAvailable, 4));
}

/** A checkpoint: the whole module, one generator per letter per round. */
export function buildCheckpoint(
  letters: Letter[], history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const {
    audioAvailable = false, count = 12,
    seed = `cp-${letters.map(l => l.id).join('-')}`, skills
  } = opts;
  const rand = rng(seed);
  const gens = generatorsFor(skills);
  const out: Exercise[] = [];
  const seen = new Set<string>();

  /* One generator per letter per round, rotating — so a twelve-question
     checkpoint covers six letters in six different ways rather than asking the
     same thing six times. */
  for (let round = 0; round < 6 && out.length < count; round++) {
    for (const L of letters) {
      if (out.length >= count) break;
      const ctx = contextFor(L, history);
      const gen = gens[(round * 3 + L.order) % gens.length]!;
      if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
      const ex = gen(L, ctx, rand, round);
      if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  /* If the rotation came up short — a module of two-letter lessons with few
     words — fall back to the ordinary fill rather than a thin checkpoint. */
  if (out.length < count) {
    for (const ex of fill(letters, history, gens, rand, count - out.length, audioAvailable, 4)) {
      if (!seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return spread(out.slice(0, count));
}

/**
 * The quick review, built from what this learner actually missed.
 *
 * `weak` is a list of letter ids ordered by how much trouble they gave;
 * `focusSkills`, when given, narrows to the dimension that is failing — a
 * learner who reads ק and cannot hear it should get listening, not more
 * reading.
 */
export function buildReview(
  weak: string[], all: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const {
    audioAvailable = false, count = 5,
    seed = `rev-${weak.join('-')}-${all.length}`, skills
  } = opts;
  const rand = rng(seed);
  const target = weak
    .map(id => all.find(l => l.id === id))
    .filter((l): l is Letter => !!l);
  const pool = target.length ? target : all;
  const gens = generatorsFor(skills);
  const out: Exercise[] = [];
  const seen = new Set<string>();

  for (let round = 0; round < 6 && out.length < count; round++) {
    for (const L of pool) {
      if (out.length >= count) break;
      const ctx = contextFor(L, all);
      const gen = gens[(round * 5 + L.order) % gens.length]!;
      if (!audioAvailable && NEEDS_AUDIO.has(gen)) continue;
      const ex = gen(L, ctx, rand, round);
      if (ex && !seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  if (out.length < count) {
    for (const ex of fill(pool, all, gens, rand, count - out.length, audioAvailable, 4)) {
      if (!seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return spread(out.slice(0, count));
}

/**
 * A drill for one confusion pair this learner actually has.
 *
 * Both letters, both directions, mixed gestures: find it in a row, tell it from
 * its twin, read a word that contains it. `a` is the letter whose place the
 * learner keeps giving to `b`.
 */
export function buildConfusionDrill(
  a: Letter, b: Letter, opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 6, seed = `conf-${a.id}-${b.id}` } = opts;
  const rand = rng(seed);
  const history = [a, b].sort((x, y) => x.order - y.order);
  const gens = generatorsFor(['rec', 'ler']);
  const out = fill(shuffled([a, b], rand), history, gens, rand, count, audioAvailable, 4);
  return spread(out.slice(0, count));
}
