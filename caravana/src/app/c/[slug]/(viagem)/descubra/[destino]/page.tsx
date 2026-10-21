import Link from 'next/link';
import { notFound } from 'next/navigation';
import { REGION_LABEL } from '@content/destinations';
import { Scene } from '@/components/art/Scene';
import { IconCheck, IconPin, IconSpark } from '@/components/icons';
import { ReviewNote } from '@/components/traveler/cards';
import { ViewTracker } from '@/components/traveler/ViewTracker';
import { cx, Eyebrow, He, LinkButton } from '@/components/ui';
import type { ContentBlock } from '@/lib/db/schema';
import { activitiesFor, destinationBySlug, getTrip } from '@/lib/trip';

const KIND: Record<ContentBlock['kind'], { label: string; className: string }> = {
  fact: { label: 'Fato histórico', className: 'text-sea' },
  tradition: { label: 'Tradição', className: 'text-ochre' },
  interpretation: { label: 'Interpretação', className: 'text-terracotta' },
  tip: { label: 'Para a visita', className: 'text-olive' },
};

export default async function DestinationPage({ params }: { params: Promise<{ slug: string; destino: string }> }) {
  const { slug, destino } = await params;
  const { snapshot: s, base, progress } = await getTrip(slug);
  const d = destinationBySlug(s, destino);
  if (!d) notFound();
  const c = d.content;
  const acts = activitiesFor(s, d.slug);
  const days = s.days.filter((day) => day.stops.some((st) => st.destinationSlug === d.slug));
  const map =
    d.latitude !== null && d.longitude !== null
      ? `https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=14/${d.latitude}/${d.longitude}`
      : null;

  return (
    <article>
      {c && <ViewTracker slug={slug} destination={d.slug} />}
      <div className="relative h-64 overflow-hidden sm:h-96">
        <Scene name={d.art} className="h-full w-full" title={d.namePt} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-paper" aria-hidden />
      </div>
      <div className="mx-auto -mt-16 max-w-2xl px-4 pb-14 sm:px-6">
        <header className="relative">
          <Eyebrow>{REGION_LABEL[d.region as keyof typeof REGION_LABEL] ?? d.region}</Eyebrow>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h1 className="font-display text-display-l font-medium tracking-[-0.02em] sm:text-display-xl">{d.namePt}</h1>
            <He display className="text-[2.2rem] leading-none text-brand-text sm:text-[2.8rem]">
              {d.nameHe}
            </He>
          </div>
          <p className="mt-3 text-small text-stone-600">
            Em hebraico: <span className="font-semibold italic text-ink">{d.transliteration}</span>
            {d.pronunciation && <> · pronuncia-se {d.pronunciation}</>}
          </p>
        </header>

        {!c ? (
          <div className="mt-10 rounded-md border border-dashed border-stone-300 p-6">
            <p className="font-display text-title font-medium">Conteúdo em preparação</p>
            <p className="mt-2 text-small text-stone-600">A equipe editorial ainda está escrevendo o texto deste lugar. Preferimos deixar o espaço vazio a publicar algo sem revisão.</p>
          </div>
        ) : (
          <>
            <p className="mt-8 font-display text-[1.35rem] leading-relaxed text-ink">{c.summary}</p>

            {c.geography && (
              <div className="mt-8 flex gap-3 rounded-md bg-sand/70 p-4 ring-1 ring-sand-deep">
                <IconPin className="mt-0.5 shrink-0 text-stone-600" />
                <div className="text-small text-ink-soft">
                  <p className="font-semibold text-ink">Onde fica</p>
                  <p className="mt-0.5">{c.geography}</p>
                  {map && (
                    <a href={map} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-brand-text underline-offset-2 hover:underline">
                      Ver no mapa (OpenStreetMap)
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="prose-editorial mt-10 space-y-12">
              {c.sections.map((sec) => (
                <section key={sec.id} aria-labelledby={`sec-${sec.id}`}>
                  <h2 id={`sec-${sec.id}`} className="font-display text-display-m font-medium tracking-[-0.01em]">
                    {sec.title}
                  </h2>
                  <div className="mt-5 space-y-6">
                    {sec.blocks.map((b, i) => (
                      <div key={i} className="grid gap-1 sm:grid-cols-[7.5rem_1fr] sm:gap-5">
                        <p className={cx('pt-1 text-micro font-semibold uppercase tracking-[0.12em]', KIND[b.kind].className)}>{KIND[b.kind].label}</p>
                        <div>
                          <p className="text-[1.06rem] leading-[1.75] text-ink">{b.text}</p>
                          {b.source && <p className="mt-1.5 text-small italic text-stone-600">Fonte: {b.source}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {c.observe.length > 0 && (
              <section className="mt-12 rounded-lg bg-ink p-6 text-paper sm:p-8">
                <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ochre-soft">Durante a visita</p>
                <h2 className="mt-1 font-display text-display-m font-medium">O que observar</h2>
                <ol className="mt-5 space-y-4">
                  {c.observe.map((o, i) => (
                    <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2">
                      <span className="tabular font-display text-title italic text-ochre-soft">{i + 1}</span>
                      <span className="text-[1.02rem] leading-relaxed text-stone-100">{o}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}

        {acts.length > 0 && (
          <section className="mt-10 space-y-3">
            {acts.map((a) => {
              const done = progress.completed[a.slug];
              return (
                <div key={a.slug} className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-brand-tint p-5 ring-1 ring-stone-200">
                  <div>
                    <p className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-brand-text">
                      <IconSpark size={16} /> Atividade
                    </p>
                    <p className="mt-1 font-display text-title font-medium">{a.title}</p>
                    {done && (
                      <p className="mt-1 flex items-center gap-1 text-small text-success">
                        <IconCheck size={16} /> Concluída
                      </p>
                    )}
                  </div>
                  <LinkButton href={`${base}/atividades/${a.slug}`} variant={done ? 'secondary' : 'primary'}>
                    {done ? 'Refazer' : 'Começar'}
                  </LinkButton>
                </div>
              );
            })}
          </section>
        )}

        {days.length > 0 && (
          <p className="mt-8 text-small text-stone-600">
            No roteiro:{' '}
            {days.map((day, i) => (
              <span key={day.number}>
                {i > 0 && ', '}
                <Link href={`${base}/roteiro/${day.number}`} className="font-semibold text-brand-text underline-offset-2 hover:underline">
                  dia {day.number}
                </Link>
              </span>
            ))}
          </p>
        )}

        {c && c.references.length > 0 && (
          <details className="group mt-10 border-t border-stone-200 pt-5">
            <summary className="cursor-pointer list-none text-small font-semibold text-ink-soft">
              Referências <span className="text-stone-500 group-open:hidden">(mostrar)</span>
            </summary>
            <ul className="mt-3 space-y-1.5 text-small text-stone-600">
              {c.references.map((r, i) => (
                <li key={i}>
                  <span className="italic">{r.label}</span>
                  {r.detail && <>, {r.detail}</>}
                </li>
              ))}
            </ul>
          </details>
        )}
        {c && d.editorialStatus !== 'approved' && (
          <div className="mt-6">
            <ReviewNote kind="content" />
          </div>
        )}
      </div>
    </article>
  );
}
