import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { allProducts, getCourse, isPlayable } from '@/lib/catalog';
import { CheckoutClient } from './CheckoutClient';
import { tx } from '@/i18n/telas/conta-checkout-client';

export function generateStaticParams() {
  /* Só os cursos que realmente abrem ganham página de pagamento. Um checkout
     para um curso "em breve" é uma cobrança por algo que não existe. */
  return allProducts().filter(isPlayable).map(c => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const c = getCourse((await params).slug);
  return {
    title: c ? tx.metaTitulo(c.titlePt) : tx.metaTituloPadrao,
    /* Uma página de pagamento não tem por que ser indexada, e um preço
       aparecendo no Google fora de contexto só gera reclamação. */
    robots: { index: false, follow: false }
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c || !isPlayable(c)) notFound();
  return (
    <Suspense fallback={null}>
      <CheckoutClient slug={c.slug} />
    </Suspense>
  );
}
