// Operacoes do superadministrador. Rodam no papel mcd_platform.

import { and, asc, count, desc, eq, ne, sql } from 'drizzle-orm';
import {
  activities,
  agencies,
  agencyMemberships,
  auditLogs,
  brandingSettings,
  caravans,
  culturalContentRevisions,
  culturalContents,
  destinations,
  hebrewExpressions,
  participantAccess,
  plans,
  users,
  type ContentReference,
  type ContentSection,
  type EditorialStatus,
} from '../db/schema';
import type { Tx } from '../db/tenant';
import { slugify } from './agency';
import { DomainError } from './publication';

async function audit(tx: Tx, actorUserId: string, action: string, targetType: string, targetId: string, agencyId: string | null = null, metadata?: Record<string, unknown>) {
  await tx.insert(auditLogs).values({ agencyId, actorUserId, action, targetType, targetId, metadata: metadata ?? null });
}

export async function listAgencies(tx: Tx) {
  return tx
    .select({
      a: agencies,
      caravans: sql<number>`(select count(*)::int from caravans c where c.agency_id = agencies.id and c.status <> 'archived')`,
      seats: sql<number>`(select coalesce(sum(c.seat_limit), 0)::int from caravans c where c.agency_id = agencies.id and c.status <> 'archived')`,
      invites: sql<number>`(select count(*)::int from participant_access p where p.agency_id = agencies.id and p.kind = 'invite' and p.status = 'active' and p.expires_at > now())`,
    })
    .from(agencies)
    .orderBy(asc(agencies.isDemo), asc(agencies.name));
}

export type ContractInput = { planId: string; defaultSeatLimit: number; maxActiveCaravans: number; status: 'active' | 'suspended' | 'archived' };

export async function createAgency(tx: Tx, actorUserId: string, input: { name: string; contactEmail: string | null } & Omit<ContractInput, 'status'>): Promise<string> {
  const [plan] = await tx.select().from(plans).where(eq(plans.id, input.planId));
  if (!plan) throw new DomainError('invalido');
  const base = slugify(input.name) || 'agencia';
  const taken = await tx.select({ slug: agencies.slug }).from(agencies).where(sql`${agencies.slug} like ${`${base}%`}`);
  const slug = taken.some((t) => t.slug === base) ? `${base}-${taken.length + 1}` : base;
  const [ag] = await tx
    .insert(agencies)
    .values({ slug, name: input.name, defaultPlanId: input.planId, defaultSeatLimit: input.defaultSeatLimit, maxActiveCaravans: input.maxActiveCaravans, contactEmail: input.contactEmail })
    .returning({ id: agencies.id });
  const monogram = input.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  await tx.insert(brandingSettings).values({ agencyId: ag!.id, displayName: input.name, logoText: monogram || 'AG' });
  await audit(tx, actorUserId, 'agency.create', 'agency', ag!.id, ag!.id, { name: input.name });
  return ag!.id;
}

export async function updateContract(tx: Tx, actorUserId: string, agencyId: string, input: ContractInput): Promise<void> {
  const [ag] = await tx.select().from(agencies).where(eq(agencies.id, agencyId));
  if (!ag) throw new DomainError('not_found');
  if (ag.isDemo) throw new DomainError('demo');
  await tx.update(agencies).set({ ...input, defaultPlanId: input.planId, updatedAt: new Date() }).where(eq(agencies.id, agencyId));
  await audit(tx, actorUserId, 'agency.contract', 'agency', agencyId, agencyId, { ...input });
}

export async function setCaravanContract(tx: Tx, actorUserId: string, caravanId: string, planId: string, seatLimit: number): Promise<void> {
  const [car] = await tx.select().from(caravans).where(eq(caravans.id, caravanId));
  if (!car) throw new DomainError('not_found');
  await tx.update(caravans).set({ planId, seatLimit, updatedAt: new Date() }).where(eq(caravans.id, caravanId));
  await audit(tx, actorUserId, 'caravan.seats', 'caravan', caravanId, car.agencyId, { planId, seatLimit, before: { planId: car.planId, seatLimit: car.seatLimit } });
}

export async function agencyDetail(tx: Tx, agencyId: string) {
  const [ag] = await tx.select().from(agencies).where(eq(agencies.id, agencyId));
  if (!ag) return null;
  const cars = await tx
    .select({
      c: caravans,
      invites: sql<number>`(select count(*)::int from participant_access p where p.caravan_id = caravans.id and p.kind = 'invite' and p.status = 'active' and p.expires_at > now())`,
    })
    .from(caravans)
    .where(eq(caravans.agencyId, agencyId))
    .orderBy(asc(caravans.startDate));
  const team = await tx
    .select({ id: users.id, email: users.email, name: users.name, role: agencyMemberships.role, hasPassword: sql<boolean>`${users.passwordHash} is not null`, lastLoginAt: users.lastLoginAt })
    .from(agencyMemberships)
    .innerJoin(users, eq(users.id, agencyMemberships.userId))
    .where(eq(agencyMemberships.agencyId, agencyId));
  return { ag, cars, team };
}

