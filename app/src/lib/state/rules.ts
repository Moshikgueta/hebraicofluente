/* The learning-state rules: XP, streak, progress, achievements.
 *
 * Every function here is pure — state in, state out, with the day passed as an
 * argument rather than read from the clock. That is what makes the streak
 * testable without mocking time, and it is the reason these rules live apart
 * from the React store. */

import type {
  Achievement, CheckpointProgress, Confusion, DayRecord, GymRecord, LearnerState,
  LessonProgress, LetterSkills, Skill, SkillStat, SrsItem
} from './types';
import { SKILLS } from './types';

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

/* ── mastery, per skill ─────────────────────────────────────────────────
   Five coarse states, and no percentage anywhere. "Forte" means four clean
   answers in a row on that skill, which is a claim the data supports; "93,4%
   de domínio" is a claim nothing supports, and a learner who is told it and
   then fails the next question stops believing the whole screen.

   `revisar` is deliberately reachable FROM `forte`: a letter that was strong
   and has just been missed is the most valuable thing the review can offer, and
   a model that cannot express "was strong, slipped" cannot ask for it. */
export type MasteryLevel = 'novo' | 'aprendendo' | 'praticando' | 'forte' | 'revisar';

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  novo: 'ainda não visto',
  aprendendo: 'aprendendo',
  praticando: 'praticando',
  forte: 'forte',
  revisar: 'precisa de revisão'
};

export const emptySkill = (): SkillStat => ({ hits: 0, misses: 0, streak: 0, lastOn: null });

export function skillLevel(stat: SkillStat | undefined): MasteryLevel {
  if (!stat || stat.hits + stat.misses === 0) return 'novo';
  /* A miss that has not yet been answered correctly again. One slip is enough:
     the cost of offering an extra review is a few seconds, the cost of skipping
     a needed one is a letter the learner keeps getting wrong. */
  if (stat.streak === 0 && stat.misses > 0) return 'revisar';
  if (stat.streak >= 4) return 'forte';
  if (stat.streak >= 2) return 'praticando';
  return 'aprendendo';
}

/** The letter's weakest skill that has any evidence — what to practise next. */
export function weakestSkill(skills: LetterSkills | undefined): Skill | null {
  if (!skills) return null;
  const RANK: Record<MasteryLevel, number> = {
    revisar: 0, aprendendo: 1, praticando: 2, forte: 3, novo: 4
  };
  let best: { skill: Skill; rank: number } | null = null;
  for (const s of SKILLS) {
    const lvl = skillLevel(skills[s]);
    if (lvl === 'novo') continue;
    const rank = RANK[lvl];
    if (!best || rank < best.rank) best = { skill: s, rank };
  }
  return best?.skill ?? null;
}

/**
 * One level for the whole letter, for the places that can only show one thing.
 *
 * It is the WEAKEST skill with evidence, not the average. Averaging would let a
 * learner who reads ק perfectly and cannot hear it at all read as "praticando",
 * and the course would move on — which is the exact failure the per-skill model
 * exists to prevent.
 */
export function letterMastery(state: LearnerState, letterId: string): MasteryLevel {
  const skills = state.skills[letterId];
  if (!skills) return 'novo';
  const levels = SKILLS.map(s => skillLevel(skills[s])).filter(l => l !== 'novo');
  if (!levels.length) return 'novo';
  if (levels.includes('revisar')) return 'revisar';
  if (levels.includes('aprendendo')) return 'aprendendo';
  if (levels.includes('praticando')) return 'praticando';
  return 'forte';
}

export function recordSkill(
  state: LearnerState, letterId: string, skill: Skill, correct: boolean, day: string
): LearnerState {
  const letter = state.skills[letterId] ?? {};
  const prev = letter[skill] ?? emptySkill();
  const stat: SkillStat = {
    hits: prev.hits + (correct ? 1 : 0),
    misses: prev.misses + (correct ? 0 : 1),
    streak: correct ? prev.streak + 1 : 0,
    lastOn: day
  };
  return { ...state, skills: { ...state.skills, [letterId]: { ...letter, [skill]: stat } } };
}

/* ── confusions ─────────────────────────────────────────────────────────
   `confusableWith` in the content says which letters TEND to be mixed up. This
   says which ones THIS learner mixes up, which is a different and more useful
   fact — and it costs nothing to collect, because the player already knows
   which wrong option was tapped. */

export const confusionKey = (correct: string, chosen: string): string => `${correct}>${chosen}`;

export function recordConfusion(
  state: LearnerState, correct: string, chosen: string, day: string
): LearnerState {
  if (!correct || !chosen || correct === chosen) return state;
  const key = confusionKey(correct, chosen);
  const prev = state.confusions[key];
  const next: Confusion = {
    correct, chosen, n: (prev?.n ?? 0) + 1, lastOn: day
  };
  return { ...state, confusions: { ...state.confusions, [key]: next } };
}

