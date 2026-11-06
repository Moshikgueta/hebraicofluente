'use client';

/* "Você já consegue ler N palavras" - calculado, nunca escrito.
 * ─────────────────────────────────────────────────────────────────────────
 * Um lugar só para o número, porque ele aparece em quatro: o painel, o fim de
 * uma letra, o fim de um checkpoint e o glossário. Quatro contas feitas em
 * quatro telas seriam quatro números um dia.
 *
 * O número é o das palavras DO CURSO que as letras que o aluno CONCLUIU leem,
 * pela mesma regra de leitura que decide o que um exercício pode mostrar
 * (`isReadableWith`). Nada inventado, nada estimado: se ele terminou oito
 * letras e o curso tem 34 palavras escritas só com elas, o número é 34.
 *
 * ── por que isto NÃO está em rules.ts ───────────────────────────────────
 * As conquistas são calculadas a cada gravação do estado, e o estado é gravado
 * também nas páginas públicas - onde o conteúdo pago não está carregado e lê-lo
 * derruba a página inteira (já aconteceu: a aba «Escrita» da capa). Então a
 * contagem mora aqui, só nas telas do curso, e quando ela cruza um marco ela
 * GRAVA o marco em `firsts`; a conquista, em rules.ts, só lê o marco gravado.
 */

import { useEffect, useMemo } from 'react';
import { useProgress } from '@/lib/state/store';
import { MARCOS_DE_LEITURA, marcoId } from '@/lib/engine/palavras';
import { track } from '@/lib/analytics';
import { leituraDe, type Leitura } from './leitura';
import { tx } from '@/i18n/telas/motor-pequenos';

export { leituraDe, letrasConcluidas, novasCom, type Leitura } from './leitura';

/**
 * O número, e o registro dos marcos cruzados.
 *
 * Os marcos (10, 25, 50, 100) são gravados como `firsts`, que só acontecem
 * uma vez e trazem a data - é isso que impede a mensagem de repetir. Quem
 * dispara é a tela que chama este hook; como todas elas são do curso, o
 * conteúdo está carregado.
 */
export function useLeitura(): Leitura {
  const p = useProgress();
  const leitura = useMemo(() => leituraDe(p.state), [p.state]);
  const n = leitura.legiveis.length;
  useEffect(() => {
    if (!p.ready) return;
    for (const m of MARCOS_DE_LEITURA) {
      if (n >= m && !p.state.firsts[marcoId(m)]) {
        p.markFirst(marcoId(m));
        track('reading_milestone', { words: m });
      }
    }
  }, [n, p]);
  return leitura;
}

/** A frase do número, sem exagero e no singular quando é um. */
export const fraseDeLeitura = (n: number): string =>
  n === 0 ? tx.leituraNenhuma
  : n === 1 ? tx.leituraUma
  : tx.leituraVarias(n);
