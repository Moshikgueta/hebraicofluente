'use client';

/* The one exercise runner. Every tested moment in the course — lesson quiz,
 * checkpoint, quick review, final challenge — is this component with a
 * different list of exercises.
 *
 * Feedback rules, from the brief and worth stating because they shape the code:
 *   · a wrong answer is never punitive. No red, no "incorreto", no life lost.
 *     The colour is amber, the copy is "quase", and the right answer is shown
 *     and explained on the spot;
 *   · correctness is never signalled by colour alone — there is an icon and a
 *     word in every state;
 *   · retry is unlimited and costs nothing.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { He, HeCloze } from '@/components/hebrew/He';
import { AudioButton } from './AudioButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Exercise } from '@/lib/engine/exercises';
import { letterIdOf } from '@/lib/engine/exercises';
import { useProgress } from '@/lib/state/store';
import { clusters } from '@/lib/hebrew';

export type PlayerResult = { correct: number; total: number; score: number; missed: string[] };

export function ExercisePlayer({
  exercises, onDone, title, compact = false
}: {
  exercises: Exercise[];
  onDone: (r: PlayerResult) => void;
  title?: string;
  compact?: boolean;
}) {
  const { answer } = useProgress();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const ex = exercises[i];
  const settled = chosen !== null;
  const isRight = settled && ex ? chosen === ex.answer : false;

  const choose = useCallback((idx: number) => {
    if (chosen !== null || !ex) return;
    setChosen(idx);
    const ok = idx === ex.answer;
    if (ok) setCorrectCount(c => c + 1);
    else setMissed(m => [...m, ex.id]);
    answer({ itemId: ex.id, letterId: letterIdOf(ex), correct: ok });
  }, [chosen, ex, answer]);

  const next = useCallback(() => {
    if (i + 1 >= exercises.length) {
      const total = exercises.length;
      const correct = correctCount;
      onDone({ correct, total, score: total ? correct / total : 0, missed });
      return;
    }
    setI(n => n + 1);
    setChosen(null);
  }, [i, exercises.length, correctCount, missed, onDone]);

  /* Keyboard: 1–4 to answer, Enter to continue. Every exercise is reachable
     and answerable without a pointer. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ex) return;
      if (e.key === 'Enter' && settled) { e.preventDefault(); next(); return; }
      const n = Number(e.key);
      if (!settled && n >= 1 && n <= ex.options.length) { e.preventDefault(); choose(n - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ex, settled, choose, next]);

  useEffect(() => { liveRef.current?.focus(); }, [settled]);

  if (!ex) return null;

  /* One column under the thumb — a phone has no width to give away. From sm up,
     short Hebrew options become TILES instead of 800px-wide rows: a single
     glyph parked at the left edge of a full-width bar makes the eye travel the
     whole screen for nothing, and four of them cost four sweeps. Long options
     (a Portuguese meaning, a whole sentence) stay stacked, where a list is
     still the readable shape. */
  const tiles = tileColumns(ex);

  return (
    <div className="grid gap-5">
      <header className="grid gap-3">
        {title && !compact && (
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">{title}</p>
        )}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--teal-band)] transition-[width] duration-300 ease-[var(--ease)]"
              style={{ width: `${((i + (settled ? 1 : 0)) / exercises.length) * 100}%` }}
            />
          </div>
          <span className="font-ui text-[13px] tabular-nums text-ink-muted shrink-0">
            {i + 1} / {exercises.length}
          </span>
        </div>
      </header>

      <Card className="p-5 sm:p-7 grid gap-6">
        <h2 className="text-[19px] sm:text-[21px] font-semibold leading-snug">{ex.promptPt}</h2>

        <Stimulus ex={ex} />

        <ul className={`grid gap-2.5 ${tiles}`} role="list">
          {ex.options.map((opt, idx) => {
            const state = !settled ? 'idle'
              : idx === ex.answer ? 'right'
              : idx === chosen ? 'wrong' : 'muted';
            return (
              <li key={`${ex.id}-${idx}`}>
                <OptionButton
                  ex={ex} option={opt} index={idx} state={state}
                  tile={tiles !== ''}
                  onClick={() => choose(idx)} disabled={settled}
                />
              </li>
            );
          })}
        </ul>
      </Card>

      <div aria-live="polite" className="min-h-[92px]">
        {settled && (
          <Card tone={isRight ? 'mint' : 'amber'} className="p-5 animate-rise">
            <p
              ref={liveRef}
              tabIndex={-1}
              className={`flex items-center gap-2 font-ui text-[15px] font-semibold outline-none
                ${isRight ? 'text-[var(--mint-ink)]' : 'text-[var(--amber)]'}`}
            >
              <span aria-hidden>{isRight ? '✓' : '↻'}</span>
              {isRight ? 'Boa! É essa mesma.' : 'Quase. Olhe com calma:'}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-body">{ex.explainPt}</p>
            <Button className="mt-4" onClick={next} size="md">
              {i + 1 >= exercises.length ? 'Ver resultado' : 'Continuar'}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

/* What the learner looks at while deciding. */
function Stimulus({ ex }: { ex: Exercise }) {
  switch (ex.kind) {
    case 'letter-recognition':
    case 'final-form':
      return null;
    case 'print-vs-cursive':
      return (
        <div className="flex justify-center py-2">
          <He size="display">{ex.letter}</He>
        </div>
      );
    case 'syllable-reading':
    case 'word-meaning':
      return (
        <div className="flex justify-center py-2">
          <He size="display">{ex.he}</He>
        </div>
      );
    case 'meaning-to-word':
      return null;
    case 'complete-word':
      return (
        <div className="grid gap-2 justify-items-center py-2">
          <HeCloze parts={ex.parts} size="xl" />
          <p className="font-ui text-[14px] text-ink-muted">{ex.hintPt}</p>
        </div>
      );
    case 'audio-recognition':
      return (
        <div className="flex justify-center py-2">
          <AudioButton audioId={ex.audioId} label="Ouvir de novo" size="lg" slow />
        </div>
      );
  }
}

/* Which exercises answer in Hebrew. Hoisted out of the button because the list
   layout needs to know it too. */
const hebrewOptionsOf = (ex: Exercise): boolean =>
  ex.kind === 'letter-recognition' || ex.kind === 'final-form' ||
  ex.kind === 'print-vs-cursive' || ex.kind === 'meaning-to-word' ||
  ex.kind === 'complete-word' || ex.kind === 'audio-recognition';

/* Tiles are for Hebrew that is short enough to read at a glance: a letter, a
   syllable, a two- or three-consonant word. Measured in CLUSTERS, not code
   units — a pointed letter is two to four codepoints and `.length` would call
   מָ a long option. */
function tileColumns(ex: Exercise): string {
  if (!hebrewOptionsOf(ex)) return '';
  const longest = Math.max(...ex.options.map(o => clusters(o).length));
  if (longest <= 1) return 'sm:grid-cols-4';
  if (longest <= 4) return 'sm:grid-cols-2 lg:grid-cols-4';
  return '';
}

/* Options are Hebrew or Portuguese depending on the exercise, and the Hebrew
   ones must be big — the glyph IS the question. */
function OptionButton({
  ex, option, index, state, tile, onClick, disabled
}: {
  ex: Exercise; option: string; index: number;
  state: 'idle' | 'right' | 'wrong' | 'muted';
  tile: boolean;
  onClick: () => void; disabled: boolean;
}) {
  const hebrewOption = hebrewOptionsOf(ex);
  const cursive = ex.kind === 'print-vs-cursive';

  const TONE = {
    idle:  'border-line bg-surface hover:border-[var(--teal)] hover:bg-[var(--teal-wash)]',
    right: 'border-[var(--green)] bg-mint',
    wrong: 'border-[var(--amber)] bg-[var(--amber-wash)]',
    muted: 'border-line bg-surface opacity-55'
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full min-h-[64px] rounded-[var(--r-md)] border-2 px-4 py-3
        flex items-center gap-4 text-left transition-all duration-[var(--dur)] ease-[var(--ease)]
        disabled:cursor-default ${TONE[state]}
        ${tile ? 'sm:h-full sm:min-h-[104px] sm:justify-center sm:gap-0 sm:px-3' : ''}`}
    >
      <span aria-hidden
        className={`shrink-0 w-7 h-7 rounded-md bg-surface-2 text-ink-muted
                   font-ui text-[12px] font-semibold grid place-items-center
                   ${tile ? 'sm:absolute sm:top-2 sm:left-2' : ''}`}>
        {state === 'right' ? '✓' : state === 'wrong' ? '↻' : index + 1}
      </span>
      {hebrewOption
        ? <He size={cursive ? 'lg' : 'word'} cursive={cursive}>{option}</He>
        : <span className="text-[16px] text-ink">{option}</span>}
    </button>
  );
}
