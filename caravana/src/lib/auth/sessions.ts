// Autenticacao sem dependencia do Next: recebe tokens e devolve contextos.
// A cola com cookies mora em ./next.ts. Tudo aqui roda como dona do banco
// (withSystem) porque e justamente o passo que descobre QUEM esta pedindo.
//
// Regras:
//  - o banco guarda o sha256 do token, nunca o token;
//  - o freio decide pela escrita atomica (INSERT ... ON CONFLICT ... RETURNING),
//    antes de verificar a senha ou o convite;
//  - login com e-mail inexistente gasta o mesmo PBKDF2 que um e-mail real.

import { and, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { DEMO_CARAVAN } from '@content/demo';
import { hashPassword, randomToken, sha256Hex, verifyPassword } from '../crypto';
import {
  agencies,
  agencyMemberships,
  auditLogs,
  caravans,
  participantAccess,
  participantDevices,
  rateLimits,
  sessions,
  userTokens,
  users,
} from '../db/schema';
import { withSystem, type Tx } from '../db/tenant';
import { hashInviteCode, newInviteCode, normalizeInviteCode } from '../domain/codes';
import { DEMO_VIEWER_EMAIL } from '../seed';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';
const RANK: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };
export function roleAtLeast(role: Role | null, min: Role): boolean {
  return role !== null && RANK[role] >= RANK[min];
}

export type StaffContext = {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
  isDemo: boolean;
  agencyId: string | null;
  agencyName: string | null;
  agencyIsDemo: boolean;
  role: Role | null;
};

export class AuthError extends Error {
  constructor(public code: 'invalid' | 'rate_limited' | 'device_limit' | 'not_published' | 'expired' | 'unavailable') {
    super(code);
  }
}

const HOUR = 3600_000;
const DAY = 24 * HOUR;
export const STAFF_SESSION_MS = 7 * DAY;
export const DEMO_SESSION_MS = 2 * HOUR;
export const DEMO_TRAVELER_MS = DAY;

// ─── Freio ──────────────────────────────────────────────────────────────────

export async function rateLimit(tx: Tx, key: string, windowSeconds: number, limit: number): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const [row] = await tx
    .insert(rateLimits)
    .values({ key, windowStart, hits: 1 })
    .onConflictDoUpdate({ target: [rateLimits.key, rateLimits.windowStart], set: { hits: sql`${rateLimits.hits} + 1` } })
    .returning({ hits: rateLimits.hits });
  // Faxina ocasional: o horizonte (2 dias) e maior que a maior janela em uso (1 hora).
  if (Math.random() < 0.02) await tx.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(Date.now() - 2 * DAY)));
  return (row?.hits ?? 0) <= limit;
}

// ─── Equipe (agencias e plataforma) ─────────────────────────────────────────

// Hash de uma senha qualquer, com as mesmas iteracoes das reais: e contra ele
// que se verifica quando o e-mail nao existe.
let dummyHash: Promise<string> | undefined;

export async function loginWithPassword(email: string, password: string, clientKey: string): Promise<{ token: string; expiresAt: Date; ctx: StaffContext }> {
  const normalized = email.trim().toLowerCase();
  const emailKey = await sha256Hex(normalized);
  const allowed = await withSystem(async (tx) => {
    const byIp = await rateLimit(tx, `login-ip:${clientKey}`, 900, 20);
    const byEmail = await rateLimit(tx, `login-email:${emailKey}`, 900, 8);
    return byIp && byEmail;
  });
  if (!allowed) throw new AuthError('rate_limited');

  const user = await withSystem(async (tx) => {
    const [u] = await tx.select().from(users).where(sql`lower(${users.email}) = ${normalized}`);
    return u ?? null;
  });
  dummyHash ??= hashPassword(randomToken());
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
  if (!user || !user.passwordHash || !ok || user.status !== 'active') throw new AuthError('invalid');

  return withSystem(async (tx) => {
    const [m] = await tx
      .select({ agencyId: agencyMemberships.agencyId })
      .from(agencyMemberships)
      .innerJoin(agencies, eq(agencies.id, agencyMemberships.agencyId))
      .where(and(eq(agencyMemberships.userId, user.id), eq(agencies.status, 'active')))
      .orderBy(desc(agencyMemberships.createdAt))
      .limit(1);
    const token = randomToken();
    const expiresAt = new Date(Date.now() + STAFF_SESSION_MS);
    const id = await sha256Hex(token);
    await tx.insert(sessions).values({ id, userId: user.id, agencyId: m?.agencyId ?? null, expiresAt });
    await tx.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await tx.insert(auditLogs).values({ agencyId: m?.agencyId ?? null, actorUserId: user.id, action: 'auth.login' });
    const ctx = await loadStaff(tx, id);
    if (!ctx) throw new AuthError('invalid');
    return { token, expiresAt, ctx };
  });
}

