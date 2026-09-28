/* O contador do teste A/B da capa (worker/src/api/ab.js). */
import { describe, expect, it } from 'vitest';
import { envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';

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
});
