/* Paddle Billing: o pagamento do site em inglês (PLANO-INGLES.md, etapa 5).
 * ─────────────────────────────────────────────────────────────────────────
 * O Paddle vende como "merchant of record": ele é o vendedor para o
 * comprador, cobra o imposto de cada país e repassa o resto. Para nós, ele
 * faz o papel que a Mercado Pago faz no site brasileiro, e por isso este
 * arquivo tem o mesmo formato que lib/mercadopago.js: criar a cobrança,
 * consultar, devolver o dinheiro, conferir o aviso.
 *
 * E entrega a cobrança no MESMO formato que applyPayment (api/pay.js) já lê:
 * `pagamentoDe` traduz uma transação do Paddle para os campos da Mercado
 * Pago (id, status, transaction_amount, transaction_amount_refunded,
 * currency_id, external_reference). A liberação continua sendo UMA função,
 * com as mesmas travas: evento repetido, pedido já pago, valor a menor,
 * moeda diferente.
 *
 * Os segredos (painel da Cloudflare, nunca no wrangler.toml):
 *   PADDLE_API_KEY         a chave da API (pdl_live_apikey_... ou pdl_sdbx_apikey_...)
 *   PADDLE_WEBHOOK_SECRET  o segredo do destino de notificações (pdl_ntfset_...)
 * E uma variável pública:
 *   PADDLE_CLIENT_TOKEN    o token do Paddle.js (live_... ou test_...), que o
 *                          checkout recebe junto com a transação.
 * O ambiente (sandbox ou produção) sai do prefixo da chave: a chave de um não
 * funciona no outro, então não há como os dois discordarem.
 */

const API_PRODUCAO = 'https://api.paddle.com';
const API_SANDBOX = 'https://sandbox-api.paddle.com';

const chave = env => String((env && env.PADDLE_API_KEY) || '').trim();

/** A chave é de sandbox? `pdl_sdbx_` nas chaves novas. */
export const ehSandbox = env => /^pdl_sdbx_/.test(chave(env));

/** O Paddle está ligado nesta implantação? Sem a chave não se cria pedido. */
export const paddlePronto = env => !!chave(env);

/** O token do Paddle.js combina com a chave? `test_` só abre o sandbox e
 *  `live_` só a produção: trocados, o checkout abre e recusa todo cartão. */
export function tokenDoCliente(env) {
  const t = String((env && env.PADDLE_CLIENT_TOKEN) || '').trim();
  if (!t) return null;
  if (ehSandbox(env) ? !t.startsWith('test_') : !t.startsWith('live_')) return null;
  return t;
}

