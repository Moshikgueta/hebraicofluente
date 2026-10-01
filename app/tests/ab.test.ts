/* O contador do teste A/B da capa (worker/src/api/ab.js). */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - idem
import { abComprasPurge } from '../../worker/src/api/ab.js';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
type Env = ReturnType<typeof envDeTeste> & { DB: { bruto: import('node:sqlite').DatabaseSync } };

const contar = (env: Env, body: unknown, headers: Record<string, string> = {}) =>
  worker.fetch(pedido(`${SITE}/api/ab`, body, { 'CF-Connecting-IP': '203.0.113.9', ...headers }), env, ctx);
const linhas = (env: Env) =>
  env.DB.bruto.prepare('SELECT variante, evento, n FROM ab_contagens ORDER BY variante, evento').all();

describe('o contador do teste A/B', () => {
  it('soma totais por versão e evento, sem guardar nada de quem mandou', async () => {
    const env = envDeTeste() as Env;
    expect((await contar(env, { exp: 'hero-2026-09', v: 'a', evento: 'visto' })).status).toBe(200);
    await contar(env, { exp: 'hero-2026-09', v: 'a', evento: 'visto' });
    await contar(env, { exp: 'hero-2026-09', v: 'b', evento: 'clique' });
    expect(linhas(env)).toEqual([
      { variante: 'a', evento: 'visto', n: 2 },
      { variante: 'b', evento: 'clique', n: 1 }
    ]);
    const colunas = env.DB.bruto.prepare("SELECT name FROM pragma_table_info('ab_contagens')").all().map(c => (c as { name: string }).name);
    expect(colunas.sort()).toEqual(['dia', 'evento', 'exp', 'n', 'variante']);
  });

  it('recusa experimento, versão ou evento desconhecidos', async () => {
    const env = envDeTeste() as Env;
    for (const body of [
      { exp: 'outro', v: 'a', evento: 'visto' },
      { exp: 'hero-2026-09', v: 'c', evento: 'visto' },
      { exp: 'hero-2026-09', v: 'a', evento: 'pagou' },
      'lixo'
    ]) expect((await contar(env, body)).status, JSON.stringify(body)).toBe(400);
    expect(linhas(env)).toEqual([]);
  });

  it('não aceita escrita vinda de outro site', async () => {
    const env = envDeTeste() as Env;
    const r = await contar(env, { exp: 'hero-2026-09', v: 'b', evento: 'compra' }, { Origin: 'https://outro.com' });
    expect(r.status).toBe(403);
    expect(linhas(env)).toEqual([]);
  });

  it('freia quem tenta inflar um lado: 30 por minuto por IP', async () => {
    const env = envDeTeste() as Env;
    for (let i = 0; i < 40; i++) await contar(env, { exp: 'hero-2026-09', v: 'b', evento: 'clique' });
    expect(linhas(env)).toEqual([{ variante: 'b', evento: 'clique', n: 30 }]);
  });

  /* SEC-A-008 (auditoria de 01/10/2026). */
  describe('o que um script não infla', () => {
    afterEach(() => { vi.useRealTimers(); });

    it('teto por dia por endereço, e a chave do freio não guarda o IP', async () => {
      vi.useFakeTimers({ now: Date.UTC(2026, 9, 1, 12, 0, 5), toFake: ['Date'] });
      const env = envDeTeste() as Env;
      for (let minuto = 0; minuto < 4; minuto++) {
        for (let i = 0; i < 30; i++) await contar(env, { exp: 'hero-2026-09', v: 'b', evento: 'visto' });
        vi.setSystemTime(Date.now() + 61_000);
      }
      expect(linhas(env)).toEqual([{ variante: 'b', evento: 'visto', n: 60 }]);
      const chaves = env.DB.bruto.prepare('SELECT key FROM throttle').all().map(r => String((r as { key: string }).key));
      expect(chaves.some(k => k.includes('203.0.113.9'))).toBe(false);
    });

    async function comprador(env: Env, pago: boolean) {
      const r = await worker.fetch(pedido(`${SITE}/api/auth/signup`,
        { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: `ana${pago}@exemplo.com`, password: 'senha-boa-123' },
        { Origin: SITE }), env, ctx);
      const { account } = await r.clone().json() as { account: { id: string } };
      env.DB.bruto.prepare(
        `INSERT INTO orders (id, account_id, course_slug, amount_cents, method, status, created_at, paid_at)
         VALUES (?, ?, 'alfabetizacao', 13230, 'pix', ?, ?, ?)`
      ).run(`HF-${pago}`, Number(account.id), pago ? 'paid' : 'pending', Date.now(), pago ? Date.now() : null);
      return cookieDe(r);
    }

    it('compra anônima, ou sem pedido pago, não conta', async () => {
      const env = envDeTeste() as Env;
      await contar(env, { exp: 'hero-2026-09', v: 'a', evento: 'compra' });
      const semPagar = await comprador(env, false);
      await contar(env, { exp: 'hero-2026-09', v: 'a', evento: 'compra' }, { Cookie: semPagar, 'CF-Connecting-IP': '203.0.113.10' });
      expect(linhas(env)).toEqual([]);
    });

    it('compra com pedido pago conta UMA vez por pedido', async () => {
      const env = envDeTeste() as Env;
      const pagou = await comprador(env, true);
      for (let i = 0; i < 5; i++) {
        await contar(env, { exp: 'hero-2026-09', v: 'a', evento: 'compra' }, { Cookie: pagou, 'CF-Connecting-IP': '203.0.113.11' });
      }
      expect(linhas(env)).toEqual([{ variante: 'a', evento: 'compra', n: 1 }]);
      /* Só o id do pedido fica, para não contar de novo; nada de versão nem conta. */
      const cols = env.DB.bruto.prepare("SELECT name FROM pragma_table_info('ab_compras')").all().map(c => (c as { name: string }).name);
      expect(cols.sort()).toEqual(['em', 'order_id']);
      await abComprasPurge(env, Date.now() + 61 * 86_400_000);
      expect(env.DB.bruto.prepare('SELECT COUNT(*) AS n FROM ab_compras').get()).toEqual({ n: 0 });
    });
  });
});
