/* O visitante não gera erro nem invocação à toa (auditoria de 01/10/2026,
 * PERF-007 / UXQA-018): /api/me sem sessão responde 200 `{signedIn:false}`
 * para o app de agora, e o progresso não pergunta ao servidor sem sessão. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
import { WorkerApi } from '@/lib/account/worker-api';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const OPCIONAL = { 'X-HF-Sessao': 'opcional' };
const me = (env: Record<string, unknown>, headers: Record<string, string> = {}) =>
  worker.fetch(new Request(`${SITE}/api/me`, { headers }), env, ctx) as Promise<Response>;

describe('/api/me sem sessão', () => {
  it('para o app de agora: 200 { signedIn: false }', async () => {
    const r = await me(envDeTeste(), OPCIONAL);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ signedIn: false });
    expect(r.headers.get('cache-control')).toBe('no-store');
  });

  it('sem o cabeçalho (o pacote antigo, o curl): o 401 de sempre', async () => {
    expect((await me(envDeTeste())).status).toBe(401);
  });

  it('cookie que não vale mais: 200 sem sessão, e o cookie é limpo', async () => {
    const env = envDeTeste();
    const r = await worker.fetch(pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com', password: 'senha-boa-123' },
      { Origin: SITE }), env, ctx);
    const cookie = cookieDe(r);
    expect((await (await me(env, { ...OPCIONAL, Cookie: cookie })).json() as { account: unknown }).account).toBeTruthy();
    (env.DB as { bruto: { exec(s: string): void } }).bruto.exec('UPDATE accounts SET session_version = session_version + 1');
    const caiu = await me(env, { ...OPCIONAL, Cookie: cookie });
    expect(caiu.status).toBe(200);
    expect(await caiu.json()).toEqual({ signedIn: false });
    expect(caiu.headers.get('set-cookie')).toMatch(/Max-Age=0/);
  });

  it('as rotas que exigem sessão continuam 401', async () => {
    const env = envDeTeste();
    for (const [m, p] of [['GET', '/api/progress'], ['GET', '/api/orders']] as const) {
      const r = await worker.fetch(new Request(`${SITE}${p}`, { method: m, headers: OPCIONAL }), env, ctx);
      expect(r.status, p).toBe(401);
    }
  });
});

describe('o cliente', () => {
  let chamadas: string[];
  let responder: (url: string) => Response;
  beforeEach(() => {
    chamadas = [];
    const guardado = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => guardado.get(k) ?? null,
        setItem: (k: string, v: string) => { guardado.set(k, v); },
        removeItem: (k: string) => { guardado.delete(k); }
      },
      dispatchEvent: () => true
    });
    vi.stubGlobal('localStorage', (globalThis as unknown as { window: { localStorage: unknown } }).window.localStorage);
    vi.stubGlobal('fetch', async (url: string) => { chamadas.push(String(url)); return responder(String(url)); });
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  /* O adaptador de conta é escolhido pela build (`api()` em
     lib/account/api.ts); o progresso do Worker só existe na build worker. */
  async function progressoDoWorker() {
    vi.stubEnv('NEXT_PUBLIC_PLATFORM_API', 'worker');
    vi.resetModules();
    return (await import('@/lib/state/worker')).WorkerProgressStore;
  }

  it('me() devolve null para { signedIn: false }, e dois pedidos juntos viram um', async () => {
    responder = () => new Response('{"signedIn":false}', { status: 200 });
    const a = new WorkerApi();
    const [x, y] = await Promise.all([a.me(), a.me()]);
    expect(x).toBeNull();
    expect(y).toBeNull();
    expect(chamadas).toEqual(['/api/me']);
  });

  it('me() continua entendendo o 401 de um Worker anterior', async () => {
    responder = () => new Response('{"error":"not-signed-in"}', { status: 401 });
    expect(await new WorkerApi().me()).toBeNull();
  });

  it('visitante: o progresso não chama /api/progress', async () => {
    responder = url => url === '/api/me'
      ? new Response('{"signedIn":false}', { status: 200 })
      : new Response('{"error":"not-signed-in"}', { status: 401 });
    await new (await progressoDoWorker())().load();
    expect(chamadas.filter(u => u.startsWith('/api/progress'))).toEqual([]);
  });

  it('com sessão, o progresso pergunta como antes', async () => {
    responder = url => url === '/api/me'
      ? new Response(JSON.stringify({ account: { id: '1', name: '', email: 'a@b.co', createdAt: '2026-10-01T00:00:00Z' }, entitlements: [] }), { status: 200 })
      : new Response(JSON.stringify({ state: null, rev: 0, uid: '1' }), { status: 200 });
    await new (await progressoDoWorker())().load();
    expect(chamadas).toContain('/api/progress');
  });
});
