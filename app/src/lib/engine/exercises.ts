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
    case 'scene-reading':
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
  /**
   * Exactly these generators, in this order. Takes precedence over `skills`.
   * The reading gym uses it: a mode is defined by the exercises it contains
   * ("sílabas"), not by a skill taxonomy ("ler"), and round-tripping one
   * through the other loses the distinction.
   */
  gens?: readonly Gen[];
};

function contextFor(L: Letter, history: Letter[]): Ctx {
  return {
    history: history.filter(x => x.order <= L.order),
    alphabet: L.alphabetSoFar,
    allGlyphs: [...ALL_GLYPHS]
  };
}

const generatorsFor = (
  skills: readonly Skill[] | undefined, gens?: readonly Gen[]
): readonly Gen[] => {
  if (gens?.length) return gens;
  if (!skills?.length) return LESSON_GENERATORS;
  const wanted = new Set(skills.flatMap(s => BY_SKILL[s] ?? []));
  /* Keep LESSON_GENERATORS' order — it is the one that alternates gestures. */
  const narrowed = LESSON_GENERATORS.filter(g => wanted.has(g));
  /* `escrever` has no generated question at all: writing is produced on a
     canvas, not answered. Asking for it left this empty, and an empty
     generator list made the builders index into nothing and throw. A narrowing
     that cannot be honoured is dropped, not crashed on. */
  return narrowed.length ? narrowed : LESSON_GENERATORS;
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
  const { audioAvailable = false, count = 8, seed = `quiz-${L.id}`, skills, gens } = opts;
  return spread(fill([L], history, generatorsFor(skills, gens), rng(seed), count, audioAvailable, 4));
}

/**
 * A checkpoint: the module, across every modality it taught.
 *
 * Twelve questions drawn at random from the same pool as a lesson is not a
 * checkpoint, it is a longer lesson — and the old one was exactly that. What
 * makes this feel like a demonstration of mastery is that it covers the
 * DIMENSIONS deliberately: shape, sound, reading, and listening once there are
 * recordings. A learner who can recognise every letter and hear none of them
 * should not be able to pass by drawing twelve recognition questions.
 *
 * Nothing new is taught here, by design: a checkpoint that introduces material
 * is a lesson wearing a badge.
 */
export function buildCheckpoint(
  letters: Letter[], history: Letter[], opts: BuildOptions = {}
): Exercise[] {
  const {
    audioAvailable = false, count = 12,
    seed = `cp-${letters.map(l => l.id).join('-')}`, skills, gens: only
  } = opts;
  const rand = rng(seed);

  /* An explicit narrowing wins: the reading gym and the tests ask for one. */
  if (skills?.length || only?.length) {
    const gens = generatorsFor(skills, only);
    return spread(fill(letters, history, gens, rand, count, audioAvailable, 6));
  }

  const dimensions: Skill[] = audioAvailable
    ? ['rec', 'som', 'ler', 'ouvir']
    : ['rec', 'som', 'ler'];
  /* Reading gets the remainder: it is what the course is for. */
  const per = Math.floor(count / dimensions.length);

  const out: Exercise[] = [];
  const seen = new Set<string>();
  const push = (list: Exercise[]) => {
    for (const ex of list) {
      if (out.length >= count) return;
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      out.push(ex);
    }
  };

  for (const skill of dimensions) {
    const want = skill === 'ler' ? count - per * (dimensions.length - 1) : per;
    push(fill(letters, history, generatorsFor([skill]), rand, want, audioAvailable, 6));
  }
  /* A dimension can come up short — a module with no words has little to read —
     so the rest is topped up from everything. */
  if (out.length < count) {
    push(fill(letters, history, LESSON_GENERATORS, rand, count - out.length, audioAvailable, 6));
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
    seed = `rev-${weak.join('-')}-${all.length}`, skills, gens: only
  } = opts;
  const rand = rng(seed);
  const target = weak
    .map(id => all.find(l => l.id === id))
    .filter((l): l is Letter => !!l);
  const pool = target.length ? target : all;
  const gens = generatorsFor(skills, only);
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

  /* Last resort: widen back to every generator.
     A narrowed review can legitimately come up empty — asking for `ouvir`
     before any recording exists leaves nothing at all — and an empty review is
     the worst possible answer: the learner is told the course cannot build
     them five questions when it plainly can. Aiming at the failing skill is a
     preference, not a promise. */
  if (!out.length && (skills?.length || only?.length)) {
    for (const ex of fill(pool, all, LESSON_GENERATORS, rand, count, audioAvailable, 4)) {
      if (!seen.has(ex.id)) { seen.add(ex.id); out.push(ex); }
    }
  }
  return spread(out.slice(0, count));
}

/**
 * The final challenge: the alphabet, and then the street.
 *
 * It opens as a checkpoint over all 22 letters and ends on the real-world
 * scenes — a word on a bottle, a word on a door, a word on a menu — because
 * the question the last screen of this course has to answer is not "do you
 * remember lesson 14" but "can you read the thing in front of you".
 *
 * Scenes go LAST and are never diluted: a learner who has just worked through
 * twenty questions about letters should finish by reading Hebrew that was not
 * written for them.
 */
export function buildFinalChallenge(
  letters: Letter[], scenes: readonly SceneLike[], opts: BuildOptions = {}
): Exercise[] {
  const { audioAvailable = false, count = 20, seed = 'final' } = opts;
  const rand = rng(seed);
  /* A third of the run, at most six: enough to change what the challenge is
     about, not so many that the letters stop being tested. */
  const wanted = Math.min(6, Math.max(3, Math.round(count / 3)));
  const sceneItems = buildScenes(scenes, rand, wanted);
  const core = buildCheckpoint(letters, letters, {
    audioAvailable, count: count - sceneItems.length, seed: `${seed}-core`
  });
  return [...core, ...sceneItems];
}

/** What a scene needs to be, so the engine does not import the content module. */
export type SceneLike = {
  id: string; he: string; pt: string; translit: string;
  labelPt: string; contextPt: string; audioId: string; fromOrder: number;
};

export function buildScenes(
  scenes: readonly SceneLike[], rand: Rand, count: number
): Exercise[] {
  const pool = shuffled(scenes, rand).slice(0, count);
  return pool.map((s, i) => {
    /* Distractors are other scenes' meanings: all plausible, all things a
       learner might meet, none of them a giveaway. */
    const others = shuffled(scenes.filter(x => x.id !== s.id), rand).slice(0, 3).map(x => x.pt);
    const unique = [...new Set([s.pt, ...others])];
    const options = shuffled(unique, rand);
    return {
      id: `scene-${s.id}-${i}`,
      kind: 'scene-reading' as const,
      letterId: 'final',
      skill: 'ler' as const,
      promptPt: 'Leia. O que está escrito?',
      he: s.he,
      wherePt: s.labelPt,
      options,
      answer: options.indexOf(s.pt),
      audioId: s.audioId,
      explainPt: `${s.he} — ${s.translit} — ${s.pt}. ${s.contextPt}`
    };
  }).filter(e => e.answer >= 0 && e.options.length >= 3);
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
