import { notFound } from 'next/navigation';
import { getModule } from '@/lib/content';
import { ExtraLessonClient, type ExtraSlug } from './ExtraLessonClient';

/* Modules 6 and 7 get their own route rather than /licao/[id]: they have three
   lessons, not five stages, and no letter to trace. */
const SLUGS: Record<ExtraSlug, number> = {
  'sem-o-ponto': 6,
  'sons-modernos': 7
};

export function generateStaticParams() {
  return Object.keys(SLUGS).map(slug => ({ slug }));
}
export const dynamicParams = false;

export default async function ExtraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = SLUGS[slug as ExtraSlug];
  const mod = n ? getModule(n) : undefined;
  if (!mod) notFound();
  return <ExtraLessonClient slug={slug as ExtraSlug} module={mod} />;
}
