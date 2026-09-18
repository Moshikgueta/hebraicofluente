/* The whole course, played start to finish.
 *
 * The unit tests each check one rule. This checks that the rules compose: that
 * a learner who does every lesson, every checkpoint and both extra modules ends
 * up with a coherent state — 22 letters mastered, 100% progress, every
 * achievement, and XP that adds up to the sum of what was earned rather than to
 * whatever the code happened to do.
 *
 * It also proves the thing no single unit test can: that every screen the
 * course can put in front of a learner has an answerable exercise on it. */

import { describe, expect, it } from 'vitest';
import { allLetters, course, extras } from '../src/lib/content';
import { buildCheckpoint, buildLessonQuiz, buildReview, isChoice, violatesOrderRule } from '../src/lib/engine/exercises';
import { buildDageshQuiz, buildGerechQuiz } from '../src/lib/engine/extras';
import {
  ACHIEVEMENTS, EXTRA_STAGE_COUNT, EXTRA_STAGE_UNITS, STAGE_COUNT, XP, applyPractice, completeStage,
  courseProgress, goalTarget, lettersMastered, markFirst, recordCheckpoint, recordQuiz,
  syncAchievements, addDays
} from '../src/lib/state/rules';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const letters = allLetters();
const EXTRA_IDS = course.modules.filter(m => !m.letterIds.length).map(m => m.id);

function playEverything() {
  let s: LearnerState = {
    ...EMPTY_STATE,
    onboarding: {
      reason: 'viagem', goalMinutes: 10, startingPoint: 'zero',
      completedAt: '2026-01-01T00:00:00.000Z'
    }
  };
  let day = '2026-01-01';
  let expectedXp = 0;
  let answered = 0;
  const target = goalTarget(10);
  /* Days on which a whole lesson was done. A day of only a checkpoint, or only
     the final challenge, is legitimately shorter than the goal — the claim
     being tested is that doing a LESSON is enough. */
  const lessonDays = new Set<string>();

  const practise = (n: number) => {
    answered += n;
    const before = s.days[day]?.goalMet ?? false;
    s = applyPractice(s, day, { answered: n, units: n });
    if (!before && (s.days[day]?.goalMet ?? false)) expectedXp += XP.dailyGoal;
  };

  /* completeStage now credits practice as well as XP, so the expected total
     has to account for the daily-goal bonus it can trigger. */
  const stage = (id: string, n: number, units?: number) => {
    const before = s.days[day]?.goalMet ?? false;
    s = completeStage(s, id, n, day, units);
    if (!before && (s.days[day]?.goalMet ?? false)) expectedXp += XP.dailyGoal;
  };

  for (const m of course.modules) {
    if (!m.letterIds.length) {
      /* Modules 6 and 7: three lessons, then the closing quiz. */
      for (let n = 1; n <= EXTRA_STAGE_COUNT; n++) {
        stage(m.id, n, EXTRA_STAGE_UNITS);
        expectedXp += XP.stage + (n === EXTRA_STAGE_COUNT ? XP.lesson : 0);
      }
      lessonDays.add(day);
      const quiz = m.n === 6
        ? buildDageshQuiz(extras, 10, `mod6`)
        : buildGerechQuiz(extras, 8, `mod7`);
      expect(quiz.length, `module ${m.n} quiz`).toBeGreaterThanOrEqual(8);
      practise(quiz.length);
      s = recordCheckpoint(s, `cp${m.n}`, 1, day);
      expectedXp += XP.checkpoint;
      day = addDays(day, 1);
      continue;
    }

    for (const [li, id] of m.letterIds.entries()) {
      const L = letters.find(x => x.id === id)!;
      const history = letters.filter(x => x.order <= L.order);

      /* Five stages. The lesson bonus is paid once, on the fifth. */
      for (let n = 1; n <= STAGE_COUNT; n++) {
        stage(id, n);
        expectedXp += XP.stage + (n === STAGE_COUNT ? XP.lesson : 0);
      }
      lessonDays.add(day);

      const quiz = buildLessonQuiz(L, history, { audioAvailable: false, count: 8 });
      expect(quiz.length, `${id} quiz`).toBeGreaterThanOrEqual(5);
      for (const ex of quiz) {
        expect(violatesOrderRule(ex, L.alphabetSoFar), `${ex.id}`).toEqual([]);
      }
      practise(quiz.length);
      s = recordQuiz(s, id, 1, day);
      expectedXp += XP.perfectQuiz;

      /* Past the eighth letter the course stops printing the transliteration,
         so a learner answering a word question correctly has read Hebrew
         unaided. The player records that moment; the simulation has to as
         well, or it is not simulating a learner. */
      if (lettersMastered(s) >= 8 && quiz.some(e => e.kind === 'word-meaning')) {
        s = markFirst(s, 'leitura-sem-translit');
      }

      /* The checkpoint runs on the same day as the module's last lesson,
         because that is what the dashboard actually sends the learner to. */
      if (li < m.letterIds.length - 1) day = addDays(day, 1);
    }

    if (m.checkpoint) {
      const own = letters.filter(l => l.module === m.n);
      const history = letters.filter(l => l.order <= (m.upTo ?? 0));
      const cp = buildCheckpoint(own, history, { audioAvailable: false, count: 12 });
      expect(cp.length, `checkpoint ${m.n}`).toBeGreaterThanOrEqual(8);
      practise(cp.length);
      s = recordCheckpoint(s, m.checkpoint.id, 1, day);
      expectedXp += XP.checkpoint;
      day = addDays(day, 1);
    }
  }

  /* The final challenge. */
  const final = buildCheckpoint(letters, letters, { audioAvailable: false, count: 20 });
  practise(final.length);
  s = { ...s, finalChallenge: { best: 1, completedAt: new Date().toISOString() } };
  s = { ...s, xp: s.xp + XP.checkpoint };
  expectedXp += XP.checkpoint;

  return { state: syncAchievements(s, day).state, expectedXp, answered, target, lessonDays };
}

