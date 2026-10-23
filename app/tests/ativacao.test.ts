/* Os lembretes dos primeiros dias depois da compra e os testes do dono fora
 * dos painéis (23/10/2026, plano de marketing, oportunidade 0).
 * O que estes testes travam:
 *  - d1 e d3 só para quem não concluiu nenhuma lição; d7 só para quem não
 *    estuda há mais de 3 dias; cada marco uma vez por compra;
 *  - nada retroativo (compra antes de ATIVACAO_DESDE), nada para estornada,
 *    conta de teste, apagada ou de administrador, nem para o livro sozinho;
 *  - o e-mail não fala de preço nem oferece outro produto;
 *  - /admin/vendas marca as compras do administrador como teste, e
 *    /admin/estatisticas não as soma.
 * Ver worker/src/ativacao.js e marketing/01-diagnostico.md.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { comoAdmin, cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { ATIVACAO_DESDE, cabe, runAtivacao } from '../../worker/src/ativacao.js';
// @ts-expect-error - idem
import { mensagemDeAtivacao } from '../../worker/src/lib/mail.js';
// @ts-expect-error - idem
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';

const SITE = 'https://hebraicofluente.com.br';
const DONO = 'dono@exemplo.com';
const DIA = 86_400_000;
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = Record<string, unknown> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
type Mail = { to: string; subject: string; text: string; html: string };
let enviados: Mail[];

beforeEach(() => {
  enviados = [];
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (new URL(url).host === 'api.resend.test') {
      const b = JSON.parse(String(init?.body ?? '{}'));
      enviados.push({ to: String(b.to?.[0] ?? b.to ?? ''), subject: b.subject, text: b.text, html: b.html });
      return new Response('{"id":"m1"}', { status: 200 });
    }
    return new Response('{}', { status: 200 });
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

const envCompleto = () => envDeTeste({
  RESEND_API_KEY: 're_teste', EMAIL_FROM: 'Hebraico Fluente <c@hebraicofluente.com.br>',
  RESEND_BASE: 'https://api.resend.test', SUPPORT_EMAIL: DONO, SITE_ORIGIN: SITE, ADMIN_EMAILS: DONO
}) as Env;
const exec = (env: Env, sql: string, ...a: unknown[]) => env.DB.bruto.prepare(sql).run(...(a as never[]));

let seq = 0;
function conta(env: Env, email: string, name = 'Ana') {
  const r = exec(env, `INSERT INTO accounts (email, name, pass_hash, pass_salt, created_at) VALUES (?, ?, 'x', 'y', 1)`, email, name);
  return Number(r.lastInsertRowid);
}
function compra(env: Env, accountId: number, pagoEm: number, { slug = 'alfabetizacao', status = 'paid' } = {}) {
  const id = `HFTESTE${++seq}`;
  exec(env, `INSERT INTO orders (id, account_id, course_slug, amount_cents, method, status, created_at, paid_at)
             VALUES (?, ?, ?, 13230, 'pix', ?, ?, ?)`, id, accountId, slug, status, pagoEm, pagoEm);
  return id;
}
function progresso(env: Env, accountId: number, licoes: string[], quando: number) {
  const lessons = Object.fromEntries(licoes.map(l => [l, { completedAt: new Date(quando).toISOString() }]));
  exec(env, `INSERT OR REPLACE INTO progress (account_id, state, updated_at) VALUES (?, ?, ?)`,
    accountId, JSON.stringify({ lessons }), quando);
}
/** Roda a varredura no instante `at` (a trava de 23 h é por chamada: cada dia é uma rodada nova). */
async function rodar(env: Env, at: number) {
  enviados = [];
  await runAtivacao(env, at);
  return enviados;
}

const T0 = ATIVACAO_DESDE + 2 * DIA;   // uma compra feita depois da publicação

