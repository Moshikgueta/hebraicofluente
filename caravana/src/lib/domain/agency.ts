// Operacoes do painel da agencia. Todas recebem a transacao ja no papel
// mcd_agency (withScope): mesmo que um id de outra agencia chegue aqui, o banco
// nao devolve a linha e as chaves compostas recusam a escrita.

import { and, asc, count, desc, eq, gt, inArray, isNull, ne, sql } from 'drizzle-orm';
import { infoTemplates } from '@content/info-templates';
import { decryptText } from '../crypto';
import { addDays, daysBetween } from '../dates';
import {
  activityCompletions,
  agencies,
  auditLogs,
  brandingSettings,
  caravanContents,
  caravanDays,
  caravanInfoItems,
  caravans,
  contentViews,
  destinations,
  participantAccess,
  participantBadges,
  participantDevices,
  plans,
  stops,
  type CaravanFeatures,
} from '../db/schema';
import type { Tx } from '../db/tenant';
import { formatInviteCode, newInviteCode } from './codes';
import { effectiveFeatures } from './features';
import { DomainError } from './publication';

export type Actor = { userId: string; agencyId: string };

async function audit(tx: Tx, actor: Actor, action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>) {
  await tx.insert(auditLogs).values({ agencyId: actor.agencyId, actorUserId: actor.userId, action, targetType, targetId, metadata: metadata ?? null });
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function randomSuffix(): string {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  return [...crypto.getRandomValues(new Uint8Array(5))].map((b) => a[b % a.length]).join('');
}

export async function requireCaravan(tx: Tx, caravanId: string) {
  const [car] = await tx.select().from(caravans).where(eq(caravans.id, caravanId));
  if (!car) throw new DomainError('caravan_not_found');
  return car;
}

// ─── Caravanas ──────────────────────────────────────────────────────────────

export type GeneralInput = { name: string; description: string | null; startDate: string; endDate: string; organizerName: string | null };

export async function createCaravan(tx: Tx, actor: Actor, input: GeneralInput): Promise<string> {
  if (input.endDate < input.startDate) throw new DomainError('dates');
  if (daysBetween(input.startDate, input.endDate) > 60) throw new DomainError('too_long');
  const [car] = await tx
    .insert(caravans)
    .values({
      agencyId: actor.agencyId,
      slug: `${slugify(input.name) || 'caravana'}-${randomSuffix()}`,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      organizerName: input.organizerName,
      // Plano e vagas: o gatilho do banco troca pelos do contrato da agencia.
      planId: 'essencial',
      seatLimit: 0,
    })
    .returning({ id: caravans.id });
  const caravanId = car!.id;
  let pos = 0;
  for (const t of infoTemplates) {
    await tx.insert(caravanInfoItems).values({ caravanId, agencyId: actor.agencyId, section: t.section, title: t.title, body: t.body, position: pos++ });
  }
  await audit(tx, actor, 'caravan.create', 'caravan', caravanId, { name: input.name });
  return caravanId;
}

export async function updateGeneral(tx: Tx, actor: Actor, caravanId: string, input: GeneralInput): Promise<void> {
  const car = await requireCaravan(tx, caravanId);
  if (input.endDate < input.startDate) throw new DomainError('dates');
  if (daysBetween(input.startDate, input.endDate) > 60) throw new DomainError('too_long');
  await tx
    .update(caravans)
    .set({ name: input.name, description: input.description, startDate: input.startDate, endDate: input.endDate, organizerName: input.organizerName, updatedAt: new Date() })
    .where(eq(caravans.id, caravanId));
  if (car.startDate !== input.startDate || car.endDate !== input.endDate) {
    await audit(tx, actor, 'caravan.dates', 'caravan', caravanId, { from: [car.startDate, car.endDate], to: [input.startDate, input.endDate] });
  }
}

export type BrandingInput = {
  primaryColor: string | null;
  secondaryColor: string | null;
  welcomeMessage: string | null;
  postTripMessage: string | null;
  coverArt: string;
};

export async function updateCaravanBranding(tx: Tx, actor: Actor, caravanId: string, input: BrandingInput): Promise<void> {
  await requireCaravan(tx, caravanId);
  await tx.update(caravans).set({ ...input, updatedAt: new Date() }).where(eq(caravans.id, caravanId));
  await audit(tx, actor, 'caravan.branding', 'caravan', caravanId);
}

export async function updateAgencyBranding(
  tx: Tx,
  actor: Actor,
  input: { displayName: string; logoText: string; primaryColor: string; secondaryColor: string; welcomeMessage: string | null },
): Promise<void> {
  await tx
    .insert(brandingSettings)
    .values({ agencyId: actor.agencyId, ...input })
    .onConflictDoUpdate({ target: brandingSettings.agencyId, set: { ...input, updatedAt: new Date() } });
  await audit(tx, actor, 'agency.branding', 'agency', actor.agencyId);
}

export async function updateFeatures(tx: Tx, actor: Actor, caravanId: string, features: CaravanFeatures): Promise<CaravanFeatures> {
  const car = await requireCaravan(tx, caravanId);
  const [plan] = await tx.select().from(plans).where(eq(plans.id, car.planId));
  // O plano corta no servidor: um recurso fora do contrato fica desligado.
  const allowed = effectiveFeatures(features, plan?.features ?? []);
  await tx.update(caravans).set({ features: allowed, updatedAt: new Date() }).where(eq(caravans.id, caravanId));
  await audit(tx, actor, 'caravan.features', 'caravan', caravanId, allowed);
  return allowed;
}

export async function archiveCaravan(tx: Tx, actor: Actor, caravanId: string): Promise<void> {
  await requireCaravan(tx, caravanId);
  await tx.update(caravans).set({ status: 'archived', currentPublicationId: null, archivedAt: new Date(), updatedAt: new Date() }).where(eq(caravans.id, caravanId));
  await audit(tx, actor, 'caravan.archive', 'caravan', caravanId);
}

// ─── Roteiro ────────────────────────────────────────────────────────────────

export type DayInput = { title: string; summary: string | null; practicalNotes: string | null };

export async function addDay(tx: Tx, actor: Actor, caravanId: string, input: DayInput): Promise<string> {
  const car = await requireCaravan(tx, caravanId);
  const [{ n } = { n: 0 }] = await tx.select({ n: count() }).from(caravanDays).where(eq(caravanDays.caravanId, caravanId));
  const duration = daysBetween(car.startDate, car.endDate) + 1;
  if (n >= duration) throw new DomainError('day_limit', `A viagem tem ${duration} dias.`);
  const [d] = await tx
    .insert(caravanDays)
    .values({ caravanId, agencyId: actor.agencyId, dayNumber: n + 1, ...input })
    .returning({ id: caravanDays.id });
  return d!.id;
}

export async function updateDay(tx: Tx, caravanId: string, dayId: string, input: DayInput): Promise<void> {
  const res = await tx.update(caravanDays).set(input).where(and(eq(caravanDays.id, dayId), eq(caravanDays.caravanId, caravanId))).returning({ id: caravanDays.id });
  if (!res.length) throw new DomainError('not_found');
}

async function renumberDays(tx: Tx, caravanId: string, orderedIds: string[]) {
  // Dois passos para nao colidir numeracao no meio do caminho.
  for (let i = 0; i < orderedIds.length; i++) await tx.update(caravanDays).set({ dayNumber: 1000 + i }).where(eq(caravanDays.id, orderedIds[i]!));
  for (let i = 0; i < orderedIds.length; i++) await tx.update(caravanDays).set({ dayNumber: i + 1 }).where(eq(caravanDays.id, orderedIds[i]!));
}

export async function deleteDay(tx: Tx, actor: Actor, caravanId: string, dayId: string): Promise<void> {
  const res = await tx.delete(caravanDays).where(and(eq(caravanDays.id, dayId), eq(caravanDays.caravanId, caravanId))).returning({ id: caravanDays.id });
  if (!res.length) throw new DomainError('not_found');
  const rest = await tx.select({ id: caravanDays.id }).from(caravanDays).where(eq(caravanDays.caravanId, caravanId)).orderBy(asc(caravanDays.dayNumber));
  await renumberDays(tx, caravanId, rest.map((r) => r.id));
  await audit(tx, actor, 'day.delete', 'caravan', caravanId);
}

export async function moveDay(tx: Tx, caravanId: string, dayId: string, direction: -1 | 1): Promise<void> {
  const rows = await tx.select({ id: caravanDays.id }).from(caravanDays).where(eq(caravanDays.caravanId, caravanId)).orderBy(asc(caravanDays.dayNumber));
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(dayId);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  await renumberDays(tx, caravanId, ids);
}

export type StopInput = { title: string; timeLabel: string | null; description: string | null; practicalNote: string | null; destinationId: string | null };

export async function addStop(tx: Tx, actor: Actor, caravanId: string, dayId: string, input: StopInput): Promise<string> {
  const [{ n } = { n: 0 }] = await tx.select({ n: count() }).from(stops).where(eq(stops.dayId, dayId));
  if (n >= 12) throw new DomainError('stop_limit');
  const [s] = await tx.insert(stops).values({ dayId, caravanId, agencyId: actor.agencyId, position: n, ...input }).returning({ id: stops.id });
  if (input.destinationId) await suggestContent(tx, actor, caravanId, input.destinationId);
  return s!.id;
}

// Parada ligada a um destino cadastrado: o destino entra na selecao de
// conteudo. A ligacao e explicita (o id escolhido na lista), nunca por nome.
async function suggestContent(tx: Tx, actor: Actor, caravanId: string, destinationId: string) {
  await tx.insert(caravanContents).values({ caravanId, destinationId, agencyId: actor.agencyId }).onConflictDoNothing();
}

export async function updateStop(tx: Tx, actor: Actor, caravanId: string, stopId: string, input: StopInput): Promise<void> {
  const res = await tx.update(stops).set(input).where(and(eq(stops.id, stopId), eq(stops.caravanId, caravanId))).returning({ id: stops.id });
  if (!res.length) throw new DomainError('not_found');
  if (input.destinationId) await suggestContent(tx, actor, caravanId, input.destinationId);
}

export async function deleteStop(tx: Tx, caravanId: string, stopId: string): Promise<void> {
  const [s] = await tx.delete(stops).where(and(eq(stops.id, stopId), eq(stops.caravanId, caravanId))).returning({ dayId: stops.dayId });
  if (!s) throw new DomainError('not_found');
  const rest = await tx.select({ id: stops.id }).from(stops).where(eq(stops.dayId, s.dayId)).orderBy(asc(stops.position));
  for (let i = 0; i < rest.length; i++) await tx.update(stops).set({ position: i }).where(eq(stops.id, rest[i]!.id));
}

export async function moveStop(tx: Tx, caravanId: string, stopId: string, direction: -1 | 1): Promise<void> {
  const [s] = await tx.select().from(stops).where(and(eq(stops.id, stopId), eq(stops.caravanId, caravanId)));
  if (!s) return;
  const rest = await tx.select({ id: stops.id }).from(stops).where(eq(stops.dayId, s.dayId)).orderBy(asc(stops.position));
  const ids = rest.map((r) => r.id);
  const i = ids.indexOf(stopId);
  const j = i + direction;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  for (let k = 0; k < ids.length; k++) await tx.update(stops).set({ position: k }).where(eq(stops.id, ids[k]!));
}

export async function setContentSelection(tx: Tx, actor: Actor, caravanId: string, destinationIds: string[]): Promise<void> {
  await requireCaravan(tx, caravanId);
  const valid = destinationIds.length
    ? (await tx.select({ id: destinations.id }).from(destinations).where(inArray(destinations.id, destinationIds))).map((d) => d.id)
    : [];
  await tx.delete(caravanContents).where(eq(caravanContents.caravanId, caravanId));
  for (const destinationId of valid) await tx.insert(caravanContents).values({ caravanId, destinationId, agencyId: actor.agencyId });
  await audit(tx, actor, 'caravan.contents', 'caravan', caravanId, { count: valid.length });
}

// ─── Informacoes uteis ──────────────────────────────────────────────────────

export type InfoInput = {
  section: string;
  title: string;
  body: string;
  contactValue: string | null;
  contactKind: string | null;
  isTimeSensitive: boolean;
};

export async function addInfoItem(tx: Tx, actor: Actor, caravanId: string, input: InfoInput): Promise<void> {
  await requireCaravan(tx, caravanId);
  const [{ n } = { n: 0 }] = await tx.select({ n: count() }).from(caravanInfoItems).where(eq(caravanInfoItems.caravanId, caravanId));
  if (n >= 60) throw new DomainError('info_limit');
  await tx.insert(caravanInfoItems).values({ caravanId, agencyId: actor.agencyId, position: n, ...input });
}

export async function updateInfoItem(tx: Tx, caravanId: string, itemId: string, input: InfoInput): Promise<void> {
  const res = await tx
    .update(caravanInfoItems)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(caravanInfoItems.id, itemId), eq(caravanInfoItems.caravanId, caravanId)))
    .returning({ id: caravanInfoItems.id });
  if (!res.length) throw new DomainError('not_found');
}

