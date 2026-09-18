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
 * Guard for the order rule at runtime: every consonant of `word` must be in
 * `alphabet`. The build already proves this for the workbook's own vocabulary
 * (validate.js V1); this is what stops a GENERATED distractor from smuggling
 * in a letter the learner has not met.
 */
export function isReadableWith(word: string, alphabet: readonly string[]): boolean {
  const allowed = new Set(alphabet.map(c => FINAL_TO_BASE[c] ?? c));
  return consonantsOf(word).every(c => allowed.has(c));
}
