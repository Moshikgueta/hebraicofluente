/* O A1 é outro curso, com outro direito de acesso (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Até o A1, o portão e a rota de conteúdo conferiam um curso só, o alfabeto,
 * escrito à mão nos dois arquivos. Com dois cursos, o erro que custa dinheiro
 * é um curso abrir o outro. Aqui se prova, nos dois sentidos:
 *   · quem comprou só o alfabeto não abre /a1 nem baixa o conteúdo do A1;
 *   · quem comprou só o A1 não abre as rotas do alfabeto nem o conteúdo dele;
 *   · os clipes de áudio (/audio) servem a quem tem qualquer um dos dois,
 *     porque a mesma palavra é a mesma gravação nos dois cursos. */

import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { gate, cursoDaRota, isGatedPath } from '../../worker/src/gate.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { content } from '../../worker/src/api/content.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { contentA1, conteudoA1Bruto } from '../../worker/src/api/content-a1.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { grantAccess } from '../../worker/src/lib/db.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };

async function comConta(env: Record<string, unknown>, cursos: string[]) {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com.br', password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  const { account } = await r.json() as { account: { id: number } };
  for (const c of cursos) {
    await grantAccess(env, { accountId: account.id, courseSlug: c, orderId: `T-${c}`, months: 12 });
  }
  return cookieDe(r);
}

const porta = (env: Record<string, unknown>, cookie: string, caminho: string) =>
  gate(new Request(`${SITE}${caminho}`, { headers: { Cookie: cookie } }), env);

const pedirA1 = (cookie?: string) =>
  new Request(`${SITE}/api/content/a1`, cookie ? { headers: { cookie } } : undefined);
const pedirAlfabeto = (cookie?: string) =>
  new Request(`${SITE}/api/content`, cookie ? { headers: { cookie } } : undefined);

describe('cada rota sabe de que curso é', () => {
  it('o A1 tem prefixo próprio, protegido como o resto', () => {
    expect(isGatedPath('/a1')).toBe(true);
    expect(isGatedPath('/a1/unidade/1/')).toBe(true);
    expect(isGatedPath('/A1/Unidade/1')).toBe(true);
    expect(isGatedPath('/a10')).toBe(false);
    expect(cursoDaRota('/a1/unidade/1/')).toBe('hebraico-a1');
    expect(cursoDaRota('/licao/alef/')).toBe('alfabetizacao');
    expect(cursoDaRota('/audio/he-12345678.mp3')).toBeNull();
  });
});

describe('o portão não deixa um curso abrir o outro', () => {
  it('quem comprou só o alfabeto não abre o A1, e vai para a página de vendas do A1', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['alfabetizacao']);
    expect(await porta(env, cookie, '/licao/alef/')).toBeNull();
    const r = await porta(env, cookie, '/a1/unidade/1/');
    expect(r?.status).toBe(302);
    expect(r?.headers.get('location')).toContain('/cursos/hebraico-a1/');
  });

  it('quem comprou só o A1 abre o A1 e não abre o alfabeto', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['hebraico-a1']);
    expect(await porta(env, cookie, '/a1/unidade/1/')).toBeNull();
    const r = await porta(env, cookie, '/licao/alef/');
    expect(r?.status).toBe(302);
    expect(r?.headers.get('location')).toContain('/curso-de-hebraico/');
  });

  it('os clipes de áudio servem a quem tem qualquer um dos dois cursos', async () => {
    for (const curso of ['alfabetizacao', 'hebraico-a1']) {
      const env = envDeTeste();
      const cookie = await comConta(env, [curso]);
      expect(await porta(env, cookie, '/audio/he-12345678.mp3'), curso).toBeNull();
    }
  });

  it('sem curso nenhum, nem o áudio abre', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, []);
    const r = await porta(env, cookie, '/audio/he-12345678.mp3');
    expect(r?.status).toBe(302);
  });
});

describe('o conteúdo do A1 só sai para quem comprou o A1', () => {
  it('recusa sem sessão', async () => {
    const r = await contentA1({ request: pedirA1(), env: envDeTeste(), ctx: {} });
    expect(r.status).toBe(401);
  });

  it('recusa quem comprou só o alfabeto', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['alfabetizacao']);
    const r = await contentA1({ request: pedirA1(cookie), env, ctx: {} });
    expect(r.status).toBe(403);
    expect(await r.text()).not.toContain('unidades');
  });

  it('entrega o A1 a quem comprou o A1, privado e por cookie', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['hebraico-a1']);
    const r = await contentA1({ request: pedirA1(cookie), env, ctx: {} });
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toContain('private');
    expect(r.headers.get('vary') || '').toContain('Cookie');
    const corpo = await r.json() as { modulos: { unidades: number[] }[]; unidades: unknown[]; exame: { partes: { itens?: unknown }[] } };
    expect(corpo.unidades).toHaveLength(corpo.modulos.flatMap(m => m.unidades).length);
    expect(corpo.exame.partes).toHaveLength(6);
    /* O exame é corrigido no servidor: as perguntas e o gabarito não vêm aqui. */
    expect(corpo.exame.partes.every(p => p.itens === undefined)).toBe(true);
  });

  it('e quem comprou só o A1 não baixa o conteúdo do alfabeto', async () => {
    const env = envDeTeste();
    const cookie = await comConta(env, ['hebraico-a1']);
    const r = await content({ request: pedirAlfabeto(cookie), env, ctx: {} });
    expect(r.status).toBe(403);
  });

  it('cada hebraico que se ouve leva o id da sua gravação', () => {
    const a1 = JSON.parse(conteudoA1Bruto()) as {
      unidades: { dialogo: { linhas: { audioId?: string }[] }; exercicios: { t: string; audioId?: string }[] }[];
    };
    for (const u of a1.unidades) {
      for (const l of u.dialogo.linhas) expect(l.audioId).toMatch(/^he-[0-9a-f]{8}$/);
      for (const it of u.exercicios.filter(i => i.t === 'ouvir')) expect(it.audioId).toMatch(/^he-[0-9a-f]{8}$/);
    }
  });
});
