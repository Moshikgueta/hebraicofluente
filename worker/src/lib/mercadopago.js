/* Mercado Pago.
 * ─────────────────────────────────────────────────────────────────────────
 * Dois caminhos, porque são dois produtos diferentes lá dentro:
 *
 *   PIX    → API de pagamentos (`POST /v1/payments`). Volta na hora com o
 *            copia-e-cola e o QR; o comprador nunca sai da nossa página.
 *   CARTÃO → Checkout Pro (`POST /checkout/preferences`). O comprador vai
 *            para a tela da Mercado Pago, digita o cartão lá e volta. É por
 *            isso que esta plataforma nunca vê um número de cartão - e não
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
 * está na credencial - pedir que alguém declare o modo num segundo lugar é
 * criar a chance de os dois discordarem.
 *
 * E a discordância é cara nos dois sentidos:
 *
 *   · token de PRODUÇÃO com modo de teste → o comprador é mandado para um
 *     checkout que NÃO COBRA. O pedido nunca compensa, ninguém reclama
 *     (afinal não pagaram), e a falha pode passar semanas despercebida -
 *     semanas de vendas perdidas sem nenhum sintoma;
 *   · token de TESTE com modo de produção → o checkout recusa tudo, o que ao
 *     menos aparece na hora.
 *
 * Derivando do token, nenhum dos dois pode acontecer. `MP_SANDBOX` no
 * wrangler.toml só é consultado quando o prefixo é desconhecido, e o padrão
 * nesse caso é o modo que não cobra: diante da dúvida, não tirar dinheiro de
 * ninguém.
 */
/**
 * O token, limpo.
 *
 * Um segredo colado num formulário chega com espaço na ponta e, às vezes, com
 * quebra de linha. Nenhum dos dois é visível para quem colou, os dois viajam
 * dentro do cabeçalho `Authorization`, e o servidor do outro lado responde com
 * algo que não menciona espaço nenhum. É barato aparar aqui.
 */
const token = env => String((env && env.MP_ACCESS_TOKEN) || '').trim();

export function isSandbox(env) {
  const t = token(env);
  if (t.startsWith('TEST-')) return true;
  if (t.startsWith('APP_USR-')) return false;
  return !env || env.MP_SANDBOX !== '0';
}

/**
 * QUE credencial é essa? Sem revelá-la.
 * ─────────────────────────────────────────────────────────────────────────
 * A Mercado Pago entrega DOIS valores por aplicação, e os dois começam com
 * `APP_USR-`: a Public Key e o Access Token. Só o segundo serve para chamar a
 * API do servidor. Colar o primeiro produz um 401 cuja mensagem
 * ("authorization value not present") não faz a menor alusão ao erro real, e
 * a pessoa vai conferir chave PIX, webhook e conta bancária antes de
 * desconfiar do campo que copiou.
 *
 * As formas são distinguíveis:
 *   Public Key    APP_USR-<8>-<4>-<4>-<4>-<12>   hexadecimal, como um UUID
 *   Access Token  APP_USR-<dígitos>-<data>-<hex>-<dígitos>
 *
 * Devolve só o NOME da forma - nunca um pedaço do valor. Isto sai em
 * /api/health, que é público.
 */
export function tokenFormato(env) {
  const t = token(env);
  if (!t) return 'ausente';
  const corpo = t.replace(/^(TEST|APP_USR)-/, '');
  if (t === corpo) return 'formato-desconhecido';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(corpo)) {
    return 'chave-publica';
  }
  if (/^\d+-\d+-[0-9a-f]+-\d+$/i.test(corpo)) return 'access-token';
  return 'formato-desconhecido';
}

