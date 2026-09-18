/* Shared page furniture. Nothing here knows about a specific letter. */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { esc } from '../scripts/lib/render.js';

const ROOT = new URL('..', import.meta.url).pathname;

export function sheet(inner, folio) {
  return `<section class="sheet">\n${inner}\n  <span class="folio">${folio}</span>\n</section>`;
}

export function badge(label) {
  return `<span class="badge">${label}</span>`;
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
export function strokeOrder(L, ctx) {
  const p = join(ROOT, 'assets/stroke-order', `${L.id}.svg`);
  if (existsSync(p)) {
    const src = readFileSync(p, 'utf8');
    if (!src.includes('data-placeholder="true"')) {
      return `<div class="stroke-wrap">${src}</div>`;
    }
  }
  return `<div class="stroke-wrap">
    <span class="he he--display he--cursive" lang="he">${esc(L.letter)}</span>
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
