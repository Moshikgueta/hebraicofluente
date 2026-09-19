'use client';

/* The one React entry point to learner state.
 *
 * Components never touch a store adapter or the rules module directly: they
 * call the actions here, which apply a pure rule, sync achievements, persist,
 * and emit an analytics event. Keeping that sequence in one place is what
 * stops XP being awarded twice from two different screens. */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode
} from 'react';
import {
  EMPTY_STATE, type Achievement, type Confusion, type LearnerState, type Onboarding,
  type ProgressStore, type Skill
} from './types';
import { LocalProgressStore, persistenceAvailable } from './local';
import { SupabaseProgressStore, supabaseConfigured } from './supabase';
import {
  ANSWER_UNITS, applyPractice, awardXp, clearConfusion, completeStage, courseProgress,
  displayStreak, dueItems, goalTarget, lettersMastered, markFirst, recordAnswer,
  recordCheckpoint, recordConfusion, recordExam, recordGym, recordQuiz, recordSkill,
  syncAchievements, today,
  topConfusions, weakLetters, XP
} from './rules';
import { track } from '@/lib/analytics';
import { EXAM_PASS } from '@/lib/engine/exam';

function createStore(): ProgressStore {
  return supabaseConfigured() ? new SupabaseProgressStore() : new LocalProgressStore();
}

