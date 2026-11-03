import { DayCard } from '@/components/traveler/cards';
import { Eyebrow, Notice } from '@/components/ui';
import { dayState, formatRange } from '@/lib/dates';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Meu roteiro' };

export default async function ItineraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s, today, base } = await getTrip(slug);
  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-8 sm:px-6">
      <Eyebrow>{formatRange(s.caravan.startDate, s.caravan.endDate)}</Eyebrow>
      <h1 className="mt-2 font-display text-display-l font-medium tracking-[-0.02em]">Meu roteiro</h1>
      <p className="mt-2 text-ink-soft">
        {s.days.length} dias. Abra qualquer um, na ordem que quiser: os dias ficam disponíveis antes, durante e depois da viagem.
      </p>
      {s.agency.isDemo && (
        <Notice tone="ochre" className="mt-5">
          Roteiro ilustrativo da demonstração, sem horários confirmados.
        </Notice>
      )}
      {s.days.length === 0 ? (
        <p className="mt-10 text-stone-600">A agência ainda não publicou o roteiro.</p>
      ) : (
        <ol className="relative mt-8 space-y-3 before:absolute before:bottom-4 before:left-[-0.6rem] before:top-4 before:w-px before:bg-stone-300 sm:before:left-[-1rem]">
          {s.days.map((d) => {
            const state = dayState(d.date, today);
            return (
              <li key={d.number} className="relative">
                <span
                  aria-hidden
                  className={`absolute left-[-0.85rem] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full sm:left-[-1.25rem] ${state === 'today' ? 'bg-brand ring-4 ring-brand-tint' : state === 'past' ? 'bg-stone-500' : 'bg-paper ring-1 ring-stone-500'}`}
                />
                <DayCard day={d} state={state} href={`${base}/roteiro/${d.number}`} />
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
