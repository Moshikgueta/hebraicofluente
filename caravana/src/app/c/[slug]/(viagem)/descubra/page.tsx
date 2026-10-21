import Link from 'next/link';
import { REGION_LABEL } from '@content/destinations';
import { DestinationCard } from '@/components/traveler/cards';
import { IconCheck } from '@/components/icons';
import { Eyebrow, He } from '@/components/ui';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Descubra Israel' };

const ORDER = ['costa', 'galileia', 'deserto', 'jerusalem'];

export default async function DiscoverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s, base, progress } = await getTrip(slug);
  const ready = s.destinations.filter((d) => d.content);
  const pending = s.destinations.filter((d) => !d.content);
  const regions = ORDER.filter((r) => ready.some((d) => d.region === r));
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6">
      <Eyebrow>Descubra Israel</Eyebrow>
      <h1 className="mt-2 max-w-2xl font-display text-display-l font-medium tracking-[-0.02em]">Os lugares da sua viagem</h1>
      <p className="mt-2 max-w-xl text-ink-soft">História, curiosidades e o que observar em cada parada. Cada texto separa o que é fato histórico, o que é tradição e o que é interpretação.</p>
      {s.destinations.length === 0 && <p className="mt-10 text-stone-600">A agência ainda não escolheu os conteúdos desta caravana.</p>}
      {regions.map((r) => (
        <section key={r} className="mt-10">
          <h2 className="font-display text-title font-medium text-stone-700">{REGION_LABEL[r as keyof typeof REGION_LABEL]}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ready
              .filter((d) => d.region === r)
              .map((d) => (
                <DestinationCard
                  key={d.slug}
                  d={d}
                  href={`${base}/descubra/${d.slug}`}
                  footer={
                    progress.viewed.includes(d.slug) ? (
                      <p className="flex items-center gap-1 pt-2 text-micro font-semibold text-success">
                        <IconCheck size={14} /> Lido
                      </p>
                    ) : null
                  }
                />
              ))}
          </div>
        </section>
      ))}
      {pending.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-title font-medium text-stone-700">Em preparação</h2>
          <p className="mt-1 text-small text-stone-600">Lugares do roteiro cujo texto a equipe editorial ainda está escrevendo.</p>
          <ul className="mt-4 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
            {pending.map((d) => (
              <li key={d.slug}>
                <Link href={`${base}/descubra/${d.slug}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-stone-100/60">
                  <span>
                    <span className="block text-small font-semibold text-ink">{d.namePt}</span>
                    <span className="block text-micro italic text-stone-600">{d.transliteration}</span>
                  </span>
                  <He display className="text-[1.2rem] text-stone-700">
                    {d.nameHe}
                  </He>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
