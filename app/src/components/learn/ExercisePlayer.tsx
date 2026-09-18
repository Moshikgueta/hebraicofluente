'use client';

/* The one exercise runner. Every tested moment in the course — lesson quiz,
 * checkpoint, quick review, reading gym, final challenge — is this component
 * with a different list of exercises.
 *
 * Feedback rules, from the brief and worth stating because they shape the code:
 *   · a wrong answer is never punitive. No red, no "incorreto", no life lost.
 *     The colour is amber, the copy is "quase", and the right answer is shown
 *     and explained on the spot;
 *   · the explanation is about the OPTION THE LEARNER CHOSE where the exercise
 *     can say something specific — "você escolheu מִ, mas o som era מַ" teaches,
 *     "errado" does not;
 *   · correctness is never signalled by colour alone — there is an icon and a
 *     word in every state;
 *   · retry is unlimited and costs nothing, and so does a hint, and so does
 *     replaying the audio.
 *
 * What it reports upward is richer than right/wrong: the skill the question
 * exercised, and on a miss the wrong option that was chosen, so the review
 * system can learn that THIS learner trades ד for ר.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { He, HeCloze } from '@/components/hebrew/He';
import { AudioButton, hasAudio } from './AudioButton';
import { BuildSyllable, BuildWord, Hints, MatchPairs, TypeAnswer } from './Answers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Exercise } from '@/lib/engine/exercises';
import { isChoice } from '@/lib/engine/exercises';
import { useProgress } from '@/lib/state/store';
import { clusters } from '@/lib/hebrew';

export type PlayerResult = { correct: number; total: number; score: number; missed: string[] };

/** What one settled question knows about itself. */
type Settled = { correct: boolean; chosen: number | null; why: string | null };

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
  const [settled, setSettled] = useState<Settled | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const ex = exercises[i];
  const isRight = settled?.correct ?? false;

  /**
   * Settle the current question.
   *
   * `expected` and `chosen` are GLYPHS, and only passed where the pair means
   * something: telling ד from ר is a confusion worth drilling, picking the
   * wrong meaning of a word is not.
   */
  const settle = useCallback((
    correct: boolean,
    opts: { chosen?: number | null; why?: string | null; expected?: string; chosenGlyph?: string } = {}
  ) => {
    if (settled || !ex) return;
    setSettled({ correct, chosen: opts.chosen ?? null, why: opts.why ?? null });
    if (correct) setCorrectCount(c => c + 1);
    else setMissed(m => [...m, ex.id]);
    answer({
      itemId: ex.id, letterId: ex.letterId, correct, skill: ex.skill,
      expected: opts.expected, chosen: opts.chosenGlyph
    });
  }, [settled, ex, answer]);

  /* Choice kinds go through here so option feedback and confusion reporting
     happen in one place. */
  const choose = useCallback((idx: number) => {
    if (settled || !ex || !isChoice(ex)) return;
    const correct = idx === ex.answer;
    const glyphLevel = GLYPH_CONFUSION.has(ex.kind);
    settle(correct, {
      chosen: idx,
      why: correct ? null : (ex.whyPt?.[idx] ?? null),
      expected: glyphLevel ? ex.options[ex.answer] : undefined,
      chosenGlyph: glyphLevel ? ex.options[idx] : undefined
    });
  }, [settled, ex, settle]);

  const next = useCallback(() => {
    if (i + 1 >= exercises.length) {
      const total = exercises.length;
      onDone({ correct: correctCount, total, score: total ? correctCount / total : 0, missed });
      return;
    }
    setI(n => n + 1);
    setSettled(null);
  }, [i, exercises.length, correctCount, missed, onDone]);

  /* Keyboard: 1–9 to answer a choice, Enter to continue. Every exercise that
     can be answered without a pointer, is. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ex) return;
      if (e.key === 'Enter' && settled) { e.preventDefault(); next(); return; }
      if (settled || !isChoice(ex)) return;
      /* Not while the learner is typing an answer. */
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length) { e.preventDefault(); choose(n - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ex, settled, choose, next]);

  useEffect(() => { if (settled) liveRef.current?.focus(); }, [settled]);

  if (!ex) return null;

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

        <Body ex={ex} settled={!!settled} settledState={settled} onChoose={choose} onSettle={settle} />

        {!settled && <Hints hints={ex.hintsPt} audioId={ex.audioId ?? null} />}
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
            {/* The specific reason first, the general explanation after it. A
                learner who chose מִ needs to hear about מִ, not about vowels. */}
            {settled.why && (
              <p className="mt-2 text-[15px] leading-relaxed text-ink font-medium">{settled.why}</p>
            )}
            <p className="mt-2 text-[15px] leading-relaxed text-ink-body">{ex.explainPt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={next} size="md">
                {i + 1 >= exercises.length ? 'Ver resultado' : 'Continuar'}
              </Button>
              {hasAudio(ex.audioId) && <AudioButton audioId={ex.audioId!} label="Ouvir" size="sm" slow />}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* The kinds where the wrong OPTION is itself a letter, and so worth recording
   as a confusion. Choosing the wrong meaning of a word is a different kind of
   mistake and does not belong in the ד/ר pile. */
const GLYPH_CONFUSION = new Set<Exercise['kind']>([
  'letter-recognition', 'print-vs-cursive', 'final-form', 'complete-word', 'odd-one-out'
]);

/* ── what the learner looks at, and how they answer ──────────────────────── */

function Body({
  ex, settled, settledState, onChoose, onSettle
}: {
  ex: Exercise;
  settled: boolean;
  settledState: Settled | null;
  onChoose: (i: number) => void;
  onSettle: (correct: boolean, opts?: {
    chosen?: number | null; why?: string | null; expected?: string; chosenGlyph?: string;
  }) => void;
}) {
  switch (ex.kind) {
    case 'build-syllable':
      return (
        <BuildSyllable
          consonant={ex.consonant} vowels={ex.vowels} answer={ex.answer} sound={ex.sound}
          settled={settled}
          onAnswer={(correct, chosen) => onSettle(correct, {
            why: correct ? null : `Esse sinal não faz “${ex.sound}”.`,
            expected: ex.vowels[ex.answer], chosenGlyph: chosen
          })}
        />
      );

    case 'build-word':
      return (
        <BuildWord
          tiles={ex.tiles} target={ex.target} hintPt={ex.hintPt}
          settled={settled}
          onAnswer={correct => onSettle(correct, {
            why: correct ? null : 'A ordem não fecha. Em hebraico a primeira letra fica à direita.'
          })}
        />
      );

    case 'match':
      return (
        <MatchPairs
          pairs={ex.pairs} leftKind={ex.leftKind} rightKind={ex.rightKind}
          labelLeft={ex.labelLeft} labelRight={ex.labelRight}
          settled={settled} seed={ex.id}
          onAnswer={(correct, misses) => onSettle(correct, {
            why: correct ? null
              : `Você juntou ${misses.length === 1 ? 'um par' : `${misses.length} pares`} que não combinam.`,
            expected: ex.leftKind === 'glyph' ? misses[0]?.[0] : undefined,
            chosenGlyph: ex.leftKind === 'glyph' ? misses[0]?.[1] : undefined
          })}
        />
      );

    case 'type-answer':
      return (
        <TypeAnswer
          he={ex.he} accept={ex.accept} placeholder={ex.placeholder}
          settled={settled} correct={settledState?.correct ?? null}
          onAnswer={correct => onSettle(correct)}
        />
      );

    default:
      return (
        <>
          <Stimulus ex={ex} />
          <Options ex={ex} settled={settled} chosen={settledState?.chosen ?? null} onChoose={onChoose} />
        </>
      );
  }
}

/** What the learner looks at while deciding, for the choice kinds. */
function Stimulus({ ex }: { ex: Exercise }) {
  switch (ex.kind) {
    case 'letter-recognition':
    case 'final-form':
    case 'meaning-to-word':
    case 'odd-one-out':
      return null;
    case 'print-vs-cursive':
      return (
        <div className="flex justify-center py-2">
          <He size="display">{ex.letter}</He>
        </div>
      );
    case 'syllable-reading':
    case 'word-meaning':
    case 'vowel-sound':
      return (
        <div className="flex justify-center py-2">
          <He size="display">{ex.he}</He>
        </div>
      );
    case 'sound-to-syllable':
      return (
        <div className="grid gap-1 justify-items-center py-2">
          <span className="font-display text-[44px] sm:text-[56px] font-bold text-[var(--teal-band)]">
            {ex.sound}
          </span>
          <p className="font-ui text-[13px] text-ink-muted">é assim que soa</p>
        </div>
      );
    case 'complete-word':
      return (
        <div className="grid gap-2 justify-items-center py-2">
          <HeCloze parts={ex.parts} size="xl" />
          <p className="font-ui text-[14px] text-ink-muted">{ex.hintPt}</p>
        </div>
      );
    case 'audio-recognition':
    case 'listen-syllable':
      return (
        <div className="flex justify-center py-2">
          <AudioButton audioId={ex.audioId} label="Ouvir de novo" size="lg" slow />
        </div>
      );
    default:
      return null;
  }
}

function Options({
  ex, settled, chosen, onChoose
}: {
  ex: Exercise; settled: boolean; chosen: number | null; onChoose: (i: number) => void;
}) {
  if (!isChoice(ex)) return null;

  /* A row of nearly identical glyphs is the exercise itself, so it is laid out
     as a row and never as a list — the learner has to scan it the way they will
     scan a word. */
  if (ex.kind === 'odd-one-out') {
    return (
      <ul className="flex flex-wrap justify-center gap-2.5" role="list">
        {ex.options.map((opt, idx) => (
          <li key={idx}>
            <button
              type="button"
              disabled={settled}
              onClick={() => onChoose(idx)}
              aria-label={`Posição ${idx + 1}`}
              className={`min-h-[76px] min-w-[72px] px-3 rounded-[var(--r-md)] border-2
                grid place-items-center transition-colors disabled:cursor-default
                ${settled && idx === ex.answer ? 'border-[var(--green)] bg-mint'
                  : settled && idx === chosen ? 'border-[var(--amber)] bg-[var(--amber-wash)]'
                  : settled ? 'border-line bg-surface opacity-55'
                  : 'border-line bg-surface hover:border-[var(--teal)] hover:bg-[var(--teal-wash)]'}`}
            >
              <He size="lg">{opt}</He>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  const tiles = tileColumns(ex);
  return (
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
              onClick={() => onChoose(idx)} disabled={settled}
            />
          </li>
        );
      })}
    </ul>
  );
}

/* Which exercises answer in Hebrew. */
const hebrewOptionsOf = (ex: Exercise): boolean =>
  ex.kind === 'letter-recognition' || ex.kind === 'final-form' ||
  ex.kind === 'print-vs-cursive' || ex.kind === 'meaning-to-word' ||
  ex.kind === 'complete-word' || ex.kind === 'audio-recognition' ||
  ex.kind === 'sound-to-syllable' || ex.kind === 'listen-syllable' ||
  ex.kind === 'odd-one-out';

/* Tiles are for Hebrew short enough to read at a glance: a letter, a syllable,
   a two- or three-consonant word. Measured in CLUSTERS, not code units — a
   pointed letter is two to four codepoints and `.length` would call מָ a long
   option. One column under the thumb, always: a phone has no width to give
   away, and the phone is where most of the studying happens. */
function tileColumns(ex: Exercise): string {
  if (!isChoice(ex) || !hebrewOptionsOf(ex)) return '';
  const longest = Math.max(...ex.options.map(o => clusters(o).length));
  if (longest <= 1) return 'sm:grid-cols-4';
  if (longest <= 4) return 'sm:grid-cols-2 lg:grid-cols-4';
  return '';
}

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
