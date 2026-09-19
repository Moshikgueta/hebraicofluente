import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { allCourses, getCourse, isPlayable } from '@/lib/catalog';
import { ObrigadoClient } from './ObrigadoClient';

export function generateStaticParams() {
  return allCourses().filter(isPlayable).map(c => ({ slug: c.slug }));
}

export const metadata: Metadata = {
  title: 'Confirmando seu pagamento - Hebraico Fluente',
  robots: { index: false, follow: false }
};

export default async function ObrigadoPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c || !isPlayable(c)) notFound();
  return (
    <Suspense fallback={null}>
      <ObrigadoClient slug={c.slug} />
    </Suspense>
  );
}
