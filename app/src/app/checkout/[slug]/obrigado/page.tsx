import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { allProducts, getCourse, isPlayable } from '@/lib/catalog';
import { ObrigadoClient } from './ObrigadoClient';
import { tx } from '@/i18n/telas/conta-obrigado';

export function generateStaticParams() {
  return allProducts().filter(isPlayable).map(c => ({ slug: c.slug }));
}

export const metadata: Metadata = {
  title: tx.metaTitulo,
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
