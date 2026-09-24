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
import {
  getOrder, log, logPurge, resetPurge, stalePendingOrders, updateOrder, verifyPurge
} from './lib/db.js';
import empresa from '../../data/empresa.json';

/* No PIX direto não existe provedor a quem perguntar: o dinheiro cai na conta
   do recebedor sem avisar ninguém, e a liberação é feita à mão. Varrer
   pendentes contra a Mercado Pago aqui seria bater numa porta que não existe,
   de cinco em cinco minutos, para sempre. A faxina de senhas no fim continua
   valendo - ela não tem nada a ver com pagamento. */
const PIX_DIRETO = ((empresa.pagamento && empresa.pagamento.modo) || '') === 'pix-direto';

const MIN_AGE_MS = 60_000;
const GIVE_UP_MS = 24 * 3_600_000;

/** Teto por execução. Uma varredura que tenta resolver duzentos pedidos numa
 *  tacada estoura o tempo do cron e não resolve nenhum. */
const BATCH = 20;

export async function runReconcile(env) {
  const pending = await stalePendingOrders(env, { olderThanMs: MIN_AGE_MS, limit: BATCH });
  let settled = 0, expired = 0;

  for (const order of pending) {
    /* Cada pedido no seu próprio try: um pedido que estoura não pode
       encerrar a varredura para os dezenove atrás dele, nem pular a faxina
       no fim. O erro vai para a trilha, com o pedido que o causou. */
    try {
      if (Date.now() - order.created_at > GIVE_UP_MS) {
        await updateOrder(env, order.id, { status: 'expired' });
        expired++;
        continue;
      }
      /* Expirar continua valendo no PIX direto - um pedido de ontem não pode
         ficar pendente para sempre. Perguntar ao provedor, não: não há
         provedor. */
      if (PIX_DIRETO) continue;
      const status = await settleFromProvider(env, order, 'reconcile');
      /* Conta como liberado só o que FOI liberado agora: o pedido era
         pendente e saiu pago. Contar o valor devolvido pela função
         registrava "1 liberados" para pedidos que continuavam pendentes -
         foi assim que o defeito do evento repetido ficou invisível. */
      if (status === 'paid') {
        const depois = await getOrder(env, order.id);
        if (depois && depois.status === 'paid') settled++;
      }
    } catch (e) {
      await log(env, order.account_id, 'reconcile-error', `${order.id} ${e && e.message || e}`);
    }
  }

  if (settled || expired) {
    await log(env, null, 'reconcile',
      `${pending.length} pendentes · ${settled} liberados · ${expired} expirados`);
  }

  /* De carona: apaga os pedidos de senha vencidos há mais de uma semana. Não
     tem nada a ver com pagamento, e é por isso que está aqui - um segundo
     cron só para uma linha de DELETE é um segundo cron para configurar,
     lembrar e conferir. Falhar aqui não pode derrubar a varredura, que é o
     trabalho de verdade desta execução. */
  try { await resetPurge(env); } catch { /* a faxina tenta de novo em 5 min */ }
  try { await logPurge(env); } catch { /* idem */ }
  try { await verifyPurge(env); } catch { /* idem, e a tabela pode ainda não existir */ }

  return { checked: pending.length, settled, expired };
}
