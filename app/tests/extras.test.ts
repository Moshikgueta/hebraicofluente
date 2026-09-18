/* Modules 6 and 7, and the real-world scenes.
 *
 * These are the parts of the course with no letter of their own, which means
 * nothing else in the test suite touches them. */

import { describe, expect, it } from 'vitest';
import { extras, allLetters, scenesUpTo, scenesForOrder } from '../src/lib/content';
import { buildDageshQuiz, buildGerechQuiz } from '../src/lib/engine/extras';
import { clusters, consonantsOf, isReadableWith, stripNikud } from '../src/lib/hebrew';

const letters = allLetters();
const glyphsUpTo = (order: number) =>
  letters.filter(l => l.order <= order)
    .flatMap(l => (l.finalForm ? [l.letter, l.finalForm] : [l.letter]));

describe('module 6 — dagesh and the final forms', () => {
  it('pairs each dotted letter with a letter that exists', () => {
    for (const D of extras.dagesh.letters) {
      const L = letters.find(x => x.id === D.id);
      expect(L, D.id).toBeDefined();
      expect(stripNikud(D.hard)).toBe(L!.letter);
      expect(stripNikud(D.soft)).toBe(L!.letter);
    }
  });

  it('gives every dagesh word a hard/soft assignment that its spelling supports', () => {
    /* A "hard" word must actually carry the dagesh on the target letter; a
       "soft" one must not. If the data is wrong the course teaches the wrong
       sound, and nothing else in the suite would notice.

       The check looks at the whole CLUSTER, not at the next codepoint: NFC
       sorts combining marks by class, so in בַּיִת the patach (ccc 17) comes
       before the dagesh (ccc 21) and "the next character" is the vowel. That
       is what the first version of this test got wrong. */
    const DAGESH = '\u05BC';
    for (const D of extras.dagesh.letters) {
      for (const w of D.hardWords) {
        const cl = clusters(w.he).find(c => c[0] === D.soft);
        expect(cl, `${w.he} (${D.id}) has no ${D.soft}`).toBeDefined();
        expect(cl!.includes(DAGESH), `${w.he} (${D.id}) should carry a dagesh`).toBe(true);
      }
      for (const w of D.softWords) {
        const cl = clusters(w.he).find(c => c[0] === D.soft || c[0] === finalOf(D.soft));
        expect(cl, `${w.he} (${D.id}) has no ${D.soft}`).toBeDefined();
        expect(cl!.includes(DAGESH), `${w.he} (${D.id}) should NOT carry a dagesh`).toBe(false);
      }
    }
  });

  it('has the right five final forms, each with an example that uses it', () => {
    expect(extras.finals).toHaveLength(5);
    const expected: Record<string, string> = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };
    for (const F of extras.finals) {
      expect(expected[F.base], `${F.base}`).toBe(F.fin);
      expect(F.word.includes(F.fin), `${F.word} should contain ${F.fin}`).toBe(true);
    }
  });

  it('strips the nikud correctly for the unpointed reading list', () => {
    for (const u of extras.unpointed.words) {
      expect(stripNikud(u.pointed)).toBe(u.bare);
    }
  });

  it('builds a quiz of the requested size, with no duplicate options', () => {
    const quiz = buildDageshQuiz(extras, 10, 'test');
    expect(quiz).toHaveLength(10);
    for (const ex of quiz) {
      expect(new Set(ex.options).size).toBe(ex.options.length);
      expect(ex.options.length).toBeGreaterThanOrEqual(2);
      expect(ex.answer).toBeGreaterThanOrEqual(0);
      expect(ex.answer).toBeLessThan(ex.options.length);
    }
  });

  it('is deterministic', () => {
    expect(JSON.stringify(buildDageshQuiz(extras, 10, 's')))
      .toBe(JSON.stringify(buildDageshQuiz(extras, 10, 's')));
  });
});

describe('module 7 — the gerech', () => {
  it('spells each letter as base + U+05F3, not an ASCII apostrophe', () => {
    for (const g of extras.gerech.letters) {
      expect(g.he).toBe(g.base + '׳');
      expect(g.he).not.toContain("'");
    }
  });

  it('gives every loanword the letter it is meant to demonstrate', () => {
    for (const g of extras.gerech.letters) {
      for (const w of g.words) {
        expect(w.he.includes(g.he), `${w.he} should contain ${g.he}`).toBe(true);
      }
    }
  });

  it('builds a usable quiz', () => {
    const quiz = buildGerechQuiz(extras, 8, 'test');
    expect(quiz).toHaveLength(8);
    for (const ex of quiz) {
      expect(new Set(ex.options).size).toBe(ex.options.length);
      expect(ex.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('«Hebraico no mundo real»', () => {
  it('never shows a scene the learner cannot decode', () => {
    /* The whole point of the feature is that it feels like a reward. A sign
       with an unlearned letter in it is the opposite. */
    for (let order = 1; order <= letters.length; order++) {
      for (const s of scenesUpTo(order)) {
        expect(
          isReadableWith(s.he, glyphsUpTo(order)),
          `${s.id} (${s.he}) at order ${order}`
        ).toBe(true);
      }
    }
  });

  it('gives every scene a reading and a meaning', () => {
    for (const s of scenesUpTo(22)) {
      expect(s.translit, s.id).toBeTruthy();
      expect(s.pt, s.id).toBeTruthy();
      expect(consonantsOf(s.he).length, s.id).toBeGreaterThan(0);
    }
  });

  it('unlocks the first scene only once there is something to read', () => {
    expect(scenesUpTo(2)).toHaveLength(0);
    expect(scenesUpTo(22).length).toBeGreaterThan(10);
  });

  it('attaches each scene to exactly one letter', () => {
    const all = scenesUpTo(22);
    const attached = letters.flatMap(l => scenesForOrder(l.order));
    expect(attached).toHaveLength(all.length);
  });
});

const FINAL: Record<string, string> = { 'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ' };
const finalOf = (c: string) => FINAL[c] ?? c;
