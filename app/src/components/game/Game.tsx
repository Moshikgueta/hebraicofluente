'use client';

/* Gamification, kept quiet.
 *
 * The rule applied throughout: a number is shown when it tells the learner
 * something about their learning. XP, streak and progress are on the
 * dashboard; they are NOT on every lesson screen, because a counter ticking
 * during a reading exercise competes with the reading. */

import { ACHIEVEMENTS } from '@/lib/state/rules';
import { Prose } from '@/components/learn/Blocks';
import { Card } from '@/components/ui/Card';

export function ProgressBar({
  value, label, sublabel
}: { value: number; label?: string; sublabel?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="grid gap-2">
      {(label || sublabel) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="font-ui text-[13px] text-ink-body">{label}</span>}
          {sublabel && <span className="font-ui text-[13px] tabular-nums text-ink-muted">{sublabel}</span>}
        </div>
      )}
      <div
        className="h-2 rounded-full bg-surface-2 overflow-hidden"
        role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        aria-label={label ?? 'Progresso'}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-[var(--ease)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StreakCard({ days, goalUnits, goalTarget }: {
  days: number; goalUnits: number; goalTarget: number;
}) {
  const met = goalUnits >= goalTarget;
  return (
    <Card tone={days > 0 ? 'ember' : 'surface'} className="p-5 grid gap-3">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="text-[20px]">{days > 0 ? '🔥' : '○'}</span>
        <p className="font-display text-[19px] font-bold text-ink">
          {days === 0 ? 'Comece hoje'
            : days === 1 ? '1 dia seguido'
            : `${days} dias seguidos`}
        </p>
      </div>
      <ProgressBar
        value={goalTarget ? goalUnits / goalTarget : 0}
        label={met ? 'Meta de hoje concluída' : 'Meta de hoje'}
        sublabel={`${Math.round((Math.min(goalUnits, goalTarget) / goalTarget) * 100)}%`}
      />
      {days === 0 && (
        <p className="font-ui text-[13px] leading-relaxed text-ink-muted">
          Seu progresso continua aqui, sem prazo. Vamos retomar?
        </p>
      )}
    </Card>
  );
}

export function XPIndicator({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-ui text-[13px] font-semibold text-ink-body">
      <span aria-hidden className="text-[var(--accent)]">◆</span>
      <span className="tabular-nums">{xp.toLocaleString('pt-BR')}</span>
      <span className="text-ink-muted font-normal">XP</span>
    </span>
  );
}

export function AchievementBadge({
  id, unlocked = true, compact = false
}: { id: string; unlocked?: boolean; compact?: boolean }) {
  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (!def) return null;
  return (
    <div
      className={`rounded-[var(--r-md)] border p-4 grid gap-1 transition-opacity
        ${unlocked ? 'border-[var(--accent-soft)] bg-[var(--accent-wash)]' : 'border-line bg-surface opacity-55'}`}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className={unlocked ? 'text-[var(--accent)]' : 'text-ink-muted'}>
          {unlocked ? '◆' : '◇'}
        </span>
        <p className="font-display text-[15px] font-semibold text-ink">{def.titlePt}</p>
      </div>
      {!compact && (
        <p className="font-ui text-[13px] leading-relaxed text-ink-muted">
          <Prose text={def.descPt} />
        </p>
      )}
    </div>
  );
}

/* The one strong celebration. Reserved for a completed letter, a checkpoint
   and the end of the course — nothing smaller earns it. */
export function Milestone({
  kicker, title, body, children
}: { kicker: string; title: string; body: string; children?: React.ReactNode }) {
  return (
    <Card tone="mint" className="p-7 sm:p-9 grid gap-4 text-center animate-rise">
      <p className="font-ui text-[12px] uppercase tracking-[.12em] text-[var(--mint-ink)]">{kicker}</p>
      <h2 className="text-[26px] sm:text-[32px] font-bold leading-tight text-ink">{title}</h2>
      <p className="text-[16px] leading-relaxed text-ink-body max-w-[46ch] mx-auto">{body}</p>
      {children && <div className="pt-2 flex flex-wrap gap-3 justify-center">{children}</div>}
    </Card>
  );
}
