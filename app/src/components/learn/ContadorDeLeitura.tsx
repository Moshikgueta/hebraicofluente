'use client';

/* "Agora você consegue ler N palavras" - o cartão.
 * ─────────────────────────────────────────────────────────────────────────
 * Um componente para os três lugares em que o número aparece fora do
 * glossário: o fim de uma letra, o fim de um checkpoint e o painel. Ele usa
 * `useLeitura`, que é também quem grava os marcos (10, 25, 50, 100) - então
 * a conquista chega exatamente no momento em que o número a cruza, e só uma
 * vez.
 *
 * No fim de uma letra ele diz também quantas palavras AQUELA letra abriu.
 * "Você lê 34 palavras" é um fato; "o Dálet abriu 6 palavras novas" é o
 * motivo de ter feito a lição, e é o que faz o número parecer conquistado.
 */

import Link from 'next/link';
import type { Letter } from '@/lib/content';
import { useProgress } from '@/lib/state/store';
import { fraseDeLeitura, novasCom, useLeitura } from '@/lib/vocabulario';

export function ContadorDeLeitura({ letra, className = '' }: { letra?: Letter; className?: string }) {
  const p = useProgress();
  const leitura = useLeitura();
  const n = leitura.legiveis.length;
  const novas = letra ? novasCom(p.state, letra) : 0;

  return (
    <section
      aria-label="Palavras que você consegue ler"
      className={`rounded-[var(--r-lg)] bg-[var(--teal-soft)] px-5 py-4 grid gap-1.5 ${className}`}
    >
      <p className="font-ui text-[17px] font-semibold text-[var(--teal-ink)] m-0">
        {fraseDeLeitura(n)}
      </p>
      {letra && novas > 0 && (
        <p className="font-ui text-[14px] text-ink-body m-0">
          Com o {letra.namePt}, {novas === 1 ? 'uma palavra nova passou' : `${novas} palavras novas passaram`} a
          ser legíveis para você.
        </p>
      )}
      {n > 0 && (
        <Link href="/vocabulario" className="font-ui text-[14px] font-medium text-[var(--teal-ink)] underline w-fit">
          Ver o meu vocabulário
        </Link>
      )}
    </section>
  );
}
