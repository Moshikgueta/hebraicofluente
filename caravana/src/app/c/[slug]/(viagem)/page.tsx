import Link from 'next/link';
import { Scene } from '@/components/art/Scene';
import { Stamp } from '@/components/art/Stamp';
import { IconChevronRight, IconLogout } from '@/components/icons';
import { DayCard, DestinationCard } from '@/components/traveler/cards';
import { Eyebrow, He, LinkButton, SectionTitle } from '@/components/ui';
import { dayState, formatLong, formatRange } from '@/lib/dates';
import { badgeProgress, getTrip } from '@/lib/trip';
import { demoDateAction, leaveAction } from '../actions';

export default async function WelcomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s, progress, today, phase, ctx, base, simulated } = await getTrip(slug);
  const c = s.caravan;
  const name = ctx.label;

  const focusDay =
    phase.phase === 'during' ? s.days.find((d) => d.number === phase.dayNumber) : phase.phase === 'before' ? s.days[0] : undefined;
  const featured =
    s.destinations.find((d) => d.content && focusDay?.stops.some((st) => st.destinationSlug === d.slug)) ?? s.destinations.find((d) => d.content);
  const words = s.hebrew?.expressions ?? [];
  const dayIndex = Math.floor(Date.parse(`${today}T12:00:00Z`) / 86_400_000);
  const word = words.length ? words[dayIndex % words.length] : null;
  const badges = badgeProgress(s, progress);

  return (
    <div className="anim-rise">
      {/* Abertura: ilustracao e cartao de embarque */}
      <section className="relative">
        <div className="relative h-[17.5rem] overflow-hidden sm:h-[22rem]">
          <Scene name={c.coverArt} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-paper" aria-hidden />
        </div>
        <div className="relative mx-auto -mt-28 max-w-xl px-4 sm:px-6">
          <article className="relative rounded-lg bg-paper-raised shadow-float ring-1 ring-stone-200">
            <div className="px-5 pb-5 pt-6 sm:px-7">
              <Eyebrow className="flex items-center gap-2">
                <He className="text-[0.95rem] normal-case tracking-normal text-brand-text">שָׁלוֹם</He>
                <span aria-hidden>·</span>
                <span>{name ? `Shalom, ${name}!` : 'Shalom!'}</span>
              </Eyebrow>
              <h1 className="mt-2 font-display text-display-l font-medium tracking-[-0.02em] text-ink sm:text-display-xl">{c.name}</h1>
              <p className="mt-2 text-small text-stone-600">{formatRange(c.startDate, c.endDate)}</p>
            </div>
            {/* picote do cartao de embarque */}
            <div className="relative h-0 border-t border-dashed border-stone-300" aria-hidden>
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paper ring-1 ring-stone-200 [clip-path:inset(0_0_0_50%)]" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-paper ring-1 ring-stone-200 [clip-path:inset(0_50%_0_0)]" />
            </div>
            <div className="flex items-end justify-between gap-4 px-5 py-5 sm:px-7">
              {phase.phase === 'before' && (
                <>
                  <div>
                    <p className="text-micro uppercase tracking-[0.14em] text-stone-600">Embarque</p>
                    <p className="mt-1 text-small font-semibold text-ink">{formatLong(c.startDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular font-display text-[3.2rem] font-medium leading-none text-brand-text">{phase.daysToGo}</p>
                    <p className="text-micro uppercase tracking-[0.14em] text-stone-600">{phase.daysToGo === 1 ? 'dia para embarcar' : 'dias para embarcar'}</p>
                  </div>
                </>
              )}
              {phase.phase === 'during' && (
                <>
                  <div>
                    <p className="text-micro uppercase tracking-[0.14em] text-stone-600">Hoje</p>
                    <p className="mt-1 text-small font-semibold text-ink">{focusDay?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular font-display text-[3.2rem] font-medium leading-none text-brand-text">
                      {phase.dayNumber}
                      <span className="text-display-m text-stone-500">/{s.days.length}</span>
                    </p>
                    <p className="text-micro uppercase tracking-[0.14em] text-stone-600">dia da viagem</p>
                  </div>
                </>
              )}
              {phase.phase === 'after' && (
                <div>
                  <p className="text-micro uppercase tracking-[0.14em] text-stone-600">Viagem concluída</p>
                  <p className="mt-1 text-small text-ink-soft">O conteúdo e o seu passaporte continuam aqui.</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-6 sm:px-7">
              {phase.phase === 'after' ? (
                <LinkButton href={`${base}/depois`} block size="lg">
                  Ver as lembranças da viagem
                </LinkButton>
              ) : (
                <LinkButton href={phase.phase === 'during' && focusDay ? `${base}/roteiro/${focusDay.number}` : `${base}/roteiro`} block size="lg">
                  {phase.phase === 'during' ? 'Ver o dia de hoje' : 'Ver meu roteiro'}
                </LinkButton>
              )}
            </div>
          </article>
        </div>
      </section>

      <div className="mx-auto max-w-xl space-y-12 px-4 pb-10 pt-10 sm:px-6">
        {c.welcomeMessage && (
          <section aria-label="Mensagem do organizador">
            <blockquote className="border-l-2 border-accent pl-5">
              <p className="font-display text-[1.3rem] italic leading-relaxed text-ink">{c.welcomeMessage}</p>
              {c.organizerName && <footer className="mt-3 text-small font-semibold text-stone-600">{c.organizerName}</footer>}
            </blockquote>
          </section>
        )}

        {focusDay && (
          <section className="space-y-4">
            <SectionTitle eyebrow={phase.phase === 'during' ? 'Hoje no roteiro' : 'Para começar'} title={phase.phase === 'during' ? 'O seu dia' : 'O primeiro dia'} />
            <DayCard day={focusDay} state={dayState(focusDay.date, today)} href={`${base}/roteiro/${focusDay.number}`} />
          </section>
        )}

        {featured && (
          <section className="space-y-4">
            <SectionTitle
              eyebrow="Descubra Israel"
              title="Antes de chegar lá"
              action={
                <Link href={`${base}/descubra`} className="text-small font-semibold text-brand-text">
                  Ver todos
                </Link>
              }
            />
            <DestinationCard d={featured} href={`${base}/descubra/${featured.slug}`} />
          </section>
        )}

        {word && (
          <section className="space-y-4">
            <SectionTitle eyebrow="Palavra do dia" title="Para levar no bolso" />
            <Link href={`${base}/hebraico?c=${word.category}`} className="group flex items-center gap-5 rounded-md bg-sand/70 px-5 py-5 ring-1 ring-sand-deep">
              <He display className="min-w-[5.5rem] text-center text-[2.4rem] leading-none text-brand-text">
                {word.hebrewPointed ?? word.hebrew}
              </He>
              <div className="min-w-0 flex-1">
                <p className="font-display text-title italic text-ink">{word.transliteration}</p>
                <p className="text-small text-ink-soft">{word.translation}</p>
              </div>
              <IconChevronRight className="text-stone-500 transition group-hover:translate-x-0.5" />
            </Link>
          </section>
        )}

        {badges.total > 0 && (
          <section className="space-y-4">
            <SectionTitle
              eyebrow="Passaporte digital"
              title={`${badges.earned} de ${badges.total} selos`}
              action={
                <Link href={`${base}/passaporte`} className="text-small font-semibold text-brand-text">
                  Abrir
                </Link>
              }
            />
            <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2">
              {s.badges.map((b) => (
                <Link key={b.slug} href={`${base}/passaporte`} className="shrink-0" aria-label={b.title}>
                  <Stamp slug={`home-${b.slug}`} title={b.title} art={b.art} ink={b.ink} earned={Boolean(progress.badges[b.slug])} size={92} />
                </Link>
              ))}
            </div>
            {badges.earned === 0 && (
              <p className="text-small text-stone-600">
                Cada atividade concluída vale um selo.{' '}
                <Link href={`${base}/atividades`} className="font-semibold text-brand-text underline-offset-2 hover:underline">
                  Ver atividades
                </Link>
              </p>
            )}
          </section>
        )}

        {s.agency.isDemo && (
          <section className="rounded-md border border-dashed border-ochre/60 bg-ochre-soft/40 p-5">
            <Eyebrow className="text-[#7a5016]">Só na demonstração</Eyebrow>
            <p className="mt-1 text-small text-ink-soft">Veja como a página muda antes, durante e depois da viagem. Os dados da caravana são ilustrativos.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ['real', 'Antes do embarque'],
                ['durante', 'Durante (dia 4)'],
                ['depois', 'Depois da volta'],
              ].map(([modo, label]) => {
                const active = (simulated ?? 'real') === modo;
                return (
                  <form key={modo} action={demoDateAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="modo" value={modo} />
                    <button
                      type="submit"
                      aria-pressed={active}
                      className={active ? 'rounded-full bg-ink px-3.5 py-1.5 text-small font-semibold text-paper' : 'rounded-full bg-paper-raised px-3.5 py-1.5 text-small font-semibold text-ink ring-1 ring-stone-300'}
                    >
                      {label}
                    </button>
                  </form>
                );
              })}
            </div>
          </section>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-6 text-small text-stone-600">
          <Link href={`${base}/informacoes`} className="font-semibold text-ink-soft hover:text-ink">
            Informações úteis
          </Link>
          <form action={leaveAction}>
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" className="inline-flex items-center gap-1.5 hover:text-ink">
              <IconLogout size={18} /> Sair deste aparelho
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
