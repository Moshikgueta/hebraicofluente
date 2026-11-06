/* "Como foi esta lição?" (worker/src/api/avaliacoes.js, 05/10/2026).
 *
 *   · só quem tem o curso avalia;
 *   · a linha não guarda a conta (anônima);
 *   · nota e lição conferidas, comentário limpo e com teto;
 *   · o dono, com o código, lê o resumo por lição e os comentários.
 */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, grantAccess } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { validar, COMENTARIO_MAX as MAX_SERVIDOR } from '../../worker/src/api/avaliacoes.js';
import { COMENTARIO_MAX } from '@/components/learn/AvaliarLicao';
import { cookieDe, envDeTeste, pedido, comoAdmin } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const DONO = 'dono@exemplo.com';

async function conta(env: Env, email: string, comprou = true) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Ana', email, password: 'senha-boa-123' }), env, ctx
  });
  const cookie = cookieDe(r);
  const { id } = env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(email) as { id: number };
  if (comprou) {
    const order = await createOrder(env, { accountId: id, courseSlug: 'alfabetizacao', amountCents: 14700, method: 'pix' });
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12 });
  }
  return cookie;
}
const chamar = (env: Env, metodo: string, path: string, cookie: string, body?: unknown) =>
  worker.fetch(new Request(`${SITE}${path}`, {
    method: metodo,
    headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  }), env, ctx);

describe('o aluno avalia a lição', () => {
  it('só quem tem o curso, e a linha não guarda a conta', async () => {
    const env = envDeTeste() as Env;
    const ana = await conta(env, 'ana@exemplo.com');
    const visitante = await conta(env, 'bia@exemplo.com', false);
    expect((await chamar(env, 'POST', '/api/avaliacao', visitante, { licao: 'mem', nota: 'ok' })).status).toBe(403);
    expect((await chamar(env, 'POST', '/api/avaliacao', ana, { licao: 'mem', nota: 'dificil', comentario: '  o som\r\n do Mem  ' })).status).toBe(200);
    const linhas = env.DB.bruto.prepare('SELECT * FROM avaliacoes_licao').all() as Record<string, unknown>[];
    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ licao: 'mem', nota: 'dificil', comentario: 'o som\ndo Mem' });
    expect(Object.keys(linhas[0]!).some(k => /account|conta|email/.test(k))).toBe(false);
  });

  it('recusa nota ou lição inválida e comentário longo demais', () => {
    expect(validar({ licao: 'mem', nota: 'otimo' }).erro).toBe('bad-request');
    expect(validar({ licao: '../x', nota: 'ok' }).erro).toBe('bad-request');
    expect(validar({ licao: 'mem', nota: 'ok', comentario: 'a'.repeat(MAX_SERVIDOR + 1) }).erro).toBe('texto-longo');
    expect(validar({ licao: 'som-vet', nota: 'facil' }).ok).toEqual({ licao: 'som-vet', nota: 'facil', comentario: '' });
    expect(COMENTARIO_MAX).toBe(MAX_SERVIDOR);
  });
});

describe('o dono lê', () => {
  it('só o administrador com o código, com o resumo e os comentários', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: DONO }) as Env;
    const ana = await conta(env, 'ana@exemplo.com');
    const soSenha = await conta(env, DONO, false);
    expect((await chamar(env, 'GET', '/api/admin/avaliacoes', ana)).status).toBe(403);
    expect(await (await chamar(env, 'GET', '/api/admin/avaliacoes', soSenha)).json()).toEqual({ error: 'admin-codigo' });
    const dono = await comoAdmin(env, soSenha);

    await chamar(env, 'POST', '/api/avaliacao', ana, { licao: 'mem', nota: 'dificil', comentario: 'confundi com o Nun' });
    await chamar(env, 'POST', '/api/avaliacao', ana, { licao: 'mem', nota: 'ok' });
    await chamar(env, 'POST', '/api/avaliacao', ana, { licao: 'alef', nota: 'facil' });

    const r = await (await chamar(env, 'GET', '/api/admin/avaliacoes', dono)).json() as {
      licoes: Record<string, unknown>[]; comentarios: Record<string, unknown>[];
    };
    expect(r.licoes).toEqual(expect.arrayContaining([
      { licao: 'mem', facil: 0, ok: 1, dificil: 1 },
      { licao: 'alef', facil: 1, ok: 0, dificil: 0 }
    ]));
    expect(r.comentarios.map(c => [c.licao, c.nota, c.comentario])).toEqual([['mem', 'dificil', 'confundi com o Nun']]);
  });
});
