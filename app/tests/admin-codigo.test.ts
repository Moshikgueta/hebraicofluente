/* O segundo fator do administrador (lib/admin.js, api/admin-codigo.js). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const DONO = 'dono@exemplo.com';
const SENHA = 'senha-boa-123';

let emails: { to: string[]; subject: string; text: string }[] = [];
const fetchAntes = globalThis.fetch;
beforeEach(() => {
  emails = [];
  globalThis.fetch = (async (_u: RequestInfo, init?: RequestInit) => {
    emails.push(JSON.parse(String(init?.body)));
    return new Response('{"id":"x"}', { status: 200 });
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = fetchAntes; });

const novoEnv = (extra: Record<string, unknown> = {}) => envDeTeste({
  ADMIN_EMAILS: DONO, RESEND_API_KEY: 're_teste', EMAIL_FROM: 'site@exemplo.com', ...extra
}) as Env;
const chamar = (env: Env, metodo: string, caminho: string, cookie = '', body?: unknown) =>
  worker.fetch(new Request(`${SITE}${caminho}`, {
    method: metodo,
    headers: { ...(cookie ? { cookie } : {}), Origin: SITE, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  }), env, ctx);
async function conta(env: Env, email: string) {
  return cookieDe(await chamar(env, 'POST', '/api/auth/signup', '', { aceitouTermos: true, declarouIdade: true, name: 'X', email, password: SENHA }));
}
const entrar = async (env: Env, email: string) =>
  cookieDe(await chamar(env, 'POST', '/api/auth/login', '', { email, password: SENHA }));
const doCodigo = () => emails.filter(e => /código/.test(e.subject));
const codigoDoEmail = () => /Seu código: (\d{6})/.exec(doCodigo().at(-1)!.text)![1]!;
const painel = (env: Env, cookie: string) => chamar(env, 'GET', '/api/admin/estatisticas', cookie);

async function comCodigo(env: Env, cookie: string) {
  expect((await chamar(env, 'POST', '/api/admin/codigo', cookie)).status).toBe(200);
  const r = await chamar(env, 'POST', '/api/admin/codigo/conferir', cookie, { codigo: codigoDoEmail() });
  expect(r.status).toBe(200);
  return `${cookie}; ${cookieDe(r)}`;
}

describe('o segundo fator do administrador', () => {
  it('só a senha não abre o painel: pede o código, e aluno continua sem acesso', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    const aluno = await conta(env, 'ana@exemplo.com');
    const r = await painel(env, dono);
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ error: 'admin-codigo' });
    expect(await (await painel(env, aluno)).json()).toEqual({ error: 'not-admin' });
    /* Aluno nem pede código. */
    expect((await chamar(env, 'POST', '/api/admin/codigo', aluno)).status).toBe(403);
    /* Os dois e-mails que saíram são as confirmações de cadastro; código, nenhum. */
    expect(emails.filter(e => /código/.test(e.subject))).toHaveLength(0);
  });

  it('o código chega no e-mail da conta e abre o painel', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    const tudo = await comCodigo(env, dono);
    expect(doCodigo().at(-1)!.to).toEqual([DONO]);
    expect(tudo).toMatch(/__Host-hf_admin=/);
    expect((await painel(env, tudo)).status).toBe(200);
    /* O código só é guardado como hash, e some depois de usado. */
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM admin_codigos').get()).toEqual({ n: 0 });
  });

  it('código errado não abre, e cinco erros queimam o código', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    await chamar(env, 'POST', '/api/admin/codigo', dono);
    const certo = codigoDoEmail();
    const errado = certo === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      expect(await (await chamar(env, 'POST', '/api/admin/codigo/conferir', dono, { codigo: errado })).json())
        .toEqual({ error: 'codigo-invalido' });
    }
    const r = await chamar(env, 'POST', '/api/admin/codigo/conferir', dono, { codigo: certo });
    expect(await r.json()).toEqual({ error: 'codigo-vencido' });
  });

  /* SEC-A-002 (auditoria de 01/10/2026): ler as tentativas, comparar e só
     depois somar deixava uma rajada em paralelo ser avaliada inteira. */
  it('quarenta palpites em paralelo: só cinco são avaliados', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    await chamar(env, 'POST', '/api/admin/codigo', dono);
    const certo = codigoDoEmail();
    const palpites = Array.from({ length: 40 }, (_, i) => String((Number(certo) + 1 + i) % 1_000_000).padStart(6, '0'));
    const respostas = await Promise.all(palpites.map(async c =>
      ((await (await chamar(env, 'POST', '/api/admin/codigo/conferir', dono, { codigo: c })).json()) as { error: string }).error));
    expect(respostas.filter(e => e === 'codigo-invalido')).toHaveLength(5);
    expect(respostas.filter(e => e === 'codigo-vencido')).toHaveLength(35);
    expect(await (await chamar(env, 'POST', '/api/admin/codigo/conferir', dono, { codigo: certo })).json())
      .toEqual({ error: 'codigo-vencido' });
  });

  it('código vencido não abre', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    await chamar(env, 'POST', '/api/admin/codigo', dono);
    env.DB.bruto.exec('UPDATE admin_codigos SET expira = 1');
    const r = await chamar(env, 'POST', '/api/admin/codigo/conferir', dono, { codigo: codigoDoEmail() });
    expect(await r.json()).toEqual({ error: 'codigo-vencido' });
  });

  it('o acesso fica preso ao aparelho e morre com a troca de senha', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    const tudo = await comCodigo(env, dono);
    const admin = tudo.split('; ')[1]!;
    /* O mesmo cookie de administrador com a sessão de outro aparelho: não. */
    const outro = await entrar(env, DONO);
    expect((await painel(env, `${outro}; ${admin}`)).status).toBe(403);
    /* Trocar a senha sobe a versão da sessão, e o segundo fator cai junto. */
    const r = await chamar(env, 'POST', '/api/auth/password', tudo, { current: SENHA, password: 'outra-senha-boa-456' });
    const nova = cookieDe(r);
    expect((await painel(env, `${nova}; ${admin}`)).status).toBe(403);
  });

  it('sair apaga o cookie do administrador', async () => {
    const env = novoEnv();
    const dono = await conta(env, DONO);
    const tudo = await comCodigo(env, dono);
    const r = await chamar(env, 'POST', '/api/auth/logout', tudo, {});
    expect(r.headers.get('set-cookie')).toMatch(/__Host-hf_admin=;.*Max-Age=0/);
  });

  it('sem e-mail configurado, avisa em vez de fingir que mandou', async () => {
    const env = novoEnv({ RESEND_API_KEY: '' });
    const dono = await conta(env, DONO);
    const r = await chamar(env, 'POST', '/api/admin/codigo', dono);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: 'sem-email' });
  });
});
