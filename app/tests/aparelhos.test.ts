/* No máximo três aparelhos por conta (worker/src/lib/aparelhos.js). */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { makeSessionCookie } from '../../worker/src/lib/session.js';
// @ts-expect-error - idem
import { runAlertas } from '../../worker/src/alertas.js';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const SENHA = 'senha-boa-123';

const chamar = (env: Env, path: string, body?: unknown, cookie = '') =>
  worker.fetch(pedido(`${SITE}${path}`, body, cookie ? { cookie } : {}), env, ctx);
const entrar = async (env: Env) => cookieDe(await chamar(env, '/api/auth/login', { email: 'ana@exemplo.com', password: SENHA }));
const me = (env: Env, cookie: string) => chamar(env, '/api/me', undefined, cookie);
const aula = (env: Env, cookie: string) =>
  worker.fetch(new Request(`${SITE}/licao/alef/`, { headers: { cookie } }), env, ctx);
const linhas = (env: Env) =>
  (env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM aparelhos').get() as { n: number }).n;

async function conta(env: Env) {
  const r = await chamar(env, '/api/auth/signup', { aceitouTermos: true, name: 'Ana', email: 'ana@exemplo.com', password: SENHA });
  expect(r.status).toBe(200);
  return cookieDe(r);
}

describe('três aparelhos por conta', () => {
  it('a quarta entrada desconecta a mais antiga, e só ela', async () => {
    const env = envDeTeste() as Env;
    const primeiro = await conta(env);                 // aparelho 1 (cadastro)
    const segundo = await entrar(env);                 // 2
    const terceiro = await entrar(env);                // 3
    for (const c of [primeiro, segundo, terceiro]) expect((await me(env, c)).status).toBe(200);

    const quarto = await entrar(env);                  // 4: o 1 sai
    expect((await me(env, primeiro)).status).toBe(401);
    for (const c of [segundo, terceiro, quarto]) expect((await me(env, c)).status).toBe(200);
    expect(linhas(env)).toBe(3);
  });

  it('o aparelho desconectado também perde as páginas e a API do curso', async () => {
    const env = envDeTeste() as Env;
    const primeiro = await conta(env);
    for (let i = 0; i < 3; i++) await entrar(env);
    const r = await aula(env, primeiro);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toContain('/entrar/');
    expect((await chamar(env, '/api/progress', undefined, primeiro)).status).toBe(401);
  });

  it('trocar a senha mantém este aparelho e derruba os outros', async () => {
    const env = envDeTeste() as Env;
    const este = await conta(env);
    const outro = await entrar(env);
    const r = await chamar(env, '/api/auth/password', { current: SENHA, password: 'outra-senha-boa-456' }, este);
    expect(r.status).toBe(200);
    const novo = cookieDe(r);
    expect((await me(env, novo)).status).toBe(200);
    expect((await me(env, outro)).status).toBe(401);
  });

  it('sair libera as vagas', async () => {
    const env = envDeTeste() as Env;
    const c = await conta(env);
    await entrar(env);
    await chamar(env, '/api/auth/logout', {}, c);
    expect(linhas(env)).toBe(0);
  });

  it('um cookie de antes do limite continua valendo e ganha um aparelho', async () => {
    const env = envDeTeste() as Env;
    await conta(env);
    env.DB.bruto.exec('DELETE FROM aparelhos');
    const account = env.DB.bruto.prepare('SELECT * FROM accounts').get();
    const antigo = (await makeSessionCookie(env, account)).split(';')[0];
    const r = await me(env, antigo);
    expect(r.status).toBe(200);
    const novo = cookieDe(r);
    expect(novo).toMatch(/^__Host-hf_session=/);
    expect(novo).not.toBe(antigo);
    expect(linhas(env)).toBe(1);
    expect((await me(env, novo)).status).toBe(200);
  });

  it('sem a tabela, ninguém fica trancado do lado de fora', async () => {
    const env = envDeTeste() as Env;
    await conta(env);
    env.DB.bruto.exec('DROP TABLE aparelhos');
    const c = await entrar(env);
    expect((await me(env, c)).status).toBe(200);
  });
});

describe('o rastro de login dividido', () => {
  it('mais de seis entradas em 24 h deixa UMA linha na trilha, sem bloquear', async () => {
    const env = envDeTeste() as Env;
    await conta(env);
    let ultimo = '';
    for (let i = 0; i < 10; i++) ultimo = await entrar(env);
    expect((await me(env, ultimo)).status).toBe(200);
    const n = env.DB.bruto.prepare("SELECT COUNT(*) AS n FROM access_log WHERE action = 'aparelhos-rodizio'").get();
    expect(n).toEqual({ n: 1 });
  });

  it('vira um e-mail ao dono, uma vez por dia', async () => {
    const enviados: { subject: string; text: string }[] = [];
    const env = envDeTeste({ SUPPORT_EMAIL: 'dono@exemplo.com', RESEND_API_KEY: 're_teste', EMAIL_FROM: 'site@exemplo.com' }) as Env;
    const fetchAntes = globalThis.fetch;
    globalThis.fetch = (async (_u: RequestInfo, init?: RequestInit) => {
      enviados.push(JSON.parse(String(init?.body)));
      return new Response('{"id":"x"}', { status: 200 });
    }) as typeof fetch;
    try {
      await conta(env);
      for (let i = 0; i < 8; i++) await entrar(env);
      await runAlertas(env);
      await runAlertas(env);
    } finally {
      globalThis.fetch = fetchAntes;
    }
    const aviso = enviados.filter(m => /login dividido/.test(m.subject));
    expect(aviso).toHaveLength(1);
    expect(aviso[0]!.text).toContain('ana@exemplo.com');
    expect(aviso[0]!.text).toContain('Nada foi bloqueado');
  });
});
