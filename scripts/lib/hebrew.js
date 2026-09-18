/* Hebrew text primitives. Every other module goes through this one.
   No direction decisions live here — those are in render.js. This file only
   knows about codepoints. */

/* Pointing: nikud + the shin/sin dots + dagesh + meteg + maqaf + sof pasuq.
   U+0591–U+05AF are cantillation marks (te'amim) — not used in this workbook,
   but stripped alongside the vowels so a pasted biblical string normalises. */
export const POINTING = /[֑-ׇ]/g;

/* Invisible direction marks. A string pasted from a word processor routinely
   carries these, and they are the classic source of a bidi bug nobody can
   reproduce — they are invisible in every editor. Stripped at data load. */
export const INVISIBLES = /[‎‏؜‪-‮⁦-⁩]/g;

export const HEBREW_CHAR = /[֐-׿יִ-ﭏ]/;

/* Final form → base letter. Used by the order check: a word ending in ם is
   using מ, and must be allowed exactly when מ has been taught. */
export const FINAL_TO_BASE = {
  'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ'
};
export const BASE_TO_FINAL = {
  'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ'
};

/* The 22 consonants in alphabetical (not teaching) order — for the appendix. */
export const ALEFBET = [
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל',
  'מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'
];

/** Remove invisible direction marks. Always applied at data load. */
export function clean(s) {
  return String(s == null ? '' : s).replace(INVISIBLES, '');
}

/** Drop all pointing. `stripNikud('בְּרֵאשִׁית') === 'בראשית'` */
export function stripNikud(s) {
  return clean(s).normalize('NFC').replace(POINTING, '');
}

/** True when the string carries at least one pointing mark. */
export function hasNikud(s) {
  return POINTING.test(stripReset(clean(s)));
}
function stripReset(s) { POINTING.lastIndex = 0; return s; }

/** True when the string contains any Hebrew codepoint. */
export function hasHebrew(s) {
  return HEBREW_CHAR.test(clean(s));
}

/**
 * The bare consonants of a word, finals folded to their base letter.
 * This is what the order rule (V1) compares against.
 */
export function consonantsOf(word) {
  return [...stripNikud(word)]
    .filter(ch => /[א-ת]/.test(ch))
    .map(ch => FINAL_TO_BASE[ch] || ch);
}

/**
 * Normalised form for comparison. Nikud-insensitive by default — the single
 * most important default in the project. `strict` keeps the pointing, for the
 * rare exercise that is explicitly about the vowels themselves.
 *
 * Also folds the ASCII quotes a learner will actually type onto the Hebrew
 * geresh/gershayim they stand for, and drops maqaf and Hebrew punctuation.
 */
export function normalize(s, { strictNikud = false } = {}) {
  let v = clean(s).normalize('NFC');
  if (!strictNikud) v = v.replace(POINTING, '');
  return v
    .replace(/[׳']/g, '׳')     // geresh  ׳ ← '
    .replace(/[״"]/g, '״')     // gershayim ״ ← "
    .replace(/[־-]/g, ' ')          // maqaf ־ behaves as a space
    .replace(/[׃.,;:!?()\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every distinct Hebrew letter used in a string, finals folded. */
export function lettersUsed(s) {
  return [...new Set(consonantsOf(s))];
}
