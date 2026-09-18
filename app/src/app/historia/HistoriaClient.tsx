'use client';

/* The optional half of the course. Nothing here is required, scored or
   blocking — which is exactly why it can afford to be interesting. */

import { Badge } from '@/components/ui/Card';
import { CultureShelf } from '@/components/learn/Culture';
import { useProgress } from '@/lib/state/store';

export function HistoriaClient() {
  const p = useProgress();
  return (
    <div className="grid gap-6">
      <header className="grid gap-3 reading">
        <Badge tone="teal">Bônus</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold">
          Viagem pela história do hebraico
        </h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-muted">
          Nada aqui é necessário para ler. É o contrário: são as coisas que ficam
          interessantes depois que você já consegue. As cartas abrem sozinhas
          conforme você domina letras — {p.mastered} até agora.
        </p>
      </header>
      <CultureShelf />
    </div>
  );
}
