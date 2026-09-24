/* Apagar a própria conta.
 * ─────────────────────────────────────────────────────────────────────────
 * O direito de exclusão da LGPD (art. 18, VI), contra o mesmo SQLite de
 * verdade dos outros testes de conta (ver tests/ajuda/d1.ts).
 *
 * O caminho feliz aqui é a parte fácil. O que este arquivo protege é a
 * fronteira entre duas coisas que a lei trata de maneira oposta:
 *
 *   · o DADO PESSOAL tem de sumir - e-mail, nome, senha, progresso, acesso;
 *   · o REGISTRO DE VENDA tem de ficar, porque nota fiscal é obrigação de
 *     quem vende e a própria LGPD prevê a guarda (art. 16, I).
 *
 * Um apagamento que leva o pedido junto quebra a contabilidade. Um que deixa
 * o e-mail para trás não apaga nada. Os dois erros passam despercebidos, e
 * cada um só aparece meses depois - um na hora de fechar o livro caixa, o
 * outro na hora em que alguém pergunta por que ainda está no banco.
 *
 * Também protege as travas: sem senha não apaga, com senha errada não apaga,
 * e a sessão morre junto - inclusive a do celular que ficou logado.
 */

import { describe, expect, it } from 'vitest';
import { envDeTeste, pedido, cookieDe } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { createOrder, updateOrder, grantAccess, putProgress, getProgress } from '../../worker/src/lib/db.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: () => {} };

type Env = Record<string, unknown>;
type Banco = { bruto: { prepare(sql: string): { get(...a: unknown[]): unknown;
                                                all(...a: unknown[]): unknown[] } } };

const sql = (env: Env, q: string, ...args: unknown[]) =>
  (env.DB as unknown as Banco).bruto.prepare(q).get(...args) as Record<string, unknown> | undefined;
const linhas = (env: Env, q: string, ...args: unknown[]) =>
  (env.DB as unknown as Banco).bruto.prepare(q).all(...args) as Record<string, unknown>[];

/**
 * Uma conta COMPLETA: com acesso ao curso, com progresso gravado e com um
 * pedido pago. É o estado de um aluno de verdade, e é o único estado em que
 * este teste diz alguma coisa - apagar uma conta recém-criada e vazia não
 * prova que o progresso some nem que o pedido fica.
 */
async function alunoDeVerdade(senha = 'senha-do-aluno-1') {
  const env = envDeTeste();
  const email = 'aluno@exemplo.com.br';

  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { name: 'Daniel', email, password: senha }),
    env, ctx
  });
  expect(r.status).toBe(200);
  const cookie = cookieDe(r);

  const conta = sql(env, 'SELECT id FROM accounts WHERE email = ?', email)!;
  const id = Number(conta.id);

  /* O pedido nasce `pending` e é o pagamento que o marca pago - `createOrder`
     não aceita status de fora, de propósito. O teste segue o mesmo caminho. */
  const pedidoFeito = await createOrder(env, {
    accountId: id, courseSlug: 'alfabetizacao', amountCents: 19700,
    method: 'card', installments: 1
  }) as { id: string };
  await updateOrder(env, pedidoFeito.id, { status: 'paid', paid_at: Date.now() });
  await grantAccess(env, {
    accountId: id, courseSlug: 'alfabetizacao', orderId: pedidoFeito.id, months: 12
  });
  await putProgress(env, id, {
    state: JSON.stringify({ version: 2, xp: 340 }), version: 2, expected: 0
  });

  return { env, email, senha, cookie, id };
}

const apagar = (env: Env, cookie: string, body: unknown) =>
  auth.apagar({
    request: pedido(`${SITE}/api/auth/delete`, body, { cookie }),
    env, ctx
  });

const login = (env: Env, email: string, password: string) =>
  auth.login({ request: pedido(`${SITE}/api/auth/login`, { email, password }), env, ctx });

/* ── o que some ─────────────────────────────────────────────────────────── */

