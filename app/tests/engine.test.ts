/* The exercise engine v2: variety, construction, and typed answers.
 *
 * The order rule is proved elsewhere, over every exercise the course can
 * generate. This file proves the other half — that the new kinds are actually
 * answerable, that the thing they ask the learner to assemble really does
 * assemble, and that a lesson stops being the same gesture thirteen times. */

import { describe, expect, it } from 'vitest';
import { allLetters, course, scenesUpTo } from '@/lib/content';
import {
  buildCheckpoint, buildConfusionDrill, buildFinalChallenge, buildLessonQuiz, buildReview,
  isChoice, spread, typedIsCorrect, violatesOrderRule
} from '@/lib/engine/exercises';
import { normalizeTyped } from '@/lib/engine/types';
import { clean, clusters, joinSyllable, splitSyllable } from '@/lib/hebrew';

const letters = allLetters();
const historyFor = (order: number) => letters.filter(l => l.order <= order);

describe('variety', () => {
  it('gives a full lesson at least five different gestures', () => {
    /* The old engine had eight generators that were all "tap one of four", so
       a varied-looking quiz was one gesture with different words in it. */
    for (const L of letters) {
      const quiz = buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 13 });
      const kinds = new Set(quiz.map(e => e.kind));
      expect(kinds.size, `${L.id}: ${[...kinds].join(', ')}`).toBeGreaterThanOrEqual(5);
    }
  });

  it('never asks the same gesture twice in a row, anywhere', () => {
    const runs: string[] = [];
    const check = (label: string, list: { kind: string; id: string }[]) => {
      for (let i = 1; i < list.length; i++) {
        if (list[i]!.kind === list[i - 1]!.kind) runs.push(`${label}: ${list[i]!.id}`);
      }
    };
    for (const L of letters) {
      check(`quiz ${L.id}`, buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 13 }));
    }
    for (const m of course.modules) {
      if (!m.letterIds.length || m.upTo == null) continue;
      const own = letters.filter(l => l.module === m.n);
      check(`cp${m.n}`, buildCheckpoint(own, historyFor(m.upTo), { audioAvailable: true, count: 12 }));
    }
    for (let upTo = 3; upTo <= letters.length; upTo += 4) {
      const learned = historyFor(upTo);
      check(`rev@${upTo}`, buildReview(learned.slice(-3).map(l => l.id), learned,
        { audioAvailable: true, count: 8 }));
    }
    expect(runs).toEqual([]);
  });

  it('leaves a set of all-one-kind alone rather than failing', () => {
    /* spread() reorders; it cannot invent variety that is not there, and
       pretending otherwise would mean dropping questions. */
    const one = [
      { kind: 'match', id: 'a' }, { kind: 'match', id: 'b' }, { kind: 'match', id: 'c' }
    ] as unknown as Parameters<typeof spread>[0];
    expect(spread(one).map(e => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('covers more than one skill in every lesson', () => {
    for (const L of letters) {
      const quiz = buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 13 });
      expect(new Set(quiz.map(e => e.skill)).size, L.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('can be narrowed to one skill when the learner is weak in it', () => {
    const L = letters[15]!;
    const quiz = buildLessonQuiz(L, historyFor(L.order), {
      audioAvailable: true, count: 6, skills: ['rec']
    });
    expect(quiz.length).toBeGreaterThan(0);
    for (const ex of quiz) expect(ex.skill).toBe('rec');
  });

  it('still withholds every listening kind when there are no recordings', () => {
    for (const L of letters) {
      const quiz = buildLessonQuiz(L, historyFor(L.order), { audioAvailable: false, count: 20 });
      for (const ex of quiz) expect(ex.skill, ex.id).not.toBe('ouvir');
    }
  });
});

describe('build the syllable', () => {
  it('assembles back to exactly the syllable it asked for', () => {
    let seen = 0;
    for (const L of letters) {
      for (const ex of buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 20 })) {
        if (ex.kind !== 'build-syllable') continue;
        seen++;
        const built = joinSyllable(ex.consonant, ex.vowels[ex.answer]!);
        expect(built, `${ex.id}`).toBe(clean(ex.target));
      }
    }
    expect(seen, 'no build-syllable exercises were generated at all').toBeGreaterThan(15);
  });

  it('never offers the same vowel twice', () => {
    for (const L of letters) {
      for (const ex of buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 20 })) {
        if (ex.kind !== 'build-syllable') continue;
        expect(new Set(ex.vowels).size, ex.id).toBe(ex.vowels.length);
      }
    }
  });

  it('keeps the shin dot with the consonant, not with the vowel', () => {
    /* שׁ against שׂ is a different LETTER, not a different vowel. Handing the
       learner a shin dot in the vowel row would teach the opposite. */
    const shin = letters.find(l => l.id === 'shin')!;
    const { consonant, vowel } = splitSyllable(shin.syllables[0]!.he);
    expect(consonant).toContain('ׁ');
    expect(vowel).not.toContain('ׁ');
  });

  it('round-trips every syllable in the course', () => {
    for (const L of letters) {
      for (const s of L.syllables) {
        const { consonant, vowel } = splitSyllable(s.he);
        expect(joinSyllable(consonant, vowel), `${L.id} ${s.translit}`).toBe(clean(s.he));
      }
    }
  });
});