export async function createDemoViewerSession(clientKey: string): Promise<{ token: string; expiresAt: Date }> {
  return withSystem(async (tx) => {
    if (!(await rateLimit(tx, `demo-painel:${clientKey}`, 3600, 30))) throw new AuthError('rate_limited');
    const [row] = await tx
      .select({ userId: users.id, agencyId: agencyMemberships.agencyId })
      .from(users)
      .innerJoin(agencyMemberships, eq(agencyMemberships.userId, users.id))
      .innerJoin(agencies, eq(agencies.id, agencyMemberships.agencyId))
      .where(and(sql`lower(${users.email}) = ${DEMO_VIEWER_EMAIL}`, eq(users.isDemo, true), eq(agencies.isDemo, true), eq(agencyMemberships.role, 'viewer')));
    if (!row) throw new AuthError('unavailable');
    const token = randomToken();
    const expiresAt = new Date(Date.now() + DEMO_SESSION_MS);
    await tx.insert(sessions).values({ id: await sha256Hex(token), userId: row.userId, agencyId: row.agencyId, expiresAt });
    return { token, expiresAt };
  });
}

async function loadStaff(tx: Tx, sessionId: string): Promise<StaffContext | null> {
  const [row] = await tx
    .select({ s: sessions, u: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())));
  if (!row || row.u.status !== 'active') return null;
  let role: Role | null = null;
  let agencyName: string | null = null;
  let agencyIsDemo = false;
  if (row.s.agencyId) {
    const [m] = await tx
      .select({ role: agencyMemberships.role, name: agencies.name, isDemo: agencies.isDemo, status: agencies.status })
      .from(agencyMemberships)
      .innerJoin(agencies, eq(agencies.id, agencyMemberships.agencyId))
      .where(and(eq(agencyMemberships.userId, row.u.id), eq(agencyMemberships.agencyId, row.s.agencyId)));
    if (m && m.status === 'active') {
      role = m.role as Role;
      agencyName = m.name;
      agencyIsDemo = m.isDemo;
    }
  }
  if (Date.now() - row.s.lastSeenAt.getTime() > 5 * 60_000) {
    await tx.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, sessionId));
  }
  return {
    sessionId,
    userId: row.u.id,
    email: row.u.email,
    name: row.u.name,
    isPlatformAdmin: row.u.isPlatformAdmin,
    isDemo: row.u.isDemo,
    agencyId: role ? row.s.agencyId : null,
    agencyName,
    agencyIsDemo,
    role,
  };
}

export async function resolveStaffSession(token: string): Promise<StaffContext | null> {
  if (!token || token.length > 100) return null;
  const id = await sha256Hex(token);
  return withSystem((tx) => loadStaff(tx, id));
}

export async function revokeStaffSession(token: string): Promise<void> {
  const id = await sha256Hex(token);
  await withSystem((tx) => tx.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, id)));
}

