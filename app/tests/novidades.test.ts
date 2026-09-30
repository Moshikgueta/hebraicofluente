/* A lista do aviso do próximo curso (auditoria de 28/09/2026, LEGAL-019).
 * Entra só quem marca; sai pela caixa, pelo link assinado do e-mail ou
 * apagando a conta; e o link não serve para tirar outra pessoa. */

import { describe, expect, it } from 'vitest';
import { envDeTeste, pedido, cookieDe } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import * as novidades from '../../worker/src/api/novidades.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: () => {} };
type Env = Record<string, unknown>;
const naLista = (env: Env, id: number) =>
  !!(env.DB as { bruto: { prepare(s: string): { get(...a: unknown[]): unknown } } })
    .bruto.prepare('SELECT 1 AS x FROM novidades WHERE account_id = ?').get(id);

async function conta(env: Env, email: string) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, name: 'Ana', email, password: 'senha-da-ana-1' }), env, ctx
  });
  expect(r.status).toBe(200);
  const cookie = cookieDe(r);
  const me = await (await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie }), env })).json();
  return { cookie, id: Number(me.account.id), me };
}

const marcar = (env: Env, cookie: string, quero: unknown) =>
  novidades.marcar({ request: pedido(`${SITE}/api/novidades`, { quero }, { cookie }), env });
const sair = (env: Env, t: string) =>
  novidades.sair({ request: pedido(`${SITE}/api/novidades/sair`, { t }), env });

describe('a lista do aviso do próximo curso', () => {
  it('ninguém nasce na lista; entra pela caixa e aparece na sessão', async () => {
    const env = envDeTeste();
    const { cookie, id, me } = await conta(env, 'ana@exemplo.com.br');
    expect(me.account.novidades).toBe(false);
    expect(naLista(env, id)).toBe(false);

    expect((await marcar(env, cookie, true)).status).toBe(200);
    expect(naLista(env, id)).toBe(true);
    const depois = await (await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie }), env })).json();
    expect(depois.account.novidades).toBe(true);

    expect((await marcar(env, cookie, false)).status).toBe(200);
    expect(naLista(env, id)).toBe(false);
  });

  it('sem sessão não marca, e só aceita true ou false', async () => {
    const env = envDeTeste();
    const { cookie } = await conta(env, 'bia@exemplo.com.br');
    expect((await marcar(env, '', true)).status).toBe(401);
    expect((await marcar(env, cookie, 'sim')).status).toBe(400);
  });

  it('o link do e-mail tira da lista sem login; adulterado, não tira ninguém', async () => {
    const env = envDeTeste();
    const a = await conta(env, 'cris@exemplo.com.br');
    const b = await conta(env, 'davi@exemplo.com.br');
    await marcar(env, a.cookie, true);
    await marcar(env, b.cookie, true);

    const link: string = await novidades.linkDeSaida(env, a.id);
    expect(link.startsWith(`${SITE}/sair-da-lista/?t=`)).toBe(true);
    const tA = decodeURIComponent(link.split('?t=')[1]!);

    /* A assinatura de A com o id de B: não tira B. */
    const forjado = `${b.id}.${tA.split('.')[1]!}`;
    expect((await sair(env, forjado)).status).toBe(400);
    expect((await sair(env, 'lixo')).status).toBe(400);
    expect(naLista(env, b.id)).toBe(true);

    expect((await sair(env, tA)).status).toBe(200);
    expect(naLista(env, a.id)).toBe(false);
    expect(naLista(env, b.id)).toBe(true);
    /* Clicar de novo não é erro. */
    expect((await sair(env, tA)).status).toBe(200);
  });

  it('apagar a conta tira da lista', async () => {
    const env = envDeTeste();
    const { cookie, id } = await conta(env, 'eva@exemplo.com.br');
    await marcar(env, cookie, true);
    const r = await auth.apagar({
      request: pedido(`${SITE}/api/auth/delete`, { password: 'senha-da-ana-1' }, { cookie }), env, ctx
    });
    expect(r.status).toBe(200);
    expect(naLista(env, id)).toBe(false);
  });
});
