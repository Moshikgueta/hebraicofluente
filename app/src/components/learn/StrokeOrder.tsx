'use client';

/* How the letter is written, one stroke at a time.
 * ─────────────────────────────────────────────────────────────────────────
 * The shapes are EXACT: every path here came out of the same cursive font the
 * model and the tracing guide use (tools/gen-stroke-order.py reads the outline
 * straight from the woff2), so what a learner watches and what they trace can
 * never drift apart.
 *
 * What is claimed and what is not, carefully:
 *
 *   · the stroke COUNT is derived - outer contours, counters excluded. It
 *     gives he, alef and qof two strokes and everything else one, which is the
 *     real count of Israeli cursive;
 *   · the ORDER and the START POINT follow two rules that hold for Hebrew:
 *     strokes begin at the top, and where there is more than one the rightmost
 *     comes first, because Hebrew is written right to left;
 *   · the CURL is not claimed. An outline cannot tell us which way the pen
 *     goes round, so the arrow says "start here, set off this way" and stops.
 *     Animating a pen along an invented path would teach a movement nobody
 *     verified, which is worse than teaching less.
 *
 * A native reviewer should still confirm the order before print.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { strokesFor, type StrokeSet } from '@/lib/content';

const HOLD = 900;   // ms a finished stroke stays alone on screen

export function StrokeOrderPlayer({
  letterId, label, className = ''
}: { letterId: string; label: string; className?: string }) {
  const set: StrokeSet | null = strokesFor(letterId);
  const [shown, setShown] = useState(0);          // strokes drawn so far
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    if (!set) return;
    stop();
    setShown(0);
    setPlaying(true);
    set.strokes.forEach((_, i) => {
      timers.current.push(setTimeout(() => setShown(i + 1), HOLD * i + 240));
    });
    timers.current.push(setTimeout(() => setPlaying(false), HOLD * set.strokes.length + 240));
  }, [set, stop]);

  /* Plays once on arrival, then on demand. Respecting prefers-reduced-motion by
     showing the finished letter instead of animating it - the information is
     the stroke order, and the numbers carry that without movement. */
  useEffect(() => {
    if (!set) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(set.strokes.length); return; }
    play();
    return stop;
  }, [set, play, stop]);

  if (!set || !set.strokes.length) return null;

  const n = set.strokes.length;

  return (
    <div className={`grid gap-3 justify-items-center ${className}`}>
      <svg
        viewBox={`0 0 ${set.box} ${set.box}`}
        className="w-full max-w-[220px] aspect-square"
        role="img"
        aria-label={`Ordem dos traços da letra ${label}: ${n} ${n === 1 ? 'movimento' : 'movimentos'}`}
      >
        {/* The whole letter, very faint, so the learner always sees where the
            stroke they are watching sits inside the finished shape. */}
        {set.strokes.map((s, i) => (
          <path key={`ghost-${i}`} d={s.d} fill="var(--line-soft)" opacity={0.5} />
        ))}
        {set.strokes.slice(0, shown).map((s, i) => (
          <path
            key={`ink-${i}`}
            d={s.d}
            fill="var(--ink)"
            className="animate-rise"
            style={{ ['--dur' as string]: '260ms' }}
          />
        ))}
        {set.strokes.map((s, i) => {
          if (i >= shown) return null;
          const [x, y] = s.start;
          const [dx, dy] = s.dir;
          return (
            <g key={`mark-${i}`}>
              <line
                x1={x + dx * 15} y1={y + dy * 15}
                x2={x + dx * 34} y2={y + dy * 34}
                stroke="var(--ember)" strokeWidth={2.6} strokeLinecap="round"
                markerEnd={`url(#arrow-${letterId})`}
              />
              <circle cx={x} cy={y} r={9} fill="var(--paper)"
                      stroke="var(--ember)" strokeWidth={2.4} />
              <text x={x} y={y + 4.2} textAnchor="middle"
                    className="font-ui" fontSize={12} fontWeight={700} fill="var(--ember)">
                {i + 1}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id={`arrow-${letterId}`} viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="var(--ember)" />
          </marker>
        </defs>
      </svg>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={play} disabled={playing}>
          {playing ? 'Mostrando…' : 'Ver de novo'}
        </Button>
        <span className="font-ui text-[12.5px] text-ink-muted">
          {n === 1 ? 'um movimento só' : `${n} movimentos, nesta ordem`}
        </span>
      </div>
    </div>
  );
}