export async function platformMetrics(tx: Tx) {
  const real = await tx.select().from(agencies).where(eq(agencies.isDemo, false));
  const realIds = new Set(real.map((a) => a.id));
  const cars = (await tx.select().from(caravans)).filter((c) => realIds.has(c.agencyId));
  const planRows = await tx.select().from(plans);
  const priceOf = new Map(planRows.map((p) => [p.id, p]));
  let reference = 0;
  for (const c of cars.filter((c) => c.status !== 'archived')) {
    const p = priceOf.get(c.planId);
    if (!p) continue;
    reference += p.priceUnit === 'participant' ? p.priceCents * c.seatLimit : p.priceCents * Math.max(1, Math.ceil(c.seatLimit / (p.groupSize ?? 50)));
  }
  const [{ n: travelers } = { n: 0 }] = await tx
    .select({ n: count() })
    .from(participantAccess)
    .innerJoin(agencies, eq(agencies.id, participantAccess.agencyId))
    .where(and(eq(agencies.isDemo, false), eq(participantAccess.kind, 'invite'), sql`${participantAccess.firstUsedAt} is not null`));
  return {
    agencies: real.filter((a) => a.status === 'active').length,
    suspended: real.filter((a) => a.status === 'suspended').length,
    published: cars.filter((c) => c.status === 'published').length,
    drafts: cars.filter((c) => c.status === 'draft').length,
    seats: cars.filter((c) => c.status !== 'archived').reduce((s, c) => s + c.seatLimit, 0),
    travelers,
    referenceCents: reference,
  };
}

// ─── Biblioteca ─────────────────────────────────────────────────────────────

export async function updateContent(
  tx: Tx,
  actorUserId: string,
  destinationId: string,
  input: { title: string; summary: string; geography: string | null; sections: ContentSection[]; observe: string[]; references: ContentReference[] },
): Promise<number> {
  const [c] = await tx.select().from(culturalContents).where(and(eq(culturalContents.destinationId, destinationId), eq(culturalContents.locale, 'pt-BR')));
  let contentId: string;
  let revision: number;
  if (!c) {
    const [row] = await tx.insert(culturalContents).values({ destinationId, ...input, editorialStatus: 'draft', revision: 1 }).returning({ id: culturalContents.id });
    contentId = row!.id;
    revision = 1;
    await tx.update(destinations).set({ status: 'draft', updatedAt: new Date() }).where(eq(destinations.id, destinationId));
  } else {
    contentId = c.id;
    revision = c.revision + 1;
    // Texto editado volta para revisao: o que estava aprovado nao vira aprovado de novo sozinho.
    await tx
      .update(culturalContents)
      .set({ ...input, revision, editorialStatus: c.editorialStatus === 'approved' ? 'in_review' : c.editorialStatus, reviewedBy: null, reviewedAt: null, updatedAt: new Date() })
      .where(eq(culturalContents.id, c.id));
  }
  await tx.insert(culturalContentRevisions).values({ contentId, revision, body: input as unknown as Record<string, unknown>, createdBy: actorUserId });
  await audit(tx, actorUserId, 'library.content', 'destination', destinationId, null, { revision });
  return revision;
}

export async function setEditorialStatus(tx: Tx, actorUserId: string, destinationId: string, status: EditorialStatus, reviewer: string | null): Promise<void> {
  const [c] = await tx.select().from(culturalContents).where(eq(culturalContents.destinationId, destinationId));
  if (!c) throw new DomainError('not_found');
  if (status === 'approved' && !reviewer) throw new DomainError('revisor');
  await tx
    .update(culturalContents)
    .set({ editorialStatus: status, reviewedBy: status === 'approved' ? reviewer : null, reviewedAt: status === 'approved' ? new Date() : null })
    .where(eq(culturalContents.id, c.id));
  await tx.update(destinations).set({ status, updatedAt: new Date() }).where(eq(destinations.id, destinationId));
  await audit(tx, actorUserId, 'library.status', 'destination', destinationId, null, { status, reviewer });
}

export async function setHebrewReview(tx: Tx, actorUserId: string, slug: string, reviewed: boolean, reviewer: string | null): Promise<void> {
  if (reviewed && !reviewer) throw new DomainError('revisor');
  const res = await tx
    .update(hebrewExpressions)
    .set({ reviewStatus: reviewed ? 'reviewed' : 'pending_native_review' })
    .where(eq(hebrewExpressions.slug, slug))
    .returning({ id: hebrewExpressions.id });
  if (!res.length) throw new DomainError('not_found');
  await audit(tx, actorUserId, 'hebrew.review', 'hebrew_expression', slug, null, { reviewed, reviewer });
}

export async function setActivityStatus(tx: Tx, actorUserId: string, activityId: string, status: EditorialStatus): Promise<void> {
  const res = await tx.update(activities).set({ status, updatedAt: new Date() }).where(eq(activities.id, activityId)).returning({ id: activities.id });
  if (!res.length) throw new DomainError('not_found');
  await audit(tx, actorUserId, 'activity.status', 'activity', activityId, null, { status });
}

export async function updatePlan(tx: Tx, actorUserId: string, planId: string, input: { name: string; priceCents: number; isActive: boolean }): Promise<void> {
  const res = await tx.update(plans).set(input).where(eq(plans.id, planId)).returning({ id: plans.id });
  if (!res.length) throw new DomainError('not_found');
  await audit(tx, actorUserId, 'plan.update', 'plan', planId, null, input);
}

export async function recentAudit(tx: Tx, limit = 150) {
  return tx
    .select({ log: auditLogs, agency: agencies.name, actor: users.email })
    .from(auditLogs)
    .leftJoin(agencies, eq(agencies.id, auditLogs.agencyId))
    .leftJoin(users, eq(users.id, auditLogs.actorUserId))
    .where(ne(auditLogs.action, 'auth.login'))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
