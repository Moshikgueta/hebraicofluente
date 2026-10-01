/* "Baixar meus dados" (LGPD art. 18; auditoria de 01/10/2026, LEGAL-122). */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import * as auth from '../../worker/src/api/auth.js';
// @ts-expect-error - idem
import { exportar } from '../../worker/src/api/meus-dados.js';
// @ts-expect-error - idem
import { createOrder, grantAccess } from '../../worker/src/lib/db.js';
import { cookieDe, envDeTeste, pedido } from './ajuda/d1';

const SITE = 'https://hebraicofluente.com.br';
const ctx = { waitUntil: () => {} };

describe('GET /api/account/dados', () => {
  it('sem sessão, 401', async () => {
    const r = await exportar({ request: new Request(`${SITE}/api/account/dados`), env: envDeTeste() });
    expect(r.status).toBe(401);
  });

  it('devolve a própria conta como anexo, e nunca senha nem marca', async () => {
    const env = envDeTeste();
    const s = await auth.signup({ request: pedido(`${SITE}/api/auth/signup`,
      { aceitouTermos: true, declarouIdade: true, name: 'Ana', email: 'ana@exemplo.com', password: 'senha-boa-123' }), env, ctx });
    const cookie = cookieDe(s);
    const { account } = await s.json() as { account: { id: number } };
    const order = await createOrder(env, { accountId: account.id, courseSlug: 'alfabetizacao', amountCents: 13230, method: 'pix' });
    await grantAccess(env, { accountId: account.id, courseSlug: 'alfabetizacao', orderId: order.id, months: 12 });

    const r = await exportar({ request: new Request(`${SITE}/api/account/dados`, { headers: { cookie } }), env });
    expect(r.status).toBe(200);
    expect(r.headers.get('content-disposition')).toMatch(/attachment; filename="hebraico-fluente-meus-dados-\d{4}-\d{2}-\d{2}\.json"/);
    expect(r.headers.get('cache-control')).toContain('no-store');
    const texto = await r.text();
    const d = JSON.parse(texto);
    expect(d.conta.email).toBe('ana@exemplo.com');
    expect(d.pedidos).toHaveLength(1);
    expect(d.pedidos[0].valorCentavos).toBe(13230);
    expect(d.acessos[0].curso).toBe('alfabetizacao');
    expect(d.aceites.length).toBeGreaterThanOrEqual(1);
    for (const proibido of ['pass_hash', 'pass_salt', 'session_version', 'marca"', 'pix_code', 'pay_url']) {
      expect(texto, proibido).not.toContain(proibido);
    }
  });
});