/**
 * De QUEM é essa credencial? Sem dizer de quem.
 * ─────────────────────────────────────────────────────────────────────────
 * `tokenFormato` responde QUE credencial foi colada. Esta responde a outra
 * pergunta, que custou uma rodada de depuração para aparecer: a conta dona da
 * credencial consegue receber dinheiro de verdade de um comprador brasileiro?
 *
 * O prefixo não basta. Os usuários de teste que a Mercado Pago cria no painel
 * de desenvolvedor têm credenciais que começam com `APP_USR-` igualzinho às de
 * produção - então `isSandbox` diz "produção", o checkout manda o comprador
 * para o `init_point` real, e lá ele encontra:
 *
 *   Uma das partes com as quais você está tentando efetuar o pagamento
 *   é de teste.
 *
 * Do lado de cá nada parece errado. A única coisa que distingue as duas contas
 * é PERGUNTAR à Mercado Pago de quem é o token, e é isso que esta função faz.
 *
 * Os veredictos:
 *
 *   real             a conta é uma conta comum, no Brasil. Pode cobrar.
 *   usuario-de-teste a conta é um usuário de teste. Comprador real é recusado.
 *   outro-pais       conta de outro país: `site_id` diferente de MLB, e uma
 *                    cobrança em BRL não vai completar.
 *   recusado         a Mercado Pago respondeu 401/403 - token revogado, ou a
 *                    Public Key colada no lugar do Access Token.
 *   indisponivel     não deu para perguntar agora (rede, 5xx). NÃO é um
 *                    diagnóstico; é a ausência de um.
 *   desligado        não há token nenhum, que é um estado legítimo.
 *
 * Sai em /api/health, que é público, então **só o veredicto viaja** - nunca o
 * apelido, nunca o e-mail, nunca o id da conta. Saber que o vendedor é real
 * não ajuda ninguém a entrar em lugar nenhum; saber o e-mail dele, talvez.
 */
let vendedorLembrado = { chave: '', verdito: '', ate: 0 };

export async function vendedorFormato(env) {
  const t = token(env);
  if (!t) return 'desligado';

  /* A chave do cache é uma IMPRESSÃO do token, não o token: o veredicto é
     guardado fora do tempo de vida da requisição, e não há motivo para uma
     segunda cópia do segredo morar lá. Trocar o token muda a impressão e o
     veredicto velho deixa de casar sozinho. */
  const chave = `${t.length}:${t.slice(-6)}`;
  const agora = Date.now();
  if (vendedorLembrado.chave === chave && vendedorLembrado.ate > agora) {
    return vendedorLembrado.verdito;
  }

  let verdito;
  /* Com prazo. Este campo é um diagnóstico dentro de um endpoint de SAÚDE, e
     um diagnóstico que pendura a saúde é pior do que nenhum: quem consulta
     /api/health durante uma publicação precisa de resposta, não de uma espera
     por um servidor de terceiro. Passados três segundos, `indisponivel`. */
  const prazoDaPergunta = AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined;
  try {
    const eu = await call(env, '/users/me', { signal: prazoDaPergunta });
    const apelido = String((eu && eu.nickname) || '');
    const correio = String((eu && eu.email) || '');
    const pais = String((eu && eu.site_id) || '');
    /* As duas marcas de um usuário de teste, e basta uma: o apelido que a
       Mercado Pago gera (`TESTUSER83610294`) e o domínio do e-mail que ela
       inventa para ele. */
    if (/^TESTUSER/i.test(apelido) || /@testuser\.com$/i.test(correio)) {
      verdito = 'usuario-de-teste';
    } else if (pais && pais !== 'MLB') {
      verdito = 'outro-pais';
    } else {
      verdito = 'real';
    }
  } catch (e) {
    const status = e && e.status;
    verdito = (status === 401 || status === 403) ? 'recusado' : 'indisponivel';
  }

  /* Dez minutos para um veredicto, meio minuto para a falta de um: guardar
     `indisponivel` pelo prazo cheio transformaria uma oscilação de rede em dez
     minutos de saúde dizendo que não sabe. */
  const prazo = verdito === 'indisponivel' ? 30_000 : 10 * 60_000;
  vendedorLembrado = { chave, verdito, ate: agora + prazo };
  return verdito;
}

/** Só para os ensaios: o cache vive no módulo e atravessaria um caso para o
 *  seguinte. Em produção ele se dissolve sozinho, porque trocar um segredo no
 *  painel da Cloudflare reinicia o Worker. */
