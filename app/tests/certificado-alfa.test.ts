/* O certificado do alfabeto, emitido pelo servidor (03/11/2026).
 * Ver worker/src/api/certificado-alfa.js. */
import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess } from '../../worker/src/lib/db.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const DIA = 86_400_000;

async function aluna(env: Env, pagoHaDias: number | null) {
  const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
    { aceitouTermos: true, declarouIdade: true, name: 'Ana Souza', email: 'ana@exemplo.com', password: 'senha-boa-123' }), env, ctx });
  const cookie = cookieDe(r);
  const id = (env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get('ana@exemplo.com') as { id: number }).id;
  if (pagoHaDias !== null) {
    const o = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: o.id, months: 12 });
    env.DB.bruto.prepare("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?").run(Date.now() - pagoHaDias * DIA, o.id);
  }
  return { cookie, id };
}
const chamar = (env: Env, cookie: string, metodo = 'GET', corpo?: unknown) =>
  worker.fetch(new Request(`${SITE}/api/certificado/alfabetizacao`, {
    method: metodo, headers: { cookie, 'content-type': 'application/json', origin: SITE },
    ...(corpo ? { body: JSON.stringify(corpo) } : {})
  }), env, ctx);
const exame = { best: 0.9, completedAt: '2026-11-01T10:00:00.000Z', passedAt: '2026-11-01T10:00:00.000Z' };
const gravarProgresso = (env: Env, cookie: string, rev = 0) =>
  worker.fetch(new Request(`${SITE}/api/progress`, {
    method: 'PUT', headers: { cookie, 'content-type': 'application/json', origin: SITE },
    body: JSON.stringify({ rev, state: { version: 2, lessons: {}, finalChallenge: exame } })
  }), env, ctx);

describe('o certificado do alfabeto', () => {
  it('sem o curso, não responde', async () => {
    const env = envDeTeste() as Env;
    const { cookie } = await aluna(env, null);
    expect((await chamar(env, cookie)).status).toBe(403);
  });

  it('no prazo de desistência: não emite, e o exame não é gravado', async () => {
    const env = envDeTeste() as Env;
    const { cookie, id } = await aluna(env, 1);
    expect((await gravarProgresso(env, cookie)).status).toBe(200);
    const salvo = JSON.parse((env.DB.bruto.prepare('SELECT state FROM progress WHERE account_id = ?').get(id) as { state: string }).state);
    expect(salvo.finalChallenge.passedAt ?? null).toBeNull();

    const s = await (await chamar(env, cookie)).json() as { situacao: string; abreEm: string };
    expect(s.situacao).toBe('prazo');
    expect(Date.parse(s.abreEm)).toBeGreaterThan(Date.now());
    const r = await chamar(env, cookie, 'POST', { nome: 'Ana Souza' });
    expect(r.status).toBe(403);
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM certificados').get()).toEqual({ n: 0 });
  });

  it('passado o prazo, sem o exame no servidor: falta', async () => {
    const env = envDeTeste() as Env;
    const { cookie } = await aluna(env, 9);
    expect((await (await chamar(env, cookie)).json() as { situacao: string }).situacao).toBe('falta');
    expect((await chamar(env, cookie, 'POST', { nome: 'Ana Souza' })).status).toBe(403);
  });

  it('passado o prazo e com o exame: emite com código, uma vez, e a verificação pública confere', async () => {
    const env = envDeTeste() as Env;
    const { cookie } = await aluna(env, 9);
    expect((await gravarProgresso(env, cookie)).status).toBe(200);
    expect((await (await chamar(env, cookie)).json() as { situacao: string }).situacao).toBe('pode');

    expect((await chamar(env, cookie, 'POST', { nome: '<script>' })).status).toBe(400);
    const r = await chamar(env, cookie, 'POST', { nome: 'Ana Souza' });
    expect(r.status).toBe(201);
    const { certificado } = await r.json() as { certificado: { id: string; nome: string; nota: number } };
    expect(certificado.id).toMatch(/^HF-[A-Z2-9]{8}$/);
    expect(certificado.nome).toBe('Ana Souza');
    expect(certificado.nota).toBe(0.9);

    /* de novo: o mesmo certificado, e o nome não muda */
    const outra = await (await chamar(env, cookie, 'POST', { nome: 'Outro Nome' })).json() as { certificado: { id: string; nome: string } };
    expect(outra.certificado).toMatchObject({ id: certificado.id, nome: 'Ana Souza' });

    const v = await worker.fetch(new Request(`${SITE}/api/certificado?id=${certificado.id}`), env, ctx);
    expect(v.status).toBe(200);
    expect(await v.json()).toMatchObject({ id: certificado.id, nome: 'Ana Souza', curso: 'Alfabetização em Hebraico' });
  });
});