describe('build the word', () => {
  it('assembles back to the word, tile for tile', () => {
    let seen = 0;
    for (const L of letters) {
      for (const ex of buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 25 })) {
        if (ex.kind !== 'build-word') continue;
        seen++;
        expect([...ex.tiles].sort().join('')).toBe([...clusters(ex.target)].sort().join(''));
        expect(ex.tiles.length, ex.id).toBeGreaterThanOrEqual(3);
      }
    }
    expect(seen, 'no build-word exercises were generated').toBeGreaterThan(5);
  });

  it('never hands the learner the answer already in order', () => {
    for (const L of letters) {
      for (const ex of buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 25 })) {
        if (ex.kind !== 'build-word') continue;
        expect(ex.tiles.join(''), ex.id).not.toBe(clean(ex.target));
      }
    }
  });
});

describe('matching', () => {
  it('pairs are unique on both sides', () => {
    /* Two identical right-hand items make a pair that cannot be got wrong, and
       a learner who notices spends the rest of the exercise looking for them
       instead of reading. */
    for (const L of letters) {
      for (const ex of buildLessonQuiz(L, historyFor(L.order), { audioAvailable: true, count: 25 })) {
        if (ex.kind !== 'match') continue;
        expect(new Set(ex.pairs.map(p => p.left)).size, `${ex.id} left`).toBe(ex.pairs.length);
        expect(new Set(ex.pairs.map(p => p.right)).size, `${ex.id} right`).toBe(ex.pairs.length);
        expect(ex.pairs.length, ex.id).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('typed answers are forgiving about the right things', () => {
  it('ignores the accents this course uses as stress hints', () => {
    expect(typedIsCorrect('shana', ['shaná'])).toBe(true);
    expect(typedIsCorrect('SHANÁ', ['shaná'])).toBe(true);
    expect(typedIsCorrect('  shaná  ', ['shaná'])).toBe(true);
  });

  it('ignores a typed geresh or hyphen', () => {
    expect(typedIsCorrect("ma'im", ['maim'])).toBe(true);
    expect(typedIsCorrect('ma-im', ['maim'])).toBe(true);
  });

  it('does NOT collapse distinctions the course teaches', () => {
    expect(typedIsCorrect('sam', ['sham'])).toBe(false);
    expect(typedIsCorrect('kar', ['car'])).toBe(false);
  });

  it('never accepts an empty answer', () => {
    expect(typedIsCorrect('', ['shalom'])).toBe(false);
    expect(typedIsCorrect('   ', ['shalom'])).toBe(false);
  });

  it('normalises the same way on both sides', () => {
    expect(normalizeTyped('Á É Í')).toBe('a e i');
  });
});

describe('confusion drills', () => {
  it('builds a drill for a pair the learner actually confuses', () => {
    const dalet = letters.find(l => l.id === 'dalet')!;
    const resh = letters.find(l => l.id === 'resh')!;
    const drill = buildConfusionDrill(dalet, resh, { count: 6 });
    expect(drill.length).toBeGreaterThanOrEqual(4);
    /* Both letters, not just the one that was answered wrong. */
    expect(new Set(drill.map(e => e.letterId))).toEqual(new Set(['dalet', 'resh']));
    for (const ex of drill) expect(['rec', 'ler']).toContain(ex.skill);
  });

  it('is deterministic', () => {
    const a = letters.find(l => l.id === 'bet')!;
    const b = letters.find(l => l.id === 'kaf')!;
    expect(JSON.stringify(buildConfusionDrill(a, b)))
      .toBe(JSON.stringify(buildConfusionDrill(a, b)));
  });
});

describe('the vav of מוֹ is a vowel, not a letter', () => {
  it('lets a learner read mo at lesson one', () => {
    const mem = letters.find(l => l.id === 'mem')!;
    const quiz = buildLessonQuiz(mem, [mem], { audioAvailable: true, count: 25 });
    const syllables = quiz.filter(e => e.kind === 'build-syllable' || e.kind === 'sound-to-syllable');
    expect(syllables.length).toBeGreaterThan(0);
  });

  it('still refuses a word whose vav is a consonant', () => {
    const mem = letters.find(l => l.id === 'mem')!;
    const quiz = buildLessonQuiz(mem, [mem], { audioAvailable: true, count: 25 });
    for (const ex of quiz) {
      if (!isChoice(ex)) continue;
      for (const o of ex.options) expect(o).not.toContain('וַ');
    }
  });
});

describe('a review is never empty', () => {
  /* It came back with nothing for a learner whose weakest skill was listening
     while no recordings existed: the narrowing left no generator that could
     run. The learner was told the course could not build five questions, which
     it plainly could. Aiming at the failing skill is a preference, not a
     promise. */
  it('falls back to every generator rather than returning nothing', () => {
    for (let upTo = 1; upTo <= letters.length; upTo++) {
      const learned = historyFor(upTo);
      const weak = learned.slice(-2).map(l => l.id);
      for (const skills of [['ouvir'], ['escrever'], ['ouvir', 'escrever']] as const) {
        const rev = buildReview(weak, learned, {
          audioAvailable: false, count: 5, skills: skills as never
        });
        expect(rev.length, `@${upTo} skills=${skills.join(',')}`).toBeGreaterThan(0);
        for (const ex of rev) expect(ex.skill).not.toBe('ouvir');
      }
    }
  });

  it('still honours the narrowing when it CAN be honoured', () => {
    const learned = historyFor(12);
    const rev = buildReview(learned.slice(-3).map(l => l.id), learned, {
      audioAvailable: false, count: 6, skills: ['rec']
    });
    expect(rev.length).toBeGreaterThan(0);
    for (const ex of rev) expect(ex.skill).toBe('rec');
  });
});

describe('the final challenge', () => {
  const scenes = scenesUpTo(22).map(s => ({
    id: s.id, he: s.he, pt: s.pt, translit: s.translit,
    labelPt: s.labelPt, contextPt: s.contextPt, audioId: s.audioId, fromOrder: s.fromOrder
  }));

  it('ends on the street, not on the alphabet', () => {
    const run = buildFinalChallenge(letters, scenes, { audioAvailable: false, count: 20 });
    expect(run).toHaveLength(20);
    const sceneCount = run.filter(e => e.kind === 'scene-reading').length;
    expect(sceneCount).toBeGreaterThanOrEqual(3);
    expect(sceneCount).toBeLessThanOrEqual(6);
    /* And they come LAST: a learner who has just worked through twenty
       questions about letters should finish by reading Hebrew that was not
       written for them. */
    const lastKinds = run.slice(-3).map(e => e.kind);
    expect(new Set(lastKinds)).toEqual(new Set(['scene-reading']));
  });

  it('asks about real words with real places', () => {
    const run = buildFinalChallenge(letters, scenes, { audioAvailable: false, count: 20 });
    for (const ex of run) {
      if (ex.kind !== 'scene-reading') continue;
      expect(ex.he.length).toBeGreaterThan(0);
      expect(ex.wherePt.length).toBeGreaterThan(0);
      expect(ex.options).toContain(ex.options[ex.answer]);
      expect(new Set(ex.options).size).toBe(ex.options.length);
    }
  });

  it('never shows a word the course did not teach', () => {
    const alphabet = letters.flatMap(l => l.finalForm ? [l.letter, l.finalForm] : [l.letter]);
    const run = buildFinalChallenge(letters, scenes, { audioAvailable: true, count: 24 });
    for (const ex of run) expect(violatesOrderRule(ex, alphabet), ex.id).toEqual([]);
  });

  it('is deterministic', () => {
    expect(JSON.stringify(buildFinalChallenge(letters, scenes, { count: 20 })))
      .toBe(JSON.stringify(buildFinalChallenge(letters, scenes, { count: 20 })));
  });
});

describe('a checkpoint is a demonstration, not a longer lesson', () => {
  it('covers shape, sound and reading in every module', () => {
    for (const m of course.modules) {
      if (!m.letterIds.length || m.upTo == null) continue;
      const own = letters.filter(l => l.module === m.n);
      const cp = buildCheckpoint(own, historyFor(m.upTo), { audioAvailable: false, count: 12 });
      const skills = new Set(cp.map(e => e.skill));
      for (const want of ['rec', 'som', 'ler'] as const) {
        expect(skills.has(want), `cp${m.n} has no ${want}: ${[...skills].join(',')}`).toBe(true);
      }
    }
  });

  it('adds listening as a fourth dimension once there are recordings', () => {
    const m = course.modules.find(x => x.n === 3)!;
    const own = letters.filter(l => l.module === m.n);
    const cp = buildCheckpoint(own, historyFor(m.upTo!), { audioAvailable: true, count: 12 });
    expect(new Set(cp.map(e => e.skill)).has('ouvir')).toBe(true);
  });

  it('still fills the whole checkpoint', () => {
    for (const m of course.modules) {
      if (!m.letterIds.length || m.upTo == null) continue;
      const own = letters.filter(l => l.module === m.n);
      const cp = buildCheckpoint(own, historyFor(m.upTo), { audioAvailable: false, count: 12 });
      expect(cp.length, `cp${m.n}`).toBe(12);
    }
  });
});
