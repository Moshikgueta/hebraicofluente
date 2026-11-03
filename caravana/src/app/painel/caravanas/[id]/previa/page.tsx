// Previa do rascunho: o mesmo retrato que a publicacao vai gravar, montado na
// hora e mostrado com as pecas da area do viajante, num quadro de celular.

import type { CSSProperties } from 'react';
import { Scene } from '@/components/art/Scene';
import { Stamp } from '@/components/art/Stamp';
import { BackLink } from '@/components/panel/PanelShell';
import { DayCard, DestinationCard } from '@/components/traveler/cards';
import { Eyebrow, He, Notice } from '@/components/ui';
import { dayState, formatRange, todayIn, tripPhase } from '@/lib/dates';
import { buildSnapshot, currentSnapshot } from '@/lib/domain/publication';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { brandTheme } from '@/lib/theme';

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { car, staff } = await getPanelCaravan(id);
  const s = await agencyTx(staff, async (tx) => buildSnapshot(tx, id, ((await currentSnapshot(tx, id))?.version ?? 0) + 1));
  const today = todayIn(s.caravan.timezone);
  const phase = tripPhase(s.caravan.startDate, s.caravan.endDate, today);
  const readyDest = s.destinations.filter((d) => d.content);
  return (
    <div>
      <BackLink href={`/painel/caravanas/${car.id}/publicacao`}>Revisão e publicação</BackLink>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="max-w-xl space-y-4 text-small text-ink-soft">
          <h2 className="font-display text-title font-medium text-ink">Prévia do rascunho</h2>
          <p>É exatamente o que será publicado se você publicar agora: roteiro, conteúdos aprovados, atividades do plano e a identidade visual desta caravana.</p>
          <p>Os links da prévia não navegam. Depois de publicar, crie um convite para você mesmo e abra pelo celular para ver a experiência completa.</p>
          <ul className="space-y-1">
            <li>· {s.days.length} dias no roteiro</li>
            <li>
              · {readyDest.length} de {s.destinations.length} destinos com texto
            </li>
            <li>· {s.activities.length} atividades</li>
            <li>· {s.hebrew ? `${s.hebrew.expressions.length} expressões em hebraico` : 'Hebraico desligado'}</li>
            <li>· {s.badges.length ? `${s.badges.length} selos no passaporte` : 'Passaporte desligado'}</li>
          </ul>
          {s.destinations.length > readyDest.length && (
            <Notice tone="warning">Destinos sem texto aprovado aparecem como &quot;em preparação&quot;.</Notice>
          )}
        </div>
        <div className="mx-auto w-full max-w-[24rem]">
          <div className="rounded-[2.4rem] bg-ink p-2.5 shadow-float">
            <div style={brandTheme(s.agency.primaryColor, s.agency.secondaryColor) as CSSProperties} className="h-[46rem] overflow-y-auto rounded-[1.9rem] bg-paper" tabIndex={0} aria-label="Prévia rolável">
              <div inert>
              <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand font-display text-small font-semibold text-brand-ink">{s.agency.logoText}</span>
                <span className="leading-tight">
                  <span className="block text-small font-semibold">{s.agency.displayName}</span>
                  <span className="block text-micro text-stone-600">{s.caravan.name}</span>
                </span>
              </div>
              <Scene name={s.caravan.coverArt} className="h-44 w-full" />
              <div className="relative -mt-16 px-3">
                <div className="rounded-lg bg-paper-raised p-4 shadow-float ring-1 ring-stone-200">
                  <Eyebrow>
                    <He className="normal-case tracking-normal text-brand-text">שָׁלוֹם</He> · Shalom!
                  </Eyebrow>
                  <p className="mt-1.5 font-display text-[1.6rem] font-medium leading-tight">{s.caravan.name}</p>
                  <p className="mt-1 text-micro text-stone-600">{formatRange(s.caravan.startDate, s.caravan.endDate)}</p>
                  {phase.phase === 'before' && (
                    <p className="mt-3 border-t border-dashed border-stone-300 pt-3 text-right font-display text-[2.2rem] leading-none text-brand-text">
                      {phase.daysToGo} <span className="font-sans text-micro uppercase tracking-[0.12em] text-stone-600">dias</span>
                    </p>
                  )}
                  <span className="mt-4 flex h-11 items-center justify-center rounded-full bg-brand text-small font-semibold text-brand-ink">Ver meu roteiro</span>
                </div>
              </div>
              <div className="space-y-6 px-3 py-6">
                {s.caravan.welcomeMessage && <p className="border-l-2 border-accent pl-3 font-display italic">{s.caravan.welcomeMessage}</p>}
                <div className="space-y-2">
                  {s.days.slice(0, 4).map((d) => (
                    <DayCard key={d.number} day={d} state={dayState(d.date, today)} href="#" compact />
                  ))}
                </div>
                {readyDest[0] && <DestinationCard d={readyDest[0]} href="#" />}
                {s.badges.length > 0 && (
                  <div className="flex gap-1 overflow-hidden">
                    {s.badges.slice(0, 3).map((b) => (
                      <Stamp key={b.slug} slug={`prev-${b.slug}`} title={b.title} art={b.art} ink={b.ink} earned={false} size={88} />
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
