/* O que a proposta de correção do pagamento tem de fazer valer.
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco defeitos confirmados pela auditoria de 20/09/2026, cada um com o
 * cenário que o dispara, contra os handlers reais e o esquema de produção,
 * com uma Mercado Pago de mentira que muda de ideia sobre um pagamento do
 * jeito que a de verdade muda: `pending` hoje, `approved` daqui a pouco,
 * `refunded` na semana que vem - sempre com o MESMO id.
 *
 * No código de hoje estes testes FALHAM. É o esperado, e é a prova. Com
 * audit/pagamento-proposto.patch aplicado, passam.
 *
 *   cd app && npx vitest run --config ../audit/vitest.config.mts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookieDe, envDeTeste, pedido } from '../app/tests/ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../worker/src/api/auth.js';
// @ts-expect-error - idem
import * as pay from '../worker/src/api/pay.js';
// @ts-expect-error - idem
import { runReconcile } from '../worker/src/reconcile.js';
// @ts-expect-error - idem
import { grantAccess, hasEntitlement } from '../worker/src/lib/db.js';
// @ts-expect-error - idem
import { hmacHex } from '../worker/src/lib/crypto.js';

const SITE = 'https://hebraicofluente.com.br';
const SEGREDO = 'segredo-do-webhook-de-teste';
const TOKEN = 'APP_USR-1234567890123456-092019-abcdef0123456789abcdef0123456789-123456789';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };

/* ── a Mercado Pago de mentira ─────────────────────────────────────────── */
type Pagamento = { id: number; status: string; external_reference: string; transaction_amount: number; currency_id: string };
let pagamentos: Map<number, Pagamento>;
let proximoId = 700001;

function mercadoPagoFalsa() {
  pagamentos = new Map();
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    if (u.pathname === '/v1/payments' && init?.method === 'POST') {
      const body = JSON.parse(String(init.body));
      const p: Pagamento = {
        id: proximoId++, status: 'pending', external_reference: body.external_reference,
        transaction_amount: body.transaction_amount, currency_id: 'BRL'
      };
      pagamentos.set(p.id, p);
      return new Response(JSON.stringify({ ...p, point_of_interaction: { transaction_data: { qr_code: '000201-teste' } } }), { status: 201 });
    }
    if (u.pathname === '/v1/payments/search') {
      const ref = u.searchParams.get('external_reference');
      const results = [...pagamentos.values()].filter(p => p.external_reference === ref);
      return new Response(JSON.stringify({ results }), { status: 200 });
    }
    const m = u.pathname.match(/^\/v1\/payments\/(\d+)$/);
    if (m) {
      const p = pagamentos.get(Number(m[1]));
      return p ? new Response(JSON.stringify(p), { status: 200 }) : new Response('{"message":"not found"}', { status: 404 });
    }
    return new Response('{}', { status: 500 });
  });
}

/** Um aviso assinado como a Mercado Pago assina. */
async function avisoAssinado(id: number) {
  const ts = Math.floor(Date.now() / 1000);
  const v1 = await hmacHex(SEGREDO, `id:${id};request-id:req-1;ts:${ts};`);
  return new Request(`${SITE}/api/pay/webhook?data.id=${id}&type=payment`, {
    method: 'POST',
    headers: { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'req-1', 'content-type': 'application/json' },
    body: '{}'
  });
}

const envPagamento = () => envDeTeste({ MP_ACCESS_TOKEN: TOKEN, MP_WEBHOOK_SECRET: SEGREDO });

