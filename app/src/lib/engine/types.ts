/* What an exercise IS.
 * ─────────────────────────────────────────────────────────────────────────
 * Sixteen kinds, and the point of having sixteen is that they are different
 * GESTURES, not different content in the same gesture. The course used to have
 * eight kinds that were all "read a Portuguese question, tap one of four
 * boxes" - a learner performed that one action about 286 times over 22 letters.
 *
 * Every exercise declares two things the old engine only guessed at:
 *
 *   · `letterId` - which letter it belongs to. It used to be derived by
 *     splitting the id on a hyphen, which worked until an id changed shape.
 *   · `skill` - which of the five dimensions it tests. This is what lets the
 *     system know that a learner reads ק well and cannot hear it.
 *
 * And one the old engine had no room for: `whyPt`, a reason per OPTION. "Você
 * escolheu מִ, mas o som era מַ" teaches; "Errado" does not.
 */

import type { Skill } from '@/lib/state/types';

export type ExerciseBase = {
  id: string;
  letterId: string;
  skill: Skill;
  promptPt: string;
  /** Shown after answering, whatever the answer was. */
  explainPt: string;
  /**
   * The hint ladder. First a nudge, then something concrete; the answer itself
   * is never a hint. Optional - an exercise with nothing useful to withhold
   * simply has none, which is better than a hint that gives the game away.
   */
  hintsPt?: string[];
  /** A recording the learner may replay while deciding. Never a penalty. */
  audioId?: string | null;
};

/** Anything answered by picking one of a list. */
export type ChoiceBase = ExerciseBase & {
  options: string[];
  answer: number;
  /** Aligned with `options`: why THIS one was wrong. Sparse. */
  whyPt?: (string | null)[];
};

export type Exercise =
  /* ── pick one of four (the original eight, now typed) ─────────────── */
  | (ChoiceBase & { kind: 'letter-recognition'; letter: string })
  | (ChoiceBase & { kind: 'print-vs-cursive'; letter: string })
  | (ChoiceBase & { kind: 'final-form'; letter: string })
  | (ChoiceBase & { kind: 'syllable-reading'; he: string })
  | (ChoiceBase & { kind: 'word-meaning'; he: string })
  | (ChoiceBase & { kind: 'meaning-to-word'; pt: string })
  | (ChoiceBase & { kind: 'complete-word'; parts: (string | null)[]; hintPt: string })
  | (ChoiceBase & { kind: 'audio-recognition'; audioId: string })

  /* ── vowels, which the course taught and never tested ─────────────── */
  /** A syllable is shown; which vowel sound is it. Tests the SIGN, not the letter. */
  | (ChoiceBase & { kind: 'vowel-sound'; he: string })
  /** The sound is given; find the syllable that spells it. The reverse direction. */
  | (ChoiceBase & { kind: 'sound-to-syllable'; sound: string })
  /** Two syllables that differ only in their vowel, played. */
  | (ChoiceBase & { kind: 'listen-syllable'; audioId: string })

  /* ── discrimination ───────────────────────────────────────────────── */
  /** A row of the same glyph with one intruder. Options ARE the row. */
  | (ChoiceBase & { kind: 'odd-one-out' })

  /* ── construction: the learner assembles, rather than recognises ──── */
  | (ExerciseBase & {
      kind: 'build-syllable';
      /** The finished syllable, for checking. */
      target: string;
      /** The consonant, already on screen. */
      consonant: string;
      /** Vowel parts to choose from - marks, shown on a dotted carrier. */
      vowels: string[];
      answer: number;
      /** How the target reads, e.g. "ma". */
      sound: string;
    })
  | (ExerciseBase & {
      kind: 'build-word';
      target: string;
      /** The word's clusters, shuffled. Tapped in reading order. */
      tiles: string[];
      hintPt: string;
    })

  /* ── pairing, tap-one-then-its-match (never drag) ─────────────────── */
  | (ExerciseBase & {
      kind: 'match';
      pairs: { left: string; right: string }[];
      /**
       * What each side holds, which decides both how it is rendered and which
       * half of the order rule applies to it:
       *   glyph   - a single Hebrew letter; may be one the learner has not met
       *   reading - Hebrew the learner must decode; every letter must be known
       *   text    - Portuguese
       * Guessing this from string length was a bug: a pointed syllable is two
       * codepoints and read as a bare glyph.
       */
      leftKind: 'glyph' | 'reading' | 'text';
      rightKind: 'glyph' | 'reading' | 'text';
      labelLeft: string;
      labelRight: string;
    })

  /* ── the world outside the course ─────────────────────────────────── */
  /**
   * A word as it is actually met - on a bottle, a door, a menu - with the
   * place named and the Hebrew alone on a plain surface.
   *
   * The final challenge is built from these, because the question it has to
   * answer is not "do you remember lesson 14" but "can you read the thing in
   * front of you". Every scene is drawn from vocabulary the course taught and
   * carries the order of the letter that unlocked it, so it is always legible.
   */
  | (ChoiceBase & {
      kind: 'scene-reading';
      he: string;
      /** Where it is met: "na garrafa d'água do supermercado". */
      wherePt: string;
    })

  /* ── production: typing, which is retrieval rather than recognition ─ */
  | (ExerciseBase & {
      kind: 'type-answer';
      /** Shown, when there is something to read. */
      he?: string;
      /** Everything counted as correct, already normalised by `normalizeTyped`. */
      accept: string[];
      placeholder: string;
      /** What the box wants: 'translit' | 'meaning'. */
      want: 'translit' | 'meaning';
    });

export type ExerciseKind = Exercise['kind'];

/** Which letter an exercise belongs to. Stored, not parsed out of the id. */
export const letterIdOf = (ex: Exercise): string => ex.letterId;

/** Every kind that is answered by picking an index. */
export const isChoice = (ex: Exercise): ex is Extract<Exercise, { options: string[] }> =>
  'options' in ex && Array.isArray((ex as { options?: unknown }).options);

/**
 * Typed answers, compared forgivingly.
 *
 * A Brazilian typing a transliteration on a phone keyboard should not be marked
 * wrong for the accent the course itself only uses as a stress hint, for
 * capitals, or for a stray space. The one thing this does NOT do is collapse
 * letters that carry meaning - sh and s stay different, because telling שׁ from
 * שׂ is a thing the course teaches.
 */
export function normalizeTyped(text: string): string {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // á → a: stress marks are a hint, not the answer
    .toLowerCase()
    .replace(/['’`´-]/g, '')            // a typed geresh or hyphen is not a mistake
    .replace(/\s+/g, ' ')
    .trim();
}

export const typedIsCorrect = (typed: string, accept: readonly string[]): boolean => {
  const t = normalizeTyped(typed);
  return t.length > 0 && accept.some(a => normalizeTyped(a) === t);
};
