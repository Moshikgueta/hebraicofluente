/* O que a auditoria de segurança de 20/09/2026 fechou, e não pode reabrir.
 * ─────────────────────────────────────────────────────────────────────────
 * Cada bloco aqui é um achado que dez agentes independentes confirmaram
 * contra o código real, e cada teste reproduz o ataque ANTES de conferir a
 * defesa - onde dá, o mesmo pedido que abria a porta é o que está aqui,
 * agora esperando a porta fechada. Contra um SQLite de verdade com o
 * `worker/schema.sql` de produção (tests/ajuda/d1.ts), e contra o Worker
 * inteiro (`worker.fetch`), não contra pedaços dele.
 *
 * O relatório completo está em SECURITY-AUDIT.md.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { canonical, gate, isGatedPath } from '../../worker/src/gate.js';
// @ts-expect-error - idem
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import * as pay from '../../worker/src/api/pay.js';
// @ts-expect-error - idem
import * as progress from '../../worker/src/api/progress.js';
// @ts-expect-error - idem
import { readJson } from '../../worker/src/lib/http.js';
// @ts-expect-error - idem
import { makeSessionCookie, readSession } from '../../worker/src/lib/session.js';
// @ts-expect-error - idem
import { enxuto, estourou, grantAccess, hasEntitlement, inviteCreate, recordEvent, throttled } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { getPayment, verifyWebhookSignature } from '../../worker/src/lib/mercadopago.js';
// @ts-expect-error - idem
import { hmacHex } from '../../worker/src/lib/crypto.js';
import { safeNext } from '../src/lib/safe-next';
import { mergeStates } from '../src/lib/state/merge';
import { empresa, formasAtivas, temCartao, temPix } from '../src/lib/empresa';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };

/* Um servidor de ativos de mentira: devolve HTML público com os cabeçalhos
   que o da Cloudflare devolve. */
const ASSETS = {
  fetch: async (_r: Request) => new Response('<html><body>aula</body></html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate' }
  })
};

const envSite = (extra: Record<string, unknown> = {}) => envDeTeste({ ASSETS, ...extra });

async function comConta(env: Record<string, unknown>, email = 'aluna@exemplo.com.br') {
  const r = await auth.signup({
    request: pedido(`${SITE}/api/auth/signup`, { name: 'Ana', email, password: 'senha-boa-123' }),
    env, ctx
  });
  expect(r.status).toBe(200);
  const body = await r.json() as { account: { id: number } };
  return { cookie: cookieDe(r), id: body.account.id, email };
}

const linhas = (env: Record<string, unknown>, sql: string) =>
  ((env.DB as { bruto: { prepare(s: string): { all(): unknown[] } } }).bruto.prepare(sql).all());

/* ── o portão ───────────────────────────────────────────────────────────── */

describe('o portão não acredita em cabeçalho do cliente', () => {
  const alvo = `${SITE}/licao/alef/`;

  it.each([
    ['sem Sec-Fetch-Dest', {}, 302],
    ['Sec-Fetch-Dest: document', { 'Sec-Fetch-Dest': 'document' }, 302],
    ['Sec-Fetch-Dest: empty (o ataque)', { 'Sec-Fetch-Dest': 'empty' }, 403],
    ['Sec-Fetch-Dest: iframe', { 'Sec-Fetch-Dest': 'iframe' }, 403],
    ['Sec-Fetch-Dest: image', { 'Sec-Fetch-Dest': 'image' }, 403],
    ['Sec-Fetch-Dest: xyz', { 'Sec-Fetch-Dest': 'xyz' }, 403]
  ])('sem sessão, %s → recusa', async (_n, headers, status) => {
    const r = await gate(new Request(alvo, { headers }), envSite());
    expect(r, 'o portão deixou passar').toBeTruthy();
    expect(r.status).toBe(status);
    expect(r.headers.get('cache-control')).toBe('no-store');
  });

  it('com sessão mas sem o curso, recusa para a página de vendas', async () => {
    const env = envSite();
    const { cookie } = await comConta(env);
    const r = await gate(new Request(alvo, { headers: { Cookie: cookie } }), env);
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toContain('/cursos/alfabetizacao/');
  });

  it('com sessão e curso, passa - inclusive o index.txt que o Next busca', async () => {
    const env = envSite();
    const { cookie, id } = await comConta(env);
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
    expect(await gate(new Request(alvo, { headers: { Cookie: cookie } }), env)).toBeNull();
    expect(await gate(new Request(`${alvo}index.txt`, {
      headers: { Cookie: cookie, 'Sec-Fetch-Dest': 'empty' }
    }), env)).toBeNull();
  });

  it('normaliza o caminho antes de decidir', () => {
    for (const p of ['/LICAO/alef/', '//licao/alef/', '/licao//alef', '/%6cicao/alef/', '/Modulo/1', '/audio/alef.mp3']) {
      expect(isGatedPath(p), p).toBe(true);
    }
    expect(isGatedPath('/licaox/alef')).toBe(false);
    expect(isGatedPath('/cursos/alfabetizacao/')).toBe(false);
    /* O que não decodifica é tratado como pago: na dúvida, fecha. */
    expect(isGatedPath('/%zz/licao')).toBe(true);
    expect(canonical('/%zz')).toBeNull();
  });
});

