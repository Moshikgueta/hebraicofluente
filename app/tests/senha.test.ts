/* A senha: criar, entrar, esquecer, redefinir, trocar.
 * ─────────────────────────────────────────────────────────────────────────
 * Este arquivo percorre o caminho inteiro contra um SQLite de verdade
 * carregado com o `worker/schema.sql` de produção (ver tests/ajuda/d1.ts), e
 * o e-mail é interceptado na saída - então o token que o teste usa é o mesmo
 * token que chegaria à caixa de entrada, extraído do mesmo texto.
 *
 * O que está sendo protegido aqui não é o caminho feliz. É:
 *
 *   · o formulário de recuperação não pode virar uma lista de quem é cliente;
 *   · um link não pode valer duas vezes;
 *   · trocar a senha tem de derrubar as sessões, senão trocar a senha porque
 *     alguém entrou na conta não expulsa esse alguém;
 *   · o link do e-mail não pode sair do cabeçalho Host.
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { envDeTeste, pedido, cookieDe } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { mailReady, mensagemDeRecuperacao } from '../../worker/src/lib/mail.js';

const SITE = 'https://hebraicofluente.com.br';

/* O ctx do Worker. `waitUntil` espera de verdade aqui: o teste precisa que o
   envio tenha acontecido quando a asserção roda. */
const pendentes: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => { pendentes.push(p); } };
const assentar = async () => { await Promise.all(pendentes.splice(0)); };

/** Os e-mails que "saíram" no teste atual. */
let enviados: { to: string; subject: string; text: string }[] = [];

beforeEach(() => {
  enviados = [];
  pendentes.length = 0;
  /* Intercepta a saída no fetch, e não na função de envio: assim o teste
     exercita `sendMail` inteiro - cabeçalho de autorização, corpo, leitura da
     resposta - em vez de um atalho que só ele conhece. */
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const corpo = JSON.parse(String(init.body)) as
      { to: string[]; subject: string; text: string };
    enviados.push({ to: corpo.to[0]!, subject: corpo.subject, text: corpo.text });
    return new Response(JSON.stringify({ id: 'msg_teste' }), { status: 200 });
  });
});

afterEach(() => { vi.unstubAllGlobals(); });

const envComEmail = (extra: Record<string, unknown> = {}) => envDeTeste({
  RESEND_API_KEY: 're_de_teste',
  EMAIL_FROM: 'Hebraico Fluente <contato@hebraicofluente.com.br>',
  RESEND_BASE: 'https://api.resend.test',
  ...extra
});

/** Cria uma conta e devolve o env, o e-mail e o cookie de sessão. */
async function comConta(env = envComEmail(), senha = 'senha-inicial-1') {
  const email = 'aluno@exemplo.com.br';
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { name: 'Daniel', email, password: senha }),
    env, ctx
  });
  expect(r.status).toBe(200);
  return { env, email, senha, cookie: cookieDe(r) };
}

/** O token que está dentro do último e-mail enviado. */
function tokenDoEmail(): string {
  const ultimo = enviados.at(-1);
  expect(ultimo, 'nenhum e-mail foi enviado').toBeTruthy();
  const m = ultimo!.text.match(/\/nova-senha\/\?token=([^\s]+)/);
  expect(m, `o e-mail não tem link de recuperação:\n${ultimo!.text}`).toBeTruthy();
  return decodeURIComponent(m![1]!);
}

const forgot = (env: Record<string, unknown>, email: string, headers = {}) =>
  auth.forgot({ request: pedido(`${SITE}/api/auth/forgot`, { email }, headers), env, ctx });

const reset = (env: Record<string, unknown>, token: string, password: string) =>
  auth.reset({ request: pedido(`${SITE}/api/auth/reset`, { token, password }), env, ctx });

const login = (env: Record<string, unknown>, email: string, password: string) =>
  auth.login({ request: pedido(`${SITE}/api/auth/login`, { email, password }), env, ctx });

/* ── o caminho inteiro ──────────────────────────────────────────────────── */

