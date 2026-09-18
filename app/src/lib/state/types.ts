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
};

export type Achievement = {
  id: string;
  unlockedAt: string;
};

export type DayRecord = {
  /** Exercises answered that day — the unit of "meaningful practice". */
  answered: number;
  xp: number;
  goalMet: boolean;
};

export type LearnerState = {
  version: 1;
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
};

export const EMPTY_STATE: LearnerState = {
  version: 1,
  onboarding: null,
  xp: 0,
  lessons: {},
  checkpoints: {},
  srs: {},
  achievements: [],
  days: {},
  streak: { current: 0, longest: 0, lastDay: null },
  lastRoute: null,
  finalChallenge: { best: null, completedAt: null }
};

export interface ProgressStore {
  load(): Promise<LearnerState>;
  save(state: LearnerState): Promise<void>;
  clear(): Promise<void>;
}
