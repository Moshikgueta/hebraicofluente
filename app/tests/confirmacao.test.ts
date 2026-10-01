/* Confirmar o e-mail: o link do cadastro, o reenvio e o que ele NÃO faz.
 * ─────────────────────────────────────────────────────────────────────────
 * O achado (auditoria de 24/09/2026): qualquer pessoa criava uma conta com o
 * endereço de outra, e a dona só descobria ao ouvir "já existe uma conta com
 * esse e-mail". A decisão do dono foi confirmar SEM bloquear - a conta e a
 * compra funcionam sem a confirmação.
 *
 * O que este arquivo protege, além do caminho feliz:
 *
 *   · o link só confirma com a sessão da conta que o pediu. Se confirmasse
 *     sozinho, a dona do endereço clicaria por reflexo e confirmaria a conta
 *     do impostor;
 *   · o e-mail diz à dona do endereço como tomar a conta de volta, e tomar
 *     (recuperar a senha) confirma o e-mail e derruba a sessão do impostor;
 *   · sem a tabela nova - a publicação não aplica o schema.sql - o cadastro
 *     continua funcionando.
 *
 * Contra o SQLite com o `worker/schema.sql` de produção (tests/ajuda/d1.ts), e
 * o e-mail interceptado na saída.
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { envDeTeste, pedido, cookieDe } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { mensagemDeConfirmacao } from '../../worker/src/lib/mail.js';

const SITE = 'https://hebraicofluente.com.br';

const pendentes: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => { pendentes.push(p); } };
const assentar = async () => { await Promise.all(pendentes.splice(0)); };

let enviados: { to: string; subject: string; text: string; html: string }[] = [];

beforeEach(() => {
  enviados = [];
  pendentes.length = 0;
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    const corpo = JSON.parse(String(init.body)) as
      { to: string[]; subject: string; text: string; html: string };
    enviados.push({ to: corpo.to[0]!, subject: corpo.subject, text: corpo.text, html: corpo.html });
    return new Response(JSON.stringify({ id: 'msg_teste' }), { status: 200 });
  });
});

afterEach(() => { vi.unstubAllGlobals(); });

const envComEmail = () => envDeTeste({
  RESEND_API_KEY: 're_de_teste',
  EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>',
  RESEND_BASE: 'https://api.resend.test',
  SUPPORT_EMAIL: 'suporte@exemplo.com.br'
});

type Env = Record<string, unknown> & { DB: { bruto: { exec(sql: string): void; prepare(sql: string): { get(...a: unknown[]): unknown } } } };

async function cadastrar(env: Env, email = 'aluna@exemplo.com.br', senha = 'senha-da-aluna-1') {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Débora', email, password: senha }),
    env, ctx
  });
  expect(r.status).toBe(200);
  await assentar();
  return { cookie: cookieDe(r), body: await r.json() as { account: { emailVerified: boolean | null } } };
}

/** O token que está no último e-mail de confirmação. */
function tokenDaConfirmacao(): string {
  const m = [...enviados].reverse().find(e => e.subject.startsWith('Confirme'));
  expect(m, 'nenhum e-mail de confirmação saiu').toBeTruthy();
  const t = m!.text.match(/\/confirmar-email\/\?token=([^\s]+)/);
  expect(t, `o e-mail não tem o link:\n${m!.text}`).toBeTruthy();
  return decodeURIComponent(t![1]!);
}

const confirmar = (env: Env, token: string, cookie?: string) =>
  auth.verify({
    request: pedido(`${SITE}/api/auth/verify`, { token }, cookie ? { cookie } : {}),
    env
  });

const me = (env: Env, cookie: string) =>
  auth.me({ request: new Request(`${SITE}/api/me`, { headers: { cookie } }), env });

const confirmado = async (env: Env, cookie: string) =>
  ((await (await me(env, cookie)).json()) as { account: { emailVerified: boolean | null } })
    .account.emailVerified;

