/* Mercado Pago.
 * ─────────────────────────────────────────────────────────────────────────
 * Dois caminhos, porque são dois produtos diferentes lá dentro:
 *
 *   PIX    → API de pagamentos (`POST /v1/payments`). Volta na hora com o
 *            copia-e-cola e o QR; o comprador nunca sai da nossa página.
 *   CARTÃO → Checkout Pro (`POST /checkout/preferences`). O comprador vai
 *            para a tela da Mercado Pago, digita o cartão lá e volta. É por
 *            isso que esta plataforma nunca vê um número de cartão — e não
 *            ver é a única forma barata de não ter de proteger.
 *
 * Três regras que valem mais do que o resto do arquivo:
 *
 * 1. `X-Idempotency-Key` em toda criação de pagamento. Sem ela, um clique
 *    duplo ou um retry de rede vira dois PIX para a mesma compra.
 *
 * 2. O webhook é VERIFICADO por assinatura (`x-signature`) e mesmo assim não
 *    é acreditado: ele só diz QUAL pagamento olhar. Quem responde o status é
 *    uma consulta nossa à API. Um webhook diz o que o remetente quer; uma
 *    consulta diz o que o provedor sabe.
 *
 * 3. O VALOR é conferido na volta. Um pagamento aprovado de R$ 1,00 para um
 *    pedido de R$ 147,00 não libera nada. Parece paranoia até o dia em que
 *    alguém monta o próprio link de pagamento com o nosso external_reference.
 */

const API = 'https://api.mercadopago.com';

/**
 * Teste ou produção? O TOKEN responde, não uma variável.
 * ─────────────────────────────────────────────────────────────────────────
 * A Mercado Pago dá dois pares de credenciais, e o prefixo os distingue:
 * `TEST-` é a de teste, `APP_USR-` é a de produção. Isso é informação que já
 * está na credencial — pedir que alguém declare o modo num segundo lugar é
 * criar a chance de os dois discordarem.
 *
 * E a discordância é cara nos dois sentidos:
 *
 *   · token de PRODUÇÃO com modo de teste → o comprador é mandado para um
 *     checkout que NÃO COBRA. O pedido nunca compensa, ninguém reclama
 *     (afinal não pagaram), e a falha pode passar semanas despercebida —
 *     semanas de vendas perdidas sem nenhum sintoma;
 *   · token de TESTE com modo de produção → o checkout recusa tudo, o que ao
 *     menos aparece na hora.
 *
 * Derivando do token, nenhum dos dois pode acontecer. `MP_SANDBOX` no
 * wrangler.toml só é consultado quando o prefixo é desconhecido, e o padrão
 * nesse caso é o modo que não cobra: diante da dúvida, não tirar dinheiro de
 * ninguém.
 */
export function isSandbox(env) {
  const token = String((env && env.MP_ACCESS_TOKEN) || '');
  if (token.startsWith('TEST-')) return true;
  if (token.startsWith('APP_USR-')) return false;
  return !env || env.MP_SANDBOX !== '0';
}