/**
 * The pairs worth drilling, worst first.
 *
 * Both directions of a pair count as one confusion: a learner who answers ר for
 * ד and ד for ר does not have two problems, they have one, and drilling it once
 * in both directions is the fix.
 */
export function topConfusions(state: LearnerState, limit = 3): Confusion[] {
  const merged = new Map<string, Confusion>();
  for (const c of Object.values(state.confusions)) {
    const pairKey = [c.correct, c.chosen].sort().join('|');
    const prev = merged.get(pairKey);
    if (!prev) merged.set(pairKey, { ...c });
    else merged.set(pairKey, {
      ...(prev.n >= c.n ? prev : c),
      n: prev.n + c.n,
      lastOn: prev.lastOn > c.lastOn ? prev.lastOn : c.lastOn
    });
  }
  return [...merged.values()]
    .filter(c => c.n >= 2)          // one slip is noise; twice is a pattern
    .sort((a, b) => b.n - a.n || b.lastOn.localeCompare(a.lastOn))
    .slice(0, limit);
}

/** A confusion is settled once the learner answers it right twice running. */
export function clearConfusion(state: LearnerState, correct: string, chosen: string): LearnerState {
  const a = confusionKey(correct, chosen), b = confusionKey(chosen, correct);
  if (!state.confusions[a] && !state.confusions[b]) return state;
  const confusions = { ...state.confusions };
  for (const key of [a, b]) {
    const c = confusions[key];
    if (!c) continue;
    if (c.n <= 1) delete confusions[key];
    else confusions[key] = { ...c, n: c.n - 1 };
  }
  return { ...state, confusions };
}

/* ── the final exam ─────────────────────────────────────────────────────
   Unlimited attempts, no penalty, and the best score is kept — the same
   policy as every other assessment in the course. What is NOT overwritten is
   `passedAt`: the day a learner first passed is a fact about them, and a
   later worse attempt does not take it away. */
export function recordExam(
  state: LearnerState, score: number, parts: Record<string, { correct: number; total: number }>,
  day: string, passMark: number
): LearnerState {
  const prev = state.finalChallenge;
  const passing = score >= passMark;
  const firstPass = passing && !prev.passedAt;

  const next: LearnerState = {
    ...state,
    finalChallenge: {
      best: prev.best == null ? score : Math.max(prev.best, score),
      completedAt: prev.completedAt ?? new Date().toISOString(),
      passedAt: prev.passedAt ?? (passing ? new Date().toISOString() : null),
      attempts: (prev.attempts ?? 0) + 1,
      /* The sitting that just happened, not a best-of composite. */
      parts
    }
  };
  return firstPass ? awardXp(next, day, XP.checkpoint) : next;
}

/**
 * May this learner be issued a certificate?
 *
 * Two conditions, both about the learner and neither about payment: every
 * letter finished, and the exam passed. A certificate for someone who has not
 * passed is worth nothing, including to them.
 */
export function certificateReady(
  state: LearnerState, totalLetters: number
): { ready: boolean; lettersDone: number; examPassed: boolean } {
  const lettersDone = lettersMastered(state);
  const examPassed = !!state.finalChallenge.passedAt;
  return { ready: lettersDone >= totalLetters && examPassed, lettersDone, examPassed };
}

/* ── the reading gym ────────────────────────────────────────────────────
   One record per mode. The time comparison is the learner against their own
   last run and nothing else — no target, no average, no other learners. */
export function recordGym(
  state: LearnerState, modeId: string, score: number, seconds: number, day: string
): LearnerState {
  const prev = state.gym[modeId];
  const rec: GymRecord = {
    runs: (prev?.runs ?? 0) + 1,
    best: prev?.best == null ? score : Math.max(prev.best, score),
    bestSeconds: prev?.bestSeconds == null ? seconds : Math.min(prev.bestSeconds, seconds),
    /* The run before this one. Written here rather than derived on the result
       screen, which by then is looking at the run that just finished and would
       always compare it with itself. */
    previousSeconds: prev?.lastSeconds ?? null,
    lastSeconds: seconds,
    lastOn: day
  };
  return { ...state, gym: { ...state.gym, [modeId]: rec } };
}

/* ── firsts ─────────────────────────────────────────────────────────────
   A moment, not a badge: it happens once, it is dated, and the course can say
   so out loud when it does. */
export function markFirst(state: LearnerState, id: string): LearnerState {
  if (state.firsts[id]) return state;
  return { ...state, firsts: { ...state.firsts, [id]: new Date().toISOString() } };
}

export const hasFirst = (state: LearnerState, id: string): boolean => !!state.firsts[id];

/* ── spaced review (Leitner) ────────────────────────────────────────────── */

const INTERVALS = [1, 2, 4, 8, 16] as const;

