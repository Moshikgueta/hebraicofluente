/* A fila da prática de revisão (o reforço depois do teste da lição).
 * ─────────────────────────────────────────────────────────────────────────
 * Acertou: a questão está feita. Errou: ela volta para a fila, depois de
 * outras DISTANCIA_DA_VOLTA questões (ou no fim, se sobrarem menos), e
 * continua voltando até ser acertada. A prática só termina quando não sobra
 * nenhuma pendente. Usado por components/learn/ExercisePlayer.tsx no modo
 * `repetirErros`.
 */

/* Duas: longe o bastante para não ser só repetir a resposta que acabou de
   aparecer, perto o bastante para a explicação ainda valer. */
export const DISTANCIA_DA_VOLTA = 2;

/** A fila depois de um erro na posição `i`. */
export function reenfileirar<T>(fila: readonly T[], i: number): T[] {
  const item = fila[i];
  if (item === undefined) return [...fila];
  const onde = Math.min(i + 1 + DISTANCIA_DA_VOLTA, fila.length);
  return [...fila.slice(0, onde), item, ...fila.slice(onde)];
}
