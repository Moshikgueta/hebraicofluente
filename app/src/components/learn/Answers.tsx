'use client';

/* The answer surfaces: one per gesture.
 * ─────────────────────────────────────────────────────────────────────────
 * Each of these is how a learner ANSWERS, and they are deliberately different
 * physical actions — tapping one of four, assembling a syllable, ordering
 * tiles right to left, pairing two columns, typing. A course whose every
 * question is answered the same way stops being read after the third lesson;
 * the eye learns the layout and the brain follows the shape of the options.
 *
 * Three rules hold across all of them, and they are all mobile rules:
 *
 *   · nothing is dragged. Drag-and-drop on a phone is a precision task done
 *     with the blunt end of a finger; tap-one-then-tap-the-other works at any
 *     size, and is also the only version that works from a keyboard;
 *   · every target is at least 44px on its shortest side;
 *   · nothing is undoable only by getting it right. There is always a way back
 *     — remove a tile, clear the build, change the pairing.
 */

import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Button } from '@/components/ui/Button';
import { AudioButton, hasAudio } from './AudioButton';
import { clean, joinSyllable, onCarrier } from '@/lib/hebrew';
import { typedIsCorrect } from '@/lib/engine/types';
import { rng, shuffled } from '@/lib/engine/rng';

/* ── build a syllable ───────────────────────────────────────────────────
   The consonant is on screen. Tapping a vowel puts it ON the consonant, in
   place, at full size — so the learner watches the sign attach instead of
   being told that it does. That is the whole lesson of nikud in one gesture. */
