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

import { runEstornos, settleFromProvider } from './api/pay.js';
import { runAlertas } from './alertas.js';
import { pegarTrava, soltarTrava,
  arrependimentosIpPurge, getOrder, log, logPurge, paidOrdersToRecheck, registrosPurge, resetPurge, stalePendingOrders, updateOrder, verifyPurge
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

/** A varredura de 5 em 5 minutos, uma de cada vez (auditoria de 28/09,
 *  INFRA-013). Uma execução que demorasse mais que o intervalo encontraria a
 *  seguinte no meio do caminho, e as duas pediriam o mesmo estorno e
 *  mandariam o mesmo alerta. A trava vale 4 minutos: se uma execução morrer
 *  sem soltar, a próxima-da-próxima segue normalmente. Sem a tabela, ou com
 *  o banco falhando, a varredura roda assim mesmo - não rodar é pior. */
export async function runReconcile(env) {
  if (!await pegarTrava(env, 'varredura', 4 * 60_000)) {
    console.log('varredura anterior ainda em andamento - esta foi pulada');
    return { checked: 0, settled: 0, expired: 0, pulada: true };
  }
  try { return await varrer(env); }
  finally { await soltarTrava(env, 'varredura'); }
}

async function varrer(env) {
  /* No PIX direto não há nada a perguntar, e EXPIRAR também não: o pedido
     é a prova de que a pessoa quis comprar, e a liberação à mão pode vir no
     dia seguinte. Expirado, o aluno que pagou via "Expirado" em /perfil
     enquanto esperava (auditoria de 28/09, PAY-009); pendente, vê
     "aguardando". Quando a Mercado Pago voltar, a varredura retoma e os
     pedidos velhos expiram pela regra de sempre. */
  const pending = PIX_DIRETO ? []
    : await stalePendingOrders(env, { olderThanMs: MIN_AGE_MS, limit: BATCH });
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
  /* Os registros de acesso do Marco Civil: seis meses e pronto. */
  try { await registrosPurge(env); } catch { /* idem, e a tabela pode ainda não existir */ }
  try { await verifyPurge(env); } catch { /* idem, e a tabela pode ainda não existir */ }
  try { await arrependimentosIpPurge(env); } catch { /* idem */ }

  /* Os estornos das desistências (pedir de novo o que falhou, confirmar o
     que a Mercado Pago já devolveu) e os alertas ao dono, que também marcam
     o batimento que /api/health usa para dizer se esta varredura parou.
     Cada um no seu try, pelo mesmo motivo das faxinas acima. */
  /* Os pedidos PAGOS, uma vez por dia cada, dez por rodada (o plano gratuito
     limita cada execução a 50 chamadas externas): pega o estorno ou a
     contestação cujo aviso nunca chegou (auditoria de 28/09, PAY-002).
     `settleFromProvider` pergunta à Mercado Pago pelo nosso id de pedido e
     aplica o que ela disser; um `refunded` ou `charged_back` fecha o acesso. */
  if (!PIX_DIRETO) {
    try {
      for (const order of await paidOrdersToRecheck(env)) {
        try { await settleFromProvider(env, order, 'reconcile-pagos'); }
        catch (e) { await log(env, order.account_id, 'reconcile-error', `${order.id} ${e && e.message || e}`); }
      }
    } catch (e) { console.error('pagos', e && e.stack || e); }
  }
  try { await runEstornos(env); } catch (e) { console.error('estornos', e && e.stack || e); }
  try { await runAlertas(env); } catch (e) { console.error('alertas', e && e.stack || e); }

  return { checked: pending.length, settled, expired };
}
