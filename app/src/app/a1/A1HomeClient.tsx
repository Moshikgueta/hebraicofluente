'use client';

/* A página do curso Hebraico A1: a pergunta do gênero (se ainda não foi
   respondida) e as 8 unidades, com o que já foi feito em cada uma. */

import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { useProgress } from '@/lib/state/store';
import { cursoA1 } from '@/lib/a1';
import { unidadeConcluida } from '@/lib/state/a1-estado';
import { GeneroA1 } from '@/components/a1/GeneroA1';
import { Misto } from '@/components/a1/A1Player';

export function A1HomeClient() {
  const p = useProgress();
  const curso = cursoA1();
  const a1 = p.state.a1;
  const feitas = curso.unidades.filter(u => unidadeConcluida(a1, u.n)).length;
  /* A próxima a fazer: a primeira não concluída. */
  const proxima = curso.unidades.find(u => !unidadeConcluida(a1, u.n))?.n ?? null;

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Badge tone="accent">Curso</Badge>
        <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight m-0">Hebraico A1</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          <Misto texto="8 unidades: do primeiro שָׁלוֹם a uma conversa inteira com alguém novo." />
        </p>
        <p className="font-ui text-[14px] text-ink-muted m-0">{feitas} de {curso.unidades.length} unidades concluídas</p>
      </header>

      {!a1.genero && <GeneroA1 />}

      <ol className="grid gap-3 m-0 p-0 list-none">
        {curso.unidades.map(u => {
          const feita = unidadeConcluida(a1, u.n);
          const best = a1.unidades[String(u.n)]?.best;
          return (
            <li key={u.n}>
              <Link href={`/a1/unidade/${u.n}`} className="block rounded-[var(--r-lg)] focus-visible:outline-2">
                <Card tone={feita ? 'mint' : 'surface'} className="p-5 grid gap-1 hover:border-[var(--accent-soft)]">
                  <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
                    Unidade {u.n}{feita ? ' · concluída ✓' : u.n === proxima ? ' · próxima' : ''}
                    {best != null ? ` · melhor nota ${Math.round(best * 100)}%` : ''}
                  </p>
                  <p className="font-display text-[18px] font-semibold text-ink m-0">{u.tituloPt}</p>
                  <p className="text-[14.5px] leading-relaxed text-ink-body m-0">{u.objetivoPt}</p>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>

      {a1.genero && (
        <details className="font-ui text-[14px] text-ink-muted">
          <summary className="cursor-pointer min-h-[44px] flex items-center">Trocar o gênero dos exercícios</summary>
          <div className="pt-2"><GeneroA1 /></div>
        </details>
      )}
    </div>
  );
}
