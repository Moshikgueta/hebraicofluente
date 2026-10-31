/* O consumidor e a lei: desistência pelo site, registro de acesso, termos.
 * ─────────────────────────────────────────────────────────────────────────
 * Revisão de 24/09/2026 contra a lei brasileira:
 *
 *   · Decreto 7.962/2013, art. 5º - a desistência (CDC, art. 49) pode ser
 *     feita "pela mesma ferramenta utilizada para a contratação", o site, e
 *     o recebimento é confirmado IMEDIATAMENTE;
 *   · Marco Civil da Internet (Lei 12.965/2014), art. 15 - os registros de
 *     acesso (IP, data e hora) ficam guardados seis meses;
 *   · Código Civil / LGPD art. 14 - quem compra é maior de 18 ou o
 *     responsável.
 *
 * Contra o SQLite com o `worker/schema.sql` de produção (tests/ajuda/d1.ts),
 * e-mail interceptado na saída.
 */

import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookieDe, envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import * as pay from '../../worker/src/api/pay.js';
// @ts-expect-error - idem
import { REGISTROS_DIAS, registrosPurge } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { runReconcile } from '../../worker/src/reconcile.js';

const SITE = 'https://hebraicofluente.com.br';
const pendentes: Promise<unknown>[] = [];
const ctx = { waitUntil: (p: Promise<unknown>) => { pendentes.push(p); } };
const assentar = async () => { await Promise.all(pendentes.splice(0)); };