export function BuildSyllable({
  consonant, vowels, answer, sound, settled, onAnswer
}: {
  consonant: string; vowels: string[]; answer: number; sound: string;
  settled: boolean; onAnswer: (correct: boolean, chosen: string) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const shown = picked == null ? consonant : joinSyllable(consonant, vowels[picked]!);

  return (
    <div className="grid gap-5">
      <div className="rounded-[var(--r-lg)] bg-surface-2 py-8 grid place-items-center gap-2">
        <He size="display">{shown}</He>
        <p className="font-ui text-[13px] text-ink-muted">
          {picked == null ? 'toque num sinal para montar' : `deve soar “${sound}”`}
        </p>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {vowels.map((v, i) => (
          <li key={v}>
            <button
              type="button"
              disabled={settled}
              onClick={() => { setPicked(i); onAnswer(i === answer, v); }}
              aria-label={`Sinal ${i + 1}`}
              className={`w-full min-h-[76px] rounded-[var(--r-md)] border-2 grid place-items-center
                transition-colors disabled:cursor-default
                ${settled && i === answer ? 'border-[var(--green)] bg-mint'
                  : settled && i === picked ? 'border-[var(--amber)] bg-[var(--amber-wash)]'
                  : settled ? 'border-line bg-surface opacity-55'
                  : 'border-line bg-surface hover:border-[var(--accent-soft)] hover:bg-[var(--accent-wash)]'}`}
            >
              <He size="lg">{onCarrier(v)}</He>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── build a word ───────────────────────────────────────────────────────
   Right to left is not decoration here. A learner who assembles שָׁלוֹם from the
   left has not read it, so the tray builds into an RTL row: the first tile
   tapped lands on the RIGHT, where the first letter of a Hebrew word goes.

   The tiles are CLUSTERS — a consonant with its own marks — because anything
   smaller would put a vowel sign on the table with nothing to sit on. */
export function BuildWord({
  tiles, target, hintPt, settled, onAnswer
}: {
  tiles: string[]; target: string; hintPt: string;
  settled: boolean; onAnswer: (correct: boolean) => void;
}) {
  const [built, setBuilt] = useState<number[]>([]);
  const used = new Set(built);
  const done = built.length === tiles.length;

  const check = () => {
    const word = built.map(i => tiles[i]!).join('');
    onAnswer(clean(word) === clean(target));
  };

  return (
    <div className="grid gap-4">
      <div
        className="he-seq min-h-[96px] rounded-[var(--r-lg)] border-2 border-dashed border-line
                   bg-surface-2 px-4 py-3 justify-center"
        aria-label="Palavra em construção"
      >
        {built.length === 0 ? (
          <span className="font-ui text-[13px] text-ink-muted">
            toque nas peças na ordem — a primeira letra fica à direita
          </span>
        ) : built.map((t, pos) => (
          <button
            key={`${t}-${pos}`}
            type="button"
            disabled={settled}
            onClick={() => setBuilt(b => b.filter((_, k) => k !== pos))}
            aria-label={`Tirar a peça ${pos + 1}`}
            className="min-h-[56px] min-w-[52px] px-2 rounded-[var(--r-md)] bg-surface
                       border border-line grid place-items-center disabled:cursor-default"
          >
            <He size="word">{tiles[t]!}</He>
          </button>
        ))}
      </div>

      <ul className="flex flex-wrap gap-2.5 justify-center">
        {tiles.map((t, i) => (
          <li key={`${t}-${i}`}>
            <button
              type="button"
              disabled={settled || used.has(i)}
              onClick={() => setBuilt(b => [...b, i])}
              className={`min-h-[64px] min-w-[60px] px-3 rounded-[var(--r-md)] border-2
                grid place-items-center transition-colors
                ${used.has(i)
                  ? 'border-line-soft bg-surface-2 opacity-35'
                  : 'border-line bg-surface hover:border-[var(--accent-soft)] hover:bg-[var(--accent-wash)]'}`}
            >
              <He size="word" dim={used.has(i)}>{t}</He>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={check} disabled={!done || settled} size="md">Conferir</Button>
        {built.length > 0 && !settled && (
          <Button variant="ghost" size="sm" onClick={() => setBuilt([])}>Recomeçar</Button>
        )}
        <span className="font-ui text-[13px] text-ink-muted ml-auto">soa “{hintPt}”</span>
      </div>
    </div>
  );
}

/* ── match ──────────────────────────────────────────────────────────────
   Tap one, tap its pair. A wrong pairing is not a failure state: it flashes,
   it is remembered for the score, and the exercise carries on — the learner is
   here to finish the pairing, not to be stopped by it. */
export function MatchPairs({
  pairs, leftKind, rightKind, labelLeft, labelRight, settled, seed, onAnswer
}: {
  pairs: { left: string; right: string }[];
  leftKind: 'glyph' | 'reading' | 'text';
  rightKind: 'glyph' | 'reading' | 'text';
  labelLeft: string; labelRight: string;
  settled: boolean;
  /** The exercise id. The right column is shuffled FROM it, not from
   *  Math.random(), so a learner who leaves and comes back finds the same
   *  board — the same rule the generators follow. */
  seed: string;
  onAnswer: (correct: boolean, misses: [string, string][]) => void;
}) {
  const [order] = useState(() => shuffled(pairs.map((_, i) => i), rng(seed)));
  /* Either column may be tapped first. Forcing left-then-right is one more
     rule to discover, and a learner reading the Hebrew column naturally starts
     from the side they can read. */
  const [picked, setPicked] = useState<{ side: 'left' | 'right'; i: number } | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ l: number; r: number } | null>(null);
  const missesRef = useRef<[string, string][]>([]);
  const reported = useRef(false);

  useEffect(() => {
    if (matched.length === pairs.length && !reported.current) {
      reported.current = true;
      onAnswer(missesRef.current.length === 0, missesRef.current);
    }
  }, [matched, pairs.length, onAnswer]);

  const tap = (side: 'left' | 'right', i: number) => {
    if (settled || matched.includes(i)) return;
    if (!picked) { setPicked({ side, i }); return; }
    if (picked.side === side) { setPicked({ side, i }); return; }   // changed their mind

    const l = side === 'right' ? picked.i : i;
    const r = side === 'right' ? i : picked.i;
    if (l === r) {
      setMatched(m => [...m, l]);
      setWrong(null);
    } else {
      missesRef.current.push([pairs[l]!.left, pairs[r]!.right]);
      setWrong({ l, r });
      setTimeout(() => setWrong(null), 550);
    }
    setPicked(null);
  };

  const Side = ({ kind, value }: { kind: typeof leftKind; value: string }) =>
    kind === 'text'
      ? <span className="font-ui text-[15px] text-ink">{value}</span>
      : <He size={kind === 'glyph' ? 'lg' : 'word'}>{value}</He>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {([['left', labelLeft], ['right', labelRight]] as const).map(([side, label]) => (
        <div key={side} className="grid gap-2 content-start">
          <p className="font-ui text-[11px] uppercase tracking-[.07em] text-ink-muted px-1">
            {label}
          </p>
          <ul className="grid gap-2">
            {(side === 'left' ? pairs.map((_, i) => i) : order).map(i => {
              const isMatched = matched.includes(i);
              const isPicked = picked?.side === side && picked.i === i;
              const isWrong = wrong && (side === 'left' ? wrong.l === i : wrong.r === i);
              return (
                <li key={`${side}-${i}`}>
                  <button
                    type="button"
                    disabled={settled || isMatched}
                    onClick={() => tap(side, i)}
                    /* A fixed row height on BOTH sides, so row 3 on the left
                       sits beside row 3 on the right. Hebrew at word size is
                       taller than a line of Portuguese, and letting the rows
                       find their own heights made the two columns drift apart
                       down the screen. */
                    className={`w-full h-[72px] px-3 rounded-[var(--r-md)] border-2
                      grid place-items-center transition-colors disabled:cursor-default
                      ${isMatched ? 'border-[var(--green)] bg-mint'
                        : isWrong ? 'border-[var(--amber)] bg-[var(--amber-wash)]'
                        : isPicked ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]'
                        : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}
                  >
                    <Side
                      kind={side === 'left' ? leftKind : rightKind}
                      value={side === 'left' ? pairs[i]!.left : pairs[i]!.right}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── type it ────────────────────────────────────────────────────────────
   Retrieval, not recognition, and much harder — so the answer is short, the
   matching is forgiving (accents are a stress hint in this course, not part of
   the answer), and the field scrolls itself into view, because a phone keyboard
   covers the bottom half of the screen and an input the learner cannot see is
   an exercise they cannot do. */
export function TypeAnswer({
  he, accept, placeholder, settled, correct, onAnswer
}: {
  he?: string; accept: string[]; placeholder: string;
  settled: boolean; correct: boolean | null;
  onAnswer: (correct: boolean, typed: string) => void;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (settled || !value.trim()) return;
    onAnswer(typedIsCorrect(value, accept), value);
  };

  return (
    <div className="grid gap-4">
      {he && (
        <div className="rounded-[var(--r-lg)] bg-surface-2 py-7 grid place-items-center">
          <He size="display">{he}</He>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          onFocus={() => setTimeout(
            () => ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250
          )}
          disabled={settled}
          placeholder={placeholder}
          /* The transliteration is Latin text in a left-to-right box, inside a
             page whose subject is right-to-left. Saying so explicitly stops the
             caret jumping when the learner types next to Hebrew. */
          dir="ltr"
          lang="pt-BR"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-label="Sua resposta"
          className={`flex-1 min-w-[180px] min-h-[52px] px-4 rounded-[var(--r-md)] border-2
            bg-surface font-ui text-[17px] text-ink placeholder:text-ink-muted
            ${settled && correct === true ? 'border-[var(--green)]'
              : settled && correct === false ? 'border-[var(--amber)]'
              : 'border-line focus:border-[var(--accent-soft)]'}`}
        />
        <Button onClick={submit} disabled={settled || !value.trim()} size="md">Conferir</Button>
      </div>
      {settled && correct === false && (
        <p className="font-ui text-[14px] text-ink-body">
          Você escreveu <strong>{value}</strong>. O certo era <strong>{accept[0]}</strong>.
        </p>
      )}
    </div>
  );
}

/* ── the hint ladder ────────────────────────────────────────────────────
   Hints cost nothing and are never the answer. The first is a nudge, the
   second is concrete, and after that the learner is invited to answer and be
   told why — which teaches more than a third hint would. */
export function Hints({ hints, audioId }: { hints?: string[]; audioId?: string | null }) {
  const [shown, setShown] = useState(0);
  const available = hints?.length ?? 0;
  /* A hint row is not the place to advertise a missing recording. The lesson
     pages say "áudio em breve" where the gap is the point; here it would be
     one more disabled control between the learner and the answer. */
  const playable = hasAudio(audioId);
  if (!available && !playable) return null;

  return (
    <div className="grid gap-2">
      {shown > 0 && (
        <ul className="grid gap-1.5" aria-live="polite">
          {hints?.slice(0, shown).map((h, i) => (
            <li key={i} className="font-ui text-[13.5px] leading-relaxed text-ink-muted
                                   border-l-2 border-[var(--accent)] pl-3">
              {h}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {shown < available && (
          <button
            type="button"
            onClick={() => setShown(s => s + 1)}
            className="min-h-[44px] font-ui text-[13px] text-[var(--accent)] hover:underline"
          >
            {shown === 0 ? 'Precisa de uma dica?' : 'Mais uma dica'}
          </button>
        )}
        {playable && <AudioButton audioId={audioId!} label="Ouvir" size="sm" slow />}
      </div>
    </div>
  );
}
