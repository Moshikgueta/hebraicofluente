'use server';

import { z } from 'zod';
import { createUser } from '@/lib/auth/sessions';
import { requirePlatform } from '@/lib/auth/next';
import { withSystem } from '@/lib/db/tenant';
import { parseSections } from '@/lib/domain/editorial';
import {
  createAgency,
  setActivityStatus,
  setCaravanContract,
  setEditorialStatus,
  setHebrewReview,
  updateContent,
  updateContract,
  updatePlan,
} from '@/lib/domain/platform';
import { DomainError } from '@/lib/domain/publication';
import { publicUrl } from '@/lib/env';
import { runPlatform } from '@/lib/panel';

const uuid = z.string().uuid();
const str = (form: FormData, k: string) => String(form.get(k) ?? '').trim();
const PLAN = z.enum(['essencial', 'completa', 'white_label']);

function contract(form: FormData) {
  const r = z
    .object({
      planId: PLAN,
      defaultSeatLimit: z.coerce.number().int().min(1).max(5000),
      maxActiveCaravans: z.coerce.number().int().min(1).max(500),
      status: z.enum(['active', 'suspended', 'archived']),
    })
    .safeParse({ planId: str(form, 'planId'), defaultSeatLimit: str(form, 'defaultSeatLimit'), maxActiveCaravans: str(form, 'maxActiveCaravans'), status: str(form, 'status') || 'active' });
  if (!r.success) throw new DomainError('invalido');
  return r.data;
}

export async function createAgencyAction(form: FormData) {
  await runPlatform('/admin/agencias', async (tx, staff) => {
    const name = z.string().min(2).max(120).safeParse(str(form, 'name'));
    const email = z.union([z.literal(''), z.string().email().max(200)]).safeParse(str(form, 'contactEmail'));
    if (!name.success || !email.success) throw new DomainError('invalido');
    const c = contract(form);
    const id = await createAgency(tx, staff.userId, { name: name.data, contactEmail: email.data || null, ...c });
    return `/admin/agencias/${id}?ok=criado`;
  });
}

export async function updateContractAction(form: FormData) {
  const id = uuid.parse(str(form, 'agencyId'));
  await runPlatform(`/admin/agencias/${id}`, (tx, staff) => updateContract(tx, staff.userId, id, contract(form)));
}

export async function caravanContractAction(form: FormData) {
  const agencyId = uuid.parse(str(form, 'agencyId'));
  const caravanId = uuid.parse(str(form, 'caravanId'));
  await runPlatform(`/admin/agencias/${agencyId}`, async (tx, staff) => {
    const planId = PLAN.safeParse(str(form, 'planId'));
    const seats = z.coerce.number().int().min(0).max(5000).safeParse(str(form, 'seatLimit'));
    if (!planId.success || !seats.success) throw new DomainError('invalido');
    await setCaravanContract(tx, staff.userId, caravanId, planId.data, seats.data);
  });
}

// Conta de equipe: cria (ou reaproveita) a pessoa e gera o link de definir
// senha. O link volta como resposta da acao e aparece UMA vez na tela, para o
// superadministrador enviar: nunca passa pela URL nem fica em log.
export type UserLinkState = { error: string | null; link: string | null; email: string | null };

export async function createAgencyUserAction(_prev: UserLinkState, form: FormData): Promise<UserLinkState> {
  const staff = await requirePlatform();
  const agencyId = uuid.safeParse(str(form, 'agencyId'));
  const parsed = z
    .object({ email: z.string().email().max(200), name: z.string().min(2).max(120), role: z.enum(['owner', 'admin', 'editor', 'viewer']) })
    .safeParse({ email: str(form, 'email'), name: str(form, 'name'), role: str(form, 'role') });
  if (!agencyId.success || !parsed.success) return { error: 'Confira nome, e-mail e papel.', link: null, email: null };
  const token = await withSystem(async (tx) => {
    const { agencies, auditLogs } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');
    const [ag] = await tx.select().from(agencies).where(eq(agencies.id, agencyId.data));
    if (!ag || ag.isDemo) return null;
    const { setupToken, userId } = await createUser(tx, { ...parsed.data, agencyId: agencyId.data });
    await tx.insert(auditLogs).values({ agencyId: agencyId.data, actorUserId: staff.userId, action: 'agency.user', targetType: 'user', targetId: userId, metadata: { role: parsed.data.role } });
    return setupToken;
  });
  if (!token) return { error: 'Agência não encontrada.', link: null, email: null };
  return { error: null, link: `${publicUrl()}/definir-senha?token=${token}`, email: parsed.data.email };
}

