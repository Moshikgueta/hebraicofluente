/* The learner's state. One shape, two adapters (localStorage now, Supabase
 * when there are keys), so nothing above this line knows where it is stored. */

export type DailyGoalMinutes = 5 | 10 | 15 | 20;

export type Onboarding = {
  reason: 'viagem' | 'familia' | 'morar' | 'idiomas' | 'trabalho' | 'outro';
  goalMinutes: DailyGoalMinutes;
  startingPoint: 'zero' | 'algumas-letras' | 'leio-um-pouco';
  name?: string;
  completedAt: string;
};

/** Progress inside one letter lesson: which of the five stages are done. */
export type LessonProgress = {
  letterId: string;
  stagesDone: number[];
  quizBest: number | null;       // 0..1
  quizAttempts: number;
  perfectBonusPaid: boolean;     // the +10 is once per letter, not per retry
  completedAt: string | null;
};

export type CheckpointProgress = {
  id: string;
  best: number | null;           // 0..1
  attempts: number;
  passedAt: string | null;
};

/** One Leitner box per item the learner got wrong. */
export type SrsItem = {
  itemId: string;                // letter id, or `${letterId}:${word}`
  letterId: string;
  box: 0 | 1 | 2 | 3 | 4;
  misses: number;
  hits: number;
  dueOn: string;                 // YYYY-MM-DD
  lastSeen: string;
  /** Which of the five skills this item exercised. Absent on v1 rows. */
  skill?: Skill;
};

/* ── the five skills ────────────────────────────────────────────────────
   "Knowing a letter" is not one thing, and treating it as one was the old
   model's central flaw: it could not tell a learner who recognises ם but
   cannot write it from one who writes it and confuses its sound. These are the
   five dimensions the course actually teaches, and every exercise declares
   which one it is testing.

     rec      — pick this letter out of a row (shape)
     som      — which sound it makes (letter ↔ sound, both directions)
     ler      — decode it inside a syllable or a word
     ouvir    — identify it from a recording
     escrever — produce the shape by hand

   Kept deliberately coarse. A learner never sees "domínio: 93,482%", and the
   system never pretends to a precision it does not have. */
export type Skill = 'rec' | 'som' | 'ler' | 'ouvir' | 'escrever';

export const SKILLS: readonly Skill[] = ['rec', 'som', 'ler', 'ouvir', 'escrever'];

export const SKILL_LABEL: Record<Skill, string> = {
  rec: 'Reconhecimento',
  som: 'Som',
  ler: 'Leitura',
  ouvir: 'Audição',
  escrever: 'Escrita'
};

export type SkillStat = {
  hits: number;
  misses: number;
  /** Consecutive correct answers. Resets to 0 on a miss — the honest signal
   *  that something was relearned rather than merely met often. */
  streak: number;
  lastOn: string | null;         // YYYY-MM-DD
};

/** What the learner knows about one letter, per skill. Sparse: a skill with no
 *  attempts has no entry, which is different from a skill with a bad record. */
export type LetterSkills = Partial<Record<Skill, SkillStat>>;

/**
 * How often this learner picked B when the answer was A.
 *
 * `confusableWith` in the content names the pairs that TEND to be mixed up;
 * this records the ones THIS learner actually mixes up, which is the difference
 * between a generic course and an adaptive one. Keyed `correct>chosen`.
 */
export type Confusion = {
  correct: string;
  chosen: string;
  n: number;
  lastOn: string;
};

export type Achievement = {
  id: string;
  unlockedAt: string;
};

export type DayRecord = {
  /** Questions answered that day. Kept for analytics and for honesty. */
  answered: number;
  /**
   * Practice credit toward the daily goal, in 20-second units.
   *
   * Counting only answered questions was wrong and the full-course simulation
   * caught it: a complete letter lesson is eight questions, so a learner who
   * did exactly one lesson a day — five stages of reading, listening, tracing
   * and writing — never met a ten-minute goal and never built a streak. Most of
   * the learning in this course is not a multiple-choice answer.
   */
  units: number;
  xp: number;
  goalMet: boolean;
};

/** The current shape. Bump this and add a step to `migrate()` — never both
 *  silently, and never a shape change without a migration. */
export const STATE_VERSION = 2;

export type LearnerState = {
  version: 2;
  onboarding: Onboarding | null;
  xp: number;
  lessons: Record<string, LessonProgress>;
  checkpoints: Record<string, CheckpointProgress>;
  srs: Record<string, SrsItem>;
  achievements: Achievement[];
  days: Record<string, DayRecord>;  // YYYY-MM-DD
  streak: { current: number; longest: number; lastDay: string | null };
  lastRoute: string | null;
  finalChallenge: { best: number | null; completedAt: string | null };

  /* ── added in v2 ──────────────────────────────────────────────────── */

  /** Per-letter, per-skill record. Drives review, the dashboard and which
   *  exercise kind a letter gets offered next. */
  skills: Record<string, LetterSkills>;
  /** `correct>chosen` → how often. Feeds the confusion drills. */
  confusions: Record<string, Confusion>;
  /** Milestones that are moments rather than badges: the first word read with
   *  no transliteration on screen, the first letter written from memory. Stored
   *  as ISO timestamps so each can only happen once. */
  firsts: Record<string, string>;
  /** One record per reading-gym mode. See `GymRecord`. */
  gym: Record<string, GymRecord>;
};

/**
 * What a reading-gym mode remembers between sessions.
 *
 * `previousSeconds` exists so the result screen can say "da última vez, 41 s"
 * AFTER this run has already been written — otherwise the comparison is
 * against the run the learner just finished, which is always a tie.
 *
 * The times are the learner's own and nothing else. There is no target and no
 * average: "you were faster than last time" is motivating, "you are slower
 * than most people" is a reason to stop.
 */
export type GymRecord = {
  runs: number;
  /** Best score, 0–1. */
  best: number | null;
  /** Best time in seconds, for the timed modes only. */
  bestSeconds: number | null;
  /** How long the most recent run took. */
  lastSeconds: number | null;
  /** How long the run BEFORE that took — what the result screen compares to. */
  previousSeconds: number | null;
  lastOn: string;
};

export const EMPTY_STATE: LearnerState = {
  version: 2,
  onboarding: null,
  xp: 0,
  lessons: {},
  checkpoints: {},
  srs: {},
  achievements: [],
  days: {},
  streak: { current: 0, longest: 0, lastDay: null },
  lastRoute: null,
  finalChallenge: { best: null, completedAt: null },
  skills: {},
  confusions: {},
  firsts: {},
  gym: {}
};

export interface ProgressStore {
  load(): Promise<LearnerState>;
  save(state: LearnerState): Promise<void>;
  clear(): Promise<void>;
}
