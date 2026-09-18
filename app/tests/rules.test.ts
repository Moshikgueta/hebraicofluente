/* XP, streak and progress. All pure, all with the day injected, so the streak
   can be tested across a month without touching the clock. */

import { describe, expect, it } from 'vitest';
import {
  addDays, applyPractice, ACHIEVEMENTS, awardXp, completeStage, courseProgress,
  daysBetween, displayStreak, dueItems, goalTarget, lettersMastered, PASS_MARK,
  recordAnswer, recordCheckpoint, recordQuiz, STAGE_COUNT, STAGE_UNITS,
  syncAchievements, today, XP
} from '../src/lib/state/rules';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const base = (goal: 5 | 10 | 15 | 20 = 10): LearnerState => ({
  ...EMPTY_STATE,
  onboarding: {
    reason: 'viagem', goalMinutes: goal, startingPoint: 'zero',
    completedAt: '2026-01-01T00:00:00.000Z'
  }
});

describe('dates', () => {
  it('counts whole days across a month boundary', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);   // 2026 is not a leap year
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('uses the local date, so late-evening practice counts for that day', () => {
    const late = new Date(2026, 4, 17, 23, 30);
    expect(today(late)).toBe('2026-05-17');
  });
});

describe('XP', () => {
  it('pays per stage and once more for the finished lesson', () => {
    let s = base();
    for (let n = 1; n <= STAGE_COUNT; n++) s = completeStage(s, 'mem', n, '2026-01-05');
    /* The daily-goal bonus rides along: five stages is 30 units, which is
       exactly a ten-minute goal. That is the point of counting stages. */
    expect(s.xp).toBe(XP.stage * STAGE_COUNT + XP.lesson + XP.dailyGoal);
    expect(lettersMastered(s)).toBe(1);
    expect(s.days['2026-01-05']!.units).toBe(STAGE_COUNT * STAGE_UNITS);
  });

  it('does not pay twice for the same stage', () => {
    let s = completeStage(base(), 'mem', 1, '2026-01-05');
    const before = s.xp;
    const units = s.days['2026-01-05']!.units;
    s = completeStage(s, 'mem', 1, '2026-01-05');
    expect(s.xp).toBe(before);
    expect(s.days['2026-01-05']!.units).toBe(units);
  });

  it('pays the perfect-quiz bonus once per letter, not once per retry', () => {
    let s = base();
    s = recordQuiz(s, 'mem', 1, '2026-01-05');
    expect(s.xp).toBe(XP.perfectQuiz);
    s = recordQuiz(s, 'mem', 1, '2026-01-06');
    expect(s.xp).toBe(XP.perfectQuiz);
    expect(s.lessons['mem']!.quizAttempts).toBe(2);
  });

  it('keeps the best quiz score, not the latest', () => {
    let s = recordQuiz(base(), 'mem', 0.9, '2026-01-05');
    s = recordQuiz(s, 'mem', 0.4, '2026-01-06');
    expect(s.lessons['mem']!.quizBest).toBeCloseTo(0.9);
  });

  it('pays a checkpoint once, on the first pass', () => {
    let s = recordCheckpoint(base(), 'cp1', 0.5, '2026-01-05');
    expect(s.xp).toBe(0);
    s = recordCheckpoint(s, 'cp1', PASS_MARK, '2026-01-06');
    expect(s.xp).toBe(XP.checkpoint);
    s = recordCheckpoint(s, 'cp1', 1, '2026-01-07');
    expect(s.xp).toBe(XP.checkpoint);
  });
});