export async function deleteInfoItem(tx: Tx, caravanId: string, itemId: string): Promise<void> {
  await tx.delete(caravanInfoItems).where(and(eq(caravanInfoItems.id, itemId), eq(caravanInfoItems.caravanId, caravanId)));
}

// ─── Convites ───────────────────────────────────────────────────────────────

export const DEFAULT_MAX_DEVICES = 3;

export async function createInvites(
  tx: Tx,
  actor: Actor,
  caravanId: string,
  labels: (string | null)[],
  maxDevices = DEFAULT_MAX_DEVICES,
): Promise<{ id: string; code: string; label: string | null }[]> {
  const car = await requireCaravan(tx, caravanId);
  if (car.status === 'archived') throw new DomainError('archived');
  if (labels.length < 1 || labels.length > 100) throw new DomainError('invite_count');
  // Vale ate 180 dias depois da volta: o conteudo pos-viagem continua acessivel.
  const expiresAt = new Date(`${addDays(car.endDate, 180)}T23:59:59Z`);
  const out: { id: string; code: string; label: string | null }[] = [];
  for (const label of labels) {
    const c = await newInviteCode();
    // O gatilho mcd_seat_guard recusa o convite que passaria do limite.
    const [row] = await tx
      .insert(participantAccess)
      .values({ caravanId, agencyId: actor.agencyId, codeHash: c.hash, codeCipher: c.cipher, codeHint: c.hint, label, maxDevices, expiresAt })
      .returning({ id: participantAccess.id });
    out.push({ id: row!.id, code: c.code, label });
  }
  await audit(tx, actor, 'invite.create', 'caravan', caravanId, { count: labels.length });
  return out;
}