describe('apagar a conta leva a PESSOA', () => {
  it('apaga e-mail, nome, senha, progresso e acesso, de uma vez', async () => {
    const { env, email, senha, cookie, id } = await alunoDeVerdade();

    /* Antes: tudo no lugar. Um teste que só olha o depois passa mesmo quando
       o setup nunca gravou nada. */
    expect(await getProgress(env, id)).toBeTruthy();
    expect(linhas(env, 'SELECT * FROM entitlements WHERE account_id = ?', id)).toHaveLength(1);

    const r = await apagar(env, cookie, { password: senha });
    expect(r.status).toBe(200);

    const conta = sql(env, 'SELECT * FROM accounts WHERE id = ?', id)!;
    expect(conta.email).not.toBe(email);
    expect(String(conta.email)).toMatch(/^apagada\+\d+@invalido\.local$/);
    expect(conta.name).toBe('');

    expect(linhas(env, 'SELECT * FROM progress WHERE account_id = ?', id)).toHaveLength(0);
    expect(linhas(env, 'SELECT * FROM entitlements WHERE account_id = ?', id)).toHaveLength(0);
  });

  it('a senha antiga não entra mais, e o hash não ficou vazio', async () => {
    const { env, email, senha, cookie, id } = await alunoDeVerdade();
    const antes = sql(env, 'SELECT pass_hash FROM accounts WHERE id = ?', id)!;

    await apagar(env, cookie, { password: senha });

    expect((await login(env, email, senha)).status).toBe(401);

    const depois = sql(env, 'SELECT pass_hash, pass_salt FROM accounts WHERE id = ?', id)!;
    expect(depois.pass_hash).not.toBe(antes.pass_hash);
    /* Lixo aleatório, e não string vazia: um campo vazio é um valor que
       alguma verificação futura pode achar que casa com alguma coisa. */
    expect(String(depois.pass_hash).length).toBeGreaterThan(32);
    expect(String(depois.pass_salt).length).toBeGreaterThan(0);
  });

  it('derruba a sessão, inclusive a do aparelho que ficou logado', async () => {
    const { env, senha, cookie } = await alunoDeVerdade();

    /* Antes de apagar, o cookie vale. */
    expect((await auth.me({
      request: pedido(`${SITE}/api/me`, undefined, { cookie }), env })).status).toBe(200);

    await apagar(env, cookie, { password: senha });

    /* Depois, o MESMO cookie não vale mais para nada: `session_version` subiu
       dentro do apagamento, e é isso que `me` confere. Vale para toda aba e
       todo aparelho, porque a versão mora na conta e não no cookie. */
    const r = await auth.me({ request: pedido(`${SITE}/api/me`, undefined, { cookie }), env });
    expect(r.status).toBe(401);
  });

  it('libera o e-mail para uma conta nova, do zero', async () => {
    const { env, email, senha, cookie, id } = await alunoDeVerdade();
    await apagar(env, cookie, { password: senha });

    /* O UNIQUE em `email` é o motivo de a linha ser esvaziada em vez de
       guardar o endereço: com ele lá, voltar seria impossível para sempre. */
    const r = await auth.signup({
      request: pedido(`${SITE}/api/auth/signup`,
        { name: 'Daniel de novo', email, password: 'outra-senha-9876' }),
      env, ctx
    });
    expect(r.status).toBe(200);

    const nova = sql(env, 'SELECT id FROM accounts WHERE email = ?', email)!;
    expect(Number(nova.id)).not.toBe(id);
    /* E começa vazia: nada do dono anterior atravessa. */
    expect(await getProgress(env, Number(nova.id))).toBeFalsy();
    expect(linhas(env, 'SELECT * FROM entitlements WHERE account_id = ?', Number(nova.id)))
      .toHaveLength(0);
  });
});

/* ── o que fica ─────────────────────────────────────────────────────────── */

describe('apagar a conta NÃO leva o livro caixa', () => {
  it('o pedido continua lá, com valor e status, e sem dono identificável', async () => {
    const { env, senha, cookie, id } = await alunoDeVerdade();
    await apagar(env, cookie, { password: senha });

    const pedidos = linhas(env, 'SELECT * FROM orders WHERE account_id = ?', id);
    expect(pedidos).toHaveLength(1);
    expect(pedidos[0]!.amount_cents).toBe(19700);
    expect(pedidos[0]!.status).toBe('paid');

    /* E o que ele aponta não identifica ninguém: a linha da conta existe só
       para o pedido não virar órfão. */
    const conta = sql(env, 'SELECT email, name FROM accounts WHERE id = ?', id)!;
    expect(conta.name).toBe('');
    expect(String(conta.email)).not.toContain('aluno@exemplo.com.br');
  });

  it('a trilha registra que houve exclusão', async () => {
    const { env, senha, cookie, id } = await alunoDeVerdade();
    await apagar(env, cookie, { password: senha });

    const t = linhas(env,
      "SELECT * FROM access_log WHERE account_id = ? AND action = 'conta-apagada'", id);
    expect(t).toHaveLength(1);
  });
});

/* ── as travas ──────────────────────────────────────────────────────────── */

describe('sem prova de que é o dono, não apaga', () => {
  it('sem sessão, 401 e nada muda', async () => {
    const { env, email, id } = await alunoDeVerdade();
    const r = await apagar(env, '', { password: 'senha-do-aluno-1' });
    expect(r.status).toBe(401);
    expect(sql(env, 'SELECT email FROM accounts WHERE id = ?', id)!.email).toBe(email);
  });

  it('com a senha errada, 401 e nada muda', async () => {
    const { env, email, cookie, id } = await alunoDeVerdade();

    const r = await apagar(env, cookie, { password: 'nao-e-essa-senha' });
    expect(r.status).toBe(401);

    /* Nada foi tocado: nem a conta, nem o progresso, nem o acesso. É a parte
       que importa - um apagamento pela metade seria pior do que nenhum. */
    expect(sql(env, 'SELECT email FROM accounts WHERE id = ?', id)!.email).toBe(email);
    expect(await getProgress(env, id)).toBeTruthy();
    expect(linhas(env, 'SELECT * FROM entitlements WHERE account_id = ?', id)).toHaveLength(1);
  });

  it('a senha errada fica na trilha', async () => {
    const { env, cookie, id } = await alunoDeVerdade();
    await apagar(env, cookie, { password: 'nao-e-essa-senha' });
    expect(linhas(env,
      "SELECT * FROM access_log WHERE account_id = ? AND action = 'apagar-senha-errada'", id))
      .toHaveLength(1);
  });

  it('tentar muitas vezes esbarra no freio', async () => {
    const { env, cookie } = await alunoDeVerdade();
    let travou = false;
    for (let i = 0; i < 8; i++) {
      const r = await apagar(env, cookie, { password: 'errada' });
      if (r.status === 429) { travou = true; break; }
    }
    expect(travou, 'o freio nunca entrou: adivinhar a senha aqui custa a conta inteira')
      .toBe(true);
  });
});