describe('streak', () => {
  const answerTimes = (s: LearnerState, day: string, n: number) =>
    applyPractice(s, day, { answered: n, units: n });

  it('lets one finished lesson meet a ten-minute goal', () => {
    /* The regression the full-course simulation caught: with only answered
       questions counting, a learner doing exactly one lesson a day never met
       a ten-minute goal and never built a streak. */
    let s = base(10);
    for (let n = 1; n <= STAGE_COUNT; n++) s = completeStage(s, 'mem', n, '2026-01-05');
    expect(s.days['2026-01-05']!.goalMet).toBe(true);
    expect(s.streak.current).toBe(1);
  });

  it('counts a day only when the chosen goal is met', () => {
    const target = goalTarget(10);
    let s = answerTimes(base(10), '2026-01-05', target - 1);
    expect(s.streak.current).toBe(0);
    s = answerTimes(s, '2026-01-05', 1);
    expect(s.streak.current).toBe(1);
    expect(s.xp).toBe(XP.dailyGoal);
  });

  it('does not pay the daily bonus twice in one day', () => {
    const target = goalTarget(5);
    let s = answerTimes(base(5), '2026-01-05', target * 3);
    const xp = s.xp;
    s = answerTimes(s, '2026-01-05', target);
    expect(s.xp).toBe(xp);
    expect(s.streak.current).toBe(1);
  });

  it('extends across consecutive days and resets after a gap', () => {
    const t = goalTarget(10);
    let s = base(10);
    s = answerTimes(s, '2026-01-05', t);
    s = answerTimes(s, '2026-01-06', t);
    s = answerTimes(s, '2026-01-07', t);
    expect(s.streak.current).toBe(3);
    expect(s.streak.longest).toBe(3);

    s = answerTimes(s, '2026-01-10', t);          // three days missed
    expect(s.streak.current).toBe(1);
    expect(s.streak.longest).toBe(3);             // the record survives
  });

  it('never removes XP when a streak breaks', () => {
    const t = goalTarget(10);
    let s = answerTimes(base(10), '2026-01-05', t);
    const xp = s.xp;
    s = answerTimes(s, '2026-02-05', t);
    expect(s.xp).toBeGreaterThan(xp);
  });

  it('shows yesterday-ended runs as still alive today', () => {
    const t = goalTarget(10);
    const s = applyPractice(base(10), '2026-01-05', { answered: t, units: t });
    expect(displayStreak(s, '2026-01-05')).toBe(1);
    expect(displayStreak(s, '2026-01-06')).toBe(1);   // today is not over yet
    expect(displayStreak(s, '2026-01-07')).toBe(0);
  });
});

describe('spaced review', () => {
  it('does not enter the pool on a first-time correct answer', () => {
    const s = recordAnswer(base(), 'mem-rec-0', 'mem', true, '2026-01-05');
    expect(Object.keys(s.srs)).toHaveLength(0);
  });

  it('schedules a missed item for the next day, then further out', () => {
    let s = base();
    s = { ...s, srs: { 'mem-rec-0': {
      itemId: 'mem-rec-0', letterId: 'mem', box: 0, misses: 1, hits: 0,
      dueOn: '2026-01-05', lastSeen: '2026-01-05'
    } } };
    expect(dueItems(s, '2026-01-05')).toHaveLength(1);

    s = recordAnswer(s, 'mem-rec-0', 'mem', true, '2026-01-06');
    expect(s.srs['mem-rec-0']!.box).toBe(1);
    expect(s.srs['mem-rec-0']!.dueOn).toBe('2026-01-08');
    expect(dueItems(s, '2026-01-06')).toHaveLength(0);
  });

  it('drops back to box 0 on a miss', () => {
    let s = base();
    s = { ...s, srs: { x: { itemId: 'x', letterId: 'mem', box: 3, misses: 1, hits: 3, dueOn: '2026-01-05', lastSeen: '2026-01-05' } } };
    s = recordAnswer(s, 'x', 'mem', false, '2026-01-06');
    expect(s.srs['x']!.box).toBe(0);
    expect(s.srs['x']!.dueOn).toBe('2026-01-07');
  });

  it('retires an item after a run of clean hits', () => {
    let s = base();
    s = { ...s, srs: { x: { itemId: 'x', letterId: 'mem', box: 4, misses: 1, hits: 4, dueOn: '2026-01-05', lastSeen: '2026-01-05' } } };
    s = recordAnswer(s, 'x', 'mem', true, '2026-01-06');
    expect(s.srs['x']).toBeUndefined();
  });
});

describe('progress and achievements', () => {
  it('counts partial lessons proportionally', () => {
    let s = base();
    s = completeStage(s, 'mem', 1, '2026-01-05');
    s = completeStage(s, 'mem', 2, '2026-01-05');
    expect(courseProgress(s, 22)).toBeCloseTo((2 / 5) / 22, 6);
  });

  it('unlocks the first-letter achievement exactly once', () => {
    let s = base();
    for (let n = 1; n <= STAGE_COUNT; n++) s = completeStage(s, 'mem', n, '2026-01-05');
    const first = syncAchievements(s, '2026-01-05');
    expect(first.unlocked.map(a => a.id)).toContain('primeira-letra');
    const second = syncAchievements(first.state, '2026-01-05');
    expect(second.unlocked).toHaveLength(0);
  });

  it('has a test for every achievement definition', () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.test).toBe('function');
      expect(a.test(EMPTY_STATE, '2026-01-05')).toBe(false);
    }
  });

  it('awardXp records the day it was earned on', () => {
    const s = awardXp(base(), '2026-01-05', 30);
    expect(s.days['2026-01-05']!.xp).toBe(30);
    expect(s.xp).toBe(30);
  });
});
