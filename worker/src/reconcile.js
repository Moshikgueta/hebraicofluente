/* A varredura.
 * ─────────────────────────────────────────────────────────────────────────
 * O webhook da Mercado Pago é assinado e confiável, e ainda assim não basta.
 * Ele pode não chegar: uma indisponibilidade nossa de dois minutos durante a
 * janela de reenvio, uma mudança de domínio, um erro de configuração no
 * painel deles. E o comprador que fecha a aba logo depois de pagar não deixa
 * ninguém para perguntar.
 *
 * Então, de cinco em cinco minutos: pega os pedidos pendentes com mais de um
 * minuto de vida e pergunta ao provedor o que aconteceu com cada um. É a rede
 * por baixo das outras duas - e é ela que garante que "paguei e não liberou"
 * seja um atraso de minutos, nunca um chamado de suporte.
 *
 * O que ela NÃO faz: liberar acesso por conta própria. Ela chama exatamente a
 * mesma função que o webhook chama. Um segundo caminho de liberação seria uma
 * segunda regra, e a segunda regra é sempre a que tem o bug.
 *
 * Um pendente de mais de 24 horas vira `expired`. Não é desistência: o PIX
 * expira em 30 minutos e a preferência de cartão deixa de aceitar pagamento -
 * continuar perguntando por eles seria gastar chamada com pedido morto. Se um
 * pagamento chegar mesmo assim, o webhook o encontra pelo id do pedido e o
 * `settle` o processa do mesmo jeito: `expired` não fecha porta nenhuma.
 */

import { settleFromProvider } from './api/pay.js';
import { log, stalePendingOrders, updateOrder } from './lib/db.js';

const MIN_AGE_MS = 60_000;
const GIVE_UP_MS = 24 * 3_600_000;

/** Teto por execução. Uma varredura que tenta resolver duzentos pedidos numa
 *  tacada estoura o tempo do cron e não resolve nenhum. */
const BATCH = 20;

export async function runReconcile(env) {
  const pending = await stalePendingOrders(env, { olderThanMs: MIN_AGE_MS, limit: BATCH });
  let settled = 0, expired = 0;

  for (const order of pending) {
    if (Date.now() - order.created_at > GIVE_UP_MS) {
      await updateOrder(env, order.id, { status: 'expired' });
      expired++;
      continue;
    }
    const status = await settleFromProvider(env, order, 'reconcile');
    if (status === 'paid') settled++;
  }

  if (settled || expired) {
    await log(env, null, 'reconcile',
      `${pending.length} pendentes · ${settled} liberados · ${expired} expirados`);
  }
  return { checked: pending.length, settled, expired };
}
