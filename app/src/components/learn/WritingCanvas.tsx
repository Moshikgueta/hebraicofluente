'use client';

/* Handwriting practice.
 * ─────────────────────────────────────────────────────────────────────────
 * No automatic grading in v1, by design. Judging a hand-drawn Hebrew letter
 * badly is worse than not judging it: a beginner told their perfectly good
 * ג is wrong will stop trusting the app. So the loop is model → trace →
 * free → compare, and the learner is the judge.
 *
 * Three things that are not obvious and were each got wrong once:
 *   · the model glyph is rendered by the CURSIVE WEBFONT, not an image. 22
 *     letters × 3 states would be 66 hand-drawn assets to keep in sync; one
 *     font is always consistent and scales to any screen.
 *   · pointer events, not mouse/touch pairs — one code path covers finger,
 *     stylus and mouse, and `setPointerCapture` is what keeps a stroke alive
 *     when the finger leaves the canvas mid-letter.
 *   · the canvas is sized from its box with devicePixelRatio applied, or the
 *     stroke is blurry on every phone made in the last decade.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { asset } from '@/lib/asset';

type Mode = 'trace' | 'free';

export function WritingCanvas({
  glyph, strokeOrderSrc, label
}: {
  glyph: string;
  strokeOrderSrc: string | null;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<Mode>('trace');
  const [hasInk, setHasInk] = useState(false);

  const resize = useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--teal-band').trim() || '#15788F';
  }, []);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawing.current = true;
    setHasInk(true);
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    /* Pressure where the hardware reports it, so an Apple Pencil stroke
       tapers the way a pen does. 0.5 is what a mouse reports. */
    ctx.lineWidth = 4 + (e.pressure && e.pressure !== 0.5 ? e.pressure * 8 : 3);
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const up = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[color:var(--line-soft)]">
        <h3 className="font-ui text-[13px] font-semibold uppercase tracking-[.07em] text-ink-muted">
          {label}
        </h3>
        <div className="flex items-center gap-1.5 rounded-full bg-surface-2 p-1" role="tablist">
          {(['trace', 'free'] as const).map(m => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); clear(); }}
              className={`min-h-[36px] px-4 rounded-full font-ui text-[13px] font-medium transition-colors
                ${mode === m ? 'bg-surface text-ink shadow-[var(--shadow-1)]' : 'text-ink-muted'}`}
            >
              {m === 'trace' ? 'Traçar por cima' : 'Sem modelo'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-0">
        <div
          ref={wrapRef}
          className="relative h-[300px] sm:h-[340px] bg-[repeating-linear-gradient(
            to_bottom,transparent,transparent_calc(50%-1px),var(--line-soft)_calc(50%-1px),
            var(--line-soft)_calc(50%),transparent_calc(50%),transparent)]"
        >
          {/* The model, under the ink. In free mode it is simply not rendered —
              hiding it with opacity would still leave it selectable and would
              show through on a printout. */}
          {mode === 'trace' && (
            <div className="absolute inset-0 grid place-items-center pointer-events-none select-none">
              <span className="opacity-[0.16]">
                <He size="hero" cursive>{glyph}</He>
              </span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={up}
            className="absolute inset-0 touch-none cursor-crosshair"
            aria-label={`Área de escrita para a letra ${label}`}
            role="img"
          />
          <p className="absolute top-3 right-4 font-ui text-[11px] uppercase tracking-[.12em] text-ink-muted pointer-events-none">
            ← escreva nesta direção ←
          </p>
        </div>

        <aside className="border-t sm:border-t-0 sm:border-l border-[color:var(--line-soft)]
                          p-5 grid gap-4 content-start sm:w-[220px]">
          <div className="grid gap-2">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
              Ordem dos traços
            </p>
            {strokeOrderSrc ? (
              <div className="rounded-[var(--r-md)] bg-surface-2 p-3 grid place-items-center">
                <Image src={asset(strokeOrderSrc)} alt={`Ordem dos traços da letra ${label}`}
                       width={140} height={140} unoptimized />
              </div>
            ) : (
              <div className="rounded-[var(--r-md)] bg-surface-2 p-6 grid place-items-center">
                <He size="xl" cursive>{glyph}</He>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Button variant="secondary" size="sm" onClick={clear} disabled={!hasInk} full>
              Limpar
            </Button>
            <p className="font-ui text-[12px] leading-relaxed text-ink-muted">
              Compare com o modelo e decida você mesmo. Não há correção automática
              aqui — ela erraria mais do que ajudaria.
            </p>
          </div>
        </aside>
      </div>
    </Card>
  );
}