export function esquecerVendedor() {
  vendedorLembrado = { chave: '', verdito: '', ate: 0 };
}

async function call(env, path, { method = 'GET', body, idempotencyKey, signal } = {}) {
  const headers = {
    'Authorization': `Bearer ${token(env)}`,
    'Content-Type': 'application/json'
  };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

  const res = await fetch(API + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined, signal
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
      description: `${course.titlePt} - Hebraico Fluente`,
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

/** Um instante em ISO 8601 no horário de Brasília: 2026-09-29T21:30:00.000-03:00. */
export const comFusoBR = ms => new Date(ms - 3 * 3_600_000).toISOString().replace('Z', '-03:00');

export async function createCardPreference(env, { order, course, account, origin }) {
  const pref = await call(env, '/checkout/preferences', {
    method: 'POST',
    idempotencyKey: order.id,
    body: {
      items: [{
        id: course.slug,
        title: `${course.titlePt} - Hebraico Fluente`,
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
         são acreditados por ninguém - ver ObrigadoClient.tsx. */
      back_urls: {
        success: `${origin}/checkout/${course.slug}/obrigado/?order=${order.id}`,
        pending: `${origin}/checkout/${course.slug}/obrigado/?order=${order.id}`,
        failure: `${origin}/checkout/${course.slug}/obrigado/?order=${order.id}`
      },
      auto_return: 'approved',
      payment_methods: {
        /* PIX sai daqui: quem quer PIX usa o caminho de cima, que mostra o
           código na nossa própria tela. Boleto também sai - três dias de
           espera com o aluno achando que já comprou gera mais suporte do que
           venda. */
        excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }],
        installments: Number(order.installments) || 1
      },
      statement_descriptor: 'HEBRAICOFLUENTE',
      /* O link morre uma hora ANTES de o pedido expirar aqui (24 h, ver
         reconcile.js). Sem prazo, dava para pagar o link de ontem num pedido
         que a varredura e a tela já não consultavam mais (auditoria de 28/09,
         PAY-005). Horário de Brasília com o fuso escrito, como na
         documentação da Mercado Pago. */
      expires: true,
      expiration_date_to: comFusoBR(Number(order.created_at || Date.now()) + 23 * 3_600_000)
    }
  });

  return {
    preferenceId: String(pref.id),
    /* `sandbox_init_point` só existe em conta de teste, e usá-lo em produção
       manda o comprador para um checkout que não cobra. Quem decide é o
       prefixo do token - ver `isSandbox` no topo do arquivo. */
    payUrl: isSandbox(env) ? (pref.sandbox_init_point || pref.init_point) : pref.init_point
  };
}

/* ── consulta ───────────────────────────────────────────────────────────── */

export const getPayment = (env, paymentId) => {
  /* O id entra no CAMINHO da URL. Sem isto, `../../outra-rota` no lugar de
     um número viraria uma chamada a outro endpoint deles, com o nosso token.
     A assinatura do webhook já barra isso antes; esta linha é para o dia em
     que a assinatura não for a única coisa no caminho. */
  const id = String(paymentId);
  if (!/^\d{1,24}$/.test(id)) throw new Error('id de pagamento fora do formato');
  return call(env, `/v1/payments/${encodeURIComponent(id)}`);
};

/* ── avisos que não são de pagamento ─────────────────────────────────────
   Uma contestação (chargeback) ou um pedido do Checkout Pro chegam com o id
   DELES, não o do pagamento. Estas duas consultas levam do aviso aos
   pagamentos, e daí tudo segue pelo caminho de sempre (settleFromPaymentId). */

const idNumerico = id => {
  const s = String(id);
  if (!/^\d{1,24}$/.test(s)) throw new Error('id fora do formato');
  return encodeURIComponent(s);
};

/** Os ids de pagamento de uma contestação. */
export async function paymentsOfChargeback(env, chargebackId) {
  const c = await call(env, `/v1/chargebacks/${idNumerico(chargebackId)}`);
  return (c && Array.isArray(c.payments) ? c.payments : []).map(p => String(p && p.id || p));
}

/** Os ids de pagamento de um pedido (merchant order) do Checkout Pro. */
export async function paymentsOfMerchantOrder(env, merchantOrderId) {
  const m = await call(env, `/merchant_orders/${idNumerico(merchantOrderId)}`);
  return (m && Array.isArray(m.payments) ? m.payments : []).map(p => String(p && p.id));
}

/* ── estorno ────────────────────────────────────────────────────────────── */

/**
 * Pede o estorno TOTAL de um pagamento (desistência em sete dias).
 *
 * Corpo vazio = devolve tudo. A chave de idempotência é fixa por pedido de
 * compra (`estorno-<pedido>`): se a varredura repetir a chamada depois de uma
 * resposta perdida, a Mercado Pago devolve o mesmo estorno em vez de fazer
 * outro. Quem fecha o acesso não é esta função: é `applyPayment`, quando o
 * pagamento aparece `refunded`.
 */
export const refundPayment = (env, paymentId, idempotencyKey) => {
  const id = String(paymentId);
  if (!/^\d{1,24}$/.test(id)) throw new Error('id de pagamento fora do formato');
  return call(env, `/v1/payments/${encodeURIComponent(id)}/refunds`, {
    method: 'POST', body: {}, idempotencyKey
  });
};

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
 * O manifesto é fixo - `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` - e
 * assinado em HMAC-SHA256 com o segredo do webhook. `ts` entra no manifesto
 * justamente para que uma entrega gravada não possa ser reenviada por outra
 * pessoa depois; a janela de tolerância abaixo é o que transforma isso em
 * proteção de verdade.
 *
 * Sem MP_WEBHOOK_SECRET configurado a resposta é `false`, e não "deixa
 * passar". Um webhook não verificado é uma rota pública que concede acesso.
 */
export async function verifyWebhookSignature(env, request, dataId, out = {}) {
  /* Aparado, pela mesma razão do Access Token lá em cima: este valor é
     COLADO de um painel para outro, e colar traz espaço na ponta e às vezes
     quebra de linha. Nenhum dos dois é visível para quem colou, e o efeito
     aqui é pior do que um 401 na hora: a assinatura passa a não conferir
     NUNCA, toda notificação legítima da Mercado Pago é recusada, e o sintoma
     é "paguei e não liberou" dias depois - com o segredo certo, à vista, nos
     dois lados. */
  const segredo = String((env && env.MP_WEBHOOK_SECRET) || '').trim();
  /* `out.motivo` diz POR QUE recusou, para a trilha: "assinatura errada"
     sozinho não separa um segredo trocado de um relógio fora da janela, e os
     dois pedem consertos diferentes (28/09/2026). */
  if (!segredo) { out.motivo = 'sem-segredo'; return false; }

  const sig = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(
    sig.split(',').map(p => p.split('=').map(s => s.trim())).filter(p => p.length === 2)
  );
  const ts = parts.ts, v1 = parts.v1;
  if (!ts || !v1) { out.motivo = 'sem-assinatura'; return false; }

  /* Cinco minutos. Um relógio desencontrado de dez segundos passa; uma
     entrega gravada ontem, não. */
  /* Em segundos, como na documentação, ou em milissegundos, como a Mercado
     Pago também manda: lido em segundos, um `ts` de 13 dígitos parecia vir
     de milhares de anos no futuro e todo aviso era recusado. */
  const tsMs = /^\d{13,}$/.test(ts) ? Number(ts) : Number(ts) * 1000;
  const age = Math.abs(Date.now() - tsMs);
  if (!Number.isFinite(age) || age > 5 * 60_000) { out.motivo = `fora-da-janela ts=${ts}`; return false; }

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const { hmacHex, timingSafeEqual } = await import('./crypto.js');
  const ok = timingSafeEqual(await hmacHex(segredo, manifest), v1.toLowerCase());
  if (!ok) out.motivo = 'hmac-diferente';
  return ok;
}