type Ctx = {
  state: LearnerState;
  ready: boolean;
  /** False in a private window with storage blocked - the UI says so. */
  persistent: boolean;
  day: string;
  /* derived */
  streak: number;
  mastered: number;
  progress: number;
  dueCount: number;
  weak: string[];
  /** Practice credit today, in the same units as `goalTargetToday`. */
  goalUnits: number;
  goalTargetToday: number;
  /* celebrations the shell shows and then clears */
  pending: Achievement[];
  clearPending: () => void;
  /* actions */
  /** The confusions this learner actually has, worst first. */
  confusions: Confusion[];
  setOnboarding: (o: Onboarding) => void;
  finishStage: (letterId: string, stage: number, units?: number) => void;
  /**
   * One answer, with everything the adaptive layer needs to learn from it:
   * which skill it tested, and - on a miss - which wrong option was chosen, so
   * ד answered for ר is recorded as that pair rather than as a generic slip.
   */
  answer: (args: {
    itemId: string; letterId: string; correct: boolean;
    skill?: Skill; expected?: string; chosen?: string;
  }) => void;
  /** Record a moment that can only happen once, and say so. */
  markFirst: (id: string) => void;
  /**
   * A traced or freehand attempt at a letter, scored 0-1 by the canvas.
   *
   * Writing is the one skill with no question to answer, so it needs its own
   * door into the model - without it `escrever` would stay permanently 'novo'
   * and the dashboard would keep claiming a letter is strong that the learner
   * cannot actually produce.
   */
  recordWriting: (letterId: string, score: number) => void;
  /** One finished reading-gym run: its score and how long it took. */
  finishGym: (modeId: string, score: number, seconds: number) => void;
  finishQuiz: (letterId: string, score: number) => void;
  finishCheckpoint: (id: string, score: number) => void;
  finishReview: (score: number) => void;
  finishFinalChallenge: (score: number) => void;
  /** One sitting of the final exam: its overall score and each part's. */
  finishExam: (
    score: number, parts: Record<string, { correct: number; total: number }>
  ) => void;
  remember: (route: string) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function ProgressProvider({
  children, totalLetters, extraModuleIds = []
}: { children: ReactNode; totalLetters: number; extraModuleIds?: string[] }) {
  const store = useMemo(createStore, []);
  /* The caller passes a fresh array literal on every render; keying the memo on
     its contents rather than its identity keeps the context value stable. */
  const extraKey = extraModuleIds.join(',');
  const [state, setState] = useState<LearnerState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [pending, setPending] = useState<Achievement[]>([]);
  const [day, setDay] = useState(() => today());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    setPersistent(supabaseConfigured() || persistenceAvailable());
    store.load().then(s => { if (alive) { setState(s); setReady(true); } });
    return () => { alive = false; };
  }, [store]);

  /* A session left open across midnight must not keep crediting yesterday. */
  useEffect(() => {
    const t = setInterval(() => setDay(d => { const n = today(); return n === d ? d : n; }), 60_000);
    return () => clearInterval(t);
  }, []);

  const commit = useCallback((next: LearnerState) => {
    const synced = syncAchievements(next, today());
    if (synced.unlocked.length) {
      setPending(p => [...p, ...synced.unlocked]);
      synced.unlocked.forEach(a => track('achievement_unlocked', { achievementId: a.id }));
    }
    setState(synced.state);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void store.save(synced.state); }, 250);
  }, [store]);

  const setOnboarding = useCallback((o: Onboarding) => {
    commit({ ...state, onboarding: o });
    track('onboarding_completed', { goalMinutes: o.goalMinutes, reason: o.reason });
  }, [commit, state]);

  const finishStage = useCallback((letterId: string, stage: number, units?: number) => {
    const d = today();
    const total = units === undefined ? 5 : 3;
    const before = state.lessons[letterId]?.stagesDone.length ?? 0;
    const next = completeStage(state, letterId, stage, d, units);
    commit(next);
    track('stage_completed', { letterId, stage });
    if (before < total && (next.lessons[letterId]?.stagesDone.length ?? 0) >= total) {
      track('lesson_completed', { letterId });
    }
  }, [commit, state]);

  const answer = useCallback((args: {
    itemId: string; letterId: string; correct: boolean;
    skill?: Skill; expected?: string; chosen?: string;
  }) => {
    const { itemId, letterId, correct, skill, expected, chosen } = args;
    const d = today();
    let next = recordAnswer(state, itemId, letterId, correct, d, skill);
    /* A miss always creates the review entry, even the first time. */
    if (!correct && !next.srs[itemId]) {
      next = { ...next, srs: { ...next.srs, [itemId]: {
        itemId, letterId, box: 0, misses: 1, hits: 0, dueOn: d, lastSeen: d, skill
      } } };
    }
    if (skill) next = recordSkill(next, letterId, skill, correct, d);
    /* The chosen option is the whole point: a wrong answer that names WHICH
       letter was picked instead turns a generic miss into a drillable pair. */
    if (expected && chosen) {
      next = correct
        ? clearConfusion(next, expected, chosen)
        : recordConfusion(next, expected, chosen, d);
    }
    next = applyPractice(next, d, { answered: 1, units: ANSWER_UNITS });
    commit(next);
    track('exercise_answered', { letterId, itemId, correct, skill });
    if (!correct) track('exercise_wrong', { letterId, itemId, chosen });
  }, [commit, state]);

  const recordWriting = useCallback((letterId: string, score: number) => {
    const d = today();
    /* The bar is 0.5, which is low, and that is the decision: a finger on glass
       is not a pen on paper, and a learner told their readable ג is wrong stops
       trusting the whole app. The canvas is generous; this agrees with it. */
    let next = recordSkill(state, letterId, 'escrever', score >= 0.5, d);
    /* Writing is practice even when it comes out badly - more so, in fact. */
    next = applyPractice(next, d, { units: ANSWER_UNITS });
    commit(next);
    track('exercise_answered', { letterId, skill: 'escrever', correct: score >= 0.5 });
  }, [commit, state]);

  const finishGym = useCallback((modeId: string, score: number, seconds: number) => {
    const d = today();
    /* XP for a gym run is the review award: it is the same kind of work, and
       paying more for it would turn the gym into the cheapest way to farm. */
    let next = recordGym(state, modeId, score, seconds, d);
    next = awardXp(next, d, XP.review);
    commit(next);
    track('gym_completed', { mode: modeId, score, seconds });
  }, [commit, state]);

  const doMarkFirst = useCallback((id: string) => {
    if (state.firsts[id]) return;
    commit(markFirst(state, id));
    track('first_reached', { id });
  }, [commit, state]);

  const finishQuiz = useCallback((letterId: string, score: number) => {
    commit(recordQuiz(state, letterId, score, today()));
    track('quiz_completed', { letterId, score });
  }, [commit, state]);

  const finishCheckpoint = useCallback((id: string, score: number) => {
    commit(recordCheckpoint(state, id, score, today()));
    track('checkpoint_completed', { checkpointId: id, score });
  }, [commit, state]);

  const finishReview = useCallback((score: number) => {
    commit(awardXp(state, today(), XP.review));
    track('review_completed', { score });
  }, [commit, state]);

  const finishFinalChallenge = useCallback((score: number) => {
    const d = today();
    let next: LearnerState = {
      ...state,
      finalChallenge: {
        best: state.finalChallenge.best == null ? score : Math.max(state.finalChallenge.best, score),
        completedAt: state.finalChallenge.completedAt ?? new Date().toISOString()
      }
    };
    next = awardXp(next, d, XP.checkpoint);
    commit(next);
    track('course_completed', { score });
  }, [commit, state]);

  const finishExam = useCallback((
    score: number, parts: Record<string, { correct: number; total: number }>
  ) => {
    commit(recordExam(state, score, parts, today(), EXAM_PASS));
    track('course_completed', { score });
  }, [commit, state]);

  const remember = useCallback((route: string) => {
    setState(s => {
      if (s.lastRoute === route) return s;
      const next = { ...s, lastRoute: route };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { void store.save(next); }, 400);
      return next;
    });
  }, [store]);

  const reset = useCallback(() => {
    void store.clear();
    setState(EMPTY_STATE);
    setPending([]);
  }, [store]);

  const value = useMemo<Ctx>(() => {
    const goal = state.onboarding?.goalMinutes ?? 10;
    return {
      state, ready, persistent, day,
      streak: displayStreak(state, day),
      mastered: lettersMastered(state),
      progress: courseProgress(state, totalLetters, extraKey ? extraKey.split(',') : []),
      dueCount: dueItems(state, day).length,
      weak: weakLetters(state, day),
      goalUnits: state.days[day]?.units ?? 0,
      goalTargetToday: goalTarget(goal),
      confusions: topConfusions(state),
      pending,
      clearPending: () => setPending([]),
      setOnboarding, finishStage, answer, markFirst: doMarkFirst, recordWriting, finishGym,
      finishQuiz, finishCheckpoint, finishReview, finishFinalChallenge, finishExam,
      remember, reset
    };
  }, [
    state, ready, persistent, day, totalLetters, extraKey, pending,
    setOnboarding, finishStage, answer, doMarkFirst, recordWriting, finishGym, finishQuiz,
    finishCheckpoint, finishReview, finishFinalChallenge, finishExam, remember, reset
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
