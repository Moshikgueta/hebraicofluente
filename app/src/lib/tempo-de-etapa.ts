/* Quanto tempo leva uma letra (28/10/2026, decisão do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * O site promete "cerca de dez minutos por letra" e ninguém tinha medido. A
 * lição passa a contar o tempo ATIVO de cada etapa e, na primeira vez que a
 * etapa é concluída, as estatísticas anônimas levam só a FAIXA (nunca os
 * segundos): o servidor soma quantas vezes cada faixa apareceu, sem conta,
 * e-mail, IP nem horário (worker/src/api/estatisticas.js), e o painel tira
 * a mediana (lib/painel-estatisticas.ts). A Política de Privacidade, art. 4,
 * diz isso.
 *
 * "Ativo" = a página à vista e o aluno mexeu nela no último minuto. Um
 * celular esquecido aberto na lição não vira uma etapa de duas horas.
 */
import { useCallback, useEffect, useRef } from 'react';
import { tx } from '@/i18n/telas/motor-pequenos';

/** O limite de cima de cada faixa, em minutos. A última faixa é "20 ou mais". */
export const LIMITES_MIN = [1, 2, 4, 7, 12, 20] as const;
export const N_FAIXAS = LIMITES_MIN.length + 1;
/** O meio de cada faixa, em minutos: é o que a estimativa soma. */
export const MEIO_MIN = [0.5, 1.5, 3, 5.5, 9.5, 16, 25] as const;
export const ROTULO_FAIXA = [tx.faixa0, tx.faixa1, tx.faixa2, tx.faixa3, tx.faixa4, tx.faixa5, tx.faixa6] as const;

export function faixaDe(segundos: number): number | null {
  if (!Number.isFinite(segundos) || segundos < 0) return null;
  const min = segundos / 60;
  const i = LIMITES_MIN.findIndex(l => min < l);
  return i === -1 ? LIMITES_MIN.length : i;
}

/** Sem mexer na página por mais que isto, o relógio para. */
export const PARADO_MS = 60_000;

/**
 * O relógio de tempo ativo de uma etapa. Zera quando `chave` muda (outra
 * etapa, outra letra). `segundos()` diz quanto passou até agora.
 */
export function useTempoAtivo(chave: string): () => number {
  const total = useRef(0);
  const ultimoGesto = useRef(Date.now());

  useEffect(() => {
    total.current = 0;
    ultimoGesto.current = Date.now();
    const gesto = () => { ultimoGesto.current = Date.now(); };
    const eventos = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    for (const e of eventos) window.addEventListener(e, gesto, { passive: true, capture: true });
    const t = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - ultimoGesto.current < PARADO_MS) total.current += 1;
    }, 1000);
    return () => {
      clearInterval(t);
      for (const e of eventos) window.removeEventListener(e, gesto, { capture: true });
    };
  }, [chave]);

  return useCallback(() => total.current, []);
}
