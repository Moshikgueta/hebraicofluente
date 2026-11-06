'use client';

/* A história da língua hebraica, em 10 capítulos curtos.
   Bônus: nada aqui trava o curso, e nada do curso trava isto. Cada capítulo
   sugere um momento ("depois da Unidade N") só para espalhar a leitura. */

import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { Misto } from '@/components/a1/A1Player';
import { cursoA1 } from '@/lib/a1';
import { useProgress } from '@/lib/state/store';
import { unidadeConcluida } from '@/lib/state/a1-estado';

export function HistoriaA1Client() {
  const p = useProgress();
  const { capitulos, revisado } = cursoA1().historia;
  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Hebraico A1
        </Link>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">Bônus</Badge>
          {!revisado && <Badge tone="ember">Rascunho: aguardando revisão</Badge>}
        </div>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">A história do hebraico</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          De uma língua de pedras e pergaminhos a uma língua de WhatsApp, em dez capítulos curtos. Leia na ordem que quiser.
        </p>
      </header>
      <ol className="grid gap-3 m-0 p-0 list-none">
        {capitulos.map(c => {
          const sugerido = unidadeConcluida(p.state.a1, c.depoisDaUnidade);
          return (
            <li key={c.n}>
              <Card className="p-5 grid gap-2">
                <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
                  {c.n}. {c.epocaPt}{sugerido ? '' : ` · sugerido depois da Unidade ${c.depoisDaUnidade}`}
                </p>
                <h2 className="font-display text-[19px] font-semibold text-ink m-0">{c.tituloPt}</h2>
                <p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={c.textoPt} /></p>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
