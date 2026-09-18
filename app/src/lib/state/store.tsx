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
import { EMPTY_STATE, type Achievement, type LearnerState, type Onboarding, type ProgressStore } from './types';
import { LocalProgressStore, persistenceAvailable } from './local';
import { SupabaseProgressStore, supabaseConfigured } from './supabase';
import {
  applyPractice, awardXp, completeStage, courseProgress, displayStreak, dueItems,
  goalTarget, lettersMastered, recordAnswer, recordCheckpoint, recordQuiz,
  syncAchievements, today, weakLetters, XP
} from './rules';
import { track } from '@/lib/analytics';

function createStore(): ProgressStore {
  return supabaseConfigured() ? new SupabaseProgressStore() : new LocalProgressStore();
}

type Ctx = {
  state: LearnerState;
  ready: boolean;
  /** False in a private window with storage blocked — the UI says so. */
  persistent: boolean;
  day: string;
  /* derived */
  streak: number;
  mastered: number;
  progress: number;
  dueCount: number;
  weak: string[];
  goalAnswered: number;
  goalTargetToday: number;
  /* celebrations the shell shows and then clears */
  pending: Achievement[];
  clearPending: () => void;
  /* actions */
  setOnboarding: (o: Onboarding) => void;
  finishStage: (letterId: string, stage: number) => void;
  answer: (args: { itemId: string; letterId: string; correct: boolean }) => void;
  finishQuiz: (letterId: string, score: number) => void;
  finishCheckpoint: (id: string, score: number) => void;
  finishReview: (score: number) => void;
  finishFinalChallenge: (score: number) => void;
  remember: (route: string) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children, totalLetters }: { children: ReactNode; totalLetters: number }) {
  const store = useMemo(createStore, []);
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

  const finishStage = useCallback((letterId: string, stage: number) => {
    const d = today();
    const before = state.lessons[letterId]?.stagesDone.length ?? 0;
    const next = completeStage(state, letterId, stage, d);
    commit(next);
    track('stage_completed', { letterId, stage });
    if (before < 5 && (next.lessons[letterId]?.stagesDone.length ?? 0) >= 5) {
      track('lesson_completed', { letterId });
    }
  }, [commit, state]);

  const answer = useCallback(({ itemId, letterId, correct }: { itemId: string; letterId: string; correct: boolean }) => {
    const d = today();
    let next = recordAnswer(state, itemId, letterId, correct, d);
    /* A miss always creates the review entry, even the first time. */
    if (!correct && !next.srs[itemId]) {
      next = { ...next, srs: { ...next.srs, [itemId]: {
        itemId, letterId, box: 0, misses: 1, hits: 0, dueOn: d, lastSeen: d
      } } };
    }
    next = applyPractice(next, d, 1);
    commit(next);
    track('exercise_answered', { letterId, itemId, correct });
    if (!correct) track('exercise_wrong', { letterId, itemId });
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
      progress: courseProgress(state, totalLetters),
      dueCount: dueItems(state, day).length,
      weak: weakLetters(state, day),
      goalAnswered: state.days[day]?.answered ?? 0,
      goalTargetToday: goalTarget(goal),
      pending,
      clearPending: () => setPending([]),
      setOnboarding, finishStage, answer, finishQuiz, finishCheckpoint,
      finishReview, finishFinalChallenge, remember, reset
    };
  }, [
    state, ready, persistent, day, totalLetters, pending,
    setOnboarding, finishStage, answer, finishQuiz, finishCheckpoint,
    finishReview, finishFinalChallenge, remember, reset
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
