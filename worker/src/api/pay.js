/* Pagamento: criar, conferir, receber o aviso.
 * ─────────────────────────────────────────────────────────────────────────
 * Três rotas e uma função. As rotas são portas; a função `settle` é a única
 * coisa no sistema inteiro que libera acesso, e ela é chamada pelos três
 * caminhos pelos quais um pagamento pode chegar até nós:
 *
 *   webhook    - a Mercado Pago avisa;
 *   verify     - o comprador está com a tela aberta e perguntamos;
 *   reconcile  - o cron varre pendentes antigos.
 *
 * Um caminho só não basta: webhook se perde, aba fecha, e o cron sozinho
 * faria o comprador esperar dez minutos olhando para "aguardando". Três
 * caminhos redundantes com UMA função de liberação é a forma de ter
 * resiliência sem ter três regras diferentes de quando liberar.
 *
 * E `settle` é idempotente por construção: o UNIQUE em payment_events barra o
 * aviso repetido, e o próprio `settle` não faz nada se o pedido já está pago.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { ip, requireAccount } from './auth.js';
import { clampInstallments, getCourse, isSellable, priceCents } from '../lib/catalog.js';
import {
  createOrder, entitlementExpiry, entitlementOf, findAccountById, getOrder, grantAccess,
  log, markPaid, ordersOf, recordEvent, rollbackAccess, throttled, updateOrder
} from '../lib/db.js';
import { dataBR, mailReady, mensagemDeCompra, reaisBR, sendMail } from '../lib/mail.js';
import {
  createCardPreference, createPix, getPayment, mapStatus, paymentsFor,
  verifyWebhookSignature
} from '../lib/mercadopago.js';
import { brCode, confereBrCode } from '../lib/pix.js';
import empresa from '../../../data/empresa.json';

/* ── qual trilho de cobrança está ligado ──────────────────────────────────
 * Sai de data/empresa.json, e não de uma variável de ambiente, porque os
 * DOIS lados precisam da mesma resposta: o Worker, para saber o que criar, e
 * o checkout, para saber o que oferecer. Em dois lugares eles divergem, e a
 * divergência aqui é uma tela que oferece cartão e um servidor que não sabe
 * cobrar no cartão.
 */
const PAGAMENTO = (empresa.pagamento && empresa.pagamento.modo) || 'mercadopago';
const pixDireto = () => PAGAMENTO === 'pix-direto';

/* E QUAIS FORMAS a conta do provedor aceita nesta build.
 * ─────────────────────────────────────────────────────────────────────────
 * Resolvido na publicação por scripts/pagamento-ativo.mjs, que pergunta à
 * Mercado Pago. Ausente (build antiga) significa os dois, que era o
 * comportamento de antes do campo existir.
 *
 * O checkout já esconde o que não dá para cobrar; isto é para quem chama a
 * API direto - e para o dia em que a tela e o servidor discordarem, que é o
 * dia em que alguém mexe num e esquece o outro. */
const FORMAS = (empresa.pagamento && empresa.pagamento.formas) || null;
const aceita = forma => {
  if (pixDireto()) return forma === 'pix';
  if (!FORMAS) return true;
  return forma === 'pix' ? !!FORMAS.pix : !!FORMAS.cartao;
};

/** Um pedido, no formato que o app espera (app/src/lib/account/types.ts). */
const toOrder = row => ({
  id: row.id,
  courseSlug: row.course_slug,
  amountCents: row.amount_cents,
  method: row.method,
  status: row.status,
  createdAt: new Date(row.created_at).toISOString(),
  ...(row.pix_code ? {
    pix: {
      code: row.pix_code,
      qrPngBase64: null,     // o QR não é guardado: é grande e derivável do código
      expiresAt: new Date(row.pix_expires_at || Date.now()).toISOString()
    }
  } : {})
});

const origin = request => new URL(request.url).origin;

/* ── POST /api/pay/create ───────────────────────────────────────────────── */