async function compradora(env: Record<string, unknown>, email = 'compradora@exemplo.com.br') {
  const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`, { name: 'Ana', email, password: 'senha-boa-123' }), env, ctx });
  const body = await r.json() as { account: { id: number } };
  return { cookie: cookieDe(r), id: body.account.id };
}

async function pedidoPix(env: Record<string, unknown>, cookie: string) {
  const r = await pay.create({ request: pedido(`${SITE}/api/pay/create`, { courseSlug: 'alfabetizacao', method: 'pix' }, { Cookie: cookie }), env, ctx });
  expect(r.status).toBe(200);
  return await r.json() as { id: string; status: string };
}

const verify = (env: Record<string, unknown>, cookie: string, id: string) =>
  pay.verify({ request: new Request(`${SITE}/api/pay/verify?order=${id}`, { headers: { Cookie: cookie } }), env });

const linha = (env: Record<string, unknown>, sql: string) =>
  (env.DB as { bruto: { prepare(s: string): { get(): unknown } } }).bruto.prepare(sql).get() as Record<string, unknown> | undefined;

beforeEach(() => { proximoId = 700001; mercadoPagoFalsa(); });
afterEach(() => { vi.unstubAllGlobals(); });

/* ── 1. o pagamento visto pendente tem de poder ser liberado depois ─────── */

describe('1. um PIX visto pendente e aprovado depois libera o curso', () => {
  it('a tela consulta enquanto está pendente, o aviso de aprovação chega, e o acesso abre', async () => {
    const env = envPagamento();
    const { cookie, id } = await compradora(env);
    const ordem = await pedidoPix(env, cookie);

    /* A tela do checkout pergunta três segundos depois do QR aparecer. */
    const antes = await verify(env, cookie, ordem.id);
    expect((await antes.json() as { status: string }).status).toBe('pending');

    /* A compradora paga. O MESMO pagamento muda de status. */
    const p = [...pagamentos.values()][0]!;
    p.status = 'approved';

    const w = await pay.webhook({ request: await avisoAssinado(p.id), env });
    expect(w.status).toBe(200);

    expect(await hasEntitlement(env, id, 'alfabetizacao'), 'o curso não foi liberado').toBe(true);
    expect(linha(env, `SELECT status FROM orders WHERE id = '${ordem.id}'`)!.status).toBe('paid');
  });

  it('o mesmo aviso de aprovação repetido continua não liberando duas vezes', async () => {
    const env = envPagamento();
    const { cookie, id } = await compradora(env);
    const ordem = await pedidoPix(env, cookie);
    const p = [...pagamentos.values()][0]!;
    p.status = 'approved';
    for (let i = 0; i < 3; i++) await pay.webhook({ request: await avisoAssinado(p.id), env });
    expect(await hasEntitlement(env, id, 'alfabetizacao')).toBe(true);
    const grants = (env.DB as { bruto: { prepare(s: string): { all(): unknown[] } } }).bruto
      .prepare("SELECT 1 FROM access_log WHERE action = 'grant'").all();
    expect(grants.length).toBe(1);
    void ordem;
  });

  it('a varredura também consegue, e não conta um no-op como liberação', async () => {
    const env = envPagamento();
    const { cookie, id } = await compradora(env);
    const ordem = await pedidoPix(env, cookie);
    await verify(env, cookie, ordem.id);                       // pendente, registrado
    /* Envelhece o pedido para a varredura olhar para ele. */
    (env.DB as { bruto: { prepare(s: string): { run(): unknown } } }).bruto
      .prepare(`UPDATE orders SET created_at = created_at - 120000, checked_at = NULL WHERE id = '${ordem.id}'`).run();
    const r1 = await runReconcile(env);
    expect(r1.settled, 'contou como liberado sem liberar').toBe(0);
    [...pagamentos.values()][0]!.status = 'approved';
    const r2 = await runReconcile(env);
    expect(r2.settled).toBe(1);
    expect(await hasEntitlement(env, id, 'alfabetizacao')).toBe(true);
  });
});

/* ── 2. estorno fecha a porta ───────────────────────────────────────────── */

describe('2. estorno e chargeback fecham o acesso', () => {
  it.each(['refunded', 'charged_back'])('%s depois de pago revoga e marca o pedido', async (fim) => {
    const env = envPagamento();
    const { cookie, id } = await compradora(env);
    const ordem = await pedidoPix(env, cookie);
    const p = [...pagamentos.values()][0]!;
    p.status = 'approved';
    await pay.webhook({ request: await avisoAssinado(p.id), env });
    expect(await hasEntitlement(env, id, 'alfabetizacao')).toBe(true);

    p.status = fim;
    const w = await pay.webhook({ request: await avisoAssinado(p.id), env });
    expect(w.status).toBe(200);

    expect(await hasEntitlement(env, id, 'alfabetizacao'), 'o acesso sobreviveu ao estorno').toBe(false);
    expect(linha(env, `SELECT status FROM orders WHERE id = '${ordem.id}'`)!.status).toBe('refunded');
    expect(linha(env, "SELECT 1 AS x FROM access_log WHERE action = 'estorno'")).toBeTruthy();
  });
});

/* ── 3. uma liberação que quebrou no meio se recupera ───────────────────── */

describe('3. uma falha no meio da liberação não vira um pedido pago sem curso', () => {
  it('o webhook responde 500 (para a Mercado Pago reenviar) e o reenvio termina o serviço', async () => {
    const env = envPagamento();
    const { cookie, id } = await compradora(env);
    const ordem = await pedidoPix(env, cookie);
    const p = [...pagamentos.values()][0]!;
    p.status = 'approved';

    /* O banco cai exatamente na gravação do direito de acesso, uma vez. */
    const db = env.DB as { prepare(sql: string): unknown };
    const prepareReal = db.prepare.bind(db);
    let derrubar = true;
    db.prepare = (sql: string) => {
      if (derrubar && /INSERT INTO entitlements/i.test(sql)) { derrubar = false; throw new Error('D1 fora do ar'); }
      return prepareReal(sql);
    };

    const w1 = await pay.webhook({ request: await avisoAssinado(p.id), env });
    expect(w1.status, 'uma falha interna respondeu como sucesso').toBe(500);
    expect(await hasEntitlement(env, id, 'alfabetizacao')).toBe(false);

    const w2 = await pay.webhook({ request: await avisoAssinado(p.id), env });
    expect(w2.status).toBe(200);
    expect(await hasEntitlement(env, id, 'alfabetizacao'), 'o reenvio não recuperou').toBe(true);
    expect(linha(env, `SELECT status FROM orders WHERE id = '${ordem.id}'`)!.status).toBe('paid');
  });

  it('um pagamento que não é nosso continua respondendo 200, sem reenvio', async () => {
    const env = envPagamento();
    pagamentos.set(999, { id: 999, status: 'approved', external_reference: 'HF-de-outra-loja', transaction_amount: 1, currency_id: 'BRL' });
    const w = await pay.webhook({ request: await avisoAssinado(999), env });
    expect(w.status).toBe(200);
  });
});

/* ── 4. renovar antes de vencer ─────────────────────────────────────────── */

describe('4. dá para renovar nos últimos 45 dias, e só neles', () => {
  const dia = 86_400_000;
  async function comAcessoVencendoEm(dias: number) {
    const env = envPagamento();
    const { cookie, id } = await compradora(env);
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
    (env.DB as { bruto: { prepare(s: string): { run(): unknown } } }).bruto
      .prepare(`UPDATE entitlements SET expires_at = ${Date.now() + dias * dia} WHERE account_id = ${id}`).run();
    return { env, cookie };
  }
  it('com 10 dias sobrando, o pedido nasce', async () => {
    const { env, cookie } = await comAcessoVencendoEm(10);
    const r = await pay.create({ request: pedido(`${SITE}/api/pay/create`, { courseSlug: 'alfabetizacao', method: 'pix' }, { Cookie: cookie }), env, ctx });
    expect(r.status).toBe(200);
  });
  it('com 200 dias sobrando, continua recusando - e com código próprio', async () => {
    const { env, cookie } = await comAcessoVencendoEm(200);
    const r = await pay.create({ request: pedido(`${SITE}/api/pay/create`, { courseSlug: 'alfabetizacao', method: 'pix' }, { Cookie: cookie }), env, ctx });
    expect(r.status).toBe(409);
    expect((await r.json() as { error: string }).error).toBe('already-owned');
  });
});

/* ── 5. sair de verdade ─────────────────────────────────────────────────── */

describe('5. sair invalida o cookie no servidor', () => {
  it('o cookie antigo não entra mais depois de sair', async () => {
    const env = envPagamento();
    const { cookie } = await compradora(env);
    const me = (c: string) => auth.me({ request: new Request(`${SITE}/api/me`, { headers: { Cookie: c } }), env });
    expect((await me(cookie)).status).toBe(200);
    await auth.logout({ request: new Request(`${SITE}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } }), env });
    expect((await me(cookie)).status, 'o cookie sobreviveu ao logout').toBe(401);
  });
});