let enviados: { to: string; subject: string; text: string }[] = [];
beforeEach(() => {
  enviados = [];
  vi.stubGlobal('fetch', async (_u: string, init?: RequestInit) => {
    const b = JSON.parse(String(init?.body ?? '{}'));
    enviados.push({ to: String(b.to?.[0] ?? ''), subject: b.subject, text: b.text });
    return new Response('{"id":"m"}', { status: 200 });
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

type Env = Record<string, unknown> & {
  DB: { bruto: { exec(s: string): void; prepare(s: string): { get(...a: unknown[]): unknown; all(...a: unknown[]): unknown[]; run(...a: unknown[]): unknown } } }
};
const envMail = () => envDeTeste({
  RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>',
  RESEND_BASE: 'https://api.resend.test', SUPPORT_EMAIL: 'dono@exemplo.com'
}) as Env;
const linhas = (env: Env, sql: string) => env.DB.bruto.prepare(sql).all() as Record<string, unknown>[];
const deIp = (ip: string, url: string, body: unknown, cookie?: string) => new Request(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip, ...(cookie ? { Cookie: cookie } : {}) },
  body: JSON.stringify(body)
});

async function comConta(env: Env, email = 'aluna@exemplo.com.br', ipDe = '203.0.113.10') {
  const r = await auth.signup({
    request: deIp(ipDe, `${SITE}/api/auth/signup`, { aceitouTermos: true, declarouIdade: true, name: 'Ana', email, password: 'senha-boa-123' }), env, ctx
  });
  expect(r.status).toBe(200);
  await assentar();
  const { account } = await r.json() as { account: { id: string } };
  return { cookie: cookieDe(r), id: Number(account.id), email };
}

/** Um pedido pago há `diasAtras` dias, como a liberação deixaria. */
function pedidoPago(env: Env, accountId: number, id: string, pagoEm: number) {
  env.DB.bruto.prepare(
    `INSERT INTO orders (id, account_id, course_slug, amount_cents, currency, method, installments,
                         status, provider, provider_ref, paid_at, created_at)
     VALUES (?, ?, 'alfabetizacao', 13230, 'BRL', 'pix', 1, 'paid', 'mercadopago', '1', ?, ?)`
  ).run(id, accountId, pagoEm, pagoEm - 60_000);
}

const desistir = (env: Env, cookie: string, order: string) =>
  pay.desistir({ request: deIp('198.51.100.7', `${SITE}/api/pay/desistir`, { order }, cookie), env, ctx });

/* ── registro de acesso (Marco Civil, art. 15) ─────────────────────────── */

describe('o registro de acesso do Marco Civil', () => {
  it('guarda o IP inteiro, com data e hora, no cadastro, no login e na senha redefinida', async () => {
    const env = envMail();
    await comConta(env, 'aluna@exemplo.com.br', '2001:db8:0:0:1:2:3:4');
    await auth.login({
      request: deIp('203.0.113.20', `${SITE}/api/auth/login`, { email: 'aluna@exemplo.com.br', password: 'senha-boa-123' }), env, ctx
    });
    const r = linhas(env, 'SELECT evento, ip, criado_em FROM registros_acesso ORDER BY id');
    expect(r.map(x => x.evento)).toEqual(['cadastro', 'entrada']);
    /* O IP inteiro, e não o /64 dos freios: é o que identifica a conexão. */
    expect(r[0]!.ip).toBe('2001:db8:0:0:1:2:3:4');
    expect(r[1]!.ip).toBe('203.0.113.20');
    expect(Number(r[1]!.criado_em)).toBeGreaterThan(Date.now() - 60_000);
  });

  it('a tentativa que erra a senha não é acesso, e não é registrada', async () => {
    const env = envMail();
    await comConta(env);
    const antes = linhas(env, 'SELECT * FROM registros_acesso').length;
    await auth.login({
      request: deIp('203.0.113.21', `${SITE}/api/auth/login`, { email: 'aluna@exemplo.com.br', password: 'errada-123' }), env, ctx
    });
    expect(linhas(env, 'SELECT * FROM registros_acesso').length).toBe(antes);
  });

  it(`fica ${REGISTROS_DIAS} dias - pelo menos seis meses - e então a varredura apaga`, async () => {
    expect(REGISTROS_DIAS).toBeGreaterThanOrEqual(184);   // o maior semestre possível
    const env = envMail();
    const { id } = await comConta(env);
    const agora = Date.now();
    env.DB.bruto.prepare('UPDATE registros_acesso SET criado_em = ?').run(agora - (REGISTROS_DIAS + 1) * 86_400_000);
    env.DB.bruto.prepare('INSERT INTO registros_acesso (account_id, evento, ip, criado_em) VALUES (?, ?, ?, ?)')
      .run(id, 'entrada', '203.0.113.30', agora - 183 * 86_400_000);
    await registrosPurge(env);
    expect(linhas(env, 'SELECT ip FROM registros_acesso').map(x => x.ip)).toEqual(['203.0.113.30']);
  });

  it('a varredura de 5 em 5 minutos é quem apaga', () => {
    const fonte = readFileSync(new URL('../../worker/src/reconcile.js', import.meta.url), 'utf8');
    expect(fonte).toContain('registrosPurge(env)');
    expect(typeof runReconcile).toBe('function');
  });

  it('apagar a conta não apaga o registro: é obrigação legal', async () => {
    const env = envMail();
    const { cookie } = await comConta(env);
    const r = await auth.apagar({
      request: deIp('203.0.113.22', `${SITE}/api/auth/delete`, { password: 'senha-boa-123' }, cookie), env
    });
    expect(r.status).toBe(200);
    expect(linhas(env, 'SELECT * FROM registros_acesso')).toHaveLength(1);
  });
});

/* ── desistência pelo site ─────────────────────────────────────────────── */

describe('desistir da compra pelo site', () => {
  it('registra na hora e confirma por e-mail, para a pessoa e para o dono', async () => {
    const env = envMail();
    const { cookie, id, email } = await comConta(env);
    pedidoPago(env, id, 'HF-DESISTE', Date.now() - 2 * 86_400_000);
    enviados = [];

    const r = await desistir(env, cookie, 'HF-DESISTE');
    expect(r.status).toBe(200);
    const corpo = await r.json() as { novo: boolean; pedidoEm: string };
    expect(corpo.novo).toBe(true);
    await assentar();

    expect(linhas(env, 'SELECT order_id, ip FROM arrependimentos')).toEqual([
      { order_id: 'HF-DESISTE', ip: '198.51.100.7' }
    ]);
    const paraEla = enviados.find(m => m.to === email)!;
    expect(paraEla.subject).toContain('Recebemos seu pedido de desistência');
    expect(paraEla.text).toMatch(/em \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2} \(horário de Brasília\)/);
    expect(paraEla.text).toContain('Você não precisa fazer mais nada');
    expect(paraEla.text).toContain('100% do valor');
    const paraODono = enviados.find(m => m.to === 'dono@exemplo.com')!;
    expect(paraODono.text).toContain(email);
    expect(paraODono.text).toContain('HF-DESISTE');
  });

  it('pedir de novo devolve o mesmo momento, e não manda outro e-mail', async () => {
    const env = envMail();
    const { cookie, id } = await comConta(env);
    pedidoPago(env, id, 'HF-DUAS', Date.now() - 86_400_000);
    const a = await (await desistir(env, cookie, 'HF-DUAS')).json() as { pedidoEm: string };
    await assentar();
    enviados = [];
    const b = await (await desistir(env, cookie, 'HF-DUAS')).json() as { pedidoEm: string; novo: boolean };
    await assentar();
    expect(b.novo).toBe(false);
    expect(b.pedidoEm).toBe(a.pedidoEm);
    expect(enviados).toHaveLength(0);
  });

  it('vale até o fim do sétimo dia no horário de Brasília, e não depois', async () => {
    /* Pago numa terça às 14h32 de Brasília (17h32 UTC). */
    const pago = Date.UTC(2026, 8, 1, 17, 32);
    const ate = pay.prazoDeDesistencia(pago, 7);
    expect(new Date(ate).toISOString()).toBe('2026-09-09T02:59:59.999Z');   // 08/09, 23:59:59 em Brasília

    const env = envMail();
    const { cookie, id } = await comConta(env);
    pedidoPago(env, id, 'HF-PRAZO', pago);
    vi.useFakeTimers({ now: ate - 1000, toFake: ['Date'] });
    expect((await desistir(env, cookie, 'HF-PRAZO')).status).toBe(200);

    pedidoPago(env, id, 'HF-TARDE', pago);
    vi.setSystemTime(ate + 1000);
    const tarde = await desistir(env, cookie, 'HF-TARDE');
    expect(tarde.status).toBe(409);
    expect(((await tarde.json()) as { error: string }).error).toBe('fora-do-prazo');

    /* Quem pediu dentro do prazo continua vendo o pedido depois dele. */
    expect((await desistir(env, cookie, 'HF-PRAZO')).status).toBe(200);
  });

  it('só a dona do pedido, só com sessão, e só pedido pago', async () => {
    const env = envMail();
    const dona = await comConta(env, 'dona@exemplo.com.br');
    const outra = await comConta(env, 'outra@exemplo.com.br', '203.0.113.11');
    pedidoPago(env, dona.id, 'HF-DELA', Date.now());

    expect((await pay.desistir({ request: deIp('198.51.100.8', `${SITE}/api/pay/desistir`, { order: 'HF-DELA' }), env, ctx })).status).toBe(401);
    expect((await desistir(env, outra.cookie, 'HF-DELA')).status).toBe(404);

    env.DB.bruto.prepare("UPDATE orders SET status = 'pending' WHERE id = 'HF-DELA'").run();
    const r = await desistir(env, dona.cookie, 'HF-DELA');
    expect(r.status).toBe(409);
    expect(((await r.json()) as { error: string }).error).toBe('nao-pago');
    expect(linhas(env, 'SELECT * FROM arrependimentos')).toEqual([]);
  });

  it('a lista de compras diz até quando dá para desistir, e se já desistiu', async () => {
    const env = envMail();
    const { cookie, id } = await comConta(env);
    pedidoPago(env, id, 'HF-LISTA', Date.now());
    const ler = async () => ((await (await pay.orders({
      request: new Request(`${SITE}/api/orders`, { headers: { Cookie: cookie } }), env
    })).json()) as { orders: { desistirAte: string | null; desistenciaEm: string | null }[] }).orders[0]!;

    const antes = await ler();
    expect(antes.desistirAte).toBeTruthy();
    expect(antes.desistenciaEm).toBeNull();
    await desistir(env, cookie, 'HF-LISTA');
    expect((await ler()).desistenciaEm).toBeTruthy();
  });
});

/* ── o que os textos dizem ─────────────────────────────────────────────── */

describe('os textos legais', () => {
  const fonte = (p: string) => readFileSync(new URL(`../src/app/${p}`, import.meta.url), 'utf8');

  it('os Termos dizem quem pode comprar (18+) e onde desistir', () => {
    const t = fonte('termos/page.tsx');
    expect(t).toContain('maiores de 18 anos');
    expect(t).toContain('Desistir da compra');
    /* Apagar a conta é pela própria tela, e não gera reembolso. */
    expect(t).toContain('não gera reembolso');
  });

  /* 01/10/2026, nas palavras do dono: a ordem das letras vem do método do
     Damián; os exercícios, as explicações para quem fala português e a
     cursiva são adaptação dele. Capa e /sobre leem a mesma frase. */
  it('o crédito ao Damián separa o que vem do método do que é adaptação', async () => {
    const { METODO_ORIGINAL } = await import('@/lib/credito');
    expect(METODO_ORIGINAL.adaptacoesPt).toContain('A ordem em que as letras entram vem do método dele');
    expect(METODO_ORIGINAL.adaptacoesPt).toContain('os exercícios, as explicações pensadas para quem fala português e a escrita cursiva');
    expect(fonte('sobre/page.tsx')).toContain('METODO_ORIGINAL.adaptacoesPt');
  });

  /* 01/10/2026: a empresa é ME (contador), e a Política diz a dispensa do
     encarregado e o canal, em vez de calar sobre o encarregado. */
  it('a Política de Privacidade explica por que não há encarregado nomeado', () => {
    const p = fonte('privacidade/page.tsx');
    expect(p).toContain('privacidade.agentePequenoPorte');
    expect(p).toContain('dispensado de indicar um encarregado (Resolução CD/ANPD nº 2/2022, art. 11)');
  });

  /* 30/09/2026, pedido do dono: a declaração de idade fica só nos Termos
     (art. 3), e o checkout remete a eles em vez de repeti-la. */
  it('a declaração de idade está nos Termos, e o checkout remete a eles', () => {
    expect(fonte('termos/page.tsx')).toContain('você declara ter 18 anos ou mais');
    const c = fonte('checkout/[slug]/CheckoutClient.tsx')
      + readFileSync(new URL('../src/i18n/telas/conta-checkout-client.ts', import.meta.url), 'utf8');
    expect(c).toContain('Ao continuar você concorda com os');
    expect(c).not.toContain('18 anos');
  });

  it('a Política de Reembolso põe o site primeiro, com confirmação na hora', () => {
    const r = fonte('reembolso/page.tsx');
    expect(r).toContain('Desistir da compra');
    expect(r).toContain('a confirmação chega');
  });

  it('a Política de Privacidade descreve o registro de acesso e a confirmação de e-mail', () => {
    const p = fonte('privacidade/page.tsx');
    expect(p).toContain('Marco Civil da Internet');
    expect(p).toContain('Confirmação de e-mail');
    expect(p).toContain('seis meses');
    expect(p).not.toContain('art. 16, II');
  });

  it('a Política descreve o que a auditoria de 28/09 achou faltando', () => {
    const p = fonte('privacidade/page.tsx');
    /* LEGAL-002: retenções da trilha e do IP da desistência. */
    expect(p).toContain('Trilha de operações da conta');
    expect(p).toContain('o endereço IP, seis meses');
    /* LEGAL-003: operadores. */
    expect(p).toContain('<strong>GitHub</strong>');
    expect(p).toContain('Gmail, do Google');
    /* LEGAL-004: o Resend recebe o nome da conta, não só o primeiro nome. */
    expect(p).not.toContain('primeiro nome');
    /* LEGAL-007: as cópias de segurança e o prazo delas. */
    expect(p).toContain('Cópias de segurança');
    expect(p).toContain('90 dias');
    /* LEGAL-010: a voz do visitante na página inicial. */
    expect(p).toContain('demonstração da página inicial');
  });

  it('o cadastro mostra os Termos e a Política (LEGAL-009)', () => {
    const f = readFileSync(new URL('../src/components/platform/AuthForm.tsx', import.meta.url), 'utf8');
    expect(f).toContain('href="/termos"');
    expect(f).toContain('href="/privacidade"');
  });

  it('o IP da desistência sai na varredura, no prazo do registro de acesso', () => {
    const r = readFileSync(new URL('../../worker/src/reconcile.js', import.meta.url), 'utf8');
    expect(r).toContain('arrependimentosIpPurge(env)');
  });
});

/* PIX direto (auditoria de 28/09, LEGAL-017): a liberação é à mão, então
   nenhuma tela de venda pode prometer "em alguns minutos" nesse modo. */
describe('o PIX direto não promete acesso em minutos', () => {
  it('checkout, FAQ, capa e rodapé não prometem liberação "em alguns minutos"', () => {
    for (const f of [
      'src/app/checkout/[slug]/CheckoutClient.tsx', 'src/app/faq/page.tsx',
      'src/components/landing/Fecho.tsx', 'src/components/shell/PublicShell.tsx',
      'src/i18n/telas/conta-checkout-client.ts', 'src/i18n/telas/conta-public-shell.ts'
    ]) {
      /* "Recarregue em alguns minutos" (modo automático) continua valendo. */
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/(liberad[oa]|normalmente|Acesso liberado) em alguns minutos/);
    }
  });
});

