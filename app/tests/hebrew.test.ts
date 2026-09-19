/* Unicode-safe Hebrew handling. Each case here is a bug that would be
   invisible in review and obvious to a Hebrew reader on the page. */

import { describe, expect, it } from 'vitest';
import {
  clean, clusters, consonantsOf, containsLetter, gapAtLetter, gappedGlyph,
  hasNikud, isReadableWith, stripNikud
} from '../src/lib/hebrew';

describe('clusters', () => {
  it('keeps a consonant and its pointing together', () => {
    /* מַיִם is 5 codepoints and 3 letters. Anything that treats it as 5 units
       - including [...str] - puts a vowel mark on its own. */
    expect([...'מַיִם'].length).toBe(5);
    expect(clusters('מַיִם')).toEqual(['מַ', 'יִ', 'ם']);
  });

  it('handles shin dot plus vowel on one letter', () => {
    expect(clusters('שֵׁם')).toEqual(['שֵׁ', 'ם']);
  });
});

describe('consonantsOf', () => {
  it('folds final forms to the base letter', () => {
    expect(consonantsOf('מֶלֶךְ')).toEqual(['מ', 'ל', 'כ']);
    expect(consonantsOf('אֶרֶץ')).toEqual(['א', 'ר', 'צ']);
  });
});

describe('gapAtLetter', () => {
  it('blanks the TARGET letter, not the first one', () => {
    /* The bug this exists for: at the Kaf lesson מֶלֶךְ carries its kaf at the
       end, as ך, and blanking the first cluster asked for the mem instead. */
    const parts = gapAtLetter('מֶלֶךְ', 'כ');
    expect(parts[parts.length - 1]).toBeNull();
    expect(gappedGlyph('מֶלֶךְ', 'כ')).toBe('ך');
  });

  it('blanks the base form when the word has one', () => {
    expect(gappedGlyph('כֶּלֶב', 'כ')).toBe('כ');
    expect(gapAtLetter('כֶּלֶב', 'כ')[0]).toBeNull();
  });

  it('leaves the rest of the word readable', () => {
    const joined = gapAtLetter('שָׁלוֹם', 'ש').filter(Boolean).join('');
    expect(stripNikud(joined)).toBe('לום');
  });
});

describe('containsLetter', () => {
  it('sees a letter present only in final form', () => {
    expect(containsLetter('קרם', 'מ')).toBe(true);
    expect(containsLetter('אַתְּ', 'ה')).toBe(false);
  });
});

describe('clean', () => {
  it('strips invisible direction marks', () => {
    /* An LRM or RLM in the content survives copy-paste, defeats isolation and
       is impossible to spot in a bug report. */
    expect(clean('‎שָׁלוֹם‏')).toBe('שָׁלוֹם');
  });

  it('normalises to NFC', () => {
    const decomposed = 'שָׁם'.normalize('NFD');
    expect(clean(decomposed)).toBe('שָׁם'.normalize('NFC'));
  });

  it('keeps nikud', () => {
    expect(hasNikud(clean('מַיִם'))).toBe(true);
  });
});

describe('isReadableWith', () => {
  it('accepts a final form when the base letter is known', () => {
    expect(isReadableWith('יוֹם', ['י', 'ו', 'מ', 'ם'])).toBe(true);
  });
  it('rejects an unknown consonant', () => {
    expect(isReadableWith('יוֹם', ['י', 'ו'])).toBe(false);
  });
});