async function call(env, path, { method = 'GET', body, idempotencyKey } = {}) {
  const headers = {
    'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

  const res = await fetch(API + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch { /* resposta vazia ou HTML de erro */ }
  if (!res.ok) {
    const err = new Error(`mercadopago ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Vocabulário deles → o nosso. Fechado de propósito: um status novo que a
 *  Mercado Pago invente não deve virar "pago" por acidente. */
export function mapStatus(mpStatus) {
  switch (mpStatus) {
    case 'approved': case 'authorized':            return 'paid';
    case 'pending': case 'in_process': case 'in_mediation': return 'pending';
    case 'rejected': case 'cancelled':             return 'failed';
    case 'refunded': case 'charged_back':          return 'refunded';
    default:                                       return 'pending';
  }
}

/* ── PIX ────────────────────────────────────────────────────────────────── */

export async function createPix(env, { order, course, account, origin }) {
  const minutes = 30;
  const expires = new Date(Date.now() + minutes * 60_000);

  const payment = await call(env, '/v1/payments', {
    method: 'POST',
    /* A chave é o id do pedido: dois envios do mesmo pedido são o mesmo
       pagamento, nunca dois. */
    idempotencyKey: order.id,
    body: {
      transaction_amount: order.amount_cents / 100,
      description: `${course.titlePt} — Hebraico Fluente`,
      payment_method_id: 'pix',
      external_reference: order.id,
      notification_url: `${origin}/api/pay/webhook`,
      date_of_expiration: expires.toISOString().replace('Z', '-00:00'),
      payer: {
        email: account.email,
        first_name: (account.name || 'Aluno').split(/\s+/)[0]
      }
    }
  });

  const tx = payment?.point_of_interaction?.transaction_data || {};
  return {
    paymentId: String(payment.id),
    status: mapStatus(payment.status),
    pixCode: tx.qr_code || null,
    pixQrBase64: tx.qr_code_base64 || null,
    expiresAt: expires.getTime()
  };
}

/* ── cartão (Checkout Pro) ──────────────────────────────────────────────── */

export async function createCardPreference(env, { order, course, account, origin }) {
  const pref = await call(env, '/checkout/preferences', {
    method: 'POST',
    idempotencyKey: order.id,
    body: {
      items: [{
        id: course.slug,
        title: `${course.titlePt} — Hebraico Fluente`,
        description: course.taglinePt,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: order.amount_cents / 100
      }],
      payer: { email: account.email, name: account.name || undefined },
      external_reference: order.id,
      notification_url: `${origin}/api/pay/webhook`,
      /* Voltar para a NOSSA página de confirmação, que reconfere com o
         servidor. Os parâmetros que a Mercado Pago acrescenta a esta URL não
         são acreditados por ninguém — ver ObrigadoClient.tsx. */
      back_urls: {
        success: `${origin}/checkout/${course.slug}/obrigado/?order=${order.id}`,
        pending: `${origin}/checkout/${course.slug}/obrigado/?order=${order.id}`,
        failure: `${origin}/checkout/${course.slug}/obrigado/?order=${order.id}`
      },
      auto_return: 'approved',
      payment_methods: {
        /* PIX sai daqui: quem quer PIX usa o caminho de cima, que mostra o
           código na nossa própria tela. Boleto também sai — três dias de
           espera com o aluno achando que já comprou gera mais suporte do que
           venda. */
        excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }],
        installments: Number(order.installments) || 1
      },
      statement_descriptor: 'HEBRAICOFLUENTE'
    }
  });

  return {
    preferenceId: String(pref.id),
    /* `sandbox_init_point` só existe em conta de teste, e usá-lo em produção
       manda o comprador para um checkout que não cobra. Quem decide é o
       prefixo do token — ver `isSandbox` no topo do arquivo. */
    payUrl: isSandbox(env) ? (pref.sandbox_init_point || pref.init_point) : pref.init_point
  };
}

/* ── consulta ───────────────────────────────────────────────────────────── */

export const getPayment = (env, paymentId) => call(env, `/v1/payments/${paymentId}`);

/** Todos os pagamentos ligados a um pedido nosso. É como a varredura encontra
 *  um pagamento cujo aviso nunca chegou. */
export async function paymentsFor(env, orderId) {
  const r = await call(env, `/v1/payments/search?external_reference=${encodeURIComponent(orderId)}&sort=date_created&criteria=desc`);
  return r?.results || [];
}

/* ── assinatura do webhook ──────────────────────────────────────────────── */

/**
 * Confere o `x-signature` da Mercado Pago.
 *
 * O manifesto é fixo — `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` — e
 * assinado em HMAC-SHA256 com o segredo do webhook. `ts` entra no manifesto
 * justamente para que uma entrega gravada não possa ser reenviada por outra
 * pessoa depois; a janela de tolerância abaixo é o que transforma isso em
 * proteção de verdade.
 *
 * Sem MP_WEBHOOK_SECRET configurado a resposta é `false`, e não "deixa
 * passar". Um webhook não verificado é uma rota pública que concede acesso.
 */
export async function verifyWebhookSignature(env, request, dataId) {
  if (!env.MP_WEBHOOK_SECRET) return false;

  const sig = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(
    sig.split(',').map(p => p.split('=').map(s => s.trim())).filter(p => p.length === 2)
  );
  const ts = parts.ts, v1 = parts.v1;
  if (!ts || !v1) return false;

  /* Cinco minutos. Um relógio desencontrado de dez segundos passa; uma
     entrega gravada ontem, não. */
  const age = Math.abs(Date.now() - Number(ts) * 1000);
  if (!Number.isFinite(age) || age > 5 * 60_000) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const { hmacHex, timingSafeEqual } = await import('./crypto.js');
  return timingSafeEqual(await hmacHex(env.MP_WEBHOOK_SECRET, manifest), v1.toLowerCase());
}
