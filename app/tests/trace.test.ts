/* Judging handwriting, against a letter we can describe exactly.
 *
 * The real mask is a blurred cursive glyph; here it is a thick L-shaped stroke
 * in a 200×200 grid, which has the properties that matter — a long run, a
 * corner, and a lot of empty space around it. What is being checked is not
 * "does it recognise ג", which nothing here claims to do, but that the verdict
 * moves in the right direction and that a reasonable attempt is never called
 * wrong. */

import { describe, expect, it } from 'vitest';
import { scoreTrace } from '@/lib/trace-score';

const W = 200, H = 200;

/** A thick L: down the middle, then along the bottom. */
function model(): Uint8ClampedArray {
  const a = new Uint8ClampedArray(W * H);
  const put = (x: number, y: number, v: number) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    a[y * W + x] = Math.max(a[y * W + x]!, v);
  };
  const thick = (cx: number, cy: number) => {
    for (let dy = -14; dy <= 14; dy++) {
      for (let dx = -14; dx <= 14; dx++) {
        const d = Math.hypot(dx, dy);
        if (d > 14) continue;
        /* Core in the middle, a soft edge outside it — the same shape the
           blur gives the real glyph. */
        put(cx + dx, cy + dy, d < 8 ? 255 : 120);
      }
    }
  };
  for (let y = 40; y <= 150; y++) thick(100, y);
  for (let x = 100; x <= 165; x++) thick(x, 150);
  return a;
}

const alpha = model();

/** Points along the model's own path — a learner tracing it well. */
const goodTrace = () => {
  const pts: { x: number; y: number }[] = [];
  for (let y = 40; y <= 150; y += 3) pts.push({ x: 100, y });
  for (let x = 100; x <= 165; x += 3) pts.push({ x, y: 150 });
  return pts;
};

describe('a trace that follows the letter', () => {
  const v = scoreTrace({ alpha, w: W, h: H, points: goodTrace() });

  it('is called good', () => {
    expect(v.tone).toBe('good');
    expect(v.message).toContain('Muito bem');
  });

  it('scores high enough to count as writing practice', () => {
    expect(v.score).toBeGreaterThan(0.7);
    expect(v.dentro).toBeGreaterThan(0.9);
    expect(v.cobertura).toBeGreaterThan(0.7);
  });
});

describe('a wobbly trace is still a trace', () => {
  it('passes when the hand shakes by a few pixels', () => {
    /* The whole point of the tolerance. A finger on glass does not follow a
       line to the pixel, and neither does a pen. */
    const pts = goodTrace().map((p, i) => ({
      x: p.x + Math.sin(i / 3) * 7,
      y: p.y + Math.cos(i / 4) * 7
    }));
    const v = scoreTrace({ alpha, w: W, h: H, points: pts });
    expect(v.tone).toBe('good');
  });

  it('passes when the learner overshoots the ends', () => {
    const pts = [
      { x: 100, y: 25 }, { x: 100, y: 32 },
      ...goodTrace(),
      { x: 175, y: 150 }, { x: 182, y: 151 }
    ];
    expect(scoreTrace({ alpha, w: W, h: H, points: pts }).tone).toBe('good');
  });
});

describe('what is not a letter', () => {
  it('rejects a couple of stray taps', () => {
    const v = scoreTrace({ alpha, w: W, h: H, points: [{ x: 10, y: 10 }, { x: 12, y: 12 }] });
    expect(v.tone).toBe('try');
    expect(v.message).toContain('Quase nada');
    expect(v.score).toBe(0);
  });

  it('rejects a scribble in the corner', () => {
    const pts = Array.from({ length: 40 }, (_, i) => ({
      x: 18 + (i % 7) * 3, y: 18 + Math.floor(i / 7) * 3
    }));
    const v = scoreTrace({ alpha, w: W, h: H, points: pts });
    expect(v.tone).toBe('try');
    expect(v.dentro).toBeLessThan(0.2);
  });

  it('does not accept half a letter as the whole letter', () => {
    /* Every point dead on the model, but only the vertical arm drawn. High
       precision, low coverage — the case a single number would wave through. */
    const pts = [];
    for (let y = 40; y <= 100; y += 2) pts.push({ x: 100, y });
    const v = scoreTrace({ alpha, w: W, h: H, points: pts });
    expect(v.dentro).toBeGreaterThan(0.9);
    expect(v.cobertura).toBeLessThan(0.6);
    expect(v.tone).toBe('try');
  });

  it('does not accept covering the whole box as covering the letter', () => {
    /* Scribbling over everything covers the model too. Coverage alone would
       call that a success; precision is what refuses it. */
    const pts = [];
    for (let y = 5; y < H; y += 6) for (let x = 5; x < W; x += 6) pts.push({ x, y });
    const v = scoreTrace({ alpha, w: W, h: H, points: pts });
    expect(v.cobertura).toBeGreaterThan(0.9);
    expect(v.dentro).toBeLessThan(0.45);
    expect(v.tone).toBe('try');
  });
});

describe('the feedback says something useful', () => {
  it('names the missing part when coverage is what failed', () => {
    const pts = [];
    for (let y = 40; y <= 80; y += 2) pts.push({ x: 100, y });
    expect(scoreTrace({ alpha, w: W, h: H, points: pts }).message).toContain('Faltou parte');
  });

  it('never uses the word errado', () => {
    /* A wrong answer in this course is "quase", everywhere, including here. */
    const cases = [
      [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }],
      goodTrace()
    ];
    for (const points of cases) {
      const m = scoreTrace({ alpha, w: W, h: H, points }).message.toLowerCase();
      expect(m).not.toContain('errado');
      expect(m).not.toContain('incorret');
    }
  });
});
