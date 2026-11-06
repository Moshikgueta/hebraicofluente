'use client';

/* The optional half of the course. Nothing here is required, scored or
   blocking - which is exactly why it can afford to be interesting. */

import { Badge } from '@/components/ui/Card';
import { CultureShelf } from '@/components/learn/Culture';
import { ErasShelf } from '@/components/learn/Eras';
import { useProgress } from '@/lib/state/store';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-historia-client';

export function HistoriaClient() {
  const p = useProgress();
  return (
    <div className="grid gap-6">
      <header className="grid gap-3 reading">
        <Badge tone="accent">{tx.bonus}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold">
          {tx.titulo}
        </h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-muted">
          {fmt(tx.intro, { n: p.mastered })}
        </p>
      </header>
      {/* Antes das cartas, e não depois: as cartas são texto para ler sobre o
          hebraico; este bloco é hebraico para ler. Numa página opcional, o que
          se faz vem antes do que se lê sobre. */}
      <ErasShelf />

      <CultureShelf />
    </div>
  );
}
