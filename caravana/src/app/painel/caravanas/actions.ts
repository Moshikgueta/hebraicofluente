'use server';

// Acoes do criador de caravanas. Formularios comuns (funcionam sem JS); cada
// uma valida a entrada com zod, confere o papel (runAgency) e grava no papel
// mcd_agency, onde o banco recusa o que nao for da agencia.

import { z } from 'zod';
import { SCENES } from '@/components/art/Scene';
import { INFO_SECTIONS } from '@content/info-templates';
import {
  addDay,
  addInfoItem,
  addStop,
  archiveCaravan,
  createCaravan,
  createInvites,
  deleteDay,
  deleteInfoItem,
  deleteStop,
  moveDay,
  moveStop,
  resetInviteDevices,
  revokeInvite,
  setContentSelection,
  updateCaravanBranding,
  updateDay,
  updateFeatures,
  updateGeneral,
  updateInfoItem,
  updateStop,
} from '@/lib/domain/agency';
import { DomainError, publishCaravan, unpublishCaravan } from '@/lib/domain/publication';
import { runAgency } from '@/lib/panel';
import { isHexColor } from '@/lib/theme';

const uuid = z.string().uuid();
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v));
const required = (max: number) => z.string().trim().min(1).max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const color = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || isHexColor(v), 'cor');

function get(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === 'string' ? v : '';
}

function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) throw new DomainError('invalido');
  return r.data;
}

const base = (id: string) => `/painel/caravanas/${id}`;

const generalSchema = z.object({
  name: required(120),
  description: text(600),
  startDate: isoDate,
  endDate: isoDate,
  organizerName: text(120),
});

export async function createCaravanAction(form: FormData) {
  await runAgency('editor', '/painel/caravanas/nova', async (tx, actor) => {
    const input = parse(generalSchema, Object.fromEntries(['name', 'description', 'startDate', 'endDate', 'organizerName'].map((k) => [k, get(form, k)])));
    const id = await createCaravan(tx, actor, input);
    return `${base(id)}/roteiro?ok=criado`;
  });
}

export async function updateGeneralAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/geral`, async (tx, actor) => {
    const input = parse(generalSchema, Object.fromEntries(['name', 'description', 'startDate', 'endDate', 'organizerName'].map((k) => [k, get(form, k)])));
    await updateGeneral(tx, actor, id, input);
  });
}

export async function updateBrandingAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/identidade`, async (tx, actor) => {
    const input = parse(
      z.object({
        primaryColor: color,
        secondaryColor: color,
        welcomeMessage: text(700),
        postTripMessage: text(700),
        coverArt: z.enum(SCENES),
      }),
      {
        primaryColor: get(form, 'useAgency') === '1' ? '' : get(form, 'primaryColor'),
        secondaryColor: get(form, 'useAgency') === '1' ? '' : get(form, 'secondaryColor'),
        welcomeMessage: get(form, 'welcomeMessage'),
        postTripMessage: get(form, 'postTripMessage'),
        coverArt: get(form, 'coverArt'),
      },
    );
    await updateCaravanBranding(tx, actor, id, input);
  });
}

const daySchema = z.object({ title: required(120), summary: text(500), practicalNotes: text(500) });

export async function addDayAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/roteiro`, async (tx, actor) => {
    const input = parse(daySchema, { title: get(form, 'title'), summary: get(form, 'summary'), practicalNotes: get(form, 'practicalNotes') });
    await addDay(tx, actor, id, input);
  });
}

export async function updateDayAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const dayId = parse(uuid, get(form, 'dayId'));
  await runAgency('editor', `${base(id)}/roteiro#dia-${dayId}`, async (tx) => {
    const input = parse(daySchema, { title: get(form, 'title'), summary: get(form, 'summary'), practicalNotes: get(form, 'practicalNotes') });
    await updateDay(tx, id, dayId, input);
  });
}

export async function deleteDayAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const dayId = parse(uuid, get(form, 'dayId'));
  await runAgency('editor', `${base(id)}/roteiro`, (tx, actor) => deleteDay(tx, actor, id, dayId));
}

export async function moveDayAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const dayId = parse(uuid, get(form, 'dayId'));
  const dir = get(form, 'dir') === 'up' ? -1 : 1;
  await runAgency('editor', `${base(id)}/roteiro`, (tx) => moveDay(tx, id, dayId, dir));
}

const stopSchema = z.object({
  title: required(140),
  timeLabel: text(40),
  description: text(600),
  practicalNote: text(300),
  destinationId: z
    .string()
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || uuid.safeParse(v).success),
});

function stopInput(form: FormData) {
  return parse(stopSchema, {
    title: get(form, 'title'),
    timeLabel: get(form, 'timeLabel'),
    description: get(form, 'description'),
    practicalNote: get(form, 'practicalNote'),
    destinationId: get(form, 'destinationId'),
  });
}

export async function addStopAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const dayId = parse(uuid, get(form, 'dayId'));
  await runAgency('editor', `${base(id)}/roteiro#dia-${dayId}`, (tx, actor) => addStop(tx, actor, id, dayId, stopInput(form)).then(() => undefined));
}

