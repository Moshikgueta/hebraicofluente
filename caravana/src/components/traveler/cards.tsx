// Pecas repetidas da area do viajante.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { REGION_LABEL } from '@content/destinations';
import { Scene } from '../art/Scene';
import { IconChevronRight } from '../icons';
import { cx, He, Tag } from '../ui';
import { formatShort, weekday, type DayState } from '@/lib/dates';
import type { Snapshot, SnapshotDestination } from '@/lib/domain/snapshot';

export const STATE_LABEL: Record<DayState, string> = { past: 'Dia anterior', today: 'Hoje', future: 'Próximo' };

export function DayCard({ day, state, href, compact = false }: { day: Snapshot['days'][number]; state: DayState; href: string; compact?: boolean }) {
  const places = day.stops.map((s) => s.title).slice(0, 3);
  return (
    <Link
      href={href}
      className={cx(
        'group flex overflow-hidden rounded-md bg-paper-raised ring-1 transition hover:shadow-card',
        state === 'today' ? 'ring-2 ring-brand' : 'ring-stone-200',
        state === 'past' && 'opacity-[0.86]',
      )}
    >
      <div className={cx('relative shrink-0 overflow-hidden', compact ? 'w-20' : 'w-24 sm:w-32')}>
        <Scene name={day.art} variant="band" className="absolute inset-0 h-full w-full" title={day.title} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-2 pb-1.5 pt-5 text-white">
          <p className="tabular text-micro font-semibold uppercase tracking-[0.12em]">Dia {day.number}</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
        <div className="flex items-center gap-2 text-micro text-stone-600">
          <span className="tabular">
            {weekday(day.date)}, {formatShort(day.date)}
          </span>
          {state === 'today' && <Tag tone="brand">Hoje</Tag>}
        </div>
        <p className="font-display text-title font-medium leading-snug text-ink">{day.title}</p>
        {!compact && places.length > 0 && <p className="truncate text-small text-stone-600">{places.join(' · ')}</p>}
      </div>
      <div className="flex items-center pr-3 text-stone-500 transition group-hover:translate-x-0.5">
        <IconChevronRight size={20} />
      </div>
    </Link>
  );
}

export function DestinationCard({ d, href, footer }: { d: SnapshotDestination; href: string; footer?: ReactNode }) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-md bg-paper-raised ring-1 ring-stone-200 transition hover:shadow-card">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Scene name={d.art} className="h-full w-full transition duration-700 group-hover:scale-[1.03]" title={d.namePt} />
        {!d.content && (
          <span className="absolute left-3 top-3">
            <Tag>Em preparação</Tag>
          </span>
        )}
      </div>
      <div className="space-y-1 px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-title font-medium text-ink">{d.namePt}</p>
          <He display className="text-[1.15rem] text-stone-700">
            {d.nameHe}
          </He>
        </div>
        <p className="text-micro text-stone-600">
          {REGION_LABEL[d.region as keyof typeof REGION_LABEL] ?? d.region} · <span className="italic">{d.transliteration}</span>
        </p>
        {d.content && <p className="line-clamp-2 pt-1 text-small text-ink-soft">{d.content.summary}</p>}
        {footer}
      </div>
    </Link>
  );
}

// Aviso discreto e honesto sobre a origem do conteudo.
export function ReviewNote({ kind }: { kind: 'content' | 'hebrew' }) {
  return (
    <p className="text-micro text-stone-600">
      {kind === 'content'
        ? 'Texto de demonstração em revisão editorial. Numa caravana real, só entra conteúdo aprovado.'
        : 'Hebraico de demonstração, aguardando revisão de um falante nativo.'}
    </p>
  );
}