export async function createUser(
  tx: Tx,
  input: { email: string; name: string; isPlatformAdmin?: boolean; agencyId?: string; role?: Role },
): Promise<{ userId: string; setupToken: string }> {
  const email = input.email.trim().toLowerCase();
  const [existing] = await tx.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`);
  const userId =
    existing?.id ??
    (await tx.insert(users).values({ email, name: input.name, isPlatformAdmin: input.isPlatformAdmin ?? false }).returning({ id: users.id }))[0]!.id;
  if (input.agencyId) {
    await tx
      .insert(agencyMemberships)
      .values({ userId, agencyId: input.agencyId, role: input.role ?? 'admin' })
      .onConflictDoUpdate({ target: [agencyMemberships.userId, agencyMemberships.agencyId], set: { role: input.role ?? 'admin' } });
  }
  const setupToken = randomToken();
  await tx.insert(userTokens).values({ id: await sha256Hex(setupToken), userId, purpose: 'set_password', expiresAt: new Date(Date.now() + 3 * DAY) });
  return { userId, setupToken };
}

export const MIN_PASSWORD = 10;

export async function setPasswordWithToken(token: string, password: string, clientKey: string): Promise<void> {
  if (password.length < MIN_PASSWORD || password.length > 200) throw new AuthError('invalid');
  const allowed = await withSystem((tx) => rateLimit(tx, `senha:${clientKey}`, 3600, 20));
  if (!allowed) throw new AuthError('rate_limited');
  const id = await sha256Hex(token);
  const hash = await hashPassword(password);
  await withSystem(async (tx) => {
    // Gasta o token na mesma escrita que o confere: dois pedidos ao mesmo tempo nao usam o mesmo link.
    const [t] = await tx
      .update(userTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(userTokens.id, id), isNull(userTokens.usedAt), gt(userTokens.expiresAt, new Date()), eq(userTokens.purpose, 'set_password')))
      .returning({ userId: userTokens.userId });
    if (!t) throw new AuthError('expired');
    await tx.update(users).set({ passwordHash: hash }).where(eq(users.id, t.userId));
    // Senha nova derruba toda sessao anterior.
    await tx.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.userId, t.userId), isNull(sessions.revokedAt)));
    await tx.insert(auditLogs).values({ actorUserId: t.userId, action: 'auth.set_password' });
  });
}

// ─── Viajantes ──────────────────────────────────────────────────────────────

export type TravelerContext = {
  accessId: string;
  agencyId: string;
  caravanId: string;
  caravanSlug: string;
  label: string | null;
  kind: 'invite' | 'demo';
};

// O caminho do link de convite. Responde igual para codigo inexistente, de
// outra caravana, revogado ou vencido: quem tenta adivinhar nao aprende nada.
export async function claimInvite(slug: string, rawCode: string, clientKey: string): Promise<{ token: string; expiresAt: Date }> {
  const allowed = await withSystem(async (tx) => {
    const perMinute = await rateLimit(tx, `convite-min:${clientKey}`, 60, 10);
    const perHour = await rateLimit(tx, `convite-hora:${clientKey}`, 3600, 40);
    return perMinute && perHour;
  });
  if (!allowed) throw new AuthError('rate_limited');
  const code = normalizeInviteCode(rawCode);
  if (!code) throw new AuthError('invalid');
  const hash = await hashInviteCode(code);
  return withSystem(async (tx) => {
    const [row] = await tx
      .select({ a: participantAccess, slug: caravans.slug, status: caravans.status })
      .from(participantAccess)
      .innerJoin(caravans, eq(caravans.id, participantAccess.caravanId))
      .where(and(eq(participantAccess.codeHash, hash), eq(participantAccess.kind, 'invite')))
      .for('update');
    if (!row || row.slug !== slug || row.a.status !== 'active' || row.a.expiresAt <= new Date()) throw new AuthError('invalid');
    if (row.status !== 'published') throw new AuthError('not_published');
    const [{ n } = { n: 0 }] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(participantDevices)
      .where(and(eq(participantDevices.accessId, row.a.id), isNull(participantDevices.revokedAt), gt(participantDevices.expiresAt, new Date())));
    if (n >= row.a.maxDevices) throw new AuthError('device_limit');
    const token = randomToken();
    const expiresAt = row.a.expiresAt;
    await tx.insert(participantDevices).values({ id: await sha256Hex(token), accessId: row.a.id, caravanId: row.a.caravanId, agencyId: row.a.agencyId, expiresAt });
    await tx
      .update(participantAccess)
      .set({ firstUsedAt: row.a.firstUsedAt ?? new Date(), lastSeenAt: new Date() })
      .where(eq(participantAccess.id, row.a.id));
    return { token, expiresAt };
  });
}

export async function createDemoTraveler(clientKey: string): Promise<{ token: string; expiresAt: Date; slug: string }> {
  return withSystem(async (tx) => {
    if (!(await rateLimit(tx, `demo-viajante:${clientKey}`, 3600, 20))) throw new AuthError('rate_limited');
    const [car] = await tx
      .select({ id: caravans.id, agencyId: caravans.agencyId, slug: caravans.slug })
      .from(caravans)
      .innerJoin(agencies, eq(agencies.id, caravans.agencyId))
      .where(and(eq(caravans.slug, DEMO_CARAVAN.slug), eq(agencies.isDemo, true), eq(caravans.status, 'published')));
    if (!car) throw new AuthError('unavailable');
    // Visitas de demonstracao vencem em 24 h e sao apagadas com o progresso.
    await tx.delete(participantAccess).where(and(eq(participantAccess.kind, 'demo'), lt(participantAccess.expiresAt, new Date())));
    const expiresAt = new Date(Date.now() + DEMO_TRAVELER_MS);
    const code = await newInviteCode(); // nunca exibido: so preenche a coluna
    const [acc] = await tx
      .insert(participantAccess)
      .values({ caravanId: car.id, agencyId: car.agencyId, codeHash: code.hash, codeCipher: code.cipher, codeHint: code.hint, kind: 'demo', maxDevices: 1, expiresAt })
      .returning({ id: participantAccess.id });
    const token = randomToken();
    await tx.insert(participantDevices).values({ id: await sha256Hex(token), accessId: acc!.id, caravanId: car.id, agencyId: car.agencyId, expiresAt });
    return { token, expiresAt, slug: car.slug };
  });
}

export async function resolveTraveler(slug: string, token: string): Promise<TravelerContext | null> {
  if (!token || token.length > 100) return null;
  const id = await sha256Hex(token);
  return withSystem(async (tx) => {
    const now = new Date();
    const [row] = await tx
      .select({ d: participantDevices, a: participantAccess, slug: caravans.slug })
      .from(participantDevices)
      .innerJoin(participantAccess, eq(participantAccess.id, participantDevices.accessId))
      .innerJoin(caravans, eq(caravans.id, participantDevices.caravanId))
      .where(and(eq(participantDevices.id, id), isNull(participantDevices.revokedAt), gt(participantDevices.expiresAt, now)));
    if (!row || row.slug !== slug || row.a.status !== 'active' || row.a.expiresAt <= now) return null;
    if (now.getTime() - row.d.lastSeenAt.getTime() > 10 * 60_000) {
      await tx.update(participantDevices).set({ lastSeenAt: now }).where(eq(participantDevices.id, id));
      await tx.update(participantAccess).set({ lastSeenAt: now }).where(eq(participantAccess.id, row.a.id));
    }
    return {
      accessId: row.a.id,
      agencyId: row.a.agencyId,
      caravanId: row.a.caravanId,
      caravanSlug: row.slug,
      label: row.a.label,
      kind: row.a.kind as 'invite' | 'demo',
    };
  });
}

export async function leaveTraveler(token: string): Promise<void> {
  const id = await sha256Hex(token);
  await withSystem((tx) => tx.update(participantDevices).set({ revokedAt: new Date() }).where(eq(participantDevices.id, id)));
}