/* ── os cabeçalhos do site ──────────────────────────────────────────────── */

describe('o site sai blindado', () => {
  it('toda página HTML leva CSP, anti-moldura, HSTS e Referrer-Policy', async () => {
    const r = await worker.fetch(new Request(`${SITE}/`), envSite(), ctx);
    expect(r.status).toBe(200);
    const csp = r.headers.get('content-security-policy') || '';
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("default-src 'self'");
    expect(r.headers.get('x-frame-options')).toBe('DENY');
    expect(r.headers.get('strict-transport-security')).toContain('max-age=31536000');
    expect(r.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('uma aula liberada nunca é cacheável por um intermediário', async () => {
    const env = envSite();
    const { cookie, id } = await comConta(env);
    await grantAccess(env, { accountId: id, courseSlug: 'alfabetizacao', orderId: 'T', months: 12 });
    const r = await worker.fetch(new Request(`${SITE}/licao/alef/`, { headers: { Cookie: cookie } }), env, ctx);
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toBe('private, no-store');
  });

  /* A verificação independente pegou: a primeira versão só blindava as
     páginas, e o HSTS faltava no 301 do www, no 302 do portão e em toda
     resposta da API - justamente as que carregam senha. */
  it('o redirect do portão, o 301 do www e a API também saem blindados', async () => {
    const env = envSite();
    const portao = await worker.fetch(new Request(`${SITE}/licao/alef/`), env, ctx);
    expect(portao.status).toBe(302);
    expect(portao.headers.get('strict-transport-security')).toContain('max-age=31536000');
    expect(portao.headers.get('x-content-type-options')).toBe('nosniff');
    expect(portao.headers.get('cache-control')).toContain('no-store');

    const www = await worker.fetch(new Request('https://www.hebraicofluente.com.br/entrar/'), env, ctx);
    expect(www.status).toBe(301);
    expect(www.headers.get('location')).toBe(`${SITE}/entrar/`);
    expect(www.headers.get('strict-transport-security')).toContain('max-age=31536000');

    const api = await worker.fetch(new Request(`${SITE}/api/me`), env, ctx);
    expect(api.status).toBe(401);
    expect(api.headers.get('strict-transport-security')).toContain('max-age=31536000');
    expect(api.headers.get('x-content-type-options')).toBe('nosniff');
    expect(api.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    /* JSON não leva CSP - a política é de página. */
    expect(api.headers.get('content-security-policy')).toBeNull();
  });
});

/* ── escrita só da própria origem ──────────────────────────────────────── */

describe('a API recusa escrita de outra origem', () => {
  const login = (headers: Record<string, string>) =>
    worker.fetch(pedido(`${SITE}/api/auth/login`, { email: 'x@exemplo.com', password: 'nada-nada' }, headers),
      envSite(), ctx);

  it('Origin de outro site → 403, antes de qualquer handler', async () => {
    expect((await login({ Origin: 'https://evil.example' })).status).toBe(403);
  });
  it('Sec-Fetch-Site: cross-site → 403', async () => {
    expect((await login({ 'Sec-Fetch-Site': 'cross-site' })).status).toBe(403);
  });
  it('a própria origem, ou nenhuma declarada, chega ao handler', async () => {
    expect((await login({ Origin: SITE, 'Sec-Fetch-Site': 'same-origin' })).status).toBe(401);
    expect((await login({})).status).toBe(401);
  });
  it('GET não é afetado; o webhook fica de fora porque a assinatura é a trava dele', async () => {
    const g = await worker.fetch(new Request(`${SITE}/api/me`, { headers: { Origin: 'https://evil.example' } }), envSite(), ctx);
    expect(g.status).toBe(401);
    const w = await worker.fetch(new Request(`${SITE}/api/pay/webhook?data.id=123&type=payment`, {
      method: 'POST', headers: { Origin: 'https://api.mercadopago.com', 'content-type': 'application/json' }, body: '{}'
    }), envSite(), ctx);
    expect(w.status).toBe(401);   // chegou ao handler, e a assinatura recusou
  });
});

/* ── o corpo ────────────────────────────────────────────────────────────── */

describe('o limite do corpo é em bytes', () => {
  it('um corpo em hebraico não passa com o dobro do tamanho', async () => {
    const texto = 'א'.repeat(5000);                       // 5.000 unidades, 10.000 bytes
    const r = new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ t: texto }) });
    expect(await readJson(r, 8 * 1024)).toBeNull();
    const ok = new Request(`${SITE}/x`, { method: 'POST', body: JSON.stringify({ t: 'א'.repeat(1000) }) });
    expect(await readJson(ok, 8 * 1024)).toEqual({ t: 'א'.repeat(1000) });
  });
  it('um Content-Length declarado acima do limite é recusado sem ler', async () => {
    const r = new Request(`${SITE}/x`, { method: 'POST', headers: { 'Content-Length': '99999999' }, body: '{}' });
    expect(await readJson(r, 8 * 1024)).toBeNull();
  });

  /* Sem Content-Length (chunked), a primeira versão lia o corpo INTEIRO
     antes de medir - cem megabytes materializados para responder "grande
     demais". O leitor agora para no pedaço que passa do teto. */
  it('um corpo em pedaços, sem Content-Length, é largado no byte seguinte ao teto', async () => {
    let entregues = 0;
    const pedaco = new TextEncoder().encode('x'.repeat(1024));
    const corpo = new ReadableStream<Uint8Array>({
      pull(c) {
        entregues++;
        if (entregues > 200) c.close(); else c.enqueue(pedaco);
      }
    });
    const r = new Request(`${SITE}/x`, { method: 'POST', body: corpo, duplex: 'half' } as RequestInit);
    expect(r.headers.get('content-length')).toBeNull();
    expect(await readJson(r, 8 * 1024)).toBeNull();
    /* Oito cabem, o nono estoura; com folga de leitura antecipada, nunca 200. */
    expect(entregues).toBeGreaterThanOrEqual(9);
    expect(entregues).toBeLessThan(20);
  });

  it('um corpo em pedaços dentro do teto é lido inteiro', async () => {
    const partes = ['{"a":', '"א', 'ב"', '}'].map(s => new TextEncoder().encode(s));
    const corpo = new ReadableStream<Uint8Array>({
      start(c) { for (const p of partes) c.enqueue(p); c.close(); }
    });
    const r = new Request(`${SITE}/x`, { method: 'POST', body: corpo, duplex: 'half' } as RequestInit);
    expect(await readJson(r, 8 * 1024)).toEqual({ a: 'אב' });
  });
});