export async function create({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  /* Cada pedido é uma linha aqui e uma cobrança de verdade na Mercado Pago,
     com chave de idempotência nova. Sem freio, uma conta gratuita num laço
     enchia o painel de cobranças fantasmas e a fila da varredura de pedidos
     que nunca vão compensar. Seis por minuto é um humano indeciso; o de IP
     segura quem cria contas descartáveis para contornar o primeiro. */
  if (await throttled(env, `pay:${account.id}`, 6)) return fail('rate-limited', 429);
  if (await throttled(env, `payip:${ip(request)}`, 12)) return fail('rate-limited', 429);

  const body = await readJson(request);
  if (!body || typeof body !== 'object') return fail('server');

  const course = getCourse(typeof body.courseSlug === 'string' ? body.courseSlug : '');
  if (!isSellable(course)) return fail('server', 404);

  /* A plataforma pode estar no ar antes de a conta da Mercado Pago existir -
     e esse é um estado normal, não uma falha. Sem token não se cria pedido
     nenhum: melhor uma tela que diz "o pagamento ainda não está ligado" do
     que um 502 genérico e um pedido pendente que nunca vai compensar.

     No modo `pix-direto` isso não se aplica: o BR Code não depende de token
     nenhum, que é exatamente o motivo de esse modo existir. */
  if (!pixDireto() && !env.MP_ACCESS_TOKEN) return fail('payments-off', 503);

  /* Já é dono: não cobra de novo. Vender duas vezes a mesma coisa para a mesma
     pessoa é estorno garantido - e é um erro fácil de cometer quando o
     comprador abre o checkout por um link antigo.

     Exceto nos últimos 45 dias: aí é RENOVAÇÃO, e `grantAccess` estende a
     partir do vencimento, então pagar cedo não perde dia nenhum. Sem esta
     janela o botão "Renovar acesso" do painel levava a um checkout que
     respondia 409 - a renovação só era possível DEPOIS de perder o acesso. */
  const vence = await entitlementExpiry(env, account.id, course.slug);
  const RENOVACAO_MS = 45 * 86_400_000;
  if (vence !== null && (vence === undefined || vence - Date.now() > RENOVACAO_MS)) {
    return fail('already-owned', 409);
  }

  /* Uma forma que esta implantação não consegue cobrar é recusada AQUI, em
     vez de virar um pedido que nunca vai ser pago - ou, pior, uma chamada à
     Mercado Pago que volta com um erro cru na cara do comprador.

     Dois motivos possíveis, e o código de erro é o mesmo para os dois porque
     a resposta para quem chamou também é: o modo `pix-direto`, em que não há
     adquirente nenhum para o cartão; e a conta do provedor não ter aquele
     meio habilitado, o que a publicação descobre perguntando a eles.

     O checkout já esconde o que não dá para cobrar. Isto é para quem chama a
     API direto, e para o dia em que a tela e o servidor discordarem. */
  const pedido = body.method === 'card' ? 'card' : 'pix';
  if (!aceita(pedido)) return fail(pedido === 'card' ? 'card-off' : 'pix-off', 409);

  const method = pedido;
  const installments = method === 'card' ? clampInstallments(course, body.installments) : 1;

  /* O VALOR sai do catálogo. Nada do corpo da requisição chega até aqui. */
  const amountCents = priceCents(course, method);

  const order = await createOrder(env, {
    accountId: account.id, courseSlug: course.slug, amountCents, method, installments
  });

  try {
    /* ── PIX direto ────────────────────────────────────────────────────
       Nenhuma chamada de rede: o BR Code é montado aqui, a partir da chave
       do recebedor em data/empresa.json. Não há `provider_ref` porque não
       há provedor, e o pedido nasce e fica `pending` até alguém olhar o
       extrato e liberar - o que a tela diz com todas as letras.

       O código é RELIDO antes de sair. Um BR Code errado não falha aqui:
       falha no aplicativo do banco do comprador, com "QR Code inválido" e
       nenhuma pista, no pior momento possível. */
    if (pixDireto()) {
      const { pix: conf } = empresa.pagamento;
      const codigo = brCode({
        chave: conf.chave,
        nome: conf.titular,
        cidade: conf.cidade,
        valor: amountCents / 100,
        txid: order.id
      });

      const conferido = confereBrCode(codigo);
      if (!conferido.ok) throw new Error(`br code invalido: ${conferido.erro}`);

      /* Trinta minutos, como o PIX da Mercado Pago. Não é o banco que
         expira o código - é a nossa tela que para de mostrá-lo, para que
         ninguém pague um pedido esquecido de ontem. */
      const expira = Date.now() + 30 * 60_000;
      await updateOrder(env, order.id, {
        provider_ref: null,
        pix_code: codigo,
        pix_expires_at: expira,
        status: 'pending'
      });
      await log(env, account.id, 'pix-direto', `${order.id} ${amountCents}`);
      return json(toOrder(await getOrder(env, order.id)));
    }

    if (method === 'pix') {
      const pix = await createPix(env, { order, course, account, origin: origin(request) });
      await updateOrder(env, order.id, {
        provider_ref: pix.paymentId,
        pix_code: pix.pixCode,
        pix_expires_at: pix.expiresAt,
        status: pix.status === 'paid' ? 'paid' : 'pending'
      });
      /* O raríssimo caso de já nascer aprovado. Passa pelo mesmo `settle` que
         todo o resto, para que não exista um segundo lugar que libera acesso. */
      if (pix.status === 'paid') await settle(env, order.id, pix.paymentId, 'verify');
      return json(toOrder(await getOrder(env, order.id)));
    }

    const pref = await createCardPreference(env, {
      order, course, account, origin: origin(request)
    });
    await updateOrder(env, order.id, { provider_ref: pref.preferenceId, pay_url: pref.payUrl });
    return json({ ...toOrder(await getOrder(env, order.id)), redirectUrl: pref.payUrl });

  } catch (e) {
    /* O pedido fica registrado como falho e não some: um pedido apagado é um
       pagamento que pode cair depois sem ter onde encaixar. */
    await updateOrder(env, order.id, { status: 'failed' });

    /* O MOTIVO, e não só o código.
       ──────────────────────────────────────────────────────────────────
       `e.message` é "mercadopago 400" - verdadeiro e inútil. O que diz o
       que consertar está em `e.data`, o corpo que eles devolvem:
       `invalid_payer_email`, conta sem chave PIX habilitada, "cannot
       operate between same user" (comprar do próprio vendedor). São
       consertos diferentes atrás do mesmo 400, e sem isto a única saída
       é adivinhar qual.

       Vai para a trilha, e não só para o console: ler o log do Worker
       exige alguém com o painel da Cloudflare aberto na hora exata. A
       trilha espera. */
    let detalhe = '';
    try { detalhe = e && e.data ? JSON.stringify(e.data).slice(0, 400) : ''; }
    catch { /* objeto com ciclo, ou getter que lança */ }
    await log(env, account.id, 'pay-create-failed',
      `${order.id} ${method} ${e.message || e} ${detalhe}`.trim());

    /* Código próprio, e não o `server` genérico.
       ──────────────────────────────────────────────────────────────────
       "Alguma coisa quebrou do nosso lado, tente de novo" é a frase certa
       para quase toda falha e a errada para esta. Aqui a pessoa está com
       o cartão na mão: ela tenta de novo, falha de novo, e vai embora -
       e a falha é de configuração, então tentar de novo NUNCA vai
       funcionar. O texto desse código (app/src/lib/account/types.ts) diz
       que o problema é nosso e dá o endereço do suporte, que é o único
       caminho que resolve para ela hoje. */
    return fail('payment-failed', 502);
  }
}

/* ── GET /api/pay/verify?order=… ────────────────────────────────────────── */

export async function verify({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  const id = new URL(request.url).searchParams.get('order');
  const order = await getOrder(env, id);
  /* O pedido de outra pessoa responde igual a um pedido inexistente. Um id de
     pedido não é credencial - ele aparece na URL, no histórico, na captura de
     tela colada num chamado de suporte. */
  if (!order || order.account_id !== account.id) return fail('server', 404);

  /* No PIX direto não há a quem perguntar: o BR Code é nosso e o dinheiro cai
     na conta sem avisar ninguém. O pedido fica `pending` até alguém liberar à
     mão, e a tela do comprador precisa saber disso para parar de girar em vez
     de prometer uma confirmação que não vem. */
  if (order.status === 'pending' && !pixDireto()) {
    /* Cada consulta aqui é uma chamada à Mercado Pago com a nossa
       credencial. A tela pergunta a cada três segundos; um laço perguntaria
       mil vezes por minuto e gastaria a cota do vendedor com a conta de um
       comprador. Vinte por minuto por conta, e uma consulta feita há menos
       de cinco segundos vale como resposta. */
    const recente = order.checked_at && Date.now() - Number(order.checked_at) < 5_000;
    if (!recente && !await throttled(env, `verify:${account.id}`, 20)) {
      await settleFromProvider(env, order, 'verify');
    }
    return json(toOrder(await getOrder(env, order.id)));
  }
  return json(toOrder(order));
}

/* ── GET /api/orders ────────────────────────────────────────────────────── */

export async function orders({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  return json({ orders: (await ordersOf(env, account.id)).map(toOrder) });
}

/* ── POST /api/pay/webhook ──────────────────────────────────────────────── */

export async function webhook({ request, env }) {
  const url = new URL(request.url);
  const body = await readJson(request, 32 * 1024) || {};

  /* A Mercado Pago manda o id ora na query, ora no corpo, dependendo do tipo
     de aviso e da versão da integração. Aceitar os dois é mais barato do que
     descobrir em produção qual deles chegou. */
  const dataId = url.searchParams.get('data.id') || body?.data?.id || url.searchParams.get('id');
  const type = url.searchParams.get('type') || body?.type || '';

  /* Só pagamento interessa. Aviso de plano, de assinatura ou de fraude chega
     na mesma URL e não tem o que fazer aqui. */
  if (!dataId || (type && !String(type).startsWith('payment'))) {
    return json({ ok: true });
  }

  /* Um id de pagamento da Mercado Pago é um número. Qualquer outra coisa não
     é um aviso deles, e não chega nem à assinatura - nem, mais adiante, à
     URL da consulta, onde um id escolhido por alguém viraria um caminho. */
  if (typeof dataId !== 'string' && typeof dataId !== 'number') return json({ ok: true });
  if (!/^\d{1,24}$/.test(String(dataId))) return json({ ok: true });

  if (!await verifyWebhookSignature(env, request, dataId)) {
    /* A trilha guarda a recusa, mas não uma linha por requisição: esta é uma
       rota pública, e uma escrita gratuita no D1 por chamada anônima é o
       jeito mais barato de esgotar a cota de escrita da plataforma inteira.
       Trinta por minuto por IP na trilha; o resto só leva o 401. */
    if (!await throttled(env, `whk:${ip(request)}`, 30)) {
      await log(env, null, 'webhook-bad-signature', String(dataId));
    }
    /* 401, e não 200: um remetente legítimo com segredo errado precisa saber
       que está sendo recusado, em vez de achar que entregou. E o código é
       específico, porque quem lê esta resposta é o painel da Mercado Pago e um
       operador humano - não o app. */
    return json({ error: 'bad-signature' }, 401);
  }

  /* A assinatura prova QUEM mandou, não O QUE aconteceu. O status vem de uma
     consulta nossa. */
  const resultado = await settleFromPaymentId(env, String(dataId), 'webhook');
  /* Duas respostas, para dois casos que a Mercado Pago trata diferente:
     · um erro NOSSO (banco fora, consulta que caiu) devolve 500, e ela
       reenvia - que é exatamente o que se quer de um aviso que não
       conseguimos processar;
     · um pagamento que não é nosso, ou já resolvido, devolve 200, senão
       ela reenviaria para sempre um aviso que não tem o que fazer aqui. */
  if (resultado === 'erro') return json({ error: 'retry' }, 500);
  return json({ ok: true });
}

/* ── a liberação ────────────────────────────────────────────────────────── */

/**
 * Consulta o provedor por um pedido pendente e resolve o que achar.
 *
 * Usa a busca por `external_reference` porque num PIX o id do pagamento já é
 * conhecido, mas num cartão do Checkout Pro o pagamento nasce com id que
 * nunca chegou até nós se o webhook se perdeu. O nosso id de pedido é o único
 * fio que atravessa os dois casos.
 */
export async function settleFromProvider(env, order, source) {
  await updateOrder(env, order.id, { checked_at: Date.now() });
  try {
    const found = await paymentsFor(env, order.id);
    if (!found.length) return null;
    /* Se houver mais de um (o comprador tentou duas vezes), o aprovado manda. */
    const payment = found.find(p => mapStatus(p.status) === 'paid') || found[0];
    /* `await` aqui, e não só `return`: uma promessa rejeitada devolvida de
       dentro de um try NÃO é pega pelo catch dele. Sem o await, uma falha na
       liberação escapava sem log e derrubava a varredura inteira. */
    return await applyPayment(env, order, payment, source);
  } catch (e) {
    await erroDeLiberacao(env, order.account_id, `${order.id} ${e.message || e}`);
    return 'erro';
  }
}

/** O caminho do webhook: temos o id do pagamento e precisamos achar o pedido.
 *  Devolve `null` quando não há o que fazer (pagamento de outra loja, pedido
 *  inexistente) e `'erro'` quando algo NOSSO falhou - a diferença decide se a
 *  Mercado Pago deve reenviar o aviso. */
export async function settleFromPaymentId(env, paymentId, source) {
  try {
    const payment = await getPayment(env, paymentId);
    const orderId = payment?.external_reference;
    if (!orderId) return null;
    const order = await getOrder(env, orderId);
    if (!order) return null;
    return await applyPayment(env, order, payment, source);
  } catch (e) {
    /* Um id que a Mercado Pago não conhece (o simulador do painel, um
       pagamento de outra conta) não é falha nossa: responder 500 faria ela
       reenviar para sempre um aviso que nunca vai ter o que fazer aqui. */
    if (e && e.status === 404) return null;
    await erroDeLiberacao(env, null, `pagamento ${paymentId} ${e.message || e}`);
    return 'erro';
  }
}

/** A trilha do erro de liberação, com teto: um provedor fora do ar durante
 *  uma varredura, ou um aviso reenviado em laço, não pode virar uma linha
 *  por tentativa até a cota de escrita acabar. */
async function erroDeLiberacao(env, accountId, detalhe) {
  console.error('settle', detalhe);
  if (!await throttled(env, 'settle-error', 20)) await log(env, accountId, 'settle-error', detalhe);
}

/** Atalho para quando já temos os dois lados. */
export const settle = (env, orderId, paymentId, source) =>
  settleFromPaymentId(env, paymentId, source);

/**
 * A ÚNICA função que libera acesso.
 *
 * Quatro travas, e cada uma fecha um jeito conhecido de dar o curso de graça:
 *   · evento repetido não faz nada (UNIQUE em payment_events);
 *   · pedido já pago não faz nada;
 *   · valor menor do que o pedido não libera;
 *   · moeda diferente não libera.
 *
 * E a lição da auditoria, que vale contra o instinto: a chave do evento é o
 * pagamento E O ESTADO DELE. Um pagamento da Mercado Pago é um objeto que
 * muda - o mesmo id é `pending` hoje e `approved` daqui a um minuto. Com a
 * chave só no id, a PRIMEIRA vez que este código via um pagamento (a tela
 * consultando três segundos depois de o QR aparecer) gastava a única vaga
 * dele, e a aprovação que vinha depois batia no UNIQUE e era descartada.
 * Todo PIX pago, sem exceção, ficaria pendente para sempre. A trava contra
 * liberar duas vezes é `order.status === 'paid'`, logo abaixo - e sempre foi.
 */
async function applyPayment(env, order, payment, source) {
  let status = mapStatus(payment.status);

  /* Em centavos, sempre. */
  const paidCents = Math.round(Number(payment.transaction_amount || 0) * 100);
  const refundedCents = Math.round(Number(payment.transaction_amount_refunded || 0) * 100);
  const currency = String(payment.currency_id || 'BRL');

  /* Um estorno PARCIAL não muda o status na Mercado Pago: o pagamento continua
     `approved`, com `transaction_amount_refunded` maior que zero. Se o que
     ficou é menos do que o curso custa, o curso não está pago - é o mesmo
     critério do valor a menor, logo abaixo, aplicado depois do fato. */
  if (status === 'paid' && refundedCents > 0 && paidCents - refundedCents < order.amount_cents) {
    status = 'refunded';
  }

  const fresh = await recordEvent(env, {
    eventId: `${payment.id}:${status}`, orderId: order.id, status, raw: payment, source
  });

  /* O pedido, relido: o que chegou aqui pode ter sido lido antes de uma
     liberação que aconteceu no meio do caminho. */
  const atual = (await getOrder(env, order.id)) || order;
  const course = getCourse(order.course_slug);
  const months = course ? course.accessMonths : 12;

  if (status === 'refunded') {
    /* Estorno ou chargeback. Fecha a porta - o cookie não carrega direito
       nenhum, então fecha na hora - e deixa o pedido dizendo o que aconteceu.
       Antes, um estorno depois de pago não fazia NADA: nem revogava, nem
       marcava, nem registrava. Quem pedia o dinheiro de volta ficava com os
       doze meses.

       Recua os meses DESTE pedido, e não apaga tudo: o estorno de uma
       renovação não pode levar junto os meses da compra anterior, que
       ninguém devolveu. Quando este pedido é o único, recuar e apagar dão no
       mesmo. O recuo vem ANTES de marcar o pedido: se cair no meio, o pedido
       continua `paid`, o reenvio chega aqui de novo e - com a linha já
       apagada no caso comum - não encontra o que recuar. */
    if (atual.status === 'paid') {
      await rollbackAccess(env, order.account_id, order.course_slug, months, `${payment.id} via ${source}`);
      await updateOrder(env, order.id, { status: 'refunded' });
      await log(env, order.account_id, 'estorno', `${order.id} ${payment.status} ${refundedCents || paidCents} via ${source}`);
    } else if (atual.status === 'pending') {
      await updateOrder(env, order.id, { status: 'refunded' });
    }
    return status;
  }

  if (status !== 'paid') {
    if (fresh && atual.status === 'pending' && status === 'failed') {
      await updateOrder(env, order.id, { status });
    }
    return status;
  }

  /* Aprovado. Um aviso de aprovação repetido (`!fresh`) chega até aqui de
     propósito: se o pedido já está pago, a linha seguinte encerra; se NÃO
     está - uma liberação que caiu no meio, entre gravar o evento e gravar o
     direito - o reenvio é justamente a chance de terminar o serviço. */
  if (atual.status === 'paid') return 'paid';

  /* O valor. Um pagamento aprovado de R$ 1,00 apontando para um pedido de
     R$ 147,00 não é um pagamento deste pedido - é alguém que montou o próprio
     link com o nosso external_reference. */
  if (paidCents < order.amount_cents || currency !== order.currency) {
    await log(env, order.account_id, 'pay-mismatch',
      `${order.id}: cobrado ${order.amount_cents} ${order.currency}, pago ${paidCents} ${currency}`);
    return 'failed';
  }

  /* A linha de acesso ANTES de conceder, porque `grantAccess` apaga a
     diferença: depois dele toda conta tem acesso, e não haveria como saber se
     esta compra abriu a porta ou esticou um prazo que já existia. É só o que
     decide o texto do e-mail - "seu acesso está liberado" contra "foi
     renovado" -, e mandar a primeira frase a quem já estudava há meses é o
     tipo de detalhe que faz a mensagem inteira parecer automática. */
  const antes = await entitlementOf(env, order.account_id, order.course_slug);

  /* O direito PRIMEIRO, o pedido DEPOIS. A ordem é o que torna uma
     liberação interrompida recuperável: se o banco cair entre as duas
     escritas, o pedido continua `pending`, o reenvio do aviso chega até
     aqui de novo e termina o serviço. Na ordem inversa o pedido ficava
     `paid` sem direito nenhum, e cada reenvio parava na linha "já está pago"
     lá em cima.

     Nem o reenvio nem uma liberação simultânea concedem duas vezes: o
     `grantAccess` não faz nada se a linha já aponta para este pedido, e
     decide isso dentro do mesmo comando que grava. A conferência que ficava
     aqui, numa leitura separada, deixava duas liberações simultâneas lerem
     "ainda não" e estenderem os meses uma da outra - ver
     worker/concessao.mjs. */
  await grantAccess(env, {
    accountId: order.account_id,
    courseSlug: order.course_slug,
    orderId: order.id,
    months
  });

  /* Só quem de fato virou o pedido para `paid` registra e manda o recibo.
     As outras liberações simultâneas chegam aqui com o serviço feito. */
  if (!await markPaid(env, order.id, payment.id)) return 'paid';

  await log(env, order.account_id, 'paid', `${order.id} via ${source}`);

  /* Primeira compra ou renovação. Se a linha lida acima ainda era de outro
     pedido (ou não existia), ela é o retrato de antes: renovação é ter
     acesso valendo. Se já apontava para ESTE pedido - uma liberação
     interrompida sendo retomada, ou uma simultânea que concedeu primeiro -,
     o retrato de antes se perdeu, e a pista é `granted_at`: uma linha
     criada por esta compra nasce depois do pedido; uma estendida por ela é
     mais velha que ele. */
  const primeiraCompra = antes && String(antes.order_id) === String(order.id)
    ? Number(antes.granted_at) >= Number(order.created_at)
    : !(antes && (antes.expires_at === null || Number(antes.expires_at) > Date.now()));

  await confirmarPorEmail(env, order, primeiraCompra);
  return 'paid';
}

/**
 * O recibo, na caixa de entrada de quem pagou.
 *
 * ── por que AQUI, e exatamente aqui ─────────────────────────────────────
 * Este ponto roda uma vez por pedido, e não por acaso: só chega aqui quem
 * ganhou o `markPaid` - a troca de `pending` para `paid` feita num comando só,
 * que duas liberações simultâneas não conseguem ganhar juntas. A leitura
 * `if (atual.status === 'paid')` lá em cima barra a passagem que chega
 * depois, mas não a que chega AO MESMO TEMPO. E há três caminhos que levam um
 * pagamento a ser liquidado - o retorno do navegador, o aviso da Mercado
 * Pago e a varredura de dez em dez minutos -, então um disparo colocado
 * mais acima mandaria o mesmo e-mail três vezes.
 *
 * ── e por que ele NUNCA derruba a compra ────────────────────────────────
 * Falha aberta, como todo o resto do módulo de e-mail. O acesso já foi
 * concedido e o pedido já está pago quando esta função começa; um provedor
 * fora do ar não pode desfazer isso nem devolver erro a quem pagou. O que
 * acontece na falha é o que tem de acontecer: fica registrado na trilha,
 * com o motivo, para que "não recebi o e-mail" tenha resposta em vez de
 * palpite.
 */
async function confirmarPorEmail(env, order, primeiraCompra) {
  try {
    if (!mailReady(env)) return;

    const account = await findAccountById(env, order.account_id);
    if (!account?.email) return;

    const curso = getCourse(order.course_slug);
    const vence = await entitlementExpiry(env, account.id, order.course_slug);
    const site = String(env.SITE_ORIGIN || '').replace(/\/+$/, '');

    const msg = mensagemDeCompra({
      nome: account.name || '',
      curso: curso?.titlePt || order.course_slug,
      valor: reaisBR(order.amount_cents, order.currency),
      pedido: order.id,
      expiraEm: dataBR(vence),
      link: `${site}/meu-hebraico/`,
      marca: empresa.nomeFantasia || 'Hebraico Fluente',
      suporte: empresa.contato?.emailSuporte || '',
      arrependimentoDias: empresa.politicas?.arrependimentoDias || 0,
      /* Uma renovação não diz "seu acesso está liberado" a quem já estava
         estudando: diz que foi estendido. É a mesma compra e outra notícia. */
      renovacao: !primeiraCompra
    });

    const r = await sendMail(env, { to: account.email, ...msg });
    await log(env, account.id, r.ok ? 'compra-enviada' : 'compra-email-falhou',
      r.ok ? order.id : `${order.id} ${r.motivo}${r.detalhe ? ': ' + r.detalhe : ''}`);
    if (!r.ok) console.error('mail-compra', r.motivo, r.status || '', r.detalhe || '');
  } catch (e) {
    /* Um erro aqui é um e-mail que não saiu, nunca uma compra desfeita. */
    console.error('mail-compra', e && e.stack || e);
  }
}
