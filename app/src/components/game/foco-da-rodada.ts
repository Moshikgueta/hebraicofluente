'use client';

/* O foco entre uma rodada e outra.
 * ─────────────────────────────────────────────────────────────────────────
 * Nos jogos de resposta única (Batalha, Impressa × cursiva, Blast), o botão
 * escolhido fica `disabled` enquanto o retorno aparece, e a rodada seguinte
 * monta botões NOVOS. Nos dois momentos o foco caía no <body>: o leitor de
 * tela perdia o contexto e o Tab recomeçava do topo da página (auditoria de
 * 01/10/2026, VIS-008).
 *
 * O conserto é o mesmo nos três: um contêiner focável (`tabIndex={-1}`) em
 * volta da rodada. `segurar()` leva o foco para ele ANTES de os botões se
 * desligarem; quando a `chave` muda (rodada nova), o foco volta para ele, e
 * o próximo Tab cai na primeira alternativa. Só mexe no foco se ele estava
 * dentro do jogo (ou perdido no <body>): nunca rouba de outro lugar.
 */

import { useCallback, useEffect, useRef } from 'react';

export function useFocoDaRodada<T extends HTMLElement = HTMLDivElement>(chave: unknown) {
  const ref = useRef<T>(null);
  const primeira = useRef(true);

  const meu = () => {
    const el = ref.current;
    if (!el || typeof document === 'undefined') return false;
    const ativo = document.activeElement;
    return !ativo || ativo === document.body || el.contains(ativo);
  };

  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    if (meu()) ref.current?.focus({ preventScroll: true });
  }, [chave]);

  const segurar = useCallback(() => {
    if (meu()) ref.current?.focus({ preventScroll: true });
  }, []);

  return { ref, segurar };
}