export type InviteRow = {
  id: string;
  label: string | null;
  code: string | null;
  hint: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  firstUsedAt: Date | null;
  lastSeenAt: Date | null;
  devices: number;
  maxDevices: number;
};

export async function listInvites(tx: Tx, caravanId: string): Promise<InviteRow[]> {
  const rows = await tx
    .select({
      a: participantAccess,
      devices: sql<number>`(select count(*)::int from participant_devices d where d.access_id = participant_access.id and d.revoked_at is null and d.expires_at > now())`,
    })
    .from(participantAccess)
    .where(and(eq(participantAccess.caravanId, caravanId), eq(participantAccess.kind, 'invite')))
    .orderBy(desc(participantAccess.createdAt));
  const out: InviteRow[] = [];
  for (const { a, devices } of rows) {
    const plain = a.status === 'active' ? await decryptText(a.codeCipher) : null;
    out.push({
      id: a.id,
      label: a.label,
      code: plain ? formatInviteCode(plain) : null,
      hint: a.codeHint,
      status: a.status === 'active' && a.expiresAt <= new Date() ? 'expired' : a.status,
      expiresAt: a.expiresAt,
      createdAt: a.createdAt,
      firstUsedAt: a.firstUsedAt,
      lastSeenAt: a.lastSeenAt,
      devices,
      maxDevices: a.maxDevices,
    });
  }
  return out;
}

