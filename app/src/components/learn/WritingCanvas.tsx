'use client';

/* Writing a Hebrew letter with a finger.
 * ─────────────────────────────────────────────────────────────────────────
 * Four steps, in this order, and they are the point of the component:
 *
 *   1 ver     - watch the stroke order (StrokeOrderPlayer, above this)
 *   2 traçar  - the model at full strength, trace over it
 *   3 guia    - the model faded to a hint
 *   4 livre   - nothing but the line
 *
 * Support is removed gradually because that is how a motor skill is learned,
 * and because the moment a learner draws ג with nothing on the screen is worth
 * more than any badge.
 *
 * ── the mobile rule, which is absolute ──────────────────────────────────
 * While a finger is on the drawing area the PAGE MUST NOT MOVE. Not scroll,
 * not bounce, not pull to refresh, not zoom. Everything below does one job:
 *
 *   · `touch-action: none` on the canvas - the browser stops treating the
 *     gesture as a possible scroll or pinch before it starts;
 *   · `overscroll-behavior: contain` on the frame - a gesture that reaches an
 *     edge does not chain to the page and trigger pull-to-refresh;
 *   · `setPointerCapture` - the stroke survives the finger leaving the canvas
 *     mid-letter, which otherwise ends the line in the middle of a ג;
 *   · non-passive listeners with preventDefault, attached natively. React
 *     cannot promise non-passive here, and a passive listener's
 *     preventDefault() is ignored silently;
 *   · nothing is disabled globally. Scrolling works normally everywhere else
 *     on the page, and the instant the finger lifts it works here too.
 *
 * Two more details that are not obvious and were each got wrong once:
 *   · resizing a canvas ERASES it, and a ResizeObserver fires when a phone's
 *     URL bar collapses - which is to say, in the middle of writing. The
 *     bitmap is saved and put back around every resize, and a resize to the
 *     same CSS size is skipped entirely;
 *   · `getCoalescedEvents()` returns the points the browser batched between
 *     frames. Without it a fast finger draws a polygon.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StrokeOrderPlayer } from './StrokeOrder';
import { track } from '@/lib/analytics';
import { scoreTrace } from '@/lib/trace-score';

type Step = 1 | 2 | 3 | 4;

const STEPS: { n: Step; label: string; hint: string; guide: number }[] = [
  { n: 1, label: 'Ver', hint: 'Veja por onde a caneta começa.', guide: 0 },
  { n: 2, label: 'Traçar', hint: 'Passe o dedo por cima do modelo.', guide: 0.22 },
  { n: 3, label: 'Guia fraco', hint: 'O modelo está mais fraco. Siga assim mesmo.', guide: 0.08 },
  { n: 4, label: 'Sem modelo', hint: 'Agora sozinho. Escreva de memória.', guide: 0 }
];

export function WritingCanvas({
  glyph, letterId, label, onScored
}: {
  glyph: string;
  /** For the stroke data: `mem`, or `mem-final`. */
  letterId: string;
  label: string;
  /** Called once per attempt with a 0-1 score, for skill tracking. */
  onScored?: (score: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLSpanElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [step, setStep] = useState<Step>(1);
  const [hasInk, setHasInk] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const current = STEPS.find(s => s.n === step)!;

  /* ── the canvas, at device resolution, without losing the ink ────────── */
  const resize = useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (!w || !h) return;
    /* The URL bar collapsing changes the height by a few pixels and fires the
       observer. Redrawing for that would wipe a letter in progress. */
    if (sizeRef.current.w === w && sizeRef.current.h === h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const keep = sizeRef.current.w
      ? canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height)
      : null;

    sizeRef.current = { w, h };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (keep) {
      /* Best effort: put the old bitmap back at the top left. It is not
         rescaled - a stretched stroke would be a lie about what was drawn -
         and on a few-pixel change nothing visible moves. */
      try { ctx.putImageData(keep, 0, 0); } catch { /* size grew: nothing to restore */ }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#15788F';
  }, []);

  /* Keyed on `step` as well as on `resize`: at step 1 there is no canvas in
     the tree at all, so an effect that only ran on mount would measure null and
     the canvas would keep its default 300×150 when it finally appeared. */
  useEffect(() => {
    if (step === 1) return;
    sizeRef.current = { w: 0, h: 0 };     // remeasure: this is a new canvas
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize, step]);

  /* ── drawing ─────────────────────────────────────────────────────────── */
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e: PointerEvent) => {
      /* A second finger while drawing is a pinch attempt, not a second pen.
         Ignoring it keeps the stroke and lets touch-action refuse the zoom. */
      if (drawing.current) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      setHasInk(true);
      setVerdict(null);
      const p = at(e);
      last.current = p;
      pointsRef.current.push(p);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      /* A dot, so a tap leaves a mark - a learner writing a yod makes one. */
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle as string;
      ctx.fill();
    };

    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      /* Every point the browser batched since the last frame, not just the
         latest one. A fast finger otherwise draws a polygon. */
      const events = typeof e.getCoalescedEvents === 'function'
        ? e.getCoalescedEvents() : [e];
      for (const ev of events.length ? events : [e]) {
        const p = at(ev);
        const prev = last.current;
        if (!prev) { last.current = p; continue; }
        /* Through the midpoint with a quadratic: joins two segments into a
           curve instead of a corner, which is what a pen actually leaves. */
        const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2 };
        ctx.lineWidth = 5 + (ev.pressure && ev.pressure !== 0.5 ? ev.pressure * 7 : 3);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last.current = p;
        pointsRef.current.push(p);
      }
    };

    const up = (e: PointerEvent) => {
      if (!drawing.current) return;
      drawing.current = false;
      last.current = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    /* Native and non-passive. React makes no promise about passivity here, and
       a passive listener's preventDefault() is ignored without a word. */
    const opts = { passive: false } as AddEventListenerOptions;
    canvas.addEventListener('pointerdown', down, opts);
    canvas.addEventListener('pointermove', move, opts);
    canvas.addEventListener('pointerup', up, opts);
    canvas.addEventListener('pointercancel', up, opts);
    /* Belt and braces for the one browser that still needs it: an iOS Safari
       that has not enabled pointer events falls back to touch, and this stops
       the page scrolling under the finger. */
    const swallow = (e: TouchEvent) => { if (drawing.current) e.preventDefault(); };
    canvas.addEventListener('touchmove', swallow, opts);
    return () => {
      canvas.removeEventListener('pointerdown', down, opts);
      canvas.removeEventListener('pointermove', move, opts);
      canvas.removeEventListener('pointerup', up, opts);
      canvas.removeEventListener('pointercancel', up, opts);
      canvas.removeEventListener('touchmove', swallow, opts);
    };
  }, [step]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    pointsRef.current = [];
    setHasInk(false);
    setVerdict(null);
  }, []);

  const check = useCallback(() => {
    const canvas = canvasRef.current, guide = guideRef.current;
    if (!canvas) return;
    const v = scoreAttempt(canvas, guide, glyph, pointsRef.current);
    setVerdict(v);
    onScored?.(v.score);
    track('trace_completed', { letterId, score: v.score, stage: step });
  }, [glyph, letterId, step, onScored]);

  const goStep = (n: Step) => { setStep(n); clear(); };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3
                      border-b border-[color:var(--line-soft)]">
        <h3 className="font-ui text-[13px] font-semibold uppercase tracking-[.07em] text-ink-muted">
          {label}
        </h3>
        <ol className="flex items-center gap-1" aria-label="Etapas da escrita">
          {STEPS.map(s => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => goStep(s.n)}
                aria-current={step === s.n ? 'step' : undefined}
                className={`min-h-[44px] px-2.5 sm:px-3 rounded-full font-ui text-[12.5px] font-medium
                  transition-colors
                  ${step === s.n
                    ? 'bg-[var(--accent-wash)] text-[var(--accent)]'
                    : 'text-ink-muted hover:bg-surface-2'}`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {step === 1 ? (
        <div className="p-5 sm:p-6 grid gap-4 justify-items-center">
          <StrokeOrderPlayer letterId={letterId} label={label} />
          <p className="font-ui text-[13.5px] text-ink-muted text-center max-w-[40ch]">
            {current.hint} A cursiva é a que se escreve à mão - ninguém escreve
            hebraico em letra de imprensa.
          </p>
          <Button onClick={() => goStep(2)} size="md">Começar a traçar</Button>
        </div>
      ) : (
        <>
          <div
            ref={wrapRef}
            /* overscroll-behavior stops a gesture that reaches the edge from
               chaining to the page - which is what fires pull-to-refresh. */
            className="relative h-[280px] sm:h-[340px] overscroll-contain select-none
                       [-webkit-touch-callout:none]
                       bg-[repeating-linear-gradient(to_bottom,transparent,transparent_calc(50%-1px),var(--line-soft)_calc(50%-1px),var(--line-soft)_calc(50%),transparent_calc(50%),transparent)]"
          >
            {/* The model, under the ink. It is always in the DOM - the scorer
                measures against it - and simply invisible at step 4, so what
                the learner is judged against never changes between steps. */}
            <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
              <span ref={guideRef} style={{ opacity: current.guide }}>
                <He size="hero" cursive>{glyph}</He>
              </span>
            </div>

            <canvas
              ref={canvasRef}
              className="absolute inset-0 touch-none cursor-crosshair"
              aria-label={`Área de escrita para a letra ${label}`}
              role="img"
            />

            <p className="absolute top-3 right-4 font-ui text-[11px] uppercase tracking-[.12em]
                          text-ink-muted pointer-events-none">
              ← escreva nesta direção ←
            </p>
          </div>

          <div className="p-4 sm:p-5 grid gap-3 border-t border-[color:var(--line-soft)]">
            <p className="font-ui text-[13.5px] text-ink-muted">{current.hint}</p>

            {verdict && (
              <div
                role="status"
                className={`rounded-[var(--r-md)] px-4 py-3 font-ui text-[14px] leading-relaxed
                  ${verdict.tone === 'good' ? 'bg-mint text-[var(--mint-ink)]'
                    : 'bg-[var(--amber-wash)] text-[var(--amber)]'}`}
              >
                {verdict.message}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <Button onClick={check} disabled={!hasInk} size="md">Conferir</Button>
              <Button variant="secondary" size="sm" onClick={clear} disabled={!hasInk}>
                Limpar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => goStep(1)}>
                Ver o traçado
              </Button>
              {step < 4 && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => goStep((step + 1) as Step)}
                  className="ml-auto"
                >
                  Próxima etapa →
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

/* ── scoring ────────────────────────────────────────────────────────────
   The maths lives in lib/trace-score.ts, where it can be tested against a
   synthetic letter instead of by drawing on a phone and squinting. This half
   only renders the model and reads its pixels.

   If anything at all goes wrong - no context, a font that has not loaded, a
   browser without canvas filters - it returns the encouraging verdict rather
   than a false negative. None of those are the learner's fault. */
type Verdict = { score: number; tone: 'good' | 'try'; message: string };

const ENCOURAGE: Verdict = {
  score: 1, tone: 'good',
  message: 'Feito. Compare com o modelo e veja o que você mudaria.'
};

function scoreAttempt(
  canvas: HTMLCanvasElement,
  guide: HTMLSpanElement | null,
  glyph: string,
  points: { x: number; y: number }[]
): Verdict {
  try {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || !guide) return ENCOURAGE;

    /* The model, drawn where the visible guide is and at the same size, then
       BLURRED - the blur is the tolerance, and it is about a finger wide. */
    const mask = document.createElement('canvas');
    mask.width = w; mask.height = h;
    const mctx = mask.getContext('2d', { willReadFrequently: true });
    if (!mctx) return ENCOURAGE;

    const target = guide.firstElementChild ?? guide;
    const cs = getComputedStyle(target);
    const size = parseFloat(cs.fontSize) || h * 0.6;
    const family = cs.fontFamily || 'serif';
    mctx.filter = 'blur(13px)';
    mctx.fillStyle = '#000';
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.font = `${size}px ${family}`;
    mctx.fillText(glyph, w / 2, h / 2);

    const img = mctx.getImageData(0, 0, w, h).data;
    /* One byte per cell instead of four: the scorer only needs the alpha. */
    const alpha = new Uint8ClampedArray(w * h);
    for (let i = 0; i < alpha.length; i++) alpha[i] = img[i * 4 + 3]!;

    const v = scoreTrace({ alpha, w, h, points });
    return { score: v.score, tone: v.tone, message: v.message };
  } catch {
    return ENCOURAGE;
  }
}
