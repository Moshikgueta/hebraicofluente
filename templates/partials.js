/* Shared page furniture. Nothing here knows about a specific letter. */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { esc } from '../scripts/lib/render.js';

const ROOT = new URL('..', import.meta.url).pathname;

export function sheet(inner, folio) {
  return `<section class="sheet">\n${inner}\n  <span class="folio">${folio}</span>\n</section>`;
}

/* The trailing comment is a parsing anchor, not decoration: when the packer
   merges a unit onto a sheet that already has a heading, it has to strip this
   badge, and the badge's own content contains nested spans — so matching to
   the nearest </span> would cut in the wrong place. */
export function badge(label) {
  return `<span class="badge">${label}</span><!--/badge-->`;
}

export function callout(kind, icon, inner) {
  return `<aside class="callout callout--${esc(kind)}">
    <span class="callout-icon" aria-hidden="true">${icon}</span>
    <div>${inner}</div>
  </aside>`;
}

export function stepStrip(steps) {
  return `<div class="steps">${steps.map(([n, title, sub]) => `
    <div class="step">
      <span class="step-n">${esc(n)}</span>
      <h4>${esc(title)}</h4>
      <p>${esc(sub)}</p>
    </div>`).join('')}</div>`;
}

export function exercise(n, title, inner) {
  return `<div class="ex">
    <div class="ex-n">${esc(String(n))}</div>
    <div class="ex-body"><h4>${title}</h4>${inner}</div>
  </div>`;
}

/**
 * Stroke-order artwork.
 * Missing or still-a-placeholder → the model letter plus an "em breve" note,
 * never a broken build. validate.js reports it as a warning (V11).
 */
export function strokeOrder(L, ctx, variant = '') {
  const id = variant ? `${L.id}-${variant}` : L.id;
  const p = join(ROOT, 'assets/stroke-order', `${id}.svg`);
  if (existsSync(p)) {
    const src = readFileSync(p, 'utf8');
    if (!src.includes('data-placeholder="true"')) {
      return `<div class="stroke-wrap">${src}</div>`;
    }
  }
  const glyph = variant === 'final' ? L.finalForm : L.letter;
  return `<div class="stroke-wrap">
    <span class="he he--display he--cursive" lang="he">${esc(glyph)}</span>
    <p class="soon">Setas de ordem de traçado: em breve</p>
  </div>`;
}

export function document_({ title, body, description }) {
  return `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ''}
<link rel="stylesheet" href="./styles/tokens.css">
<link rel="stylesheet" href="./styles/components.css">
<link rel="stylesheet" href="./styles/print.css">
</head>
<body>
${body}
</body>
</html>`;
}

/* Split a list into fixed-size groups. Used wherever a table grows with the
   alphabet — the review's letter table runs from 4 rows to 22, and a single
   sheet cannot hold the tall end of that. */
export function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/* ── word illustrations ────────────────────────────────────────────────────
   The image slots are filled from data/icons.json: a Lucide icon per word, or
   literal text where a picture would be worse than the thing itself — the
   numbers read better as "4" than as four of anything.

   Icons are inlined rather than linked so a printed page never depends on a
   file fetch, and read `currentColor` so they inherit the surrounding ink. */
let ICONS = null;
const ICON_CACHE = new Map();

function iconTable() {
  if (!ICONS) ICONS = JSON.parse(readFileSync(join(ROOT, 'data/icons.json'), 'utf8')).words;
  return ICONS;
}

function iconSvg(name) {
  if (!ICON_CACHE.has(name)) {
    const p = join(ROOT, 'assets/icons', `${name}.svg`);
    ICON_CACHE.set(name, existsSync(p) ? readFileSync(p, 'utf8').trim() : null);
  }
  return ICON_CACHE.get(name);
}

/**
 * The illustration for a Hebrew word, at a given size class.
 * An unmapped word degrades to an empty well rather than breaking the build —
 * validate.js (V14) is what reports it.
 */
export function wordArt(he_, size = 'sm') {
  const v = iconTable()[he_];
  const cls = `art art--${size}`;
  if (!v) return `<span class="${cls}" aria-hidden="true"></span>`;
  if (v.startsWith('#')) {
    return `<span class="${cls} art--text" aria-hidden="true">${esc(v.slice(1))}</span>`;
  }
  const svg = iconSvg(v);
  return `<span class="${cls}" aria-hidden="true">${svg || ''}</span>`;
}
