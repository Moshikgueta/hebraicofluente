'use client';

/* The 22 letters, all at once.
 * ─────────────────────────────────────────────────────────────────────────
 * This is the panel that justifies a desktop version. On a phone the course
 * answers "what now?" with one card, because one card is all that fits and all
 * that a bus ride needs. At a desk the useful question is "where am I in this
 * alphabet?" — and the honest answer is the whole alphabet with your progress
 * written on it, not a percentage.
 *
 * Three states, and the third matters: done, current, and not yet — drawn but
 * never hidden. Hiding the road is what makes a course feel endless, and a
 * beginner staring at 22 unknown shapes needs to watch them turn over one by
 * one. A letter part-way through shows its stage count rather than a tick,
 * because "3 de 5" is information and a half-filled tick is not.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, type Letter } from '@/lib/content';
import { isLessonComplete, STAGE_COUNT } from '@/lib/state/rules';

export function AlphabetGrid({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const letters = allLetters();

  /* The first unfinished letter is "current". Everything before it is open for
     revisiting, everything after is reachable — nothing is locked, because a
     lock is a promise the course does not need to make. */
  const currentId = letters.find(l => !isLessonComplete(p.state, l.id))?.id;

  return (
    <div className="grid gap-3">
      <div
        className={`grid gap-2 ${compact
          ? 'grid-cols-[repeat(auto-fill,minmax(52px,1fr))]'
          : 'grid-cols-[repeat(auto-fill,minmax(64px,1fr))]'}`}
      >
        {letters.map(L => (
          <LetterCell
            key={L.id}
            letter={L}
            done={isLessonComplete(p.state, L.id)}
            current={L.id === currentId}
            stages={p.state.lessons[L.id]?.stagesDone.length ?? 0}
            compact={compact}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-ui text-[11.5px] text-ink-muted">
        <Legend swatch="bg-mint border-[var(--green)]" label={`${p.mastered} dominadas`} />
        <Legend swatch="bg-[var(--teal-wash)] border-[var(--teal)]" label="onde você está" />
        <Legend swatch="bg-surface border-line" label={`${course.totalLetters - p.mastered} pela frente`} />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`w-3 h-3 rounded-[4px] border ${swatch}`} />
      {label}
    </span>
  );
}

function LetterCell({
  letter: L, done, current, stages, compact
}: { letter: Letter; done: boolean; current: boolean; stages: number; compact: boolean }) {
  const tone = done
    ? 'bg-mint border-[var(--green)]'
    : current
      ? 'bg-[var(--teal-wash)] border-[var(--teal)]'
      : 'bg-surface border-line hover:border-[var(--teal)]';

  const state = done ? 'concluída'
    : current ? 'onde você está'
    : stages > 0 ? `${stages} de ${STAGE_COUNT} etapas`
    : 'ainda não estudada';

  return (
    <Link
      href={`/licao/${L.id}`}
      title={`${L.order}. ${L.namePt} — ${state}`}
      aria-label={`Letra ${L.order}, ${L.namePt}: ${state}`}
      className={`group relative rounded-[var(--r-md)] border-2 transition-colors
        ${compact ? 'min-h-[56px] p-1.5' : 'min-h-[74px] p-2'}
        grid place-items-center gap-0.5 ${tone} ${!done && !current && stages === 0 ? 'opacity-70' : ''}`}
    >
      <span aria-hidden className="absolute top-1 left-1.5 font-ui text-[9.5px] tabular-nums text-ink-muted">
        {L.order}
      </span>
      <He size={compact ? 'word' : 'lg'} dim={!done && !current && stages === 0}>{L.letter}</He>
      {!compact && (
        <span className="font-ui text-[10px] leading-none text-ink-muted truncate max-w-full">
          {stages > 0 && !done ? `${stages}/${STAGE_COUNT}` : L.namePt}
        </span>
      )}
      {done && (
        <span aria-hidden
              className="absolute top-1 right-1.5 text-[10px] leading-none text-[var(--green)]">✓</span>
      )}
    </Link>
  );
}

/* ── module progress ────────────────────────────────────────────────────
   The teaching plan's own units, with how far each one got. A learner who
   stalls does it inside a module, and this is where that shows. */
export function ModuleProgress() {
  const p = useProgress();

  return (
    /* Two columns while this is a full-width block under the alphabet; one
       column from lg up, where it lives in the ~350px rail and a second column
       would truncate every module title to "As s…". */
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {course.modules.map(m => {
        const own = allLetters().filter(l => l.module === m.n);
        const isExtra = own.length === 0;
        const doneCount = isExtra
          ? Math.min(3, p.state.lessons[m.id]?.stagesDone.length ?? 0)
          : own.filter(l => isLessonComplete(p.state, l.id)).length;
        const total = isExtra ? 3 : own.length;
        const cpPassed = !!p.state.checkpoints[`cp${m.n}`]?.passedAt;
        const href = isExtra
          ? `/modulo/${m.n}`
          : `/licao/${own.find(l => !isLessonComplete(p.state, l.id))?.id ?? own[0]!.id}`;

        return (
          <li key={m.id}>
            <Link
              href={href}
              className="block rounded-[var(--r-md)] border border-line bg-surface p-3
                         hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted shrink-0">
                  Mód {m.n}
                </span>
                <span className="font-ui text-[13px] font-medium text-ink truncate">{m.titlePt}</span>
                <span className="ml-auto font-ui text-[11.5px] tabular-nums text-ink-muted shrink-0">
                  {cpPassed ? '✓' : `${doneCount}/${total}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-500
                    ${cpPassed ? 'bg-[var(--green)]' : 'bg-[var(--teal-band)]'}`}
                  style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
