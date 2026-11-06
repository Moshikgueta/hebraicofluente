'use client';

/* O caminho no painel (28/10/2026, pedido do dono: o painel como "o lugar
 * que direciona o aluno", atraente, interativo e curto).
 * ─────────────────────────────────────────────────────────────────────────
 * Desde 06/11/2026 (pedido do dono: o mapa interativo na página principal),
 * o painel mostra a MESMA estrada do mapa (components/aventura/
 * estrada-do-modulo.ts):
 *   · num módulo com letras, a estrada dele: os arcos, a viajante, o jarro e
 *     o portão do checkpoint;
 *   · nos módulos sem letras (6 e 7) e com o curso terminado, que no mapa não
 *     têm estrada própria, a estrada do curso inteiro: uma parada por módulo
 *     e o desafio final no fim. Antes o painel não mostrava mapa nenhum aqui.
 * Só lê o progresso: nada novo no estado.
 */

import Link from 'next/link';
import { useProgress } from '@/lib/state/store';
import { course, type CourseModule } from '@/lib/content';
import { tx } from '@/i18n/telas/painel-trilha-do-modulo';
import { EstradaDoModulo } from '@/components/aventura/EstradaDoModulo';
import { useEstradaDoCurso, useEstradaDoModulo } from '@/components/aventura/estrada-do-modulo';

export function TrilhaDoModulo({ modulo }: { modulo: CourseModule | null }) {
  const p = useProgress();
  const doModulo = useEstradaDoModulo(modulo ?? course.modules[0]!, !!modulo);
  const doCurso = useEstradaDoCurso();
  const doCursoInteiro = !modulo || !doModulo.estrada.length;
  return (
    <section aria-labelledby="trilha" className="grid gap-2.5 min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="trilha" className="m-0 font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
          {doCursoInteiro ? tx.tituloCurso : tx.titulo(modulo!.n)}
        </h2>
        <Link href="/mapa" className="inline-flex items-center min-h-[44px] font-ui text-[13px] text-[var(--teal-ink)] hover:underline">
          {tx.verOMapa}
        </Link>
      </div>
      {doCursoInteiro
        ? <EstradaDoModulo paradas={doCurso} jarro="aberto" onAbrirJarro={() => false} />
        : <EstradaDoModulo paradas={doModulo.estrada} jarro={doModulo.jarro} onAbrirJarro={() => p.abrirJarro(modulo!.id)} />}
    </section>
  );
}
