'use client';

/* "Para revisar" - the mistake notebook.
 * ─────────────────────────────────────────────────────────────────────────
 * The review used to be a black box: it produced five questions and a learner
 * who wanted to know what the course thought they were bad at had no way to
 * ask. That is a strange thing for a study tool to withhold, and it is also
 * the screen that makes the adaptive part visible - without it, "a revisão
 * escolheu por você" is a claim the learner has to take on faith.
 *
 * It names three different debts, because they need three different answers:
 * a letter due in the queue, a SKILL that slipped (you read ק fine and cannot
 * hear it), and a PAIR being traded (ד for ר). Showing them as one number
 * would hide the only useful part.
 */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { useProgress } from '@/lib/state/store';
import { allLetters, getLetter } from '@/lib/content';
import { reviewDebt } from '@/lib/state/rules';
import { SKILL_LABEL } from '@/lib/state/types';
import { useMemo } from 'react';

export function ParaRevisar({ limit = 6 }: { limit?: number }) {
  const p = useProgress();

  /* Glyph → letter id, so a confusion recorded as "ד for ר" can be shown as
     the two letters it is about. */
  const byGlyph = useMemo(() => {
    const m = new Map<string, string>();
    for (const L of allLetters()) {
      m.set(L.letter, L.id);
      if (L.finalForm) m.set(L.finalForm, L.id);
    }
    return m;
  }, []);

  const debt = useMemo(
    () => reviewDebt(p.state, p.day, byGlyph).slice(0, limit),
    [p.state, p.day, byGlyph, limit]
  );

  if (!debt.length) {
    return (
      <Card className="p-5 grid gap-2">
        <h3 className="font-display text-[16px] font-bold text-ink">Para revisar</h3>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
          Nada pendente. Quando você errar alguma coisa, ela aparece aqui - com o
          motivo, não só a letra.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-[color:var(--line-soft)]
                      flex items-baseline justify-between gap-3">
        <h3 className="font-display text-[16px] font-bold text-ink">Para revisar</h3>
        <span className="font-ui text-[12px] text-ink-muted tabular-nums">
          {debt.length} {debt.length === 1 ? 'letra' : 'letras'}
        </span>
      </div>
      <ul className="divide-y divide-[color:var(--line-soft)]">
        {debt.map(d => {
          const L = getLetter(d.letterId);
          if (!L) return null;
          const reasons = [
            ...d.skills.map(s => SKILL_LABEL[s].toLowerCase()),
            ...(d.due ? [`${d.due} ${d.due === 1 ? 'item' : 'itens'} na fila`] : [])
          ];
          return (
            <li key={d.letterId}>
              <Link
                href={`/licao/${L.id}`}
                className="flex items-center gap-3 px-4 sm:px-5 py-3 min-h-[60px]
                           hover:bg-surface-2 transition-colors"
              >
                <He size="word">{L.letter}</He>
                <span className="grid gap-0.5 min-w-0 flex-1">
                  <span className="font-ui text-[14px] font-medium text-ink">{L.namePt}</span>
                  <span className="font-ui text-[12.5px] text-ink-muted truncate">
                    {reasons.length ? reasons.join(' · ') : 'na fila de revisão'}
                  </span>
                </span>
                {d.confusedWith.length > 0 && (
                  <span className="flex items-center gap-1 shrink-0"
                        title={`Você está trocando com ${d.confusedWith.join(', ')}`}>
                    <span aria-hidden className="font-ui text-[11px] text-ink-muted">troca com</span>
                    <He size="inline">{d.confusedWith[0]!}</He>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