describe('o e-mail de confirmação', () => {
  it('sai no cadastro, em português, com o link para a própria origem', async () => {
    const env = envComEmail() as Env;
    const { body } = await cadastrar(env);

    expect(body.account.emailVerified).toBe(false);
    const m = enviados.find(e => e.subject.startsWith('Confirme'))!;
    expect(m.to).toBe('aluna@exemplo.com.br');
    expect(m.subject).toBe('Confirme seu e-mail - Hebraico Fluente');
    /* Sem o nome: o endereço ainda não provou ser de quem escreveu o nome
       (SEC-A-003, tests/nome-nos-emails.test.ts). */
    expect(m.text.startsWith('Oi.\n')).toBe(true);
    expect(m.text).not.toContain('Débora');
    expect(m.text).toContain(`${SITE}/confirmar-email/?token=`);
    expect(m.text).toContain('O link vale por 7 dias');
  });

  it('diz a quem não criou a conta como tomá-la de volta', () => {
    const m = mensagemDeConfirmacao({
      nome: '', link: `${SITE}/confirmar-email/?token=abc`, dias: 7,
      esqueci: `${SITE}/esqueci-senha/`, marca: 'Hebraico Fluente', suporte: ''
    });
    expect(m.text).toContain('Não foi você que criou esta conta?');
    expect(m.text).toContain(`${SITE}/esqueci-senha/`);
    expect(m.html).toContain(`href="${SITE}/esqueci-senha/"`);
  });

  it('escapa o nome no HTML', () => {
    const m = mensagemDeConfirmacao({
      nome: '<img src=x onerror=alert(1)>', link: `${SITE}/confirmar-email/?token=abc`, dias: 7,
      esqueci: `${SITE}/esqueci-senha/`, marca: 'Hebraico Fluente', suporte: ''
    });
    expect(m.html).not.toContain('<img');
  });

  it('não sai para um domínio .invalid, que nunca recebe nada', async () => {
    const env = envComEmail() as Env;
    await cadastrar(env, 'hf-e2e-123@example.invalid');
    expect(enviados.filter(e => e.subject.startsWith('Confirme'))).toHaveLength(0);
  });

  it('o link sai de SITE_ORIGIN, nunca do cabeçalho Host', async () => {
    const env = envComEmail() as Env;
    await auth.signup({
      request: new Request('https://atacante.example/api/auth/signup', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ aceitouTermos: true, declarouIdade: true, name: 'X', email: 'x@exemplo.com.br', password: 'senha-grande-1' })
      }),
      env, ctx
    });
    await assentar();
    expect(enviados[0]!.text).toContain(`${SITE}/confirmar-email/`);
    expect(enviados[0]!.text).not.toContain('atacante.example');
  });
});

describe('confirmar', () => {
  it('com a sessão da conta, confirma; um segundo clique continua dando certo', async () => {
    const env = envComEmail() as Env;
    const { cookie } = await cadastrar(env);
    const token = tokenDaConfirmacao();

    const r = await confirmar(env, token, cookie);
    expect(r.status).toBe(200);
    expect(((await r.json()) as { account: { emailVerified: boolean } }).account.emailVerified).toBe(true);
    expect(await confirmado(env, cookie)).toBe(true);

    expect((await confirmar(env, token, cookie)).status).toBe(200);
  });

  it('sem sessão, não confirma nada', async () => {
    const env = envComEmail() as Env;
    const { cookie } = await cadastrar(env);
    const r = await confirmar(env, tokenDaConfirmacao());
    expect(r.status).toBe(401);
    expect(await confirmado(env, cookie)).toBe(false);
  });

  it('com a sessão de OUTRA conta, não confirma - nem uma, nem outra', async () => {
    const env = envComEmail() as Env;
    const impostor = await cadastrar(env, 'aluna@exemplo.com.br');
    const token = tokenDaConfirmacao();
    const outra = await cadastrar(env, 'outra@exemplo.com.br');

    const r = await confirmar(env, token, outra.cookie);
    expect(r.status).toBe(400);
    expect(((await r.json()) as { error: string }).error).toBe('bad-token');
    expect(await confirmado(env, impostor.cookie)).toBe(false);
    expect(await confirmado(env, outra.cookie)).toBe(false);
  });

  it('um link errado ou vencido responde bad-token', async () => {
    const env = envComEmail() as Env;
    const { cookie } = await cadastrar(env);
    const token = tokenDaConfirmacao();

    expect((await confirmar(env, 'token-que-nao-existe', cookie)).status).toBe(400);

    env.DB.bruto.exec('UPDATE email_verifications SET expires_at = 1');
    const r = await confirmar(env, token, cookie);
    expect(r.status).toBe(400);
    expect(await confirmado(env, cookie)).toBe(false);
  });

  it('pedir de novo invalida o link anterior', async () => {
    const env = envComEmail() as Env;
    const { cookie } = await cadastrar(env);
    const antigo = tokenDaConfirmacao();

    const r = await auth.verifySend({
      request: pedido(`${SITE}/api/auth/verify/send`, {}, { cookie }), env, ctx
    });
    expect(r.status).toBe(200);
    await assentar();
    const novo = tokenDaConfirmacao();
    expect(novo).not.toBe(antigo);

    expect((await confirmar(env, antigo, cookie)).status).toBe(400);
    expect((await confirmar(env, novo, cookie)).status).toBe(200);
  });

  it('pedir de novo exige sessão e tem freio', async () => {
    const env = envComEmail() as Env;
    const semSessao = await auth.verifySend({
      request: pedido(`${SITE}/api/auth/verify/send`, {}), env, ctx
    });
    expect(semSessao.status).toBe(401);

    const { cookie } = await cadastrar(env);
    const pedir = () => auth.verifySend({
      request: pedido(`${SITE}/api/auth/verify/send`, {}, { cookie }), env, ctx
    });
    expect((await pedir()).status).toBe(200);
    expect((await pedir()).status).toBe(200);
    expect((await pedir()).status).toBe(429);
  });

  it('com o e-mail já confirmado, pedir de novo não manda nada', async () => {
    const env = envComEmail() as Env;
    const { cookie } = await cadastrar(env);
    await confirmar(env, tokenDaConfirmacao(), cookie);
    const antes = enviados.length;
    const r = await auth.verifySend({
      request: pedido(`${SITE}/api/auth/verify/send`, {}, { cookie }), env, ctx
    });
    await assentar();
    expect(r.status).toBe(200);
    expect(enviados.length).toBe(antes);
  });
});

