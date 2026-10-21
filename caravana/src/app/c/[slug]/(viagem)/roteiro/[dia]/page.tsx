import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Scene } from '@/components/art/Scene';
import { IconChevronLeft, IconChevronRight, IconClock, IconSpark } from '@/components/icons';
import { STATE_LABEL } from '@/components/traveler/cards';
import { Eyebrow, He, Notice, Tag } from '@/components/ui';
import { dayState, formatLong, weekday } from '@/lib/dates';
import { activitiesFor, destinationBySlug, getTrip } from '@/lib/trip';

export default async function DayPage({ params }: { params: Promise<{ slug: string; dia: string }> }) {
  const { slug, dia } = await params;
  const { snapshot: s, today, base, progress } = await getTrip(slug);
  const n = Number(dia);
  const day = s.days.find((d) => d.number === n);
  if (!day) notFound();
  const state = dayState(day.date, today);
  const prev = s.days.find((d) => d.number === n - 1);
  const next = s.days.find((d) => d.number === n + 1);

  return (
    <article>
      <div className="relative h-44 overflow-hidden sm:h-60">
        <Scene name={day.art} variant="band" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-paper" aria-hidden />
      </div>
      <div className="mx-auto -mt-10 max-w-xl px-4 pb-12 sm:px-6">
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>
              Dia {day.number} · {weekday(day.date)}, {formatLong(day.date)}
            </Eyebrow>
            <Tag tone={state === 'today' ? 'brand' : 'neutral'}>{STATE_LABEL[state]}</Tag>
          </div>
          <h1 className="mt-2 font-display text-display-l font-medium tracking-[-0.02em]">{day.title}</h1>
          {day.summary && <p className="mt-3 text-[1.08rem] leading-relaxed text-ink-soft">{day.summary}</p>}
        </div>

        {day.practicalNotes && (
          <Notice tone="brand" title="Para este dia" className="mt-6">
            {day.practicalNotes}
          </Notice>
        )}

        <h2 className="mt-10 text-micro font-semibold uppercase tracking-[0.14em] text-stone-600">Paradas</h2>
        <ol className="mt-4 space-y-0">
          {day.stops.map((stop, i) => {
            const dest = destinationBySlug(s, stop.destinationSlug);
            const acts = dest ? activitiesFor(s, dest.slug) : [];
            return (
              <li key={i} className="relative grid grid-cols-[1.75rem_1fr] gap-3 pb-7 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="tabular grid h-7 w-7 place-items-center rounded-full bg-ink text-micro font-semibold text-paper">{i + 1}</span>
                  {i < day.stops.length - 1 && <span className="mt-1 w-px flex-1 bg-stone-300" aria-hidden />}
                </div>
                <div className="min-w-0 pt-0.5">
                  {stop.timeLabel && (
                    <p className="tabular mb-0.5 inline-flex items-center gap-1 text-micro font-semibold text-stone-600">
                      <IconClock size={14} /> {stop.timeLabel}
                    </p>
                  )}
                  <h3 className="font-display text-title font-medium text-ink">{stop.title}</h3>
                  {stop.description && <p className="mt-1 text-small text-ink-soft">{stop.description}</p>}
                  {stop.practicalNote && <p className="mt-2 text-small font-medium text-warning">{stop.practicalNote}</p>}
                  {dest && (
                    <div className="mt-3 overflow-hidden rounded-md bg-paper-raised ring-1 ring-stone-200">
                      <Link href={`${base}/descubra/${dest.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-100/60">
                        <He display className="text-[1.35rem] text-brand-text">
                          {dest.nameHe}
                        </He>
                        <span className="min-w-0 flex-1">
                          <span className="block text-small font-semibold text-ink">{dest.content ? `Conhecer ${dest.namePt}` : dest.namePt}</span>
                          <span className="block truncate text-micro text-stone-600">{dest.content ? dest.content.summary : 'Conteúdo em preparação'}</span>
                        </span>
                        <IconChevronRight size={18} className="text-stone-500" />
                      </Link>
                      {acts.map((a) => (
                        <Link key={a.slug} href={`${base}/atividades/${a.slug}`} className="flex items-center gap-2 border-t border-stone-200 px-4 py-2.5 text-small font-semibold text-brand-text hover:bg-brand-tint">
                          <IconSpark size={18} /> {progress.completed[a.slug] ? `Refazer: ${a.title}` : `Atividade: ${a.title}`}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <nav aria-label="Outros dias" className="mt-12 grid grid-cols-2 gap-3 border-t border-stone-200 pt-6">
          {prev ? (
            <Link href={`${base}/roteiro/${prev.number}`} className="group rounded-md p-2 hover:bg-stone-100">
              <span className="flex items-center gap-1 text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">
                <IconChevronLeft size={16} /> Dia {prev.number}
              </span>
              <span className="mt-1 block text-small font-semibold text-ink">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`${base}/roteiro/${next.number}`} className="group rounded-md p-2 text-right hover:bg-stone-100">
              <span className="flex items-center justify-end gap-1 text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">
                Dia {next.number} <IconChevronRight size={16} />
              </span>
              <span className="mt-1 block text-small font-semibold text-ink">{next.title}</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