describe('esqueci a senha, e volto para dentro', () => {
  it('percorre pedir, receber, redefinir e entrar com a senha nova', async () => {
    const { env, email } = await comConta();

    const r1 = await forgot(env, email);
    expect(r1.status).toBe(200);
    await assentar();

    /* O e-mail saiu para o endereço da conta, e não para outro. */
    expect(enviados).toHaveLength(1);
    expect(enviados[0]!.to).toBe(email);

    const r2 = await reset(env, tokenDoEmail(), 'senha-nova-12345');
    expect(r2.status).toBe(200);
    /* Redefinir já entra: a resposta traz sessão e cookie. */
    expect(cookieDe(r2)).toMatch(/^hf_session=/);
    expect((await r2.json()).account.email).toBe(email);

    /* E a senha nova é a que vale, das duas pontas. */
    expect((await login(env, email, 'senha-nova-12345')).status).toBe(200);
    expect((await login(env, email, 'senha-inicial-1')).status).toBe(401);
  });

  it('o link do e-mail aponta para o endereço do site, com o token', async () => {
    const { env, email } = await comConta();
    await forgot(env, email);
    await assentar();
    expect(enviados[0]!.text).toContain(`${SITE}/nova-senha/?token=`);
  });
});

/* ── o que a tela não pode entregar ─────────────────────────────────────── */

describe('não conta quem é cliente', () => {
  it('responde igual para e-mail que existe e para e-mail que não existe', async () => {
    const { env, email } = await comConta();

    const existe = await forgot(env, email);
    const naoExiste = await forgot(env, 'ninguem@exemplo.com.br');
    await assentar();

    expect(naoExiste.status).toBe(existe.status);
    expect(await naoExiste.json()).toEqual(await existe.json());
    /* E só um e-mail saiu - o da conta que existe. */
    expect(enviados).toHaveLength(1);
  });

  it('responde igual para um e-mail mal escrito', async () => {
    const env = envComEmail();
    const r = await forgot(env, 'isso-nao-e-um-email');
    await assentar();
    expect(r.status).toBe(200);
    expect(enviados).toHaveLength(0);
  });
});

/* ── o token ────────────────────────────────────────────────────────────── */

describe('o link vale uma vez', () => {
  it('recusa o mesmo token na segunda vez', async () => {
    const { env, email } = await comConta();
    await forgot(env, email);
    await assentar();
    const token = tokenDoEmail();

    expect((await reset(env, token, 'senha-nova-12345')).status).toBe(200);

    const segunda = await reset(env, token, 'outra-senha-9999');
    expect(segunda.status).toBe(400);
    expect((await segunda.json()).error).toBe('bad-token');
    /* E a segunda tentativa não trocou nada. */
    expect((await login(env, email, 'senha-nova-12345')).status).toBe(200);
  });

  it('um pedido novo derruba o anterior', async () => {
    const { env, email } = await comConta();
    await forgot(env, email);
    await assentar();
    const primeiro = tokenDoEmail();

    await forgot(env, email);
    await assentar();
    const segundo = tokenDoEmail();
    expect(segundo).not.toBe(primeiro);

    expect((await reset(env, primeiro, 'senha-nova-12345')).status).toBe(400);
    expect((await reset(env, segundo, 'senha-nova-12345')).status).toBe(200);
  });

  it('recusa um token vencido', async () => {
    const { env, email } = await comConta();
    await forgot(env, email);
    await assentar();
    const token = tokenDoEmail();

    /* Envelhece a linha no banco em vez de esperar uma hora. */
    (env.DB as { bruto: { exec(s: string): void } }).bruto
      .exec(`UPDATE password_resets SET expires_at = ${Date.now() - 1000}`);

    const r = await reset(env, token, 'senha-nova-12345');
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('bad-token');
  });

  it('recusa um token inventado, e não trava tentando', async () => {
    const { env } = await comConta();
    const r = await reset(env, 'token-que-eu-inventei-agora', 'senha-nova-12345');
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe('bad-token');
  });

  it('exige senha de verdade, mesmo com token bom', async () => {
    const { env, email } = await comConta();
    await forgot(env, email);
    await assentar();
    const token = tokenDoEmail();

    const curta = await reset(env, token, 'curta');
    expect((await curta.json()).error).toBe('weak-password');
    /* E o token continua valendo: recusar a senha não pode queimar o link,
       senão errar o tamanho custa um e-mail novo. */
    expect((await reset(env, token, 'senha-nova-12345')).status).toBe(200);
  });
});