describe('a conta criada com o endereço de outra pessoa', () => {
  it('a dona recupera a senha: o e-mail fica confirmado e o impostor sai', async () => {
    const env = envComEmail() as Env;
    const impostor = await cadastrar(env, 'aluna@exemplo.com.br', 'senha-do-impostor');

    /* A dona recebe o e-mail de confirmação, não clica, e pede senha nova. */
    await auth.forgot({
      request: pedido(`${SITE}/api/auth/forgot`, { email: 'aluna@exemplo.com.br' }), env, ctx
    });
    await assentar();
    const link = enviados.at(-1)!.text.match(/\/nova-senha\/\?token=([^\s]+)/)!;
    const r = await auth.reset({
      request: pedido(`${SITE}/api/auth/reset`, {
        token: decodeURIComponent(link[1]!), password: 'senha-da-dona-1'
      }),
      env
    });
    expect(r.status).toBe(200);
    const dona = cookieDe(r);

    expect(await confirmado(env, dona)).toBe(true);
    expect((await me(env, impostor.cookie)).status).toBe(401);
  });
});

describe('antes de a tabela nova existir', () => {
  it('o cadastro funciona, a tela não pede nada e a saúde avisa', async () => {
    const env = envComEmail() as Env;
    env.DB.bruto.exec('DROP TABLE email_verifications');

    const { cookie, body } = await cadastrar(env);
    expect(body.account.emailVerified).toBeNull();
    expect(enviados.filter(e => e.subject.startsWith('Confirme'))).toHaveLength(0);
    expect(await confirmado(env, cookie)).toBeNull();

    const h = await auth.health({
      request: new Request(`${SITE}/api/health`, { headers: { 'CF-Connecting-IP': '203.0.113.9' } }),
      env
    });
    const saude = await h.json() as { ok: boolean; verificacao: boolean };
    expect(saude.verificacao).toBe(false);
    expect(saude.ok).toBe(true);
  });

  it('apagar a conta também funciona', async () => {
    const env = envComEmail() as Env;
    env.DB.bruto.exec('DROP TABLE email_verifications');
    const { cookie } = await cadastrar(env);
    const r = await auth.apagar({
      request: pedido(`${SITE}/api/auth/delete`, { password: 'senha-da-aluna-1' }, { cookie }),
      env
    });
    expect(r.status).toBe(200);
  });
});

describe('apagar a conta', () => {
  it('leva junto as confirmações, que guardam o endereço', async () => {
    const env = envComEmail() as Env;
    const { cookie } = await cadastrar(env);
    await confirmar(env, tokenDaConfirmacao(), cookie);

    const r = await auth.apagar({
      request: pedido(`${SITE}/api/auth/delete`, { password: 'senha-da-aluna-1' }, { cookie }),
      env
    });
    expect(r.status).toBe(200);
    const sobra = env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM email_verifications').get() as { n: number };
    expect(sobra.n).toBe(0);
  });
});
