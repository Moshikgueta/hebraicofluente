/* The bidi contract.
   ─────────────────────────────────────────────────────────────────────────
   `he()` is the ONLY way a Hebrew codepoint may reach the output. Every
   template calls it; validate.js (V8) scans dist/ and fails the build if a
   Hebrew character appears outside a .he span.

   Why this exists, concretely. In the reference PDF:

     · the title renders as  "A letra מ — Mem (מֵם)"  with the closing paren
       on the wrong side, because the paren is a neutral character sitting
       between an RTL run and the line end;
     · "Encontre todas as letras מ: מים / בית / מה / שלום / מי" renders with
       the whole list reversed, because the colons and slashes are neutrals
       that join the RTL run;
     · worst, the matching exercise "Ma • מה / Mayim • מים / Mi • מי" renders
       re-paired as Mayim•מי and Mi•מים — a bidi artefact that silently
       teaches the wrong answer.

   `unicode-bidi: isolate` on every Hebrew span makes each run its own bidi
   paragraph, so no neutral outside it can be dragged in and no neutral inside
   it can escape. The rule that punctuation never enters the span is what
   fixes the third case for good. */

import { clean, hasHebrew } from './hebrew.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);

/* Characters that must never sit inside a .he span. Neutrals adjacent to an
   RTL run are exactly what reorders wrongly; kept outside, they belong to the
   surrounding LTR paragraph and stay put. Checked by validate.js (V9). */
const FORBIDDEN_IN_SPAN = /[()\[\]{}:;\/,<>«»"|]/;

/**
 * Wrap Hebrew for an LTR page.
 *   he('שָׁלוֹם')                     → <span class="he" lang="he">שָׁלוֹם</span>
 *   he('מ', { size: 'display' })     → adds .he--display
 *   he('מים', { mark: 'מ' })         → wraps the target letter in <b class="he-mark">
 *
 * `mark` highlights one letter inside the word in teal, the way the reference
 * does on the "Palavras úteis" page. It marks the FIRST occurrence only,
 * which is what the reference does and what keeps the eye on one target.
 */
export function he(text, opts = {}) {
  const raw = clean(text);
  if (!raw) return '';
  if (FORBIDDEN_IN_SPAN.test(raw)) {
    throw new Error(
      `he(): punctuation inside a Hebrew span — ${JSON.stringify(raw)}\n` +
      `      Put the Hebrew in its own he() call and the punctuation outside it.`
    );
  }
  const cls = ['he'];
  if (opts.size) cls.push(`he--${opts.size}`);
  if (opts.cursive) cls.push('he--cursive');
  if (opts.className) cls.push(opts.className);

  let inner = esc(raw);
  if (opts.mark) {
    const m = esc(clean(opts.mark));
    const at = inner.indexOf(m);
    if (at >= 0) {
      inner = inner.slice(0, at) + `<b class="he-mark">${m}</b>` + inner.slice(at + m.length);
    }
  }
  return `<span class="${cls.join(' ')}" lang="he">${inner}</span>`;
}

/**
 * A mixed Portuguese + Hebrew sentence, built from alternating parts so no
 * template ever concatenates Hebrew into a Latin string by hand.
 *
 *   mixed(['A letra ', H('מ'), ' representa o som /m/.'])
 *
 * Latin parts are escaped; H() parts are already-rendered Hebrew spans.
 */
export function mixed(parts) {
  return parts.map(p => (p && p.__html ? p.__html : esc(p))).join('');
}

/** Marks a rendered fragment as pre-escaped HTML for mixed(). */
export const H = (text, opts) => ({ __html: he(text, opts) });
export const raw = html => ({ __html: String(html) });

/**
 * A Hebrew sequence to be read in order.
 *
 * The container is its own RTL isolate, so items run right-to-left — the
 * order a Hebrew reader actually reads — with items[0] rightmost, and the
 * separators sit between them instead of drifting. Because the container is
 * isolated, nothing outside it (a Portuguese label, a colon) can join the
 * run. That is precisely the reference PDF's "Encontre todas as letras מ:"
 * bug: the label's colon was pulled into the Hebrew run and the whole list
 * flipped.
 */
export function heList(items, opts = {}) {
  const sep = opts.sep || '/';
  const rendered = items.map(t => he(t, { size: opts.size, cursive: opts.cursive }));
  return `<span class="he-list" lang="he">${rendered.join(
    `<span class="he-sep" aria-hidden="true">${esc(sep)}</span>`
  )}</span>`;
}

/**
 * A pair "Latin • Hebrew" for matching exercises. Each side is isolated and
 * the bullet is a neutral held in its own LTR span, so a row can never
 * re-pair itself the way the reference's Atividade 3 does.
 */
export function pair(latin, hebrew) {
  return `<span class="pair"><span class="pair-a">${esc(latin)}</span>` +
         `<span class="pair-dot" aria-hidden="true">•</span>` +
         `<span class="pair-b">${he(hebrew)}</span></span>`;
}

/**
 * A word with letters missing.
 *
 * `parts` is given in READING order — right to left, the order a Hebrew
 * reader meets the letters — with `null` for each blank. The container is an
 * RTL isolate and children lay out in DOM order, so parts[0] is rightmost and
 * the blanks land exactly where the author put them.
 *
 *   heCloze([null, 'ִים'])   →  a blank, then ים to its left  (= _ים for מים)
 */
export function heCloze(parts) {
  const inner = parts.map(p =>
    p == null ? `<span class="he-slot" aria-hidden="true"></span>` : he(p)
  ).join('');
  return `<span class="he-cloze" lang="he">${inner}</span>`;
}

/**
 * Prose from the data files, where Hebrew is written as {{…}}.
 *
 *   prose('Ler {{מִי}} como "mi", com a vogal limpa.')
 *
 * Authors never write a direction span by hand and never concatenate Hebrew
 * into a Portuguese sentence: they mark it, and this wraps it. Everything
 * outside the braces is escaped as ordinary Portuguese, so the quotes,
 * parentheses and colons that the reference PDF let bleed into its Hebrew runs
 * physically cannot get inside a span here.
 */
export function prose(text) {
  const src = clean(text);
  let out = '';
  let i = 0;
  for (;;) {
    const open = src.indexOf('{{', i);
    if (open < 0) { out += esc(src.slice(i)); break; }
    const close = src.indexOf('}}', open);
    if (close < 0) { out += esc(src.slice(i)); break; }
    out += esc(src.slice(i, open));
    out += he(src.slice(open + 2, close).trim());
    i = close + 2;
  }
  return out;
}

/**
 * Guard for prose fields: raw Hebrew outside {{…}} is an authoring mistake,
 * because it would reach the page with no direction span. Returns the offending
 * fragments, or an empty array. Used by validate.js (V13).
 */
export function unmarkedHebrew(text) {
  const src = clean(text).replace(/\{\{[\s\S]*?\}\}/g, '');
  return src.match(/[֐-׿]+/g) || [];
}
