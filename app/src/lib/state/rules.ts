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

/** Practice units in a daily goal. One unit is about twenty seconds. */
export const goalTarget = (minutes: number): number => Math.max(3, Math.round(minutes * 3));

/** What one answered question is worth. */
export const ANSWER_UNITS = 1;

/**
 * What finishing one stage of a lesson is worth — about two minutes of
 * reading, listening, tracing or writing. Without this the daily goal could
 * only be met by answering questions, which is the smaller half of the course.
 */
export const STAGE_UNITS = 6;

/**
 * A lesson of module 6 or 7 is bigger than a letter stage — the dagesh lesson
 * covers three letter pairs with their word lists, the finals lesson covers all
 * five forms — so it is worth more. A single constant for "a stage" was the
 * simplification; these two modules are where it stopped being true.
 */
export const EXTRA_STAGE_UNITS = 10;

/* ── streak ─────────────────────────────────────────────────────────────
   A day counts when the learner meets the goal they chose. Breaking it costs
   nothing but the counter: no XP is removed, and the longest run is kept, so
   coming back is never a fresh start. */

export const emptyDay = (): DayRecord => ({ answered: 0, units: 0, xp: 0, goalMet: false });

export function applyPractice(
  state: LearnerState, day: string, practice: { answered?: number; units: number }
): LearnerState {
  const goal = state.onboarding?.goalMinutes ?? 10;
  const target = goalTarget(goal);
  const prev: DayRecord = state.days[day] ?? emptyDay();
  const next: DayRecord = {
    ...prev,
    answered: prev.answered + (practice.answered ?? 0),
    units: prev.units + practice.units
  };

  let xp = state.xp;
  let streak = state.streak;

  if (!prev.goalMet && next.units >= target) {
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
  const prev: DayRecord = state.days[day] ?? emptyDay();
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
  state: LearnerState, letterId: string, stage: number, day: string,
  units: number = STAGE_UNITS
): LearnerState {
  const prev = state.lessons[letterId] ?? emptyLesson(letterId);
  if (prev.stagesDone.includes(stage)) return state;

  const stagesDone = [...prev.stagesDone, stage].sort((a, b) => a - b);
  /* Modules 6 and 7 have three lessons, not five stages; whichever total the
     caller is working to, the lesson bonus is paid when it is reached. */
  const total = units === STAGE_UNITS ? STAGE_COUNT : EXTRA_STAGE_COUNT;
  const justFinished = stagesDone.length === total && !prev.completedAt;
  const lesson: LessonProgress = {
    ...prev, stagesDone,
    completedAt: justFinished ? new Date().toISOString() : prev.completedAt
  };

  let next: LearnerState = { ...state, lessons: { ...state.lessons, [letterId]: lesson } };
  next = awardXp(next, day, XP.stage + (justFinished ? XP.lesson : 0));
  /* A finished stage is practice, and the daily goal has to see it. */
  next = applyPractice(next, day, { units });
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
  { id: 'sem-o-ponto', titlePt: 'Sem o ponto', descPt: 'Você lê {{בּ}}, {{כּ}} e {{פּ}} sem o daguesh — como elas aparecem na rua.',
    test: s => !!s.checkpoints['cp6']?.passedAt },
  { id: 'sons-modernos', titlePt: 'Os sons modernos', descPt: 'O gerech e as três letras que o hebraico moderno inventou sem inventar letra.',
    test: s => !!s.checkpoints['cp7']?.passedAt },
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

/* ── progressive reading support ────────────────────────────────────────
   The support fades as the alphabet fills in. This is the single most visible
   sign of progress the course has — a learner who needed the transliteration
   on letter 3 and reads without it on letter 18 can SEE that they changed.

   It is a function of letters mastered, not of a setting, because a setting
   would let the learner keep the crutch forever without noticing. */
export type SupportLevel = 'always' | 'on-tap' | 'on-request';

export function supportLevel(mastered: number): SupportLevel {
  if (mastered < 8) return 'always';        // the reading is simply there
  if (mastered < 16) return 'on-tap';       // one tap
  return 'on-request';                      // "Precisa de ajuda?"
}

export const supportLabel = (level: SupportLevel): string =>
  level === 'on-request' ? 'Precisa de ajuda?' : 'Mostrar leitura';

/* ── overall progress ───────────────────────────────────────────────────── */

/**
 * Course completion.
 *
 * `extraModuleIds` are modules 6 and 7 — three lessons each, no letters. They
 * are part of the course, so leaving them out of the denominator would let the
 * bar read 100% while the reader still cannot handle a word printed without
 * its dots, which is most words.
 */
export function courseProgress(
  state: LearnerState, totalLetters: number, extraModuleIds: readonly string[] = []
): number {
  if (totalLetters <= 0) return 0;
  const letterIds = new Set(
    Object.keys(state.lessons).filter(id => !extraModuleIds.includes(id))
  );
  const letters = [...letterIds].reduce((a, id) => {
    const l = state.lessons[id];
    return a + (l ? Math.min(STAGE_COUNT, l.stagesDone.length) / STAGE_COUNT : 0);
  }, 0);
  const extras = extraModuleIds.reduce((a, id) => {
    const l = state.lessons[id];
    return a + (l ? Math.min(EXTRA_STAGE_COUNT, l.stagesDone.length) / EXTRA_STAGE_COUNT : 0);
  }, 0);
  return Math.min(1, (letters + extras) / (totalLetters + extraModuleIds.length));
}

/** Modules 6 and 7 have three lessons, not five stages. */
export const EXTRA_STAGE_COUNT = 3;

export const isExtraModuleDone = (state: LearnerState, id: string): boolean =>
  (state.lessons[id]?.stagesDone.length ?? 0) >= EXTRA_STAGE_COUNT;
