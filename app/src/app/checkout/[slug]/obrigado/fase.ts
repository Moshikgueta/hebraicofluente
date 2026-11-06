/* O que a tela de retorno diz, a partir do que o servidor sabe.
 * ─────────────────────────────────────────────────────────────────────────
 * Separado do componente para ser testado sem navegador
 * (tests/estado-pagamento.test.ts). A auditoria de 01/10/2026 (PAY-B-003)
 * achou três textos errados aqui: um pedido ESTORNADO dizia "nada foi
 * cobrado"; quem desistiu na tela da Mercado Pago, sem pagamento nenhum, lia
 * "em análise ... e com boleto" (boleto nem é oferecido); e um cartão
 * RECUSADO segurava "Confirmando... não feche esta página" por três minutos
 * inteiros antes de dizer qualquer coisa.
 *
 * A regra que não muda: acesso só pelo `status` do pedido, que o servidor
 * reconfere com a Mercado Pago. `ultimoPagamento` (do servidor) e a `dica`
 * da URL (`collection_status`/`status` que a Mercado Pago põe na volta)
 * escolhem só o TEXTO enquanto o pedido não está pago - qualquer um pode
 * digitar a URL, e o pior que ela consegue é trocar uma frase.
 */

import type { OrderStatus, PaymentMethod, UltimoPagamento } from '@/lib/account/types';

export type Fase =
  | 'conferindo'     // ainda perguntando, sem nada a dizer
  | 'pago'
  | 'em-analise'     // cartão em análise na operadora
  | 'sem-pagamento'  // o pedido existe, mas nenhum pagamento apareceu
  | 'recusado'       // o cartão foi recusado
  | 'nao-concluido'  // falhou sem recusa conhecida
  | 'devolvido'      // houve pagamento, e ele foi estornado
  | 'expirado'       // o prazo do pedido acabou sem pagamento
  | 'desconhecido';  // não deu para perguntar

/** Quanto tempo esperar por um pagamento que ainda não apareceu antes de
 *  dizer "não há pagamento" (a busca da Mercado Pago leva alguns segundos
 *  para enxergar um pagamento recém-aprovado). */
export const ESPERA_MS = 20_000;
/** Quanto tempo insistir quando a própria volta diz "aprovado". */
export const DESISTE_MS = 3 * 60_000;

/** As fases em que não adianta continuar perguntando. */
export const FINAL: ReadonlySet<Fase> = new Set<Fase>(
  ['pago', 'recusado', 'nao-concluido', 'devolvido', 'expirado']
);

export function decidirFase(e: {
  status: OrderStatus;
  ultimoPagamento?: UltimoPagamento | null;
  metodo?: PaymentMethod;
  /** Há quanto tempo a tela está perguntando. */
  passouMs: number;
  /** `collection_status` ou `status` da URL de volta: só texto. */
  dica?: string | null;
}): Fase {
  const ultimo = e.ultimoPagamento ?? null;
  const dica = (e.dica || '').toLowerCase();
  switch (e.status) {
    case 'paid': return 'pago';
    case 'refunded': return 'devolvido';
    case 'failed':
      return ultimo === 'recusado' || e.metodo === 'card' ? 'recusado' : 'nao-concluido';
    case 'expired':
      /* O cartão que ficou em análise mais de 24 h: continua em análise. */
      return ultimo === 'em-analise' ? 'em-analise' : 'expirado';
    case 'pending':
      if (ultimo === 'em-analise') return 'em-analise';
      if (ultimo === 'recusado') return 'recusado';
      /* Um pagamento de cartão existe e espera: é a operadora analisando. */
      if (ultimo === 'aguardando' && e.metodo === 'card') return 'em-analise';
      /* A volta diz que aprovou: espera a confirmação pelo prazo inteiro. */
      if (dica === 'approved') return e.passouMs > DESISTE_MS ? 'desconhecido' : 'conferindo';
      /* Saiu da Mercado Pago sem pagar (ela devolve `null`): diz na hora. */
      if (dica === 'null') return 'sem-pagamento';
      if (dica === 'in_process' || dica === 'pending') return 'em-analise';
      if (dica === 'rejected') return e.passouMs > ESPERA_MS ? 'recusado' : 'conferindo';
      return e.passouMs > ESPERA_MS ? 'sem-pagamento' : 'conferindo';
  }
  return 'desconhecido';
}