export async function revokeInvite(tx: Tx, actor: Actor, caravanId: string, accessId: string): Promise<void> {
  const res = await tx
    .update(participantAccess)
    .set({ status: 'revoked', revokedAt: new Date() })
    .where(and(eq(participantAccess.id, accessId), eq(participantAccess.caravanId, caravanId), eq(participantAccess.status, 'active')))
    .returning({ id: participantAccess.id });
  if (!res.length) throw new DomainError('not_found');
  await tx.update(participantDevices).set({ revokedAt: new Date() }).where(and(eq(participantDevices.accessId, accessId), isNull(participantDevices.revokedAt)));
  await audit(tx, actor, 'invite.revoke', 'participant_access', accessId);
}

// Viajante trocou de celular e bateu no limite: a agencia libera os aparelhos.
export async function resetInviteDevices(tx: Tx, actor: Actor, caravanId: string, accessId: string): Promise<void> {
  const [a] = await tx
    .select({ id: participantAccess.id })
    .from(participantAccess)
    .where(and(eq(participantAccess.id, accessId), eq(participantAccess.caravanId, caravanId)));
  if (!a) throw new DomainError('not_found');
  await tx.update(participantDevices).set({ revokedAt: new Date() }).where(and(eq(participantDevices.accessId, accessId), isNull(participantDevices.revokedAt)));
  await audit(tx, actor, 'invite.reset_devices', 'participant_access', accessId);
}