export function recordAnswer(
  state: LearnerState, itemId: string, letterId: string, correct: boolean, day: string,
  skill?: Skill
): LearnerState {
  const prev: SrsItem = state.srs[itemId] ?? {
    itemId, letterId, box: 0, misses: 0, hits: 0, dueOn: day, lastSeen: day, skill
  };

  /* A correct answer promotes one box; a miss drops to box 0. Getting it right
     the first time never creates an entry: the review pool is for what the
     learner actually struggles with, not a log of everything they have seen. */
  if (correct && !state.srs[itemId]) return state;

  const box = (correct ? Math.min(4, prev.box + 1) : 0) as SrsItem['box'];
  const item: SrsItem = {
    ...prev, box,
    skill: prev.skill ?? skill,
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

/**
 * The letters worth reviewing today, most troublesome first.
 *
 * Three sources, because one was not enough:
 *
 *   · the SRS queue — items due today, weighted by how often they were missed.
 *     This was the whole of it, and it goes quiet as soon as an item's interval
 *     pushes it past today, even for a letter the learner is still failing;
 *   · any skill sitting at `revisar` — a letter that was strong and has just
 *     slipped is the single most valuable thing a review can offer, and the
 *     SRS entry for it may not be due for days;
 *   · the confusion pairs — both letters of a pair this learner actually
 *     trades, because drilling ד without ר beside it teaches nothing about the
 *     distinction that is failing.
 *
 * `byGlyph` maps a glyph back to a letter id for that third source; callers
 * that do not have the content pass nothing and get the first two.
 */
export function weakLetters(
  state: LearnerState, day: string, limit = 3,
  byGlyph?: ReadonlyMap<string, string>
): string[] {
  const score = new Map<string, number>();
  const bump = (id: string, n: number) => score.set(id, (score.get(id) ?? 0) + n);

  for (const i of dueItems(state, day)) bump(i.letterId, i.misses + 1);

  for (const [letterId, skills] of Object.entries(state.skills)) {
    for (const s of SKILLS) {
      if (skillLevel(skills[s]) === 'revisar') bump(letterId, 2);
    }
  }

  if (byGlyph) {
    for (const c of topConfusions(state, 3)) {
      for (const glyph of [c.correct, c.chosen]) {
        const id = byGlyph.get(glyph);
        if (id) bump(id, c.n);
      }
    }
  }

  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
}

/**
 * Everything the learner currently owes, as a list they can look at.
 *
 * The review used to be a black box that produced five questions; a learner
 * who wanted to know what it thought they were bad at had no way to find out.
 * This is that list — and it is also what the "para revisar" panel renders.
 */
export type ReviewDebt = {
  letterId: string;
  /** Which skills are the problem, weakest first. */
  skills: Skill[];
  /** How many SRS items are due for it today. */
  due: number;
  /** Glyph pairs this learner trades that involve this letter. */
  confusedWith: string[];
};

export function reviewDebt(
  state: LearnerState, day: string, byGlyph?: ReadonlyMap<string, string>
): ReviewDebt[] {
  const ids = new Set<string>();
  const due = new Map<string, number>();
  for (const i of dueItems(state, day)) {
    ids.add(i.letterId);
    due.set(i.letterId, (due.get(i.letterId) ?? 0) + 1);
  }
  for (const [letterId, skills] of Object.entries(state.skills)) {
    if (SKILLS.some(s => skillLevel(skills[s]) === 'revisar')) ids.add(letterId);
  }

  const confusedWith = new Map<string, string[]>();
  if (byGlyph) {
    for (const c of topConfusions(state, 6)) {
      for (const [mine, theirs] of [[c.correct, c.chosen], [c.chosen, c.correct]] as const) {
        const id = byGlyph.get(mine);
        if (!id) continue;
        ids.add(id);
        confusedWith.set(id, [...(confusedWith.get(id) ?? []), theirs]);
      }
    }
  }

  return [...ids].map(letterId => {
    const skills = state.skills[letterId] ?? {};
    return {
      letterId,
      skills: SKILLS.filter(s => skillLevel(skills[s]) === 'revisar'),
      due: due.get(letterId) ?? 0,
      confusedWith: confusedWith.get(letterId) ?? []
    };
  }).sort((a, b) =>
    (b.due + b.skills.length + b.confusedWith.length) -
    (a.due + a.skills.length + a.confusedWith.length)
  );
}

/**
 * Has the learner been away long enough to want a warm-up?
 *
 * Two days, not one: a learner who studied yesterday does not need to be told
 * they have been away, and being greeted with "vamos aquecer?" after a normal
 * night is the app talking about itself rather than about them.
 */
export function needsWarmUp(state: LearnerState, day: string): boolean {
  const last = state.streak.lastDay;
  if (!last) return false;
  const gap = daysBetween(last, day);
  return gap >= 2 && dueItems(state, day).length > 0;
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
  /* Not a count of anything. The one moment the course is actually selling:
     a whole word decoded with no transliteration on the screen. */
  { id: 'sem-apoio', titlePt: 'Sem apoio', descPt: 'Você leu uma palavra inteira sem transliteração.',
    test: s => !!s.firsts['leitura-sem-translit'] },
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
