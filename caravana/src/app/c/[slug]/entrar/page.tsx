// Entrada pelo convite. O GET so mostra o formulario: abrir o link (inclusive
// a pre-visualizacao que o WhatsApp faz sozinho) nao gasta vaga de aparelho.
// Quem entra e o POST do botao.

import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Scene } from '@/components/art/Scene';
import { Notice, Wordmark } from '@/components/ui';
import { agencies, brandingSettings, caravans } from '@/lib/db/schema';
import { withSystem } from '@/lib/db/tenant';
import { EnterForm } from './EnterForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Entrar na caravana', robots: { index: false } };

export default async function EnterPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const q = await searchParams;
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) notFound();
  // So o nome da caravana e da agencia aparecem antes da entrada: o roteiro fica atras do convite.
  const car = await withSystem(async (tx) => {
    const [row] = await tx
      .select({ name: caravans.name, status: caravans.status, art: caravans.coverArt, agency: brandingSettings.displayName, agencyName: agencies.name })
      .from(caravans)
      .innerJoin(agencies, eq(agencies.id, caravans.agencyId))
      .leftJoin(brandingSettings, eq(brandingSettings.agencyId, caravans.agencyId))
      .where(and(eq(caravans.slug, slug), eq(agencies.status, 'active')));
    return row ?? null;
  });
  if (!car || car.status === 'archived') notFound();

  return (
    <main className="min-h-dvh">
      <div className="relative h-56 overflow-hidden sm:h-72">
        <Scene name={car.art} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-paper" aria-hidden />
      </div>
      <div className="mx-auto -mt-16 max-w-md px-4 pb-16">
        <div className="relative rounded-lg bg-paper-raised p-6 shadow-float ring-1 ring-stone-200 sm:p-8">
          <p className="text-micro font-semibold uppercase tracking-[0.14em] text-stone-600">{car.agency ?? car.agencyName}</p>
          <h1 className="mt-2 font-display text-display-m font-medium tracking-[-0.01em] text-ink">{car.name}</h1>
          <p className="mt-2 text-small text-ink-soft">Cada viajante recebe um convite pessoal. Digite o código para abrir a sua experiência neste aparelho.</p>
          <div className="mt-6 space-y-4">
            {q.saiu && <Notice tone="success">Você saiu deste aparelho. O convite continua valendo.</Notice>}
            {q.indisponivel && <Notice tone="warning">Esta caravana não está disponível no momento. Fale com a sua agência.</Notice>}
            <EnterForm slug={slug} initialCode={(q.codigo ?? '').slice(0, 20)} />
          </div>
        </div>
        <p className="mt-6 text-center text-micro text-stone-600">
          Não recebeu o convite? Fale com a agência que organiza a sua viagem.
        </p>
        <div className="mt-10 flex justify-center opacity-80">
          <Wordmark />
        </div>
      </div>
    </main>
  );
}
