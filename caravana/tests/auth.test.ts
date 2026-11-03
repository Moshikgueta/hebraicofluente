import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sessions } from '@/lib/db/schema';
import { createDemoViewerSession, loginWithPassword, resolveStaffSession, revokeStaffSession, setPasswordWithToken } from '@/lib/auth/sessions';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { closeDb, makeAgency, seedAll, withSystem } from './helpers';

let A: Awaited<ReturnType<typeof makeAgency>>;
beforeAll(async () => {
  await seedAll();
  A = await makeAgency('epsilon');
});
afterAll(closeDb);

describe('senha', () => {
  it('PBKDF2 confere a certa e recusa a errada', async () => {
    const h = await hashPassword('uma senha comprida');
    expect(h.startsWith('pbkdf2$sha256$')).toBe(true);
    expect(await verifyPassword('uma senha comprida', h)).toBe(true);
    expect(await verifyPassword('outra senha', h)).toBe(false);
  });

  it('conta nova nao entra antes de definir a senha', async () => {
    await expect(loginWithPassword('admin@epsilon.test', 'qualquer coisa', 'c1')).rejects.toMatchObject({ code: 'invalid' });
  });

  it('o link de definir senha vale uma vez, e a senha curta e recusada', async () => {
    await expect(setPasswordWithToken(A.setupToken, 'curta', 'c2')).rejects.toMatchObject({ code: 'invalid' });
    await setPasswordWithToken(A.setupToken, 'senha-forte-de-teste', 'c2');
    await expect(setPasswordWithToken(A.setupToken, 'outra-senha-forte', 'c2')).rejects.toMatchObject({ code: 'expired' });
  });

  it('entra, le a propria agencia e sai', async () => {
    const { token, ctx } = await loginWithPassword('ADMIN@epsilon.test ', 'senha-forte-de-teste', 'c3');
    expect(ctx).toMatchObject({ agencyId: A.agencyId, role: 'admin', isPlatformAdmin: false });
    const db = await withSystem((tx) => tx.select().from(sessions));
    expect(JSON.stringify(db)).not.toContain(token);
    expect(await resolveStaffSession(token)).not.toBeNull();
    await revokeStaffSession(token);
    expect(await resolveStaffSession(token)).toBeNull();
  });

  it('e-mail inexistente e senha errada tem a mesma resposta', async () => {
    await expect(loginWithPassword('ninguem@x.test', 'senha-forte-de-teste', 'c4')).rejects.toMatchObject({ code: 'invalid' });
    await expect(loginWithPassword('admin@epsilon.test', 'errada-errada', 'c4')).rejects.toMatchObject({ code: 'invalid' });
  });

  it('o freio por e-mail barra tentativas repetidas, mesmo de enderecos diferentes', async () => {
    let barrado = false;
    for (let i = 0; i < 10; i++) {
      try {
        await loginWithPassword('admin@epsilon.test', `errada-${i}`, `ip-${i}`);
      } catch (e) {
        if ((e as { code: string }).code === 'rate_limited') barrado = true;
      }
    }
    expect(barrado).toBe(true);
  });
});

describe('painel de demonstracao', () => {
  it('entra como leitor da agencia de demonstracao, e so dela', async () => {
    const { token } = await createDemoViewerSession('d1');
    const ctx = await resolveStaffSession(token);
    expect(ctx).toMatchObject({ role: 'viewer', isDemo: true, agencyIsDemo: true, isPlatformAdmin: false });
  });
});
