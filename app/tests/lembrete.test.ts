/* O lembrete para estudar (28/10/2026), com a chave LIGADA só neste arquivo.
   Em produção ele nasce desligado (lembrete-desligado.test.ts). O que este
   arquivo prova: só quem tem o curso liga; sair pelo link funciona sem
   login e só com a assinatura certa; a varredura manda às 19h de Brasília,
   uma vez por dia, só a quem não estudou, e para no terceiro lembrete
   seguido sem estudo, até a pessoa voltar. */
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

vi.mock('../../data/empresa.json', () => {
  const real = JSON.parse(readFileSync(new URL('../../data/empresa.json', import.meta.url), 'utf8'));
  return { default: { ...real, privacidade: { ...real.privacidade, lembreteDeEstudo: true } } };
});

// @ts-expect-error - módulo JS do Worker, sem tipos
const { default: worker } = await import('../../worker/src/worker.js');
// @ts-expect-error - idem
const auth = await import('../../worker/src/api/auth.js');
// @ts-expect-error - idem
const { createOrder, grantAccess, deleteAccount } = await import('../../worker/src/lib/db.js');
// @ts-expect-error - idem
const { tokenDeSaida } = await import('../../worker/src/api/lembrete.js');
// @ts-expect-error - idem
const { runLembretes, decidir, agoraEmBrasilia } = await import('../../worker/src/lembrete.js');
// @ts-expect-error - idem
const { dadosDaConta } = await import('../../worker/src/api/meus-dados.js');

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };
const comEmail = () => envDeTeste({ RESEND_API_KEY: 're_teste', EMAIL_FROM: 'Hebraico Fluente <ola@exemplo.com>', RESEND_BASE: 'https://api.resend.test' }) as Env;

