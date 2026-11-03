/* O exame final, o certificado e as leituras bônus abrem depois do prazo de
 * desistência (03/11/2026, decisão do dono). Ver worker/src/lib/desistencia.js.
 *
 *   · só acesso de pedido PAGO espera; presente e liberação à mão, não;
 *   · no prazo, /api/content vem sem as leituras bônus, e com outro ETag;
 *   · passado o prazo, vem completo;
 *   · o painel de vendas mostra quem desistiu e o que já tinha feito.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido, comoAdmin } from './ajuda/d1';
import { abreDepoisDoPrazo } from '@/lib/account/types';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { content } from '../../worker/src/api/content.js';
// @ts-expect-error - idem
import { createOrder, grantAccess, activeEntitlements, desistivelAte } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { DIAS_ARREPENDIMENTO, prazoDeDesistencia } from '../../worker/src/lib/desistencia.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const DONO = 'dono@exemplo.com';
const DIA = 86_400_000;

async function conta(env: Env, email: string, name = 'X') {
  const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
    { aceitouTermos: true, declarouIdade: true, name, email, password: 'senha-boa-123' }), env, ctx });
  return cookieDe(r);
}
const idDe = (env: Env, email: string) =>
  (env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number }).id;

/** Compra e paga em `pagoEm`; devolve o id do pedido. */
async function comprou(env: Env, id: number, pagoEm: number | null, provider?: string) {
  const o = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
  await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: o.id, months: 12 });
  if (pagoEm !== null) env.DB.bruto.prepare("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?").run(pagoEm, o.id);
  if (provider) env.DB.bruto.prepare('UPDATE orders SET provider = ? WHERE id = ?').run(provider, o.id);
  return o.id as string;
}
const pedirConteudo = (cookie: string) => new Request(`${SITE}/api/content`, { headers: { cookie } });

describe('o prazo de desistência', () => {
  it('é o mesmo número da política em data/empresa.json', () => {
    const empresa = JSON.parse(readFileSync(new URL('../../data/empresa.json', import.meta.url), 'utf8'));
    expect(DIAS_ARREPENDIMENTO).toBe(empresa.politicas.arrependimentoDias);
  });

  it('vai até o fim do sétimo dia no horário de Brasília', () => {
    /* pago 03/11/2026 às 14h32 de Brasília (17h32 UTC) */
    const pago = Date.UTC(2026, 10, 3, 17, 32);
    expect(new Date(prazoDeDesistencia(pago)).toISOString()).toBe('2026-11-11T02:59:59.999Z');
  });
});

describe('quem ainda pode desistir', () => {
  it('pedido pago há pouco: no prazo', async () => {
    const env = envDeTeste() as Env;
    await conta(env, 'ana@exemplo.com');
    const id = idDe(env, 'ana@exemplo.com');
    await comprou(env, id, Date.now());
    const ate = await desistivelAte(env, id, 'alfabetizacao');
    expect(ate).toBeGreaterThan(Date.now() + 6 * DIA);
    expect(ate).toBeLessThan(Date.now() + 9 * DIA);
  });

  it('pedido pago há mais de oito dias: fora do prazo', async () => {
    const env = envDeTeste() as Env;
    await conta(env, 'ana@exemplo.com');
    const id = idDe(env, 'ana@exemplo.com');
    await comprou(env, id, Date.now() - 9 * DIA);
    expect(await desistivelAte(env, id, 'alfabetizacao')).toBeNull();
  });

  it('pelo Paddle o prazo é de catorze dias', async () => {
    const env = envDeTeste() as Env;
    await conta(env, 'ana@exemplo.com');
    const id = idDe(env, 'ana@exemplo.com');
    await comprou(env, id, Date.now() - 10 * DIA, 'paddle');
    expect(await desistivelAte(env, id, 'alfabetizacao')).not.toBeNull();
  });

  it('acesso sem pedido pago (presente, liberação à mão) não espera', async () => {
    const env = envDeTeste() as Env;
    await conta(env, 'ana@exemplo.com');
    const id = idDe(env, 'ana@exemplo.com');
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: 'MANUAL', months: 12 });
    const [e] = await activeEntitlements(env, id);
    expect(e.desistivelAte).toBeNull();
  });
});