describe('the whole course, played through', () => {
  const { state, expectedXp, answered, target, lessonDays } = playEverything();

  it('masters all 22 letters', () => {
    expect(lettersMastered(state)).toBe(22);
  });

  it('reaches 100% completion, counting modules 6 and 7', () => {
    expect(courseProgress(state, course.totalLetters, EXTRA_IDS)).toBe(1);
  });

  it('would NOT reach 100% if modules 6 and 7 were skipped', () => {
    /* The guard on the change that added them to the denominator. */
    const withoutExtras: LearnerState = {
      ...state,
      lessons: Object.fromEntries(
        Object.entries(state.lessons).filter(([id]) => !EXTRA_IDS.includes(id))
      )
    };
    expect(courseProgress(withoutExtras, course.totalLetters, EXTRA_IDS)).toBeLessThan(1);
  });

  it('passes every checkpoint, including the two extra modules', () => {
    const ids = [...course.modules.filter(m => m.checkpoint).map(m => m.checkpoint!.id), 'cp6', 'cp7'];
    for (const id of ids) {
      expect(state.checkpoints[id]?.passedAt, id).toBeTruthy();
    }
  });

  it('unlocks every achievement', () => {
    const have = new Set(state.achievements.map(a => a.id));
    for (const a of ACHIEVEMENTS) expect(have.has(a.id), a.id).toBe(true);
  });

  it('accumulates exactly the XP that was earned', () => {
    expect(state.xp).toBe(expectedXp);
  });

  it('keeps an unbroken streak across the whole run', () => {
    const metDays = Object.values(state.days).filter(d => d.goalMet).length;
    expect(metDays).toBeGreaterThanOrEqual(lessonDays.size);
    expect(state.streak.longest).toBe(state.streak.current);
    expect(state.streak.longest).toBeGreaterThanOrEqual(lessonDays.size);
  });

  it('meets the daily goal on every day a lesson was completed', () => {
    /* Doing the course as designed must be enough. If this fails, the goal is
       asking for work the course does not contain — which is exactly the bug
       this simulation was written to catch. */
    for (const d of lessonDays) {
      const rec = state.days[d]!;
      expect(rec.goalMet, `${d}: ${rec.units} of ${target} units`).toBe(true);
    }
    expect(lessonDays.size).toBe(24);          // 22 letters + modules 6 and 7
    expect(answered).toBeGreaterThan(200);
  });

  it('leaves no review debt after a perfect run', () => {
    expect(Object.keys(state.srs)).toHaveLength(0);
  });
});

describe('a learner who misses things', () => {
  it('builds a review from every prefix of the course without ever failing', () => {
    for (let upTo = 1; upTo <= letters.length; upTo++) {
      const learned = letters.filter(l => l.order <= upTo);
      const weak = learned.slice(-3).map(l => l.id);
      const rev = buildReview(weak, learned, { audioAvailable: false, count: 5 });
      /* Letter 1 alone cannot fill five distinct questions, and that is fine —
         what matters is that it never produces zero, or a broken one. */
      expect(rev.length, `review at ${upTo}`).toBeGreaterThan(0);
      for (const ex of rev) {
        if (!isChoice(ex)) continue;   // built and typed answers have no options
        expect(ex.options.length).toBeGreaterThanOrEqual(2);
        if (ex.kind !== 'odd-one-out') {
          expect(new Set(ex.options).size).toBe(ex.options.length);
        }
      }
    }
  });
});
