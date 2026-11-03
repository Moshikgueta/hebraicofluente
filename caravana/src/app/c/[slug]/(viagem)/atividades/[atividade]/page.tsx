import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IconChevronLeft } from '@/components/icons';
import { ActivityPlayer } from '@/components/traveler/ActivityPlayer';
import { Eyebrow } from '@/components/ui';
import { publicQuestion } from '@/lib/domain/snapshot';
import { destinationBySlug, getTrip } from '@/lib/trip';

export default async function ActivityPage({ params }: { params: Promise<{ slug: string; atividade: string }> }) {
  const { slug, atividade } = await params;
  const { snapshot: s, base, progress } = await getTrip(slug);
  const a = s.activities.find((x) => x.slug === atividade);
  if (!a) notFound();
  const dest = destinationBySlug(s, a.destinationSlug);
  const badges = s.badges.filter((b) => b.activities.includes(a.slug)).map(({ slug: bs, title, art, ink }) => ({ slug: bs, title, art, ink }));
  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-6 sm:px-6">
      <Link href={dest ? `${base}/descubra/${dest.slug}` : `${base}/atividades`} className="inline-flex items-center gap-1 text-small font-semibold text-stone-600 hover:text-ink">
        <IconChevronLeft size={18} /> {dest ? dest.namePt : 'Atividades'}
      </Link>
      <Eyebrow className="mt-5">{progress.completed[a.slug] ? 'Refazendo' : 'Atividade'}</Eyebrow>
      <h1 className="mt-1 font-display text-display-m font-medium tracking-[-0.01em] sm:text-display-l">{a.title}</h1>
      {a.intro && <p className="mt-2 text-ink-soft">{a.intro}</p>}
      <div className="mt-8">
        <ActivityPlayer slug={slug} base={base} activity={{ slug: a.slug, title: a.title }} questions={a.questions.map(publicQuestion)} badges={badges} />
      </div>
    </div>
  );
}