describe('os três lembretes', () => {
  it('d1, d3 e d7 para quem comprou e não começou, cada um uma vez', async () => {
    const env = envCompleto();
    const id = conta(env, 'ana@exemplo.com');
    compra(env, id, T0);

    expect(await rodar(env, T0 + 3_600_000), 'antes de um dia, nada').toHaveLength(0);
    const d1 = await rodar(env, T0 + 1 * DIA + 3_600_000);
    expect(d1.map(m => m.subject)).toEqual(['Sua primeira lição leva dez minutos']);
    expect(d1[0]!.to).toBe('ana@exemplo.com');
    expect(d1[0]!.text).toContain(`${SITE}/inicio/`);
    expect(await rodar(env, T0 + 2 * DIA + 3_600_000), 'o mesmo marco não repete').toHaveLength(0);

    const d3 = await rodar(env, T0 + 3 * DIA + 3_600_000);
    expect(d3.map(m => m.subject)).toEqual(['Ficou alguma dúvida para começar?']);
    expect(d3[0]!.text).toContain(`${SITE}/licao/alef/`);

    const d7 = await rodar(env, T0 + 7 * DIA + 3_600_000);
    expect(d7.map(m => m.subject)).toEqual(['Uma letra hoje?']);
    expect(await rodar(env, T0 + 8 * DIA + 3_600_000)).toHaveLength(0);
    expect(await rodar(env, T0 + 12 * DIA)).toHaveLength(0);
  });

  it('quem já está estudando não recebe d1 nem d3, e só recebe d7 se parou', async () => {
    const env = envCompleto();
    const estuda = conta(env, 'bia@exemplo.com', 'Bia');
    const parou = conta(env, 'caio@exemplo.com', 'Caio');
    compra(env, estuda, T0);
    compra(env, parou, T0);
    progresso(env, estuda, ['alef', 'mem'], T0 + 6.5 * DIA);
    progresso(env, parou, ['alef'], T0 + 2 * 3_600_000);

    expect(await rodar(env, T0 + 1 * DIA + 3_600_000)).toHaveLength(0);
    expect(await rodar(env, T0 + 3 * DIA + 3_600_000)).toHaveLength(0);
    const d7 = await rodar(env, T0 + 7 * DIA + 3_600_000);
    expect(d7.map(m => m.to)).toEqual(['caio@exemplo.com']);
    expect(d7[0]!.subject).toBe('Continue de onde você parou');
    expect(d7[0]!.text).toContain('Você já concluiu 1 lição');
    expect(d7[0]!.text).toContain(`${SITE}/meu-hebraico/`);
  });

  it('nada retroativo, nada para estorno, teste, conta apagada, administrador ou só o livro', async () => {
    const env = envCompleto();
    compra(env, conta(env, 'antiga@exemplo.com'), ATIVACAO_DESDE - 1 * DIA);
    compra(env, conta(env, 'estornou@exemplo.com'), T0, { status: 'refunded' });
    compra(env, conta(env, 'pendente@exemplo.com'), T0, { status: 'pending' });
    compra(env, conta(env, 'e2e@hebraicofluente.invalid'), T0);
    compra(env, conta(env, 'apagada-9@hebraicofluente.local'), T0);
    compra(env, conta(env, DONO), T0);
    compra(env, conta(env, 'livro@exemplo.com'), T0, { slug: 'israel-alem-do-roteiro' });
    const doCombo = conta(env, 'combo@exemplo.com');
    compra(env, doCombo, T0, { slug: 'alfabetizacao-e-israel' });

    const d1 = await rodar(env, T0 + 1 * DIA + 3_600_000);
    expect(d1.map(m => m.to)).toEqual(['combo@exemplo.com']);
    expect(d1[0]!.text).toContain('curso Alfabetização em Hebraico');
  });

  it('e-mail que falha não marca o lembrete: a rodada seguinte tenta de novo', async () => {
    const env = envCompleto();
    compra(env, conta(env, 'ana@exemplo.com'), T0);
    vi.stubGlobal('fetch', async () => new Response('{"message":"falhou"}', { status: 500 }));
    expect(await rodar(env, T0 + 1 * DIA + 3_600_000)).toHaveLength(0);
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      const b = JSON.parse(String(init?.body ?? '{}'));
      enviados.push({ to: String(b.to?.[0] ?? b.to ?? ''), subject: b.subject, text: b.text, html: b.html });
      return new Response('{"id":"m2"}', { status: 200 });
    });
    expect((await rodar(env, T0 + 2 * DIA)).map(m => m.subject)).toEqual(['Sua primeira lição leva dez minutos']);
  });
});