export async function updateContentAction(form: FormData) {
  const id = uuid.parse(str(form, 'destinationId'));
  const slug = z.string().regex(/^[a-z0-9-]+$/).parse(str(form, 'slug'));
  await runPlatform(`/admin/biblioteca/${slug}`, async (tx, staff) => {
    const parsed = parseSections(String(form.get('sections') ?? ''));
    if (!parsed.ok) throw new DomainError('formato');
    const lines = (k: string) =>
      String(form.get(k) ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    const title = z.string().min(2).max(120).safeParse(str(form, 'title'));
    const summary = z.string().min(10).max(600).safeParse(str(form, 'summary'));
    if (!title.success || !summary.success) throw new DomainError('invalido');
    await updateContent(tx, staff.userId, id, {
      title: title.data,
      summary: summary.data,
      geography: str(form, 'geography') || null,
      sections: parsed.sections,
      observe: lines('observe').slice(0, 12),
      references: lines('references')
        .slice(0, 20)
        .map((l) => {
          const [label, ...rest] = l.split(' | ');
          return { label: label!.trim(), detail: rest.join(' | ').trim() || undefined };
        }),
    });
  });
}

export async function editorialStatusAction(form: FormData) {
  const id = uuid.parse(str(form, 'destinationId'));
  const slug = z.string().regex(/^[a-z0-9-]+$/).parse(str(form, 'slug'));
  await runPlatform(`/admin/biblioteca/${slug}`, async (tx, staff) => {
    const status = z.enum(['draft', 'in_review', 'approved']).safeParse(str(form, 'status'));
    if (!status.success) throw new DomainError('invalido');
    await setEditorialStatus(tx, staff.userId, id, status.data, str(form, 'reviewer') || null);
  });
}

export async function hebrewReviewAction(form: FormData) {
  await runPlatform('/admin/hebraico', async (tx, staff) => {
    const slug = z.string().regex(/^[a-z0-9-]+$/).safeParse(str(form, 'slug'));
    if (!slug.success) throw new DomainError('invalido');
    await setHebrewReview(tx, staff.userId, slug.data, str(form, 'reviewed') === '1', str(form, 'reviewer') || null);
  });
}

export async function activityStatusAction(form: FormData) {
  await runPlatform('/admin/atividades', async (tx, staff) => {
    const id = uuid.safeParse(str(form, 'activityId'));
    const status = z.enum(['draft', 'in_review', 'approved']).safeParse(str(form, 'status'));
    if (!id.success || !status.success) throw new DomainError('invalido');
    await setActivityStatus(tx, staff.userId, id.data, status.data);
  });
}

export async function updatePlanAction(form: FormData) {
  await runPlatform('/admin/planos', async (tx, staff) => {
    const id = PLAN.safeParse(str(form, 'planId'));
    const name = z.string().min(2).max(80).safeParse(str(form, 'name'));
    const price = z.coerce.number().min(0).max(1_000_000).safeParse(str(form, 'price').replace(',', '.'));
    if (!id.success || !name.success || !price.success) throw new DomainError('invalido');
    await updatePlan(tx, staff.userId, id.data, { name: name.data, priceCents: Math.round(price.data * 100), isActive: form.get('isActive') === 'on' });
  });
}
