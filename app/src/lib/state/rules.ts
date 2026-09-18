/* The learning-state rules: XP, streak, progress, achievements.
 *
 * Every function here is pure — state in, state out, with the day passed as an
 * argument rather than read from the clock. That is what makes the streak
 * testable without mocking time, and it is the reason these rules live apart
 * from the React store. */

import type {
  Achievement, CheckpointProgress, DayRecord, LearnerState, LessonProgress, SrsItem
} from './types';

export const today = (d: Date = new Date()): string => {
  /* Local date, not UTC: a learner practising at 22h in São Paulo must get
     credit for that day, not the next one. */
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (isoDay: string, n: number): string => {
  const [y, m, d] = isoDay.split('-').map(Number) as [number, number, number];
  const dt = new Date(y, m - 1, d + n);
  return today(dt);
};

export const daysBetween = (a: string, b: string): number => {
  const [ay, am, ad] = a.split('-').map(Number) as [number, number, number];
  const [by, bm, bd] = b.split('-').map(Number) as [number, number, number];
  const ms = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.round(ms / 86_400_000);
};

/* ── XP ─────────────────────────────────────────────────────────────────
   XP represents learning, so every award is tied to an answered question or a
   completed stage. Navigation pays nothing, and re-running a lesson does not
   re-pay its one-time bonuses. */

export const XP = {
  stage: 5,
  lesson: 20,
  perfectQuiz: 10,
  checkpoint: 50,
  review: 15,
  dailyGoal: 5
} as const;

/** How many answered exercises a daily goal is worth. ~20s per item. */
export const goalTarget = (minutes: number): number => Math.max(3, Math.round(minutes * 3));

/* ── streak ─────────────────────────────────────────────────────────────
   A day counts when the learner meets the goal they chose. Breaking it costs
   nothing but the counter: no XP is removed, and the longest run is kept, so
   coming back is never a fresh start. */

export function applyPractice(
  state: LearnerState, day: string, answered: number
): LearnerState {
  const goal = state.onboarding?.goalMinutes ?? 10;
  const target = goalTarget(goal);
  const prev: DayRecord = state.days[day] ?? { answered: 0, xp: 0, goalMet: false };
  const next: DayRecord = { ...prev, answered: prev.answered + answered };

  let xp = state.xp;
  let streak = state.streak;

  if (!prev.goalMet && next.answered >= target) {
    next.goalMet = true;
    next.xp = prev.xp + XP.dailyGoal;
    xp += XP.dailyGoal;

    const last = streak.lastDay;
    const current = last == null ? 1 : daysBetween(last, day) === 1 ? streak.current + 1 : 1;
    streak = { current, longest: Math.max(streak.longest, current), lastDay: day };
  }

  return { ...state, xp, days: { ...state.days, [day]: next }, streak };
}

/** The streak as it should be DISPLAYED, which is not always what is stored:
 *  a run that ended yesterday is still alive until today ends. */
export function displayStreak(state: LearnerState, day: string): number {
  const { current, lastDay } = state.streak;
  if (!lastDay || current === 0) return 0;
  const gap = daysBetween(lastDay, day);
  return gap <= 1 ? current : 0;
}

export function awardXp(state: LearnerState, day: string, amount: number): LearnerState {
  const prev: DayRecord = state.days[day] ?? { answered: 0, xp: 0, goalMet: false };
  return {
    ...state,
    xp: state.xp + amount,
    days: { ...state.days, [day]: { ...prev, xp: prev.xp + amount } }
  };
}

/* ── lessons ────────────────────────────────────────────────────────────── */

export const emptyLesson = (letterId: string): LessonProgress => ({
  letterId, stagesDone: [], quizBest: null, quizAttempts: 0,
  perfectBonusPaid: false, completedAt: null
});

export const STAGE_COUNT = 5;

export function completeStage(
  state: LearnerState, letterId: string, stage: number, day: string
): LearnerState {
  const prev = state.lessons[letterId] ?? emptyLesson(letterId);
  if (prev.stagesDone.includes(stage)) return state;

  const stagesDone = [...prev.stagesDone, stage].sort((a, b) => a - b);
  const justFinished = stagesDone.length === STAGE_COUNT && !prev.completedAt;
  const lesson: LessonProgress = {
    ...prev, stagesDone,
    completedAt: justFinished ? new Date().toISOString() : prev.completedAt
  };

  let next: LearnerState = { ...state, lessons: { ...state.lessons, [letterId]: lesson } };
  next = awardXp(next, day, XP.stage + (justFinished ? XP.lesson : 0));
  return next;
}

export function recordQuiz(
  state: LearnerState, letterId: string, score: number, day: string
): LearnerState {
  const prev = state.lessons[letterId] ?? emptyLesson(letterId);
  const perfect = score >= 1;
  const payBonus = perfect && !prev.perfectBonusPaid;

  const lesson: LessonProgress = {
    ...prev,
    quizBest: prev.quizBest == null ? score : Math.max(prev.quizBest, score),
    quizAttempts: prev.quizAttempts + 1,
    perfectBonusPaid: prev.perfectBonusPaid || perfect
  };

  let next: LearnerState = { ...state, lessons: { ...state.lessons, [letterId]: lesson } };
  if (payBonus) next = awardXp(next, day, XP.perfectQuiz);
  return next;
}

export const isLessonComplete = (state: LearnerState, letterId: string): boolean =>
  (state.lessons[letterId]?.stagesDone.length ?? 0) >= STAGE_COUNT;

export const lettersMastered = (state: LearnerState): number =>
  Object.values(state.lessons).filter(l => l.stagesDone.length >= STAGE_COUNT).length;

/* ── checkpoints ────────────────────────────────────────────────────────── */

export const PASS_MARK = 0.7;

export function recordCheckpoint(
  state: LearnerState, id: string, score: number, day: string
): LearnerState {
  const prev: CheckpointProgress = state.checkpoints[id] ?? { id, best: null, attempts: 0, passedAt: null };
  const passing = score >= PASS_MARK;
  const firstPass = passing && !prev.passedAt;

  const cp: CheckpointProgress = {
    id,
    best: prev.best == null ? score : Math.max(prev.best, score),
    attempts: prev.attempts + 1,
    passedAt: firstPass ? new Date().toISOString() : prev.passedAt
  };

  let next: LearnerState = { ...state, checkpoints: { ...state.checkpoints, [id]: cp } };
  if (firstPass) next = awardXp(next, day, XP.checkpoint);
  return next;
}

/* ── spaced review (Leitner) ────────────────────────────────────────────── */

const INTERVALS = [1, 2, 4, 8, 16] as const;

export function recordAnswer(
  state: LearnerState, itemId: string, letterId: string, correct: boolean, day: string
): LearnerState {
  const prev: SrsItem = state.srs[itemId] ?? {
    itemId, letterId, box: 0, misses: 0, hits: 0, dueOn: day, lastSeen: day
  };

  /* A correct answer promotes one box; a miss drops to box 0. Getting it right
     the first time never creates an entry: the review pool is for what the
     learner actually struggles with, not a log of everything they have seen. */
  if (correct && !state.srs[itemId]) return state;

  const box = (correct ? Math.min(4, prev.box + 1) : 0) as SrsItem['box'];
  const item: SrsItem = {
    ...prev, box,
    hits: prev.hits + (correct ? 1 : 0),
    misses: prev.misses + (correct ? 0 : 1),
    lastSeen: day,
    dueOn: addDays(day, INTERVALS[box]!)
  };

  /* Four clean hits in a row and it leaves the pool. */
  if (correct && box === 4 && item.hits >= item.misses + 3) {
    const srs = { ...state.srs };
    delete srs[itemId];
    return { ...state, srs };
  }
  return { ...state, srs: { ...state.srs, [itemId]: item } };
}

export const dueItems = (state: LearnerState, day: string): SrsItem[] =>
  Object.values(state.srs)
    .filter(i => i.dueOn <= day)
    .sort((a, b) => b.misses - a.misses || a.dueOn.localeCompare(b.dueOn));

/** The letters worth reviewing today, most troublesome first. */
export function weakLetters(state: LearnerState, day: string, limit = 3): string[] {
  const score = new Map<string, number>();
  for (const i of dueItems(state, day)) {
    score.set(i.letterId, (score.get(i.letterId) ?? 0) + i.misses);
  }
  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
}

/* ── achievements ───────────────────────────────────────────────────────── */

export type AchievementDef = {
  id: string; titlePt: string; descPt: string;
  test: (s: LearnerState, day: string) => boolean;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'primeira-letra', titlePt: 'Primeira letra', descPt: 'Você concluiu a sua primeira lição.',
    test: s => lettersMastered(s) >= 1 },
  { id: 'primeira-palavra', titlePt: 'Primeira palavra lida', descPt: 'Você leu uma palavra inteira em hebraico.',
    test: s => lettersMastered(s) >= 3 },
  { id: 'modulo-1', titlePt: 'Módulo 1', descPt: 'Seis letras e o primeiro checkpoint.',
    test: s => !!s.checkpoints['cp1']?.passedAt },
  { id: 'tres-dias', titlePt: 'Três dias seguidos', descPt: 'A constância é o que faz a leitura virar automática.',
    test: (s, d) => displayStreak(s, d) >= 3 },
  { id: 'dez-letras', titlePt: 'Dez letras', descPt: 'Quase metade do alfabeto.',
    test: s => lettersMastered(s) >= 10 },
  { id: 'metade', titlePt: 'Metade do alfabeto', descPt: 'Onze das 22 letras.',
    test: s => lettersMastered(s) >= 11 },
  { id: 'checkpoint-perfeito', titlePt: 'Checkpoint perfeito', descPt: 'Um checkpoint sem nenhum erro.',
    test: s => Object.values(s.checkpoints).some(c => (c.best ?? 0) >= 1) },
  { id: 'vinte-e-duas', titlePt: '22 letras', descPt: 'O alfabeto inteiro.',
    test: s => lettersMastered(s) >= 22 },
  { id: 'leitor', titlePt: 'Leitor de hebraico', descPt: 'Você concluiu o desafio final.',
    test: s => !!s.finalChallenge.completedAt }
];

/** Returns the state plus the achievements unlocked by this change. */
export function syncAchievements(
  state: LearnerState, day: string
): { state: LearnerState; unlocked: Achievement[] } {
  const have = new Set(state.achievements.map(a => a.id));
  const unlocked: Achievement[] = [];
  for (const def of ACHIEVEMENTS) {
    if (have.has(def.id)) continue;
    if (def.test(state, day)) unlocked.push({ id: def.id, unlockedAt: new Date().toISOString() });
  }
  if (!unlocked.length) return { state, unlocked };
  return { state: { ...state, achievements: [...state.achievements, ...unlocked] }, unlocked };
}

/* ── overall progress ───────────────────────────────────────────────────── */

export function courseProgress(state: LearnerState, totalLetters: number): number {
  if (totalLetters <= 0) return 0;
  const done = Object.values(state.lessons).reduce(
    (a, l) => a + Math.min(STAGE_COUNT, l.stagesDone.length) / STAGE_COUNT, 0
  );
  return Math.min(1, done / totalLetters);
}
