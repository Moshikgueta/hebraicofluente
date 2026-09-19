'use client';

import { Card } from '@/components/ui/Card';
import { AchievementBadge, ProgressBar } from '@/components/game/Game';
import { useProgress } from '@/lib/state/store';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { course, cultureCards, cultureUnlocked } from '@/lib/content';
import Link from 'next/link';

export function AchievementsClient() {
  const p = useProgress();
  const have = new Set(p.state.achievements.map(a => a.id));

  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <h1 className="text-[27px] sm:text-[33px] font-bold">Conquistas</h1>
        <ProgressBar
          value={ACHIEVEMENTS.length ? have.size / ACHIEVEMENTS.length : 0}
          label={`${have.size} de ${ACHIEVEMENTS.length}`}
        />
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => (
          <AchievementBadge key={a.id} id={a.id} unlocked={have.has(a.id)} />
        ))}
      </div>

      {/* The other kind of unlock: not a badge for doing something, a card
          worth reading. Kept next to the badges because both are the part of
          the course that is not work. */}
      <Link
        href="/historia"
        className="flex items-center justify-between gap-4 rounded-[var(--r-md)] border
                   border-line bg-surface px-4 py-3.5 hover:bg-surface-2 transition-colors"
      >
        <span className="grid gap-0.5 min-w-0">
          <span className="font-ui text-[14.5px] font-medium text-ink">
            Viagem pela história do hebraico
          </span>
          <span className="font-ui text-[12.5px] text-ink-muted">
            {cultureUnlocked(p.mastered).length} de {cultureCards().length} cartas abertas
          </span>
        </span>
        <span aria-hidden className="text-ink-muted">→</span>
      </Link>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[17px] font-semibold">Seus números</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['XP', p.state.xp],
            ['Letras', `${p.mastered}/${course.totalLetters}`],
            ['Sequência', p.streak],
            ['Recorde', p.state.streak.longest]
          ].map(([k, v]) => (
            <div key={String(k)} className="grid gap-0.5">
              <dt className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
              <dd className="font-display text-[22px] font-bold text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[17px] font-semibold">Recomeçar do zero</h2>
        {/* "Da conta" e não "deste navegador": agora o apagar também limpa o
            servidor, e prometer menos do que o botão faz é pior do que o
            contrário - a pessoa acharia que o progresso volta noutro
            aparelho. */}
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted max-w-[52ch]">
          Apaga todo o seu progresso, em todos os aparelhos: XP, sequência,
          lições e revisões. Não dá para desfazer.
        </p>
        <button
          type="button"
          onClick={() => { if (confirm('Apagar todo o seu progresso? Isso não pode ser desfeito.')) p.reset(); }}
          className="justify-self-start min-h-[44px] px-4 rounded-[var(--r-md)] border border-line
                     font-ui text-[14px] text-ink-muted hover:text-ink hover:bg-surface-2"
        >
          Apagar progresso
        </button>
      </Card>
    </div>
  );
}
