/* O lugar novo no mapa (28/10/2026, pedido do dono: "a animação de
 * desbloqueio no mapa").
 * ─────────────────────────────────────────────────────────────────────────
 * Quando o aluno abre o mapa e o módulo atual é mais adiante do que o da
 * última visita, o cartão dele se abre com a animação: o cadeado balança e
 * some, o lugar ganha cor e a Yael chega.
 *
 * O "último visto" mora SÓ no aparelho (`hf-mapa-aberto-v1`): é uma lembrança
 * da tela, não progresso, e não precisa de regra de fusão. Sem ele (primeira
 * visita, outro aparelho, navegação privada) o mapa só anota e não anima:
 * quem já está no módulo 4 não deve ver o 4 "abrindo" ao trocar de celular.
 * Antes da Aula 0 o mapa anota 0, e assim o módulo 1 também se abre.
 */

export const CHAVE_DO_MAPA = 'hf-mapa-aberto-v1';

/** O módulo a anunciar, ou null. `visto` null = nunca anotado neste aparelho. */
export function moduloParaAnunciar(atual: number | null, visto: number | null): number | null {
  if (atual == null || visto == null) return null;
  return atual > visto ? atual : null;
}

export function lerVisto(): number | null {
  try {
    const cru = localStorage.getItem(CHAVE_DO_MAPA);
    const v = cru == null ? NaN : Number(cru);
    return Number.isInteger(v) && v >= 0 ? v : null;
  } catch { return null; }
}

export function anotarVisto(n: number): void {
  try { localStorage.setItem(CHAVE_DO_MAPA, String(n)); } catch { /* sem armazenamento: só não anima da próxima vez */ }
}