/* ── a sessão ───────────────────────────────────────────────────────────── */

describe('a sessão', () => {
  it('vale o primeiro cookie que CONFERE, não o primeiro que aparece', async () => {
    const env = envSite();
    const { cookie } = await comConta(env);
    const enxerto = `hf_session=lixo.lixo; ${cookie}; outro=1`;
    const r = await auth.me({ request: new Request(`${SITE}/api/me`, { headers: { Cookie: enxerto } }), env });
    expect(r.status).toBe(200);
  });

  /* O teto de quatro candidatos reabria a porta: cinco enxertos e o
     legítimo nunca entrava no laço. Agora o teto é de trabalho - até 32
     candidatos de tamanho plausível - e um enxerto gigante nem é conferido. */
  it('cinco, vinte enxertos ou um enxerto gigante não derrubam o cookie legítimo', async () => {
    const env = envSite();
    const { cookie } = await comConta(env);
    const me = (c: string) => auth.me({ request: new Request(`${SITE}/api/me`, { headers: { Cookie: c } }), env });
    const lixo = (n: number) => Array.from({ length: n }, (_, i) => `hf_session=lixo${i}.lixo`).join('; ');
    expect((await me(`${lixo(5)}; ${cookie}`)).status).toBe(200);
    expect((await me(`${lixo(20)}; ${cookie}`)).status).toBe(200);
    expect((await me(`hf_session=${'a'.repeat(3000)}.b; ${cookie}`)).status).toBe(200);
    /* Sem o legítimo, nada disso vira sessão. */
    expect((await me(lixo(20))).status).toBe(401);
  });

  it('não carrega e-mail nem nome', async () => {
    const env = envSite();
    const c = await makeSessionCookie(env, { id: 7, email: 'a@b.co', name: 'Ana', session_version: 0 });
    const payload = c.split('=')[1]!.split('.')[0]!;
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString());
    expect(Object.keys(dados).sort()).toEqual(['exp', 'sv', 'uid']);
    const lido = await readSession(new Request(SITE, { headers: { Cookie: c.split(';')[0]! } }), env);
    expect(lido.uid).toBe(7);
  });
});

/* ── o freio ────────────────────────────────────────────────────────────── */