describe('o token não fica guardado em claro', () => {
  it('grava só o sha256 dele', async () => {
    const { env, email } = await comConta();
    await forgot(env, email);
    await assentar();
    const token = tokenDoEmail();

    const linhas = (env.DB as { bruto: { prepare(s: string): { all(): unknown[] } } })
      .bruto.prepare('SELECT token_hash FROM password_resets').all() as { token_hash: string }[];

    expect(linhas).toHaveLength(1);
    expect(linhas[0]!.token_hash).not.toBe(token);
    expect(linhas[0]!.token_hash).toMatch(/^[0-9a-f]{64}$/);
    /* E o token não aparece em lugar nenhum da tabela. */
    expect(JSON.stringify(linhas)).not.toContain(token);
  });
});

/* ── trocar a senha estando dentro ──────────────────────────────────────── */

describe('trocar a senha no perfil', () => {
  const trocar = (env: Record<string, unknown>, cookie: string,
                  current: string, password: string) =>
    auth.password({
      request: pedido(`${SITE}/api/auth/password`, { current, password }, { cookie }),
      env, ctx
    });

  it('troca quando a senha atual confere', async () => {
    const { env, email, cookie } = await comConta();
    const r = await trocar(env, cookie, 'senha-inicial-1', 'senha-nova-12345');
    expect(r.status).toBe(200);
    expect((await login(env, email, 'senha-nova-12345')).status).toBe(200);
  });

  it('recusa sem a senha atual - uma tela destrancada não basta', async () => {
    const { env, email, cookie } = await comConta();
    const r = await trocar(env, cookie, 'chute-errado', 'senha-nova-12345');
    expect(r.status).toBe(401);
    expect((await r.json()).error).toBe('bad-credentials');
    expect((await login(env, email, 'senha-inicial-1')).status).toBe(200);
  });

  it('recusa sem sessão nenhuma', async () => {
    const { env } = await comConta();
    const r = await trocar(env, '', 'senha-inicial-1', 'senha-nova-12345');
    expect(r.status).toBe(401);
  });

  it('devolve um cookie novo - senão a própria troca desloga quem trocou', async () => {
    const { env, cookie } = await comConta();
    const r = await trocar(env, cookie, 'senha-inicial-1', 'senha-nova-12345');
    const novo = cookieDe(r);
    expect(novo).toMatch(/^hf_session=/);
    expect(novo).not.toBe(cookie);

    /* O novo abre a conta; o antigo, não. */
    expect((await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie: novo }), env }))
      .status).toBe(200);
    expect((await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie }), env }))
      .status).toBe(401);
  });
});

describe('trocar a senha derruba as outras sessões', () => {
  it('invalida o cookie de outro aparelho', async () => {
    const { env, email, senha } = await comConta();

    /* Dois aparelhos, duas sessões da mesma conta. */
    const celular = cookieDe(await login(env, email, senha));
    const notebook = cookieDe(await login(env, email, senha));
    expect((await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie: celular }), env }))
      .status).toBe(200);

    /* O notebook redefine a senha pelo link do e-mail. */
    await forgot(env, email);
    await assentar();
    await reset(env, tokenDoEmail(), 'senha-nova-12345');

    /* O celular cai - que é o ponto inteiro de redefinir a senha depois de
       achar que alguém entrou na conta. */
    for (const cookie of [celular, notebook]) {
      const r = await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie }), env });
      expect(r.status).toBe(401);
    }
  });

  it('um link pedido antes não sobrevive à troca de senha', async () => {
    const { env, email, cookie } = await comConta();

    /* Alguém pede o link; o dono, desconfiado, troca a senha no perfil. */
    await forgot(env, email);
    await assentar();
    const token = tokenDoEmail();

    await auth.password({
      request: pedido(`${SITE}/api/auth/password`,
        { current: 'senha-inicial-1', password: 'senha-do-dono-1' }, { cookie }),
      env, ctx
    });

    const r = await reset(env, token, 'senha-do-invasor');
    expect(r.status).toBe(400);
    expect((await login(env, email, 'senha-do-dono-1')).status).toBe(200);
  });
});

/* ── sem provedor de e-mail ─────────────────────────────────────────────── */

