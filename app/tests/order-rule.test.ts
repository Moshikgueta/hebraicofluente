/* The order rule, proved over every exercise the course can generate.
 *
 * This is the single most important test in the app. The workbook guarantees
 * it for authored vocabulary (validate.js V1); nothing but this guarantees it
 * for a GENERATED distractor, which is where it would break silently - a
 * plausible-looking wrong option carrying a letter the learner has never seen,
 * on a screen nobody reviewed because there are 22 × 8 of them. */

import { describe, expect, it } from 'vitest';
import { allLetters, course } from '../src/lib/content';
import {
  buildCheckpoint, buildLessonQuiz, buildReview, glyphOptionsOf, isChoice, readingUsedBy,
  violatesOrderRule
} from '../src/lib/engine/exercises';
import { ALL_GLYPHS, isReadableWith } from '../src/lib/hebrew';

const letters = allLetters();

describe('the order rule', () => {
  it('holds for every lesson quiz of every letter', () => {
    const offences: string[] = [];
    for (const L of letters) {
      const history = letters.filter(x => x.order <= L.order);
      for (const audioAvailable of [false, true]) {
        for (const ex of buildLessonQuiz(L, history, { audioAvailable, count: 25 })) {
          const bad = violatesOrderRule(ex, L.alphabetSoFar);
          if (bad.length) offences.push(`${L.id} · ${ex.id} · ${bad.join(', ')}`);
        }
      }
    }
    expect(offences).toEqual([]);
  });

  it('holds for every checkpoint', () => {
    const offences: string[] = [];
    for (const m of course.modules) {
      if (!m.letterIds.length || m.upTo == null) continue;
      const own = letters.filter(l => l.module === m.n);
      const history = letters.filter(l => l.order <= m.upTo!);
      const alphabet = history.flatMap(l => l.finalForm ? [l.letter, l.finalForm] : [l.letter]);
      for (const ex of buildCheckpoint(own, history, { audioAvailable: true, count: 30 })) {
        const bad = violatesOrderRule(ex, alphabet);
        if (bad.length) offences.push(`cp${m.n} · ${ex.id} · ${bad.join(', ')}`);
      }
    }
    expect(offences).toEqual([]);
  });

  it('holds for a review drawn from any prefix of the course', () => {
    const offences: string[] = [];
    for (let upTo = 1; upTo <= letters.length; upTo++) {
      const learned = letters.filter(l => l.order <= upTo);
      const alphabet = learned.flatMap(l => l.finalForm ? [l.letter, l.finalForm] : [l.letter]);
      const weak = learned.slice(-3).map(l => l.id);
      for (const ex of buildReview(weak, learned, { audioAvailable: true, count: 20 })) {
        const bad = violatesOrderRule(ex, alphabet);
        if (bad.length) offences.push(`rev@${upTo} · ${ex.id} · ${bad.join(', ')}`);
      }
    }
    expect(offences).toEqual([]);
  });

  /* The negative case. Without it the three tests above could be passing
     because the checker never rejects anything. */
  it('rejects a word that uses a letter taught later', () => {
    const mem = letters.find(l => l.id === 'mem')!;
    expect(isReadableWith('שָׁלוֹם', mem.alphabetSoFar)).toBe(false);
    expect(isReadableWith('מַיִם', mem.alphabetSoFar)).toBe(false);   // needs yod
    expect(isReadableWith('מָם', mem.alphabetSoFar)).toBe(true);
  });

  it('never generates an empty or single-option question', () => {
    for (const L of letters) {
      const history = letters.filter(x => x.order <= L.order);
      for (const ex of buildLessonQuiz(L, history, { audioAvailable: true, count: 20 })) {
        if (isChoice(ex)) {
          expect(ex.options.length, `${ex.id}`).toBeGreaterThanOrEqual(3);
          expect(ex.answer, `${ex.id}`).toBeGreaterThanOrEqual(0);
          expect(ex.answer, `${ex.id}`).toBeLessThan(ex.options.length);
          /* Odd-one-out is the one kind whose options are DELIBERATELY the same
             glyph over and over - that is the exercise. Everywhere else a
             repeated option means the question has two right answers. */
          if (ex.kind !== 'odd-one-out') {
            expect(new Set(ex.options).size, `${ex.id} has duplicate options`)
              .toBe(ex.options.length);
          }
        }
        /* Something has to be presented. For most kinds that is Hebrew on
           screen; for "escreva o que você ouviu" it is deliberately only the
           recording, which is the whole point of that exercise. */
        const presents =
          readingUsedBy(ex).length + glyphOptionsOf(ex).length + (ex.audioId ? 1 : 0);
        expect(presents, `${ex.id} presents nothing`).toBeGreaterThan(0);
      }
    }
  });

  /* Every kind carries the two facts the adaptive layer depends on. They used
     to be inferred - the letter by splitting the id on a hyphen, the skill not
     at all - and an inferred fact is one that breaks silently. */
  it('labels every exercise with its letter and its skill', () => {
    const ids = new Set(letters.map(l => l.id));
    const skills = new Set(['rec', 'som', 'ler', 'ouvir', 'escrever']);
    for (const L of letters) {
      const history = letters.filter(x => x.order <= L.order);
      for (const ex of buildLessonQuiz(L, history, { audioAvailable: true, count: 20 })) {
        expect(ids.has(ex.letterId), `${ex.id} letterId=${ex.letterId}`).toBe(true);
        expect(skills.has(ex.skill), `${ex.id} skill=${ex.skill}`).toBe(true);
        expect(ex.promptPt.length, `${ex.id} has no prompt`).toBeGreaterThan(0);
        expect(ex.explainPt.length, `${ex.id} has no explanation`).toBeGreaterThan(0);
      }
    }
  });

  it('is deterministic - the same lesson yields the same quiz', () => {
    const L = letters[8]!;
    const history = letters.filter(x => x.order <= L.order);
    const a = buildLessonQuiz(L, history, { audioAvailable: false });
    const b = buildLessonQuiz(L, history, { audioAvailable: false });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  /* The other half of the contract: a single-letter distractor MAY be a letter
     the learner has not met - telling מ from ס needs no knowledge of ס, and the
     printed workbook draws distractors the same way from its first page. What
     it may never be is something that is not a Hebrew letter. */
  it('offers only real Hebrew letters as glyph distractors', () => {
    const legal = new Set(ALL_GLYPHS);
    for (const L of letters) {
      const history = letters.filter(x => x.order <= L.order);
      for (const ex of buildLessonQuiz(L, history, { audioAvailable: true })) {
        for (const g of glyphOptionsOf(ex)) {
          expect(legal.has(g), `${ex.id} offered ${JSON.stringify(g)}`).toBe(true);
        }
      }
    }
  });

  it('gives every letter a quiz of at least five questions', () => {
    /* Letter 1 used to get three, because the strict rule left no legal
       distractor when the whole known alphabet was מ and ם. */
    for (const L of letters) {
      const history = letters.filter(x => x.order <= L.order);
      const quiz = buildLessonQuiz(L, history, { audioAvailable: false, count: 8 });
      expect(quiz.length, `${L.id} got ${quiz.length} questions`).toBeGreaterThanOrEqual(5);
    }
  });

  it('drops listening exercises while there are no recordings', () => {
    for (const L of letters) {
      const history = letters.filter(x => x.order <= L.order);
      const quiz = buildLessonQuiz(L, history, { audioAvailable: false });
      expect(quiz.some(e => e.kind === 'audio-recognition')).toBe(false);
    }
  });
});