describe('o freio', () => {
  it('não gasta escrita no banco com quem já estourou', async () => {
    const env = envSite();
    expect(await throttled(env, 'k', 2)).toBe(false);
    expect(await throttled(env, 'k', 2)).toBe(false);
    expect(await throttled(env, 'k', 2)).toBe(true);
    expect(await throttled(env, 'k', 2)).toBe(true);
    expect(await throttled(env, 'k', 2)).toBe(true);
    const [row] = linhas(env, "SELECT hits FROM throttle WHERE key = 'k'") as { hits: number }[];
    expect(row!.hits).toBe(2);   // e não 5
    expect(await estourou(env, 'k', 2)).toBe(true);
    expect(await estourou(env, 'outra', 2)).toBe(false);
  });

  /* A verificação independente mostrou que ler-e-depois-gravar não é uma
     operação: uma rajada em paralelo lia "zero" N vezes e passava inteira.
     Aqui as cinquenta chamadas são disparadas de uma vez, e só `limit`
     recebem passagem. */
  it('uma rajada em paralelo não passa inteira', async () => {
    const env = envSite();
    const veredictos: boolean[] = await Promise.all(Array.from({ length: 50 }, () => throttled(env, 'rajada', 5)));
    expect(veredictos.filter(v => v === false)).toHaveLength(5);
    expect(veredictos.filter(v => v === true)).toHaveLength(45);
    const [row] = linhas(env, "SELECT hits FROM throttle WHERE key = 'rajada'") as { hits: number }[];
    expect(row!.hits).toBeGreaterThanOrEqual(5);
  });

  /* A limpeza oportunista apagava a linha que a própria chamada tinha
     acabado de criar, para toda janela maior que o horizonte dela: a linha
     de uma janela de 24 horas é carimbada no INÍCIO do dia, e às duas da
     tarde já tinha "mais de duas horas". O contador nunca passava de um, e
     o freio de 24 horas não freava nada. */
  it('uma janela de 24 horas conta de verdade, e a limpeza não a come', async () => {
    const env = envSite();
    const dia = 24 * 3_600_000;
    expect(await throttled(env, 'diario', 1, dia)).toBe(false);
    for (let i = 0; i < 4; i++) expect(await throttled(env, 'diario', 1, dia)).toBe(true);
    /* Uma chave nova de um minuto dispara a limpeza; a linha diária fica. */
    await throttled(env, 'outra', 5);
    expect(await throttled(env, 'diario', 1, dia)).toBe(true);
    expect(linhas(env, "SELECT 1 AS x FROM throttle WHERE key LIKE 'diario%'")).toHaveLength(1);
  });

  it('janelas diferentes não colidem, e a limpeza de uma não apaga a outra', async () => {
    const env = envSite();
    for (let i = 0; i < 5; i++) await throttled(env, 'h', 5, 3_600_000);
    /* Uma chave nova de um minuto dispara a limpeza oportunista. */
    await throttled(env, 'j', 1);
    expect(await throttled(env, 'j', 1, 3_600_000)).toBe(false);
    const rows = linhas(env, "SELECT key, hits FROM throttle ORDER BY key") as { key: string; hits: number }[];
    expect(rows.map(r => r.key)).toEqual(['h@3600000', 'j', 'j@3600000']);
    expect(rows[0]!.hits).toBe(5);
    expect(await estourou(env, 'h', 5, 3_600_000)).toBe(true);
  });
});

/* ── o login ────────────────────────────────────────────────────────────── */

describe('o login', () => {
  const tentar = (env: Record<string, unknown>, email: string, password: string, origem: string) =>
    auth.login({ request: pedido(`${SITE}/api/auth/login`, { email, password }, { 'CF-Connecting-IP': origem }), env, ctx });

  it('um estranho errando não tranca a dona da conta', async () => {
    const env = envSite();
    const { email } = await comConta(env);
    const status: number[] = [];
    for (let i = 0; i < 7; i++) status.push((await tentar(env, email, 'errada-' + i, '203.0.113.9')).status);
    expect(status).toEqual([401, 401, 401, 401, 401, 429, 429]);
    /* A dona, de outro lugar, com a senha certa. */
    expect((await tentar(env, email, 'senha-boa-123', '198.51.100.7')).status).toBe(200);
  });

  it('a senha certa não gasta o orçamento do e-mail', async () => {
    const env = envSite();
    const { email } = await comConta(env);
    for (let i = 0; i < 10; i++) expect((await tentar(env, email, 'senha-boa-123', '203.0.113.9')).status).toBe(200);
    expect(linhas(env, "SELECT key FROM throttle WHERE key LIKE 'login:aluna%'")).toEqual([]);
  });

  it('recusa corpo que não é string sem virar 500', async () => {
    const r = await auth.login({ request: pedido(`${SITE}/api/auth/login`, { email: { toString: 1 }, password: [] }), env: envSite(), ctx });
    expect(r.status).toBe(401);
  });

  /* Quem já estourou o freio por IP não ganha nem a leitura do corpo - nem
     no login, nem no esqueci-a-senha, nem no reset. */
  it.each([
    ['login', 'login', 20, (env: Record<string, unknown>, r: Request) => auth.login({ request: r, env, ctx })],
    ['forgot', 'forgot', 6, (env: Record<string, unknown>, r: Request) => auth.forgot({ request: r, env, ctx })],
    ['reset', 'reset', 12, (env: Record<string, unknown>, r: Request) => auth.reset({ request: r, env, ctx })]
  ])('%s: o freio por IP vem antes do corpo', async (rota, chave, teto, chamar) => {
    const env = envSite();
    for (let i = 0; i < teto; i++) await throttled(env, `${chave}:203.0.113.9`, teto);
    const r = new Request(`${SITE}/api/auth/${rota}`, {
      method: 'POST', body: '{"email":"a@b.co","password":"x","token":"t"}',
      headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' }
    });
    expect((await chamar(env, r)).status).toBe(429);
    /* O corpo continua intocado: a recusa veio antes da leitura. */
    expect(r.bodyUsed).toBe(false);
  });

  /* A Cloudflare manda IPv6 comprimido; a primeira versão cortava antes de
     expandir, e vizinhos do mesmo /64 ganhavam chaves diferentes - ou seja,
     orçamentos separados. */
  it('a chave de IPv6 é o /64 de verdade, expandido', () => {
    const chave = (v: string) => auth.ip(new Request(SITE, { headers: { 'CF-Connecting-IP': v } }));
    expect(chave('2001:db8::1')).toBe('2001:0db8:0000:0000::/64');
    expect(chave('2001:db8:0:0:1:2:3:4')).toBe('2001:0db8:0000:0000::/64');
    expect(chave('2001:DB8:0000:0000:ffff:ffff:ffff:ffff')).toBe('2001:0db8:0000:0000::/64');
    expect(chave('2001:db8:0:1::5')).toBe('2001:0db8:0000:0001::/64');
    expect(chave('::1')).toBe('0000:0000:0000:0000::/64');
    expect(chave('::ffff:203.0.113.5')).toBe('203.0.113.5');
    expect(chave('203.0.113.5')).toBe('203.0.113.5');
    expect(chave('')).toBe('unknown');
  });
});