let enviados: { to: string; subject: string; text: string; headers?: Record<string, string> }[];
beforeEach(() => {
  enviados = [];
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const b = JSON.parse(String(init?.body ?? '{}'));
    if (!String(b.subject).startsWith('Confirme seu e-mail')) enviados.push({ to: b.to[0], subject: b.subject, text: b.text, headers: b.headers });
    return new Response('{"id":"m"}', { status: 200 });
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

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
  return { cookie, id };
}
const marcar = (env: Env, cookie: string, quero: unknown) => worker.fetch(new Request(`${SITE}/api/lembrete`, {
  method: 'PUT', headers: { cookie, Origin: SITE, 'Content-Type': 'application/json' }, body: JSON.stringify({ quero })
}), env, ctx);
const sair = (env: Env, t: string) => worker.fetch(new Request(`${SITE}/api/lembrete/sair`, {
  method: 'POST', headers: { Origin: SITE, 'Content-Type': 'application/json' }, body: JSON.stringify({ t })
}), env, ctx);
const me = async (env: Env, cookie: string) => (await (await worker.fetch(new Request(`${SITE}/api/me`, { headers: { cookie } }), env, ctx)).json()) as { account: { lembrete?: boolean } };
const estudou = (env: Env, id: number, dia: string) =>
  env.DB.bruto.prepare('INSERT INTO progress (account_id, state, updated_at) VALUES (?, ?, ?) ON CONFLICT(account_id) DO UPDATE SET state = excluded.state')
    .run(id, JSON.stringify({ days: { [dia]: { units: 3 } } }), Date.now());

/* 2 de novembro, 19h30 em Brasília (22h30 UTC); dia D, e os seguintes. */
const NOITE = Date.parse('2026-11-02T22:30:00Z');
const DIA = 86_400_000;

describe('ligar e desligar o lembrete', () => {
  it('só quem tem o curso liga; o /api/me conta; apagar a conta tira', async () => {
    const env = comEmail();
    const ana = await conta(env, 'ana@exemplo.com');
    const bia = await conta(env, 'bia@exemplo.com', false);
    expect((await me(env, ana.cookie)).account.lembrete).toBe(false);
    expect((await marcar(env, '', true)).status).toBe(401);
    expect((await marcar(env, ana.cookie, 'sim')).status).toBe(400);
    expect((await marcar(env, ana.cookie, true)).status).toBe(200);
    expect((await me(env, ana.cookie)).account.lembrete).toBe(true);
    /* A rota aceita a conta sem curso, mas a varredura não manda nada a ela. */
    expect((await marcar(env, bia.cookie, true)).status).toBe(200);
    await runLembretes(env, NOITE);
    expect(enviados.map(e => e.to)).toEqual(['ana@exemplo.com']);
    expect((await dadosDaConta(env, { id: ana.id, email: 'ana@exemplo.com', created_at: 0 })).lembreteParaEstudar).not.toBeNull();
    await deleteAccount(env, ana.id);
    expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM lembretes_estudo WHERE account_id = ?').get(ana.id)).toEqual({ n: 0 });
  });

  it('o link do e-mail tira sem login, só com a assinatura certa', async () => {
    const env = comEmail();
    const ana = await conta(env, 'ana@exemplo.com');
    await marcar(env, ana.cookie, true);
    await runLembretes(env, NOITE);
    const e = enviados[0]!;
    const t = await tokenDeSaida(env, ana.id);
    expect(e.text).toContain(encodeURIComponent(t));
    expect(e.headers?.['List-Unsubscribe']).toContain('/sair-da-lista/?t=');
    expect((await sair(env, t.replace(/.$/, c => (c === 'A' ? 'B' : 'A')))).status).toBe(400);
    expect((await sair(env, `l${ana.id + 1}.${t.split('.')[1]}`)).status).toBe(400);
    /* O token da lista de novidades não serve aqui. */
    expect((await sair(env, t.slice(1))).status).toBe(400);
    expect((await sair(env, t)).status).toBe(200);
    expect((await me(env, ana.cookie)).account.lembrete).toBe(false);
  });
});

describe('a varredura da noite', () => {
  it('antes das 19h não manda; depois, uma vez por dia', async () => {
    const env = comEmail();
    const ana = await conta(env, 'ana@exemplo.com');
    await marcar(env, ana.cookie, true);
    await runLembretes(env, NOITE - 2 * 3_600_000);
    expect(enviados).toHaveLength(0);
    await runLembretes(env, NOITE);
    await runLembretes(env, NOITE + 600_000);
    expect(enviados).toHaveLength(1);
    expect(enviados[0]!.subject).toBe('Dez minutos de hebraico hoje?');
    expect(enviados[0]!.text).toContain(`${SITE}/meu-hebraico/`);
  });

  it('quem estudou hoje não recebe', async () => {
    const env = comEmail();
    const ana = await conta(env, 'ana@exemplo.com');
    await marcar(env, ana.cookie, true);
    estudou(env, ana.id, agoraEmBrasilia(NOITE).dia);
    await runLembretes(env, NOITE);
    expect(enviados).toHaveLength(0);
  });

  it('três seguidos sem estudo e para; estudar faz voltar', async () => {
    const env = comEmail();
    const ana = await conta(env, 'ana@exemplo.com');
    await marcar(env, ana.cookie, true);
    for (let d = 0; d < 5; d++) await runLembretes(env, NOITE + d * DIA);
    expect(enviados).toHaveLength(3);
    /* Estudou no sexto dia: nada nesse dia, e no sétimo o lembrete volta. */
    estudou(env, ana.id, agoraEmBrasilia(NOITE + 5 * DIA).dia);
    await runLembretes(env, NOITE + 5 * DIA);
    expect(enviados).toHaveLength(3);
    await runLembretes(env, NOITE + 6 * DIA);
    expect(enviados).toHaveLength(4);
  });

  it('a regra, pura', () => {
    expect(decidir({ hoje: '2026-11-02', estudouEm: null, ultimoDia: null, seguidos: 0 })).toEqual({ manda: true, seguidos: 1 });
    expect(decidir({ hoje: '2026-11-02', estudouEm: '2026-11-02', ultimoDia: '2026-11-01', seguidos: 2 })).toEqual({ manda: false, seguidos: 0 });
    expect(decidir({ hoje: '2026-11-02', estudouEm: '2026-10-20', ultimoDia: '2026-11-01', seguidos: 3 })).toEqual({ manda: false, seguidos: 3 });
    /* Estudou ontem à noite, depois do lembrete de ontem: a conta zera. */
    expect(decidir({ hoje: '2026-11-02', estudouEm: '2026-11-01', ultimoDia: '2026-11-01', seguidos: 3 })).toEqual({ manda: true, seguidos: 1 });
  });
});
