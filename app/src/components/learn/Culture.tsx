'use client';

/* Viagem pela história do hebraico.
 * ─────────────────────────────────────────────────────────────────────────
 * Optional, unlockable, and deliberately OUTSIDE the path. The course teaches
 * reading; a learner who wants to know where the vowel points came from should
 * be able to find out without the alphabet turning into a history class, and a
 * learner who does not care should never be stopped by one.
 *
 * Cards unlock on letters mastered rather than on lessons opened, so they are a
 * consequence of progress and not another thing on the list. They are also the
 * cheapest thing in the whole course to skip: nothing depends on them, nothing
 * is scored, and nothing is unlocked by reading them.
 */

import { useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Prose } from './Blocks';
import { cultureUnlocked, cultureCards, type CultureCard } from '@/lib/content';
import { useProgress } from '@/lib/state/store';

const KIND_LABEL: Record<string, string> = {
  historia: 'História',
  curiosidade: 'Curiosidade',
  cultura: 'Na vida real'
};

export function CultureShelf() {
  const p = useProgress();
  const unlocked = cultureUnlocked(p.mastered);
  const locked = cultureCards()
    .filter(c => c.unlockAt > p.mastered)
    .sort((a, b) => a.unlockAt - b.unlockAt);

  return (
    <div className="grid gap-4">
      {unlocked.length === 0 && (
        <Card tone="wash" className="p-5">
          <p className="font-ui text-[14px] leading-relaxed text-ink-body">
            A primeira carta abre quando você dominar 3 letras. Elas não valem XP
            e não desbloqueiam nada — são só o que dá vontade de saber depois de
            começar a ler.
          </p>
        </Card>
      )}

      {unlocked.map(c => <CultureCardView key={c.id} card={c} />)}

      {locked.length > 0 && (
        <Card className="p-5 grid gap-2">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
            Ainda fechadas
          </p>
          <ul className="grid gap-1.5">
            {locked.slice(0, 4).map(c => (
              <li key={c.id} className="flex items-center gap-3 font-ui text-[13.5px] text-ink-muted">
                <span aria-hidden className="w-6 text-center">◇</span>
                <span className="flex-1 min-w-0 truncate">{c.titlePt}</span>
                <span className="tabular-nums shrink-0">{c.unlockAt} letras</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function CultureCardView({ card, open: initial = false }: { card: CultureCard; open?: boolean }) {
  const [open, setOpen] = useState(initial);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 grid gap-2 hover:bg-surface-2 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <Badge tone="teal">{KIND_LABEL[card.kind] ?? 'Curiosidade'}</Badge>
          <span aria-hidden className="ml-auto text-ink-muted text-[13px]">
            {open ? '−' : '+'}
          </span>
        </span>
        <span className="font-display text-[18px] font-bold text-ink leading-snug">
          {card.titlePt}
        </span>
        <span className="font-ui text-[14px] leading-relaxed text-ink-muted">
          <Prose text={card.leadPt} />
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 grid gap-3 border-t border-[color:var(--line-soft)] pt-4 animate-rise">
          {card.bodyPt.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink-body max-w-[64ch]">
              <Prose text={para} />
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}

/* The unlock moment: shown once, where the learner just earned it, and never
   in the way. It is a reward, so it does not ask for anything. */
export function CultureUnlock({ card }: { card: CultureCard }) {
  return (
    <Card tone="mint" className="p-5 grid gap-2">
      <p className="font-ui text-[11px] uppercase tracking-[.1em] text-[var(--mint-ink)]">
        Carta desbloqueada
      </p>
      <CultureCardView card={card} />
    </Card>
  );
}