/* O motivo, opcional (04/10/2026): a desistência nunca depende dele. */
describe('o motivo da desistência', () => {
  const desistirCom = (env: Env, cookie: string, order: string, motivo: unknown) =>
    pay.desistir({ request: deIp('198.51.100.9', `${SITE}/api/pay/desistir`, { order, motivo }, cookie), env, ctx });

  it('com motivo: vai no e-mail do dono e soma um contador sem nome', async () => {
    const env = envMail();
    const { cookie, id } = await comConta(env);
    pedidoPago(env, id, 'HF-MOTIVO', Date.now() - 3_600_000);
    expect((await desistirCom(env, cookie, 'HF-MOTIVO', 'tempo')).status).toBe(200);
    await assentar();
    const dono = enviados.find(e => e.to === 'dono@exemplo.com')!;
    expect(dono.text).toContain('Motivo: Não tenho tempo agora');
    expect(linhas(env, "SELECT chave, n FROM estatisticas WHERE chave LIKE 'm|%'")).toEqual([{ chave: 'm|tempo', n: 1 }]);
  });

  it('sem motivo, ou com um inválido: a desistência segue igual', async () => {
    const env = envMail();
    const { cookie, id } = await comConta(env);
    pedidoPago(env, id, 'HF-SEM', Date.now() - 3_600_000);
    pedidoPago(env, id, 'HF-LIXO', Date.now() - 3_600_000);
    expect((await desistir(env, cookie, 'HF-SEM')).status).toBe(200);
    expect((await desistirCom(env, cookie, 'HF-LIXO', '<script>')).status).toBe(200);
    await assentar();
    const doDono = enviados.filter(e => e.to === 'dono@exemplo.com');
    expect(doDono).toHaveLength(2);
    for (const e of doDono) expect(e.text).toContain('Motivo: não informado (é opcional)');
    expect(linhas(env, "SELECT chave FROM estatisticas WHERE chave LIKE 'm|%'")).toEqual([]);
  });
});