export async function seatUsage(tx: Tx, caravanId: string): Promise<{ used: number; limit: number }> {
  const car = await requireCaravan(tx, caravanId);
  const [{ n } = { n: 0 }] = await tx
    .select({ n: count() })
    .from(participantAccess)
    .where(
      and(
        eq(participantAccess.caravanId, caravanId),
        eq(participantAccess.kind, 'invite'),
        eq(participantAccess.status, 'active'),
        gt(participantAccess.expiresAt, new Date()),
      ),
    );
  return { used: n, limit: car.seatLimit };
}

// ─── Painel ─────────────────────────────────────────────────────────────────

export type CaravanSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  startDate: string;
  endDate: string;
  planId: string;
  seatLimit: number;
  invites: number;
  activeTravelers: number;
};

export async function listCaravans(tx: Tx): Promise<CaravanSummary[]> {
  // Nas subconsultas a coluna vai qualificada a mao: o Drizzle escreveria "id"
  // e o Postgres resolveria para a tabela de dentro, contando errado em silencio.
  const rows = await tx
    .select({
      c: caravans,
      invites: sql<number>`(select count(*)::int from participant_access p where p.caravan_id = caravans.id and p.kind = 'invite' and p.status = 'active' and p.expires_at > now())`,
      active: sql<number>`(select count(*)::int from participant_access p where p.caravan_id = caravans.id and p.kind = 'invite' and p.first_used_at is not null and p.status = 'active')`,
    })
    .from(caravans)
    .orderBy(asc(caravans.startDate));
  return rows.map(({ c, invites, active }) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    planId: c.planId,
    seatLimit: c.seatLimit,
    invites,
    activeTravelers: active,
  }));
}

