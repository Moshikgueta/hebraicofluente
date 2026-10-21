import { notFound } from 'next/navigation';
import { IconCheck, IconSpark } from '@/components/icons';
import { ReviewNote } from '@/components/traveler/cards';
import { HebrewBrowser } from '@/components/traveler/HebrewBrowser';
import Link from 'next/link';
import { Eyebrow, He } from '@/components/ui';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Hebraico para a viagem' };

export default async function HebrewPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ c?: string }> }) {
  const { slug } = await params;
  const { c } = await searchParams;
  const { snapshot: s, base, progress } = await getTrip(slug);
  if (!s.hebrew) notFound();
  const practice = s.activities.filter((a) => a.feature === 'hebrew');
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-8 sm:px-6">
      <Eyebrow>
        Hebraico para a viagem · <He className="normal-case tracking-normal">עִבְרִית</He>
      </Eyebrow>
      <h1 className="mt-2 font-display text-display-l font-medium tracking-[-0.02em]">Palavras para usar lá</h1>
      <p className="mt-2 text-ink-soft">Não é curso de gramática: são as expressões que você vai ouvir, ler nas placas e conseguir dizer.</p>

      <details className="mt-5 rounded-md bg-sand/60 px-4 py-3 text-small text-ink-soft ring-1 ring-sand-deep">
        <summary className="cursor-pointer font-semibold text-ink">Como ler a transliteração</summary>
        <ul className="mt-2 space-y-1">
          <li>
            O acento marca a sílaba forte: <em>todá</em> se diz to-DÁ.
          </li>
          <li>
            <strong>ch</strong> soa como o &quot;rr&quot; de &quot;carro&quot;: <em>slichá</em>.
          </li>
          <li>
            <strong>ts</strong> é como em &quot;tsunami&quot;: <em>tsimchoní</em>.
          </li>
          <li>O hebraico se lê da direita para a esquerda, e no dia a dia aparece sem as vogais (nikud).</li>
        </ul>
      </details>

      {practice.length > 0 && (
        <ul className="mt-6 divide-y divide-stone-200 overflow-hidden rounded-md bg-brand-tint ring-1 ring-stone-200">
          {practice.map((a) => (
            <li key={a.slug}>
              <Link href={`${base}/atividades/${a.slug}`} className="flex items-center gap-3 px-4 py-3.5 hover:brightness-[0.98]">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${progress.completed[a.slug] ? 'bg-success-soft text-success' : 'bg-paper-raised text-brand-text'}`}>
                  {progress.completed[a.slug] ? <IconCheck size={18} /> : <IconSpark size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-micro font-semibold uppercase tracking-[0.12em] text-brand-text">Praticar</span>
                  <span className="block font-semibold text-ink">{a.title}</span>
                </span>
                <span className="text-small font-semibold text-brand-text">{progress.completed[a.slug] ? 'Refazer' : 'Começar'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <HebrewBrowser categories={s.hebrew.categories} expressions={s.hebrew.expressions} initial={c ?? null} />
      </div>
      {s.hebrew.expressions.some((e) => !e.reviewed) && (
        <div className="mt-6">
          <ReviewNote kind="hebrew" />
        </div>
      )}
    </div>
  );
}