describe('quando não há como mandar e-mail', () => {
  it('não derruba o pedido, e a saúde conta a verdade', async () => {
    const env = envDeTeste();                 // sem RESEND_API_KEY
    await comConta(env);

    const r = await forgot(env, 'aluno@exemplo.com.br');
    await assentar();
    expect(r.status).toBe(200);
    expect(enviados).toHaveLength(0);

    const saude = await (await auth.health({ env })).json();
    expect(saude.email).toBe(false);
    /* E o site continua saudável: não poder recuperar senha é uma degradação,
       não uma queda. */
    expect(saude.ok).toBe(true);
    expect(saude.recuperacao).toBe(true);
  });

  it('a saúde separa "configurado" de "entregando"', async () => {
    /* A armadilha: a Resend recusa com 403 enquanto o domínio do remetente
       não estiver verificado. A chave existe, `email` diz true, a tela diz "o
       link está a caminho" - e ninguém recebe nada. `emailEntregue` é o campo
       que desmente isso. */
    const env = envComEmail();
    const { email } = await comConta(env);

    const antes = await (await auth.health({ env })).json();
    expect(antes.email).toBe(true);
    expect(antes.emailEntregue, 'ninguém pediu link ainda').toBe(null);

    /* A Resend recusa o próximo envio, como faz com domínio não verificado. */
    vi.stubGlobal('fetch', async () =>
      new Response('{"message":"The domain is not verified."}', { status: 403 }));
    await forgot(env, email);
    await assentar();

    const depois = await (await auth.health({ env })).json();
    expect(depois.email, 'a chave continua lá').toBe(true);
    expect(depois.emailEntregue, 'mas nada saiu').toBe(false);
    /* E o site continua saudável: é uma porta fechada, não uma queda. */
    expect(depois.ok).toBe(true);
  });

  it('volta a dizer que sim quando o envio funciona', async () => {
    const env = envComEmail();
    const { email } = await comConta(env);
    await forgot(env, email);
    await assentar();
    expect((await (await auth.health({ env })).json()).emailEntregue).toBe(true);
  });

  it('mailReady exige a chave E o remetente', () => {
    expect(mailReady({ RESEND_API_KEY: 'x', EMAIL_FROM: 'a@b.com' })).toBe(true);
    expect(mailReady({ RESEND_API_KEY: 'x' })).toBe(false);
    expect(mailReady({ EMAIL_FROM: 'a@b.com' })).toBe(false);
    expect(mailReady({})).toBe(false);
  });
});

/* ── o texto que a pessoa lê ────────────────────────────────────────────── */

describe('a mensagem', () => {
  it('leva o link, o prazo e nenhuma marcação vinda do nome', () => {
    const m = mensagemDeRecuperacao({
      nome: '<script>alert(1)</script>',
      link: 'https://hebraicofluente.com.br/nova-senha/?token=abc',
      minutos: 60,
      marca: 'Hebraico Fluente',
      suporte: 'suporte@exemplo.com.br'
    });
    expect(m.text).toContain('https://hebraicofluente.com.br/nova-senha/?token=abc');
    expect(m.text).toContain('60 minutos');
    expect(m.html).not.toContain('<script>');
    expect(m.html).toContain('&lt;script&gt;');
  });

  it('funciona sem nome - conta criada sem preencher o campo', () => {
    const m = mensagemDeRecuperacao({ nome: '', link: 'https://x/y', minutos: 60 });
    expect(m.text.startsWith('Oi.')).toBe(true);
  });
});

/* ── o cabeçalho Host não manda no link ─────────────────────────────────── */

describe('de onde sai o endereço do link', () => {
  it('usa SITE_ORIGIN, e não o host de quem pediu', async () => {
    /* Um pedido forjado com outro Host. Se o link saísse dali, a nossa
       plataforma mandaria, para o endereço certo do dono da conta, um e-mail
       legítimo cujo link entrega o token a outra pessoa. */
    const { env, email } = await comConta();
    await auth.forgot({
      request: pedido('https://site-do-atacante.example/api/auth/forgot', { email }),
      env, ctx
    });
    await assentar();

    expect(enviados[0]!.text).toContain(`${SITE}/nova-senha/?token=`);
    expect(enviados[0]!.text).not.toContain('site-do-atacante');
  });
});