export async function updateStopAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const stopId = parse(uuid, get(form, 'stopId'));
  await runAgency('editor', `${base(id)}/roteiro`, (tx, actor) => updateStop(tx, actor, id, stopId, stopInput(form)));
}

export async function deleteStopAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const stopId = parse(uuid, get(form, 'stopId'));
  await runAgency('editor', `${base(id)}/roteiro`, (tx) => deleteStop(tx, id, stopId));
}

export async function moveStopAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const stopId = parse(uuid, get(form, 'stopId'));
  await runAgency('editor', `${base(id)}/roteiro`, (tx) => moveStop(tx, id, stopId, get(form, 'dir') === 'up' ? -1 : 1));
}

export async function setContentsAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/conteudo`, async (tx, actor) => {
    const ids = form.getAll('destinationId').filter((v): v is string => typeof v === 'string' && uuid.safeParse(v).success);
    await setContentSelection(tx, actor, id, ids.slice(0, 200));
  });
}

export async function updateFeaturesAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/atividades`, async (tx, actor) => {
    await updateFeatures(tx, actor, id, {
      hebrew: form.get('hebrew') === 'on',
      quizzes: form.get('quizzes') === 'on',
      challenges: form.get('challenges') === 'on',
      passport: form.get('passport') === 'on',
    });
  });
}

const infoSchema = z.object({
  section: z.enum(INFO_SECTIONS.map((s) => s.id) as [string, ...string[]]),
  title: required(140),
  body: required(1500),
  contactValue: text(160),
  contactKind: z
    .string()
    .transform((v) => (v === '' ? null : v))
    .refine((v) => v === null || ['phone', 'whatsapp', 'email', 'url'].includes(v)),
  isTimeSensitive: z.boolean(),
});

function infoInput(form: FormData) {
  const input = parse(infoSchema, {
    section: get(form, 'section'),
    title: get(form, 'title'),
    body: get(form, 'body'),
    contactValue: get(form, 'contactValue'),
    contactKind: get(form, 'contactKind'),
    isTimeSensitive: form.get('isTimeSensitive') === 'on',
  });
  if (input.contactKind === 'url' && input.contactValue && !/^https:\/\//.test(input.contactValue)) throw new DomainError('invalido');
  if (input.contactKind === 'email' && input.contactValue && !z.string().email().safeParse(input.contactValue).success) throw new DomainError('invalido');
  if (!input.contactValue) input.contactKind = null;
  return input;
}

export async function addInfoAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/informacoes`, (tx, actor) => addInfoItem(tx, actor, id, infoInput(form)));
}

export async function updateInfoAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const itemId = parse(uuid, get(form, 'itemId'));
  await runAgency('editor', `${base(id)}/informacoes`, (tx) => updateInfoItem(tx, id, itemId, infoInput(form)));
}

export async function deleteInfoAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const itemId = parse(uuid, get(form, 'itemId'));
  await runAgency('editor', `${base(id)}/informacoes`, (tx) => deleteInfoItem(tx, id, itemId));
}

export async function publishAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  if (get(form, 'confirm') !== 'on') {
    await runAgency('admin', `${base(id)}/publicacao`, async () => {
      throw new DomainError('confirmar');
    });
  }
  await runAgency('admin', `${base(id)}/publicacao`, async (tx, actor) => {
    await publishCaravan(tx, id, actor.userId);
    return 'publicado';
  });
}

export async function unpublishAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('admin', `${base(id)}/publicacao`, async (tx, actor) => {
    await unpublishCaravan(tx, id, actor.userId);
    return 'despublicado';
  });
}

export async function archiveAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('admin', `${base(id)}/publicacao`, async (tx, actor) => {
    await archiveCaravan(tx, actor, id);
    return '/painel/caravanas?ok=arquivado';
  });
}

export async function createInvitesAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  await runAgency('editor', `${base(id)}/convites`, async (tx, actor) => {
    const names = get(form, 'names')
      .split('\n')
      .map((n) => n.trim().slice(0, 40))
      .filter(Boolean);
    const count = Number(get(form, 'count') || 0);
    const labels: (string | null)[] = names.length ? names : Array.from({ length: Math.min(Math.max(count, 0), 100) }, () => null);
    const maxDevices = Math.min(Math.max(Number(get(form, 'maxDevices') || 3), 1), 5);
    const created = await createInvites(tx, actor, id, labels, maxDevices);
    return `${base(id)}/convites?ok=convites&novos=${created.length}`;
  });
}

export async function revokeInviteAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const accessId = parse(uuid, get(form, 'accessId'));
  await runAgency('editor', `${base(id)}/convites`, async (tx, actor) => {
    await revokeInvite(tx, actor, id, accessId);
    return 'revogado';
  });
}

export async function resetDevicesAction(form: FormData) {
  const id = parse(uuid, get(form, 'caravanId'));
  const accessId = parse(uuid, get(form, 'accessId'));
  await runAgency('editor', `${base(id)}/convites`, async (tx, actor) => {
    await resetInviteDevices(tx, actor, id, accessId);
    return 'aparelhos';
  });
}