describe('o texto dos lembretes', () => {
  it('não fala de preço, não oferece produto e escapa o nome', () => {
    for (const marco of ['d1', 'd3', 'd7']) {
      for (const concluidas of [0, 3]) {
        const m = mensagemDeAtivacao({
          nome: '<b>Ana</b>', curso: 'Alfabetização em Hebraico', marco, concluidas,
          inicio: `${SITE}/inicio/`, primeira: `${SITE}/licao/alef/`, painel: `${SITE}/meu-hebraico/`,
          marca: 'Hebraico Fluente', suporte: 'contato@hebraicofluente.com.br'
        });
        const tudo = `${m.subject} ${m.text} ${m.html}`;
        expect(tudo).not.toMatch(/R\$|preço|desconto|checkout|oferta|combo|livro/i);
        expect(m.html).not.toContain('<b>Ana</b>');
        expect(m.text).toContain('Estes lembretes são só três');
      }
    }
  });

  it('a regra de cada marco', () => {
    const at = T0 + 7 * DIA;
    expect(cabe('d1', { concluidas: 0, progressoEm: null }, at)).toBe(true);
    expect(cabe('d1', { concluidas: 1, progressoEm: at }, at)).toBe(false);
    expect(cabe('d7', { concluidas: 5, progressoEm: at - 1 * DIA }, at)).toBe(false);
    expect(cabe('d7', { concluidas: 5, progressoEm: at - 4 * DIA }, at)).toBe(true);
    expect(cabe('outro', { concluidas: 0, progressoEm: null }, at)).toBe(false);
  });
});

describe('os testes do dono fora dos painéis', () => {
  it('/admin/vendas marca o teste e /admin/estatisticas não o soma', async () => {
    const env = envCompleto();
    const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Dono', email: DONO, password: 'senha-boa-123' }), env, ctx });
    const dono = await comoAdmin(env, cookieDe(r));
    const idDono = Number((env.DB.bruto.prepare('SELECT id FROM accounts WHERE email = ?').get(DONO) as { id: number }).id);
    const agora = Date.now();
    compra(env, idDono, agora - DIA);
    compra(env, idDono, agora - DIA, { status: 'refunded' });
    compra(env, idDono, agora - DIA, { status: 'pending' });
    compra(env, conta(env, 'ana@exemplo.com'), agora - DIA);

    const { vendas } = await (await worker.fetch(new Request(`${SITE}/api/admin/vendas`, { headers: { cookie: dono } }), env, ctx)).json() as
      { vendas: { email: string; teste: boolean }[] };
    expect(vendas.filter(v => v.teste).map(v => v.email)).toEqual([DONO, DONO]);
    expect(vendas.filter(v => !v.teste).map(v => v.email)).toEqual(['ana@exemplo.com']);

    const est = await (await worker.fetch(new Request(`${SITE}/api/admin/estatisticas?dias=7`, { headers: { cookie: dono } }), env, ctx)).json() as
      { pedidos: { pedidos: number; compras: number; estornos: number }[]; pedidosDeTeste: number };
    const soma = est.pedidos.reduce((t, p) => ({ pedidos: t.pedidos + p.pedidos, compras: t.compras + p.compras, estornos: t.estornos + p.estornos }),
      { pedidos: 0, compras: 0, estornos: 0 });
    expect(soma).toEqual({ pedidos: 1, compras: 1, estornos: 0 });
    expect(est.pedidosDeTeste).toBe(3);
  });
});