async function call(env, path, { method = 'GET', body, signal } = {}) {
  const res = await fetch((ehSandbox(env) ? API_SANDBOX : API_PRODUCAO) + path, {
    method,
    headers: { 'Authorization': `Bearer ${chave(env)}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal
  });
  let data = null;
  try { data = await res.json(); } catch { /* resposta vazia */ }
  if (!res.ok) {
    /* O motivo vem em `error.code` ("transaction_default_checkout_url_not_set",
       "not_found"...): é ele que vai para a trilha, como na Mercado Pago. */
    const err = new Error(`paddle ${res.status}`);
    err.status = res.status;
    err.data = data && data.error ? { code: data.error.code, detail: data.error.detail } : data;
    throw err;
  }
  return data && data.data;
}

/**
 * A transação do pedido. O preço vai DENTRO dela (preço e produto "fora do
 * catálogo" do Paddle), calculado do nosso catálogo: assim o valor cobrado
 * nunca depende de alguém ter cadastrado o preço certo no painel deles, e
 * data/courses.json continua sendo o único lugar do preço.
 *
 * `custom_data.order_id` é o fio que liga a transação ao pedido, como o
 * `external_reference` da Mercado Pago.
 *
 * O Paddle só cria a transação se o painel tiver um "default payment link"
 * (Checkout > Checkout settings) num domínio aprovado. Sem ele, a resposta é
 * `transaction_default_checkout_url_not_set`, e a trilha diz isso.
 */
export async function criarTransacao(env, { order, course, account }) {
  const nome = course.titleEn || course.titlePt || course.slug;
  return call(env, '/transactions', {
    method: 'POST',
    body: {
      items: [{
        quantity: 1,
        price: {
          description: `${nome} (${course.accessMonths || 12} months of access)`,
          name: nome,
          unit_price: { amount: String(order.amount_cents), currency_code: order.currency },
          /* O preço anunciado é o preço pago: o imposto vai DENTRO dele. */
          tax_mode: 'internal',
          product: { name: nome, tax_category: 'standard' }
        }
      }],
      custom_data: { order_id: order.id, account_id: String(account.id) },
      collection_mode: 'automatic'
    }
  });
}

/** A transação, com os ajustes (estornos e contestações) junto. */
export const buscarTransacao = (env, id) =>
  call(env, `/transactions/${encodeURIComponent(id)}?include=adjustments`);

/** Pede ao Paddle o estorno total da transação. Ele aprova (quase sempre
 *  sozinho) e avisa por `adjustment.updated`; é aí que o acesso fecha. */
export const estornarTransacao = (env, transactionId, motivo = 'Customer withdrew from the purchase') =>
  call(env, '/adjustments', {
    method: 'POST',
    body: { action: 'refund', type: 'full', transaction_id: transactionId, reason: motivo }
  });

/** Um id de transação do Paddle. Qualquer outra coisa não vai para a URL. */
export const idDeTransacao = id => /^txn_[a-z0-9]{10,40}$/.test(String(id || ''));

/* Em centavos, sempre: o Paddle manda valores como texto na menor unidade. */
const centavos = v => Math.round(Number(v || 0));

/**
 * Uma transação do Paddle no vocabulário que applyPayment lê.
 * ─────────────────────────────────────────────────────────────────────────
 * O status sai no vocabulário da MERCADO PAGO de propósito: é o que
 * `mapStatus` (lib/mercadopago.js) entende, e é ele quem decide o que é
 * pago. Fechado: um status novo do Paddle vira `pending`, nunca `approved`.
 *
 *   completed, paid            → approved   (o dinheiro entrou)
 *   draft, ready, billed       → pending
 *   past_due                   → pending
 *   canceled                   → cancelled
 *   estorno total aprovado     → refunded
 *   contestação aprovada       → charged_back
 *
 * O estorno PARCIAL não muda o status: sai em `transaction_amount_refunded`,
 * e applyPayment fecha o acesso quando o que sobra é menos que o preço, a
 * mesma regra da Mercado Pago.
 */
export function pagamentoDe(txn) {
  const totais = (txn && txn.details && txn.details.totals) || {};
  const pago = centavos(totais.grand_total ?? totais.total);
  const ajustes = Array.isArray(txn && txn.adjustments) ? txn.adjustments : [];
  const aprovados = ajustes.filter(a => a && a.status === 'approved');
  const devolvido = aprovados
    .filter(a => a.action === 'refund' || a.action === 'chargeback' || a.action === 'chargeback_warning')
    .reduce((s, a) => s + centavos(a.totals && a.totals.total), 0);
  const contestado = aprovados.some(a => a.action === 'chargeback');

  let status;
  switch (txn && txn.status) {
    case 'completed': case 'paid':              status = 'approved'; break;
    case 'canceled':                            status = 'cancelled'; break;
    default:                                    status = 'pending';
  }
  if (status === 'approved' && pago > 0 && devolvido >= pago) status = contestado ? 'charged_back' : 'refunded';

  return {
    id: String(txn && txn.id || ''),
    status,
    transaction_amount: pago / 100,
    transaction_amount_refunded: devolvido / 100,
    currency_id: String(txn && txn.currency_code || ''),
    external_reference: (txn && txn.custom_data && txn.custom_data.order_id) || null
  };
}

/**
 * Confere o cabeçalho `Paddle-Signature: ts=...;h1=...`.
 * ─────────────────────────────────────────────────────────────────────────
 * O Paddle assina `${ts}:${corpo cru}` com HMAC-SHA256 e o segredo do destino.
 * O corpo tem de ser o CRU, byte por byte: reler o JSON e serializar de novo
 * muda espaços e ordem, e a assinatura nunca confere. Por isso quem chama lê
 * `request.text()` e passa aqui antes de interpretar.
 *
 * Sem PADDLE_WEBHOOK_SECRET a resposta é `false`, nunca "deixa passar": um
 * aviso não verificado é uma rota pública que concede acesso.
 */
export async function conferirAssinatura(env, request, corpo, out = {}) {
  const segredo = String((env && env.PADDLE_WEBHOOK_SECRET) || '').trim();
  if (!segredo) { out.motivo = 'sem-segredo'; return false; }

  const partes = Object.fromEntries(
    String(request.headers.get('paddle-signature') || '')
      .split(';').map(p => p.split('=').map(s => s.trim())).filter(p => p.length === 2)
  );
  /* O Paddle pode mandar mais de um h1 durante a troca de segredo; aqui vale
     o primeiro, que é o do segredo atual. */
  const ts = partes.ts, h1 = partes.h1;
  if (!ts || !h1) { out.motivo = 'sem-assinatura'; return false; }

  const idade = Math.abs(Date.now() - Number(ts) * 1000);
  if (!Number.isFinite(idade) || idade > 5 * 60_000) { out.motivo = `fora-da-janela ts=${ts}`; return false; }

  const { hmacHex, timingSafeEqual } = await import('./crypto.js');
  const ok = timingSafeEqual(await hmacHex(segredo, `${ts}:${corpo}`), h1.toLowerCase());
  if (!ok) out.motivo = 'hmac-diferente';
  return ok;
}
