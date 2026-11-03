import type { Metadata } from 'next';
import Link from 'next/link';
import { Scene } from '@/components/art/Scene';
import { IconGrid, IconPassport } from '@/components/icons';
import { Button, Notice, Wordmark } from '@/components/ui';
import { enterDemoAgency, enterDemoTraveler } from './actions';

export const metadata: Metadata = { title: 'Demonstração' };

const ERRO: Record<string, string> = {
  rate_limited: 'Muitas entradas seguidas a partir desta rede. Tente de novo em alguns minutos.',
  unavailable: 'A demonstração não está carregada neste ambiente. Rode npm run db:seed.',
};

export default async function DemoPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" aria-label="Início">
        <Wordmark />
      </Link>
      <h1 className="mt-10 max-w-2xl font-display text-display-l font-medium tracking-[-0.02em] sm:text-display-xl">Veja a plataforma pelos dois lados.</h1>
      <p className="mt-4 max-w-xl text-ink-soft">
        A <strong className="font-semibold text-ink">Caravana Descubra Israel 2027</strong> é uma caravana de demonstração, da fictícia Agência Exemplo. O roteiro é ilustrativo:
        não tem horários, hotéis nem contatos reais.
      </p>
      {erro && (
        <Notice tone="danger" className="mt-6">
          {ERRO[erro] ?? 'Não foi possível abrir a demonstração.'}
        </Notice>
      )}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className="flex flex-col overflow-hidden rounded-lg bg-paper-raised ring-1 ring-stone-200 shadow-card">
          <Scene name="jerusalem" variant="band" className="h-36 w-full" />
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-2 text-sea">
              <IconPassport />
              <h2 className="font-display text-title font-medium text-ink">Como viajante</h2>
            </div>
            <p className="mt-2 flex-1 text-small text-ink-soft">
              O que a pessoa vê no celular depois de abrir o convite: boas-vindas, roteiro, páginas dos destinos, hebraico, quizzes e o passaporte de selos.
            </p>
            <form action={enterDemoTraveler} className="mt-6">
              <Button type="submit" block size="lg">
                Entrar como viajante
              </Button>
            </form>
            <p className="mt-3 text-micro text-stone-600">Cria uma visita temporária de 24 horas. O seu progresso some depois disso.</p>
          </div>
        </section>
        <section className="flex flex-col overflow-hidden rounded-lg bg-paper-raised ring-1 ring-stone-200 shadow-card">
          <Scene name="stone" variant="band" className="h-36 w-full" />
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-2 text-sea">
              <IconGrid />
              <h2 className="font-display text-title font-medium text-ink">Como agência</h2>
            </div>
            <p className="mt-2 flex-1 text-small text-ink-soft">
              O painel da agência: indicadores, caravanas, o roteiro dia a dia, a identidade visual, a seleção de conteúdo, a publicação e os convites.
            </p>
            <form action={enterDemoAgency} className="mt-6">
              <Button type="submit" variant="secondary" block size="lg">
                Ver o painel da agência
              </Button>
            </form>
            <p className="mt-3 text-micro text-stone-600">Somente leitura: na demonstração nada é salvo. Os números vêm de viajantes fictícios.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
