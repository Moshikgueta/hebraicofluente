/* Hebrew string handling. The ONLY place in the app that inspects a Hebrew
 * string character by character.
 *
 * The rule that everything else follows: a pointed Hebrew letter is 2–4
 * codepoints — the consonant plus the marks that ride on it — so any operation
 * that treats the string as an array of characters corrupts it. There is no
 * `.split('').reverse()` anywhere in this codebase, and there never can be:
 * direction is the browser's job (unicode-bidi: isolate), not ours.
 */

/** Combining marks: nikud, cantillation, dagesh, shin/sin dots. */
const POINTING = /[֑-ׇ]/;

/**
 * VOWEL marks only — sheva through qubuts, plus qamats qatan.
 *
 * Deliberately excludes three marks that look like pointing and are not vowels:
 * dagesh (U+05BC), which decides בּ from ב, and the shin and sin dots
 * (U+05C1/05C2), which decide שׁ from שׂ. They belong to the CONSONANT. Folding
 * them in would make "build the syllable" hand the learner a shin dot as if it
 * were a vowel, which is a different letter, not a different sound.
 */
const VOWEL = /[ְ-ׇֻ]/;

/** Base consonants א–ת, finals included. */
const CONSONANT = /[א-ת]/;

/** Invisible direction marks. They must never reach the DOM: they defeat
 *  isolation, survive copy-paste, and are impossible to see in a bug report. */
const INVISIBLE = /[‎‏؜​﻿]/g;

/** The 22 letters in alphabetical order, plus the five final forms. This is a
 *  property of the language, not of the course, so it is a constant — the
 *  course's own teaching order lives in the content. */
export const ALEFBET = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל',
  'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
] as const;
export const FINALS = ['ם', 'ן', 'ך', 'ף', 'ץ'] as const;
export const ALL_GLYPHS: readonly string[] = [...ALEFBET, ...FINALS];

export const FINAL_TO_BASE: Record<string, string> = {
  'ם': 'מ', 'ן': 'נ', 'ך': 'כ', 'ף': 'פ', 'ץ': 'צ'
};
export const BASE_TO_FINAL: Record<string, string> = {
  'מ': 'ם', 'נ': 'ן', 'כ': 'ך', 'פ': 'ף', 'צ': 'ץ'
};

/** NFC, minus invisibles. Everything entering a <He> passes through this. */
export function clean(text: string): string {
  return String(text ?? '').replace(INVISIBLE, '').normalize('NFC');
}

export const hasHebrew = (text: string): boolean => CONSONANT.test(clean(text));
export const hasNikud  = (text: string): boolean => POINTING.test(clean(text));

/** The consonants of a word, finals folded to their base letter. */
export function consonantsOf(text: string): string[] {
  const out: string[] = [];
  for (const ch of clean(text)) {
    if (!CONSONANT.test(ch)) continue;
    out.push(FINAL_TO_BASE[ch] ?? ch);
  }
  return out;
}

/** The word without its pointing — how Hebrew is actually printed in the wild. */
export function stripNikud(text: string): string {
  return [...clean(text)].filter(ch => !POINTING.test(ch)).join('');
}

/**
 * A word split into CLUSTERS: each consonant plus the marks that belong to it.
 * This is the only safe unit to move, hide or blank — and the reason the
 * "complete the word" exercise can put a gap in the right place instead of
 * leaving a bare vowel mark floating with nothing to sit on.
 */
export function clusters(text: string): string[] {
  const out: string[] = [];
  for (const ch of clean(text)) {
    if (CONSONANT.test(ch) || out.length === 0) out.push(ch);
    else out[out.length - 1] += ch;
  }
  return out;
}

/* ── taking a syllable apart ────────────────────────────────────────────
   A Hebrew syllable is a consonant and a vowel, and the course's central claim
   is that a reader combines them. To ASK the learner to combine them, the app
   has to be able to separate them first — and the separation is not "first
   character, rest", because a vowel can be written as a mark under the
   consonant (מַ), as a following letter carrying a mark (מוֹ, מוּ), or as
   nothing at all (shevá, which is a mark that says "no vowel").

   Both halves are returned as real strings that recombine to the original
   under NFC, and `splitSyllable` is proved round-trip for all 132 syllables in
   the content by tests/hebrew.test.ts. */

/** The consonant of a syllable, keeping the marks that identify it (שׁ, בּ). */
export function consonantPart(syllable: string): string {
  const first = clusters(syllable)[0] ?? '';
  return clean([...first].filter(ch => !VOWEL.test(ch)).join(''));
}

/**
 * The vowel of a syllable: the vowel marks on the consonant, plus any
 * following cluster (the vav of מוֹ and מוּ), in the order they were written.
 */
export function vowelPart(syllable: string): string {
  const cl = clusters(syllable);
  const first = cl[0] ?? '';
  const marks = [...first].filter(ch => VOWEL.test(ch)).join('');
  return clean(marks + cl.slice(1).join(''));
}

