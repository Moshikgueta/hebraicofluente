/* A comparação de pronúncia (26/09/2026), e o "Achei um erro" desligado.
 *
 *   · as barras da comparação ficam na mesma escala de tempo;
 *   · o "Achei um erro" saiu inteiro em 27/09/2026 (botão, rota e painel):
 *     a rota que recebia os relatos e as do painel não respondem mais.
 *
 * O banco é SQLite de verdade com o worker/schema.sql de produção.
 */

import { describe, expect, it } from 'vitest';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import worker from '../../worker/src/worker.js';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
import { barrasDoTrecho } from '@/lib/gravador';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: (_p: Promise<unknown>) => {} };
const ADMIN = 'dono@hebraicofluente.com.br';

describe('o "Achei um erro" desligado', () => {
  it('a rota que recebia os relatos e as do painel não existem mais', async () => {
    const env = envDeTeste({ ADMIN_EMAILS: ADMIN });
    const r = await auth.signup({
      request: pedido(`${SITE}/api/auth/signup`, { aceitouTermos: true, name: 'Dono', email: ADMIN, password: 'senha-boa-123' }),
      env, ctx
    });
    const cookie = cookieDe(r);
    const chamar = (metodo: string, caminho: string) =>
      worker.fetch(new Request(`${SITE}${caminho}`, {
        method: metodo, headers: { 'content-type': 'application/json', Cookie: cookie },
        ...(metodo === 'POST' ? { body: '{}' } : {})
      }), env, ctx) as Promise<Response>;
    for (const [m, c] of [['POST', '/api/relatos'], ['GET', '/api/admin/relatos'], ['POST', '/api/admin/relatos/resolver']]) {
      expect((await chamar(m!, c!)).status, `${m} ${c}`).toBe(404);
    }
  });
});

describe('a comparação de pronúncia', () => {
  it('põe duas gravações na mesma escala: o dobro do tempo, o dobro de barras', () => {
    const taxa = 8000;
    const som = new Float32Array(taxa * 2).map((_, i) => Math.sin(i / 5) * 0.5);
    const curta = barrasDoTrecho(som, taxa, { inicio: 0, fim: 400 });
    const longa = barrasDoTrecho(som, taxa, { inicio: 0, fim: 800 });
    expect(curta).toHaveLength(16);
    expect(longa).toHaveLength(32);
    expect(Math.max(...longa)).toBeCloseTo(1, 5);
  });
});