describe('/api/content no prazo', () => {
  it('vem sem as leituras bônus, e com outro ETag', async () => {
    const env = envDeTeste() as Env;
    const cookie = await conta(env, 'ana@exemplo.com');
    const id = idDe(env, 'ana@exemplo.com');
    const pedidoId = await comprou(env, id, Date.now());

    const r1 = await content({ request: pedirConteudo(cookie), env, ctx: {} });
    expect(r1.status).toBe(200);
    const c1 = await r1.json() as { bonus: unknown[]; letters: unknown[] };
    expect(c1.bonus).toEqual([]);
    expect(c1.letters.length).toBeGreaterThan(0);

    /* passado o prazo, o mesmo aluno recebe tudo */
    env.DB.bruto.prepare('UPDATE orders SET paid_at = ? WHERE id = ?').run(Date.now() - 9 * DIA, pedidoId);
    const r2 = await content({ request: pedirConteudo(cookie), env, ctx: {} });
    const c2 = await r2.json() as { bonus: unknown[] };
    expect(c2.bonus.length).toBeGreaterThan(0);
    expect(r2.headers.get('etag')).not.toBe(r1.headers.get('etag'));
  });
});

describe('o navegador sabe quando abre', () => {
  const sessao = (desistivelAte: string | null) => ({
    entitlements: [{ courseSlug: 'alfabetizacao', grantedAt: '', expiresAt: null, orderId: 'X', desistivelAte }]
  }) as never;

  it('no prazo: o instante logo depois dele', () => {
    const agora = new Date('2026-11-03T12:00:00Z');
    expect(abreDepoisDoPrazo(sessao('2026-11-11T02:59:59.999Z'), 'alfabetizacao', agora)?.toISOString())
      .toBe('2026-11-11T03:00:00.000Z');
  });

  it('fora do prazo, ou sem prazo: null', () => {
    const agora = new Date('2026-11-20T12:00:00Z');
    expect(abreDepoisDoPrazo(sessao('2026-11-11T02:59:59.999Z'), 'alfabetizacao', agora)).toBeNull();
    expect(abreDepoisDoPrazo(sessao(null), 'alfabetizacao', agora)).toBeNull();
    expect(abreDepoisDoPrazo(null as never)).toBeNull();
  });
});

describe('o painel de vendas mostra quem desistiu', () => {
  it('com a data do pedido e se já tinha feito o exame final', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: DONO }) as Env;
    await conta(env, 'ana@exemplo.com', 'Ana');
    const dono = await comoAdmin(env, await conta(env, DONO));
    const ana = idDe(env, 'ana@exemplo.com');
    const pedidoId = await comprou(env, ana, 2000);
    env.DB.bruto.prepare('INSERT INTO arrependimentos (order_id, account_id, pedido_em) VALUES (?, ?, ?)').run(pedidoId, ana, 9000);
    env.DB.bruto.prepare('INSERT INTO progress (account_id, state, version, rev, updated_at) VALUES (?, ?, 2, 1, ?)')
      .run(ana, JSON.stringify({ version: 2, lessons: {}, finalChallenge: { passedAt: '2026-11-04T10:00:00Z' } }), 8000);

    const r = await worker.fetch(new Request(`${SITE}/api/admin/vendas`, { headers: { cookie: dono } }), env, ctx);
    const { vendas } = await r.json() as { vendas: Record<string, unknown>[] };
    expect(vendas.map(v => [v.nome, v.desistiuEm, v.exameFeito])).toEqual([['Ana', 9000, true]]);
  });
});
