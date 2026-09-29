/* Uma varredura por vez (auditoria de 28/09, INFRA-013). */
import { describe, expect, it } from 'vitest';
import { envDeTeste } from './ajuda/d1';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { pegarTrava, soltarTrava } from '../../worker/src/lib/db.js';
// @ts-expect-error - idem
import { runReconcile } from '../../worker/src/reconcile.js';

describe('a trava da varredura', () => {
  it('só uma pega; soltar libera; uma trava vencida é retomada', async () => {
    const env = envDeTeste();
    const t0 = 1_000_000;
    expect(await pegarTrava(env, 'varredura', 240_000, t0)).toBe(true);
    expect(await pegarTrava(env, 'varredura', 240_000, t0 + 1_000)).toBe(false);
    await soltarTrava(env, 'varredura');
    expect(await pegarTrava(env, 'varredura', 240_000, t0 + 2_000)).toBe(true);
    /* Quem pegou morreu sem soltar: depois da validade, a próxima segue. */
    expect(await pegarTrava(env, 'varredura', 240_000, t0 + 2_000 + 240_000)).toBe(true);
  });

  it('com a trava ocupada, a varredura é pulada; depois dela, roda e solta', async () => {
    const env = envDeTeste();
    expect(await pegarTrava(env, 'varredura', 240_000)).toBe(true);
    expect((await runReconcile(env)).pulada).toBe(true);
    await soltarTrava(env, 'varredura');
    const r = await runReconcile(env);
    expect(r.pulada).toBeUndefined();
    expect(await pegarTrava(env, 'varredura', 240_000)).toBe(true);
  });

  it('sem banco, falha aberta: a varredura não deixa de rodar', async () => {
    const quebrado = { DB: { prepare() { throw new Error('D1 fora'); } } };
    expect(await pegarTrava(quebrado, 'varredura', 240_000)).toBe(true);
  });
});
