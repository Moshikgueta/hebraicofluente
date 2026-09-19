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
import { requireAccount } from './auth.js';
import { clampInstallments, getCourse, isSellable, priceCents } from '../lib/catalog.js';
import {
  createOrder, getOrder, grantAccess, hasEntitlement, log, ordersOf,
  recordEvent, updateOrder
} from '../lib/db.js';
import {
  createCardPreference, createPix, getPayment, mapStatus, paymentsFor,
  verifyWebhookSignature
} from '../lib/mercadopago.js';

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

  const body = await readJson(request);
  if (!body) return fail('server');

  const course = getCourse(body.courseSlug);
  if (!isSellable(course)) return fail('server', 404);

  /* A plataforma pode estar no ar antes de a conta da Mercado Pago existir -
     e esse é um estado normal, não uma falha. Sem token não se cria pedido
     nenhum: melhor uma tela que diz "o pagamento ainda não está ligado" do
     que um 502 genérico e um pedido pendente que nunca vai compensar. */
  if (!env.MP_ACCESS_TOKEN) return fail('payments-off', 503);

  /* Já é dono: não cobra de novo. Vender duas vezes a mesma coisa para a mesma
     pessoa é estorno garantido - e é um erro fácil de cometer quando o
     comprador abre o checkout por um link antigo. */
  if (await hasEntitlement(env, account.id, course.slug)) {
    return fail('server', 409);
  }

  const method = body.method === 'card' ? 'card' : 'pix';
  const installments = method === 'card' ? clampInstallments(course, body.installments) : 1;

  /* O VALOR sai do catálogo. Nada do corpo da requisição chega até aqui. */
  const amountCents = priceCents(course, method);

  const order = await createOrder(env, {
    accountId: account.id, courseSlug: course.slug, amountCents, method, installments
  });

  try {
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
    await log(env, account.id, 'pay-create-failed', `${order.id} ${e.message || e}`);
    return fail('server', 502);
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

  if (order.status === 'pending') {
    await settleFromProvider(env, order, 'verify');
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

  if (!await verifyWebhookSignature(env, request, dataId)) {
    await log(env, null, 'webhook-bad-signature', String(dataId));
    /* 401, e não 200: um remetente legítimo com segredo errado precisa saber
       que está sendo recusado, em vez de achar que entregou. E o código é
       específico, porque quem lê esta resposta é o painel da Mercado Pago e um
       operador humano - não o app. */
    return json({ error: 'bad-signature' }, 401);
  }

  /* A assinatura prova QUEM mandou, não O QUE aconteceu. O status vem de uma
     consulta nossa. */
  await settleFromPaymentId(env, String(dataId), 'webhook');
  /* 200 sempre, depois de processar. Um erro nosso devolvido aqui faz a
     Mercado Pago reenviar - o que é bom - mas devolver erro por um pagamento
     que simplesmente não é nosso a faria reenviar para sempre. */
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
    return applyPayment(env, order, payment, source);
  } catch (e) {
    await log(env, order.account_id, 'settle-error', `${order.id} ${e.message || e}`);
    return null;
  }
}

/** O caminho do webhook: temos o id do pagamento e precisamos achar o pedido. */
export async function settleFromPaymentId(env, paymentId, source) {
  try {
    const payment = await getPayment(env, paymentId);
    const orderId = payment?.external_reference;
    if (!orderId) return null;
    const order = await getOrder(env, orderId);
    if (!order) return null;
    return applyPayment(env, order, payment, source);
  } catch (e) {
    await log(env, null, 'settle-error', `pagamento ${paymentId} ${e.message || e}`);
    return null;
  }
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
 */
async function applyPayment(env, order, payment, source) {
  const status = mapStatus(payment.status);

  const fresh = await recordEvent(env, {
    eventId: String(payment.id), orderId: order.id, status, raw: payment, source
  });
  if (!fresh) return status;

  if (status !== 'paid') {
    if (order.status === 'pending' && (status === 'failed' || status === 'refunded')) {
      await updateOrder(env, order.id, { status });
    }
    return status;
  }

  if (order.status === 'paid') return 'paid';

  /* O valor. Um pagamento aprovado de R$ 1,00 apontando para um pedido de
     R$ 147,00 não é um pagamento deste pedido - é alguém que montou o próprio
     link com o nosso external_reference. */
  const paidCents = Math.round(Number(payment.transaction_amount || 0) * 100);
  const currency = String(payment.currency_id || 'BRL');
  if (paidCents < order.amount_cents || currency !== order.currency) {
    await log(env, order.account_id, 'pay-mismatch',
      `${order.id}: cobrado ${order.amount_cents} ${order.currency}, pago ${paidCents} ${currency}`);
    return 'failed';
  }

  const course = getCourse(order.course_slug);
  await updateOrder(env, order.id, {
    status: 'paid', paid_at: Date.now(), provider_ref: String(payment.id)
  });
  await grantAccess(env, {
    accountId: order.account_id,
    courseSlug: order.course_slug,
    orderId: order.id,
    months: course ? course.accessMonths : 12
  });
  await log(env, order.account_id, 'paid', `${order.id} via ${source}`);
  return 'paid';
}