/* ── o cadastro ─────────────────────────────────────────────────────────── */

describe('o cadastro', () => {
  it('recusa e-mail longo demais e com caractere de controle', async () => {
    const env = envSite();
    for (const email of ['a'.repeat(250) + '@x.com', 'a@b\u0000.co', 'a\u0001@b.co', 'ab']) {
      const r = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`, { email, password: 'senha-boa-123' }), env, ctx });
      expect(r.status, email).toBe(400);
    }
  });

  it('a trilha guarda o id, nunca o e-mail', async () => {
    const env = envSite();
    await comConta(env);
    const rows = linhas(env, 'SELECT action, detail FROM access_log') as { action: string; detail: string }[];
    expect(rows.some(r => r.action === 'signup')).toBe(true);
    expect(rows.every(r => !r.detail.includes('@'))).toBe(true);
  });
});

/* ── o esqueci-a-senha ──────────────────────────────────────────────────── */

describe('o pedido de senha', () => {
  it('a resposta não muda quando o teto da hora estoura', async () => {
    const env = envSite({ RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>', RESEND_BASE: 'https://api.resend.test' });
    const { email } = await comConta(env);
    let envios = 0;
    vi.stubGlobal('fetch', async () => { envios++; return new Response('{"id":"m"}', { status: 200 }); });
    const esperar: Promise<unknown>[] = [];
    const c = { waitUntil: (p: Promise<unknown>) => { esperar.push(p); } };
    /* Simula cinco pedidos já feitos nesta hora. */
    for (let i = 0; i < 5; i++) await throttled(env, `forgot-h:${email}`, 5, 3_600_000);
    const r = await auth.forgot({ request: pedido(`${SITE}/api/auth/forgot`, { email }), env, ctx: c });
    await Promise.all(esperar);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, enviado: true });
    expect(envios).toBe(0);
    vi.unstubAllGlobals();
  });

  it('a trilha do envio não guarda o endereço', async () => {
    const env = envSite({ RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>', RESEND_BASE: 'https://api.resend.test' });
    const { email } = await comConta(env);
    vi.stubGlobal('fetch', async () => new Response('{"id":"m"}', { status: 200 }));
    const esperar: Promise<unknown>[] = [];
    await auth.forgot({ request: pedido(`${SITE}/api/auth/forgot`, { email }), env, ctx: { waitUntil: (p: Promise<unknown>) => { esperar.push(p); } } });
    await Promise.all(esperar);
    await auth.forgot({ request: pedido(`${SITE}/api/auth/forgot`, { email: 'ninguem@exemplo.com' }), env, ctx: { waitUntil: (p: Promise<unknown>) => { esperar.push(p); } } });
    await Promise.all(esperar);
    const rows = linhas(env, "SELECT action, detail FROM access_log WHERE action LIKE 'forgot%'") as { action: string; detail: string }[];
    expect(rows.map(r => r.action).sort()).toEqual(['forgot-enviado', 'forgot-sem-conta']);
    expect(rows.every(r => !r.detail.includes('@'))).toBe(true);
    vi.unstubAllGlobals();
  });
});

/* ── a saúde ────────────────────────────────────────────────────────────── */

describe('a saúde', () => {
  it('não publica o custo do hash, e tem freio', async () => {
    const env = envSite();
    const req = new Request(`${SITE}/api/health`, { headers: { 'CF-Connecting-IP': '203.0.113.1' } });
    const r = await auth.health({ request: req, env });
    const body = await r.json() as Record<string, unknown>;
    expect(body).not.toHaveProperty('iterations');
    expect(body.ok).toBe(true);
    for (let i = 0; i < 9; i++) await auth.health({ request: req, env });
    expect((await auth.health({ request: req, env })).status).toBe(429);
  });
});

/* ── o pagamento ────────────────────────────────────────────────────────── */

describe('o pagamento', () => {
  beforeEach(() => {
    /* Uma Mercado Pago de mentira que cria um PIX pendente. */
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      return new Response(JSON.stringify({
        id: 900001, status: 'pending', external_reference: body.external_reference,
        point_of_interaction: { transaction_data: { qr_code: '000201-teste' } }
      }), { status: 201 });
    });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('criar pedido tem freio por conta', async () => {
    const env = envSite({ MP_ACCESS_TOKEN: 'APP_USR-1234567890123456-092019-abcdef0123456789abcdef0123456789-123456789' });
    const { cookie } = await comConta(env);
    const status: number[] = [];
    for (let i = 0; i < 8; i++) {
      const r = await pay.create({ request: pedido(`${SITE}/api/pay/create`, { courseSlug: 'alfabetizacao', method: 'pix' }, { Cookie: cookie, 'CF-Connecting-IP': '203.0.113.5' }), env, ctx });
      status.push(r.status);
    }
    expect(status.slice(0, 6).every(s => s === 200)).toBe(true);
    expect(status.slice(6)).toEqual([429, 429]);
  });

  it('o webhook ignora um id que não é número e não grava nada', async () => {
    const env = envSite({ MP_WEBHOOK_SECRET: 's' });
    const r = await pay.webhook({ request: new Request(`${SITE}/api/pay/webhook?data.id=../../v1/users/me&type=payment`, { method: 'POST' }), env });
    expect(r.status).toBe(200);
    expect(linhas(env, 'SELECT * FROM access_log')).toEqual([]);
  });

  it('assinatura errada em série não vira uma linha por requisição', async () => {
    const env = envSite({ MP_WEBHOOK_SECRET: 's' });
    for (let i = 0; i < 45; i++) {
      const r = await pay.webhook({ request: new Request(`${SITE}/api/pay/webhook?data.id=${1000 + i}&type=payment`, {
        method: 'POST', headers: { 'x-signature': 'ts=1,v1=00', 'CF-Connecting-IP': '203.0.113.8' }
      }), env });
      expect(r.status).toBe(401);
    }
    const conta = linhas(env, "SELECT COUNT(*) AS n FROM access_log WHERE action='webhook-bad-signature'") as { n: number }[];
    expect(conta[0]!.n).toBeLessThanOrEqual(30);
    expect(conta[0]!.n).toBeGreaterThan(0);
  });

  it('a consulta ao provedor recusa um id fora do formato antes de chamar', async () => {
    await expect(() => getPayment({ MP_ACCESS_TOKEN: 'x' }, '../../v1/account/settings')).toThrow();
  });

  /* Um segredo colado de um painel para outro chega com espaço na ponta, e
     às vezes com quebra de linha. Sem aparar, a assinatura não confere
     NUNCA: toda notificação legítima é recusada, e o sintoma aparece dias
     depois como "paguei e não liberou" - com o segredo certo dos dois lados. */
  it('o segredo do webhook é aparado antes de conferir a assinatura', async () => {
    const segredo = 'segredo-do-webhook';
    const id = 987654321;
    const ts = Math.floor(Date.now() / 1000);
    const v1 = await hmacHex(segredo, `id:${id};request-id:r1;ts:${ts};`);
    const aviso = () => new Request(`${SITE}/api/pay/webhook?data.id=${id}&type=payment`, {
      method: 'POST',
      headers: { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': 'r1' }
    });
    for (const guardado of [segredo, ` ${segredo}`, `${segredo}\n`, `  ${segredo}  `]) {
      expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: guardado }, aviso(), id),
        JSON.stringify(guardado)).toBe(true);
    }
    /* E continua recusando o que é outro segredo, não só espaço a mais. */
    expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: 'outro' }, aviso(), id)).toBe(false);
    expect(await verifyWebhookSignature({ MP_WEBHOOK_SECRET: '   ' }, aviso(), id)).toBe(false);
  });

  it('o que fica guardado do pagamento não inclui o pagador', async () => {
    const env = envSite();
    const raw = {
      id: 1, status: 'approved', transaction_amount: 132.3, currency_id: 'BRL', external_reference: 'HF1',
      payer: { email: 'x@y.z', identification: { type: 'CPF', number: '00000000000' } },
      card: { last_four_digits: '1234', cardholder: { name: 'Fulano' } }
    };
    expect(Object.keys(enxuto(raw)).sort()).toEqual(['currency_id', 'external_reference', 'id', 'status', 'transaction_amount']);
    await recordEvent(env, { eventId: '1', orderId: 'HF1', status: 'paid', raw, source: 'teste' });
    const [row] = linhas(env, 'SELECT raw FROM payment_events') as { raw: string }[];
    expect(row!.raw).not.toContain('payer');
    expect(row!.raw).not.toContain('1234');
    expect(row!.raw).not.toContain('Fulano');
  });
});

/* ── o progresso ────────────────────────────────────────────────────────── */

describe('o progresso recusa chave que não é dado', () => {
  const salvar = async (env: Record<string, unknown>, cookie: string, state: unknown) =>
    progress.write({
      request: pedido(`${SITE}/api/progress`, { state, rev: 0 }, { Cookie: cookie }), env, ctx
    });

  it.each([
    ['na raiz', () => JSON.parse('{"version":2,"__proto__":{"admin":true}}')],
    ['no fundo', () => JSON.parse('{"version":2,"licoes":{"alef":{"__proto__":{"x":1}}}}')],
    ['constructor', () => JSON.parse('{"version":2,"constructor":{"x":1}}')],
    ['prototype', () => JSON.parse('{"version":2,"a":{"prototype":1}}')]
  ])('%s → 400, e nada é gravado', async (_n, montar) => {
    const env = envSite();
    const { cookie } = await comConta(env);
    const r = await salvar(env, cookie, montar());
    expect(r.status).toBe(400);
    expect(linhas(env, 'SELECT * FROM progress')).toEqual([]);
  });

  it('o progresso de verdade continua passando', async () => {
    const env = envSite();
    const { cookie } = await comConta(env);
    const r = await salvar(env, cookie, { version: 2, licoes: { alef: { stagesDone: [1, 2] } } });
    expect(r.status).toBe(200);
    expect((linhas(env, 'SELECT rev FROM progress') as { rev: number }[])[0]!.rev).toBe(1);
  });

  /* A fusão do cliente descarta as mesmas três chaves. */
  it('a fusão do app não copia __proto__ para o objeto novo', () => {
    const dia = (xp: number) => ({ answered: 1, units: 1, xp, goalMet: false });
    const sujo = JSON.parse(JSON.stringify({
      version: 2,
      days: { '__proto__': { poluido: true }, '2026-09-20': dia(30) }
    }));
    const limpo = { version: 2, days: { '2026-09-20': dia(10) } };
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const r = mergeStates(sujo as any, limpo as any);
    expect(Object.prototype.hasOwnProperty.call(r.days, '__proto__')).toBe(false);
    expect(({} as Record<string, unknown>).poluido).toBeUndefined();
    expect(r.days['2026-09-20']!.xp).toBe(30);
  });
});

/* ── o presente ─────────────────────────────────────────────────────────── */

describe('um convite não vira acesso sozinho', () => {
  const convidar = (env: Record<string, unknown>, email: string) =>
    inviteCreate(env, { email, courseSlug: 'alfabetizacao', months: 12, note: 'teste' });

  const cadastrar = (env: Record<string, unknown>, email: string, c = ctx) =>
    auth.signup({
      request: pedido(`${SITE}/api/auth/signup`, { name: 'Quem', email, password: 'senha-boa-123' }),
      env, ctx: c
    });

  it('quem chega primeiro no endereço presenteado NÃO leva o curso', async () => {
    const env = envSite();
    await convidar(env, 'presenteada@exemplo.com.br');

    /* O impostor sabe o endereço e corre para o cadastro. */
    const r = await cadastrar(env, 'presenteada@exemplo.com.br');
    expect(r.status).toBe(200);
    const { account } = await r.json() as { account: { id: string } };

    expect(await hasEntitlement(env, Number(account.id), 'alfabetizacao'),
      'o convite virou acesso sozinho').toBe(false);
    /* O convite continua esperando o dono decidir. */
    const [convite] = linhas(env, 'SELECT used_at FROM invites') as { used_at: number | null }[];
    expect(convite!.used_at).toBeNull();
  });

  it('o dono é avisado, e o aviso não leva o endereço para a trilha', async () => {
    const env = envSite({
      RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>',
      RESEND_BASE: 'https://api.resend.test', SUPPORT_EMAIL: 'dono@exemplo.com'
    });
    await convidar(env, 'presenteada@exemplo.com.br');

    const enviados: { to: string[]; subject: string; text: string }[] = [];
    vi.stubGlobal('fetch', async (_u: string, init?: RequestInit) => {
      enviados.push(JSON.parse(String(init?.body)));
      return new Response('{"id":"m"}', { status: 200 });
    });
    const esperar: Promise<unknown>[] = [];
    await cadastrar(env, 'presenteada@exemplo.com.br',
      { waitUntil: (p: Promise<unknown>) => { esperar.push(p); } });
    await Promise.all(esperar);
    vi.unstubAllGlobals();

    expect(enviados).toHaveLength(1);
    expect(enviados[0]!.to).toEqual(['dono@exemplo.com']);
    expect(enviados[0]!.text).toContain('presenteada@exemplo.com.br');
    expect(enviados[0]!.text).toContain('alfabetizacao');

    const trilha = linhas(env, "SELECT action, detail FROM access_log WHERE action = 'convite-aguardando'") as { detail: string }[];
    expect(trilha).toHaveLength(1);
    expect(trilha[0]!.detail).toBe('alfabetizacao');
    expect(trilha[0]!.detail).not.toContain('@');
  });

  it('entrar dez vezes não manda dez avisos', async () => {
    const env = envSite({
      RESEND_API_KEY: 're_x', EMAIL_FROM: 'HF <c@hebraicofluente.com.br>',
      RESEND_BASE: 'https://api.resend.test', SUPPORT_EMAIL: 'dono@exemplo.com'
    });
    let envios = 0;
    vi.stubGlobal('fetch', async () => { envios++; return new Response('{"id":"m"}', { status: 200 }); });
    await convidar(env, 'presenteada@exemplo.com.br');
    await cadastrar(env, 'presenteada@exemplo.com.br');
    for (let i = 0; i < 5; i++) {
      const r = await auth.login({
        request: pedido(`${SITE}/api/auth/login`,
          { email: 'presenteada@exemplo.com.br', password: 'senha-boa-123' }),
        env, ctx
      });
      expect(r.status).toBe(200);
    }
    vi.unstubAllGlobals();
    expect(envios).toBe(1);
  });

  it('sem provedor de e-mail, falha fechada: avisa na trilha e não libera', async () => {
    const env = envSite();
    await convidar(env, 'presenteada@exemplo.com.br');
    const r = await cadastrar(env, 'presenteada@exemplo.com.br');
    const { account } = await r.json() as { account: { id: string } };
    expect(await hasEntitlement(env, Number(account.id), 'alfabetizacao')).toBe(false);
    expect(linhas(env, "SELECT 1 AS x FROM access_log WHERE action = 'convite-aguardando'")).toHaveLength(1);
  });

  it('quem não tem convite nenhum não gera aviso', async () => {
    const env = envSite();
    await comConta(env, 'ninguem@exemplo.com.br');
    expect(linhas(env, "SELECT 1 AS x FROM access_log WHERE action = 'convite-aguardando'")).toEqual([]);
  });
});

/* ── só se oferece o que dá para cobrar ─────────────────────────────────── */

describe('a tela e o servidor concordam sobre as formas de pagamento', () => {
  /* O defeito que isto fecha: em 20/09/2026 a conta da Mercado Pago tinha
     cartão habilitado e PIX não, e o checkout oferecia PIX assim mesmo. Quem
     escolhesse PIX chegava até a chamada ao provedor e recebia um erro. */
  /* ── por que nada aqui afirma "PIX ligado" ────────────────────────────
     A primeira versão destes testes comparava com `{pix: true, cartao:
     true}`, que é o que está no repositório - e quebrou na publicação, que
     foi onde ficou claro o erro: a sonda roda ANTES dos testes e já
     reescreveu o arquivo para o que a conta aceita naquele dia. Um teste que
     só passa enquanto a Mercado Pago está de um certo jeito não testa o
     nosso código, testa a conta deles.
     O que vale em qualquer estado é o CONTRATO: os leitores concordam entre
     si, sobra pelo menos uma forma, e o servidor recusa exatamente as que a
     tela não oferece. */

  it('os leitores da tela concordam entre si', () => {
    expect(formasAtivas()).toEqual([
      ...(temPix() ? ['pix'] : []),
      ...(temCartao() ? ['card'] : [])
    ]);
    /* Um checkout sem forma nenhuma não é um estado válido: seria uma
       página de pagamento sem como pagar. */
    expect(formasAtivas().length).toBeGreaterThan(0);
    const f = empresa.pagamento.formas;
    if (f) {
      expect(typeof f.pix).toBe('boolean');
      expect(typeof f.cartao).toBe('boolean');
    }
  });

  it('a substituição que a sonda faz encontra o bloco no arquivo', async () => {
    const { readFileSync } = await import('node:fs');
    const original = readFileSync(
      new URL('../../data/empresa.json', import.meta.url), 'utf8');

    /* A mesma expressão de scripts/pagamento-ativo.mjs. Copiada de propósito:
       o script roda antes do build, fora do vitest, e o que este teste
       defende é o FORMATO do arquivo - renomear o campo, achatar o objeto ou
       trocar a ordem das chaves faria a substituição virar um no-op
       silencioso, e o PIX voltaria a ser oferecido sem ninguém notar. */
    const RE = /("formas"\s*:\s*\{[^}]*"pix"\s*:\s*)(true|false)([^}]*"cartao"\s*:\s*)(true|false)/;
    expect(RE.test(original), 'a substituição da sonda não casa mais').toBe(true);

    /* E ela troca SÓ as duas, para qualquer combinação. */
    for (const [pix, cartao] of [[false, true], [true, false], [true, true], [false, false]]) {
      const depois = JSON.parse(original.replace(RE, (_m, a, _p, b) => `${a}${pix}${b}${cartao}`));
      expect(depois.pagamento.formas).toEqual({ pix, cartao });
      const antes = JSON.parse(original);
      delete antes.pagamento.formas; delete depois.pagamento.formas;
      expect(depois, 'a substituição mexeu em outra coisa').toEqual(antes);
    }
  });

  it('o servidor recusa exatamente as formas que a tela não oferece', async () => {
    const env = envSite({ MP_ACCESS_TOKEN: 'APP_USR-1234567890123456-092019-abcdef0123456789abcdef0123456789-123456789' });
    const { cookie } = await comConta(env);
    const tentar = (method: string) => pay.create({
      request: pedido(`${SITE}/api/pay/create`, { courseSlug: 'alfabetizacao', method }, { Cookie: cookie }),
      env, ctx
    });

    for (const [method, oferecida, codigo] of [
      ['pix', temPix(), 'pix-off'],
      ['card', temCartao(), 'card-off']
    ] as [string, boolean, string][]) {
      const r = await tentar(method);
      if (oferecida) {
        /* Não é recusada POR ESTE MOTIVO. Pode morrer adiante, na Mercado
           Pago de mentira, e isso é outro assunto. */
        if (r.status === 409) {
          expect(await r.json()).not.toMatchObject({ error: codigo });
        }
      } else {
        expect(r.status, method).toBe(409);
        expect(await r.json()).toMatchObject({ error: codigo });
      }
    }
  });
});

/* ── o `?next=` do login ────────────────────────────────────────────────── */

describe('para onde voltar depois de entrar', () => {
  it('só caminho interno', () => {
    for (const ruim of ['//evil.example', '/\\evil.example', '/\t/evil.example', '/\n/evil.example', '/\r/evil.example',
                        'https://evil.example', 'javascript:alert(1)', '']) {
      expect(safeNext(ruim), JSON.stringify(ruim)).toBe('/meu-hebraico');
    }
    expect(safeNext('/licao/alef/')).toBe('/licao/alef/');
    expect(safeNext('/perfil?aba=x')).toBe('/perfil?aba=x');
  });
});
