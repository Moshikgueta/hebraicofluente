/* Os estornos que dependem do dono (30/09/2026): o painel /admin/estornos e o
 * "já devolvi o dinheiro". Ver worker/src/api/estornos-admin.js.
 *
 *   · só o administrador, com o código, lista e marca;
 *   · marcar fecha o pedido (refunded), tira os meses do acesso e tira o
 *     pedido do lembrete diário;
 *   · estorno automático em andamento não se marca à mão;
 *   · pedido já estornado pela Mercado Pago sai do lembrete, mesmo com o
 *     estorno ainda "erro" (antes o lembrete não parava nunca).
 */
import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido, comoAdmin } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { estornosAbertos, hasEntitlement } from '../../worker/src/lib/db.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const DONO = 'dono@exemplo.com';
const ANO = 365 * 86_400_000;

async function conta(env: Env, email: string) {
  const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
    { aceitouTermos: true, declarouIdade: true, name: 'X', email, password: 'senha-boa-123' }), env, ctx });
  return cookieDe(r);
}
const idDe = (env: Env, email: string) =>
  (env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number }).id;

/** Uma compra paga, com acesso, e uma desistência cujo estorno está `estado`. */
function compraDesistida(env: Env, accountId: number, orderId: string, estado: string) {
  const agora = Date.now();
  env.DB.bruto.prepare(
    `INSERT INTO orders (id, account_id, course_slug, amount_cents, method, status, provider, created_at, paid_at)
     VALUES (?, ?, 'alfabetizacao', 14700, 'pix', 'paid', 'pix-direto', ?, ?)`
  ).run(orderId, accountId, agora, agora);
  env.DB.bruto.prepare(
    `INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
     VALUES (?, 'alfabetizacao', ?, ?, ?)`
  ).run(accountId, agora, agora + ANO, orderId);
  env.DB.bruto.prepare(
    `INSERT INTO estornos (order_id, estado, criado_em, atualizado_em) VALUES (?, ?, ?, ?)`
  ).run(orderId, estado, agora, agora);
}

const listar = (env: Env, cookie: string) =>
  worker.fetch(new Request(`${SITE}/api/admin/estornos`, { headers: { cookie } }), env, ctx);
const marcar = (env: Env, cookie: string, orderId: string) =>
  worker.fetch(new Request(`${SITE}/api/admin/estornos/feito`, {
    method: 'POST', headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  }), env, ctx);

describe('os estornos que dependem do dono', () => {
  it('só o administrador com o código lista e marca', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: DONO }) as Env;
    const aluno = await conta(env, 'ana@exemplo.com');
    const soSenha = await conta(env, DONO);
    compraDesistida(env, idDe(env, 'ana@exemplo.com'), 'HFteste1', 'manual');
    expect((await listar(env, aluno)).status).toBe(403);
    expect(await (await listar(env, soSenha)).json()).toEqual({ error: 'admin-codigo' });
    expect((await marcar(env, aluno, 'HFteste1')).status).toBe(403);
    expect(env.DB.bruto.prepare("SELECT status FROM orders WHERE id = 'HFteste1'").get()).toEqual({ status: 'paid' });
  });

  it('"já devolvi" fecha o pedido, o acesso e o lembrete', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: DONO }) as Env;
    await conta(env, 'ana@exemplo.com');
    const dono = await comoAdmin(env, await conta(env, DONO));
    const ana = idDe(env, 'ana@exemplo.com');
    compraDesistida(env, ana, 'HFteste2', 'manual');

    const lista = await (await listar(env, dono)).json() as { estornos: { orderId: string; email: string; estado: string }[] };
    expect(lista.estornos).toMatchObject([{ orderId: 'HFteste2', email: 'ana@exemplo.com', estado: 'manual' }]);
    expect(await hasEntitlement(env, ana, 'alfabetizacao')).toBe(true);

    expect((await marcar(env, dono, 'HFteste2')).status).toBe(200);
    expect(env.DB.bruto.prepare("SELECT status FROM orders WHERE id = 'HFteste2'").get()).toEqual({ status: 'refunded' });
    expect(env.DB.bruto.prepare("SELECT estado FROM estornos WHERE order_id = 'HFteste2'").get()).toEqual({ estado: 'concluido' });
    expect(await hasEntitlement(env, ana, 'alfabetizacao')).toBe(false);
    expect(await estornosAbertos(env)).toEqual([]);
    /* Na trilha, e marcar de novo não faz mal. */
    expect(env.DB.bruto.prepare("SELECT COUNT(*) AS n FROM access_log WHERE action = 'estorno-manual-feito'").get()).toEqual({ n: 1 });
    expect(await (await marcar(env, dono, 'HFteste2')).json()).toEqual({ ok: true, jaEstava: true });
  });

  it('estorno automático em andamento não se marca à mão', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: DONO }) as Env;
    await conta(env, 'ana@exemplo.com');
    const dono = await comoAdmin(env, await conta(env, DONO));
    compraDesistida(env, idDe(env, 'ana@exemplo.com'), 'HFteste3', 'pedido');
    const r = await marcar(env, dono, 'HFteste3');
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({ error: 'automatico' });
    expect(env.DB.bruto.prepare("SELECT status FROM orders WHERE id = 'HFteste3'").get()).toEqual({ status: 'paid' });
    expect((await marcar(env, dono, 'nao existe!')).status).toBe(400);
    expect((await marcar(env, dono, 'HFnenhum')).status).toBe(404);
  });

  it('pedido já estornado pela Mercado Pago sai do lembrete, mesmo com o estorno em "erro"', async () => {
    const env = envDeTeste() as Env;
    await conta(env, 'ana@exemplo.com');
    compraDesistida(env, idDe(env, 'ana@exemplo.com'), 'HFteste4', 'erro');
    expect(await estornosAbertos(env)).toHaveLength(1);
    env.DB.bruto.exec("UPDATE orders SET status = 'refunded' WHERE id = 'HFteste4'");
    expect(await estornosAbertos(env)).toEqual([]);
  });
});
