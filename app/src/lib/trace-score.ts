/* Judging a letter drawn with a finger.
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, so it can be tested with a synthetic letter instead of by drawing on a
 * phone and squinting. The canvas component does the rendering and hands the
 * numbers here.
 *
 * Two measurements, because one is not enough:
 *
 *   dentro    what fraction of the learner's points landed on or near the
 *             model. Answers "were you drawing the letter, or somewhere else".
 *             On its own it rewards a single short stroke in the middle of the
 *             glyph, which is 100% inside and not a letter.
 *
 *   cobertura what fraction of the model got ink near it. Answers "did you
 *             draw the whole thing". On its own it rewards scribbling over
 *             everything, which covers the model and also everything else.
 *
 * Both have to be reasonable, and the bar for "reasonable" is LOW on purpose.
 * This is a reading course, not a calligraphy exam, and the input device is a
 * fingertip on glass. A learner told that their perfectly readable ג is wrong
 * stops trusting the app, and nothing this function can measure is worth that.
 *
 * The tolerance is in the mask, not here: the component blurs the glyph before
 * sampling it, so "near" already means "within about a finger's width".
 */

export type TraceVerdict = {
  /** 0-1, for the skill model. */
  score: number;
  dentro: number;
  cobertura: number;
  tone: 'good' | 'try';
  message: string;
};

export type TraceInput = {
  /** Alpha of the blurred model, one byte per sampled cell, row-major. */
  alpha: Uint8ClampedArray | number[];
  /** Width and height of that alpha grid, in cells. */
  w: number;
  h: number;
  /** The learner's points, in the same coordinate space as the grid. */
  points: { x: number; y: number }[];
  /** How far from a model cell ink still counts as covering it, in cells. */
  near?: number;
};

/** Anything at all is "on the model" above this; the blur makes it generous. */
const ON_MODEL = 24;
/** The model's core - the part that really has to be covered. */
const CORE = 90;

export function scoreTrace(input: TraceInput): TraceVerdict {
  const { alpha, w, h, points, near = 26 } = input;

  if (points.length < 4) {
    return {
      score: 0, dentro: 0, cobertura: 0, tone: 'try',
      message: 'Quase nada foi desenhado. Tente escrever a letra inteira.'
    };
  }

  const at = (x: number, y: number): number => {
    const ix = Math.round(x), iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= w || iy >= h) return 0;
    return alpha[iy * w + ix] ?? 0;
  };

  let inside = 0;
  for (const p of points) if (at(p.x, p.y) > ON_MODEL) inside++;
  const dentro = inside / points.length;

  /* Sampled on a grid rather than per pixel: this runs on a phone, right after
     the learner lifts their finger, and it must feel instant. */
  let cells = 0, covered = 0;
  const STEP = 4;
  for (let y = 0; y < h; y += STEP) {
    for (let x = 0; x < w; x += STEP) {
      if (at(x, y) <= CORE) continue;
      cells++;
      if (points.some(p => Math.abs(p.x - x) < near && Math.abs(p.y - y) < near)) covered++;
    }
  }
  const cobertura = cells ? covered / cells : 1;

  /* Weighted toward coverage: drawing the whole letter roughly is closer to
     writing it than drawing a small perfect piece of it. */
  const score = Math.min(1, dentro * 0.4 + cobertura * 0.6);

  /* Each message is a different diagnosis, because "quase" on its own tells
     the learner nothing about what to change. Accurate but short means draw
     more of it; plenty of ink in the wrong places means follow the shape. */
  if (dentro >= 0.5 && cobertura >= 0.5) {
    return { score, dentro, cobertura, tone: 'good', message: 'Muito bem! A forma está lá.' };
  }
  if (dentro >= 0.5) {
    return {
      score, dentro, cobertura, tone: 'try',
      message: 'Quase! Faltou parte da letra - tente cobrir o modelo inteiro.'
    };
  }
  if (cobertura >= 0.35 || dentro >= 0.3) {
    return {
      score, dentro, cobertura, tone: 'try',
      message: 'Quase! Tente seguir um pouco mais a forma do modelo.'
    };
  }
  return {
    score, dentro, cobertura, tone: 'try',
    message: 'Tente de novo olhando o modelo. Toque em “Ver o traçado” para rever a ordem.'
  };
}