export type DashboardMetrics = {
  activeCaravans: number;
  upcomingCaravans: number;
  draftCaravans: number;
  seatsContracted: number;
  invitesActive: number;
  travelersWithAccess: number;
  activitiesCompleted: number;
  badgesAwarded: number;
  destinationsRead: number;
  engagedShare: number | null; // viajantes com ao menos uma atividade / viajantes que entraram
  recent: { action: string; createdAt: Date; targetId: string | null }[];
  agency: { name: string; isDemo: boolean; planId: string; maxActiveCaravans: number };
};

export async function dashboardMetrics(tx: Tx, agencyId: string, today: string): Promise<DashboardMetrics> {
  const [ag] = await tx.select().from(agencies).where(eq(agencies.id, agencyId));
  if (!ag) throw new DomainError('not_found');
  const list = await listCaravans(tx);
  const live = list.filter((c) => c.status !== 'archived');
  const activeCaravans = live.filter((c) => c.status === 'published' && c.startDate <= today && c.endDate >= today).length;
  const upcomingCaravans = live.filter((c) => c.status === 'published' && c.startDate > today).length;
  const draftCaravans = live.filter((c) => c.status === 'draft').length;
  const seatsContracted = live.reduce((s, c) => s + c.seatLimit, 0);
  const invitesActive = live.reduce((s, c) => s + c.invites, 0);
  const travelersWithAccess = live.reduce((s, c) => s + c.activeTravelers, 0);

  // So convites de verdade contam: as visitas da demonstracao ficam de fora.
  const inviteIds = tx.select({ id: participantAccess.id }).from(participantAccess).where(eq(participantAccess.kind, 'invite'));
  const [{ n: activitiesCompleted } = { n: 0 }] = await tx.select({ n: count() }).from(activityCompletions).where(inArray(activityCompletions.accessId, inviteIds));
  const [{ n: badgesAwarded } = { n: 0 }] = await tx.select({ n: count() }).from(participantBadges).where(inArray(participantBadges.accessId, inviteIds));
  const [{ n: destinationsRead } = { n: 0 }] = await tx.select({ n: count() }).from(contentViews).where(inArray(contentViews.accessId, inviteIds));
  const [{ n: engaged } = { n: 0 }] = await tx
    .select({ n: sql<number>`count(distinct ${activityCompletions.accessId})::int` })
    .from(activityCompletions)
    .where(inArray(activityCompletions.accessId, inviteIds));
  const recent = await tx
    .select({ action: auditLogs.action, createdAt: auditLogs.createdAt, targetId: auditLogs.targetId })
    .from(auditLogs)
    .where(and(eq(auditLogs.agencyId, agencyId), ne(auditLogs.action, 'auth.login')))
    .orderBy(desc(auditLogs.createdAt))
    .limit(8);
  return {
    activeCaravans,
    upcomingCaravans,
    draftCaravans,
    seatsContracted,
    invitesActive,
    travelersWithAccess,
    activitiesCompleted,
    badgesAwarded,
    destinationsRead,
    engagedShare: travelersWithAccess ? engaged / travelersWithAccess : null,
    recent,
    agency: { name: ag.name, isDemo: ag.isDemo, planId: ag.defaultPlanId, maxActiveCaravans: ag.maxActiveCaravans },
  };
}

// Engajamento por caravana, agregado: nunca por pessoa.
export async function caravanEngagement(tx: Tx, caravanId: string) {
  const inviteIds = tx
    .select({ id: participantAccess.id })
    .from(participantAccess)
    .where(and(eq(participantAccess.caravanId, caravanId), eq(participantAccess.kind, 'invite')));
  const byActivity = await tx
    .select({ slug: activityCompletions.activitySlug, n: count() })
    .from(activityCompletions)
    .where(inArray(activityCompletions.accessId, inviteIds))
    .groupBy(activityCompletions.activitySlug);
  const byDestination = await tx
    .select({ slug: contentViews.destinationSlug, n: count() })
    .from(contentViews)
    .where(inArray(contentViews.accessId, inviteIds))
    .groupBy(contentViews.destinationSlug);
  return { byActivity, byDestination };
}