export const splitSyllable = (syllable: string): { consonant: string; vowel: string } =>
  ({ consonant: consonantPart(syllable), vowel: vowelPart(syllable) });

/**
 * Put a consonant and a vowel back together.
 *
 * NFC does the real work: written in the order a learner taps them, patach
 * (combining class 17) and a shin dot (class 24) can arrive in the wrong order,
 * and normalisation is what puts them back into the one canonical sequence the
 * font expects. Comparing two Hebrew strings that were not normalised is the
 * classic way to mark a right answer wrong.
 */
export const joinSyllable = (consonant: string, vowel: string): string =>
  clean(consonant + vowel);

/**
 * A bare vowel mark has nothing to sit on, so it renders as a stray dot or
 * lands on whatever precedes it. U+25CC DOTTED CIRCLE is Unicode's own carrier
 * for exactly this case: it is what the standard's own charts use.
 */
export const onCarrier = (mark: string): string =>
  VOWEL.test(mark[0] ?? '') || POINTING.test(mark[0] ?? '') ? `◌${mark}` : mark;

/** Does this word contain the letter, in base or final form? */
export function containsLetter(word: string, letter: string): boolean {
  const w = clean(word);
  const fin = BASE_TO_FINAL[letter];
  return w.includes(letter) || (!!fin && w.includes(fin));
}

/**
 * The word with the TARGET letter blanked, in reading order (right to left),
 * `null` marking the gap.
 *
 * Blanking the first cluster is the obvious implementation and it is wrong:
 * at the Kaf lesson מֶלֶךְ carries its kaf at the END, as ך, so the gap landed
 * on the mem and the exercise asked for a different letter than the one it
 * named. Find the target first; only then fall back.
 */
export function gapAtLetter(word: string, letter: string): (string | null)[] {
  const cl = clusters(word);
  const fin = BASE_TO_FINAL[letter];
  let idx = cl.findIndex(c => c[0] === letter);
  if (idx < 0 && fin) idx = cl.findIndex(c => c[0] === fin);
  if (idx < 0) idx = 0;

  const parts: (string | null)[] = [];
  cl.forEach((c, i) => {
    if (i === idx) { parts.push(null); return; }
    const last = parts[parts.length - 1];
    if (typeof last === 'string') parts[parts.length - 1] = last + c;
    else parts.push(c);
  });
  return parts;
}

/** Which glyph the gap in `gapAtLetter` expects back. */
export function gappedGlyph(word: string, letter: string): string {
  const cl = clusters(word);
  const fin = BASE_TO_FINAL[letter];
  if (cl.some(c => c[0] === letter)) return letter;
  if (fin && cl.some(c => c[0] === fin)) return fin;
  return letter;
}

/**
 * The vav of מוֹ and מוּ is not the letter vav.
 *
 * It is a *mater lectionis*: a vowel sign that happens to be shaped like a
 * letter. A learner reading מוֹ at lesson 1 is reading "mo" — they are not
 * reading a vav, and they need to know nothing about vav to do it. The course
 * has always taught it that way: every letter in the content carries all six
 * of its syllables from its own lesson, including the two built on vav, and
 * the printed workbook prints them on the letter's first page.
 *
 * So the order rule does not demand vav for a vav carrying holam or shuruk,
 * and this is the ONLY exemption in it. Two conditions, both required:
 *   · the vav carries holam (U+05B9) or the dagesh that makes shuruk (U+05BC),
 *     and no vowel of its own — וַ is a consonant and stays one;
 *   · something precedes it. A word-initial וֹ has no consonant to be the
 *     vowel of, so it is read as vav and must be known.
 *
 * Yod as a mater (מִי) is deliberately NOT exempt: this course's vocabulary
 * uses yod as a consonant, and a blanket exemption would let a word through
 * that the learner genuinely cannot read.
 */
const VAV_AS_VOWEL = /^ו[ֹּ]+$/;

/** The consonants a reader must already know to decode this word. */
export function consonantsToKnow(word: string): string[] {
  const out: string[] = [];
  clusters(word).forEach((cl, i) => {
    const base = cl[0] ?? '';
    if (!CONSONANT.test(base)) return;
    if (i > 0 && VAV_AS_VOWEL.test(clean(cl))) return;   // the mater, not the letter
    out.push(FINAL_TO_BASE[base] ?? base);
  });
  return out;
}

/**
 * Guard for the order rule at runtime: every consonant of `word` must be in
 * `alphabet`. The build already proves this for the workbook's own vocabulary
 * (validate.js V1); this is what stops a GENERATED distractor from smuggling
 * in a letter the learner has not met.
 */
export function isReadableWith(word: string, alphabet: readonly string[]): boolean {
  const allowed = new Set(alphabet.map(c => FINAL_TO_BASE[c] ?? c));
  return consonantsToKnow(word).every(c => allowed.has(c));
}
