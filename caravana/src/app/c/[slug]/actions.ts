'use server';

// Acoes do viajante. Cada uma confere a sessao de novo (o cookie preso a esta
// caravana) e valida a entrada: nada aqui confia no que o navegador manda.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearTravelerCookie, clientKey, getTraveler, setTravelerCookie, TRAVELER_COOKIE } from '@/lib/auth/next';
import { AuthError, claimInvite, leaveTraveler } from '@/lib/auth/sessions';
import { answerQuestion, recordView, revealAnswer, type AnswerResult } from '@/lib/domain/traveler';
import { DEMO_DATE_COOKIE } from '@/lib/trip';

const slugSchema = z.string().regex(/^[a-z0-9-]{3,80}$/);
const keySchema = z.string().regex(/^[a-z0-9-]{1,80}$/);
const answerSchema = z.union([
  z.object({ optionId: z.string().max(20) }),
  z.object({ pairs: z.array(z.string().max(120)).min(1).max(12) }),
]);

export async function answerAction(slug: string, activitySlug: string, questionKey: string, answer: unknown): Promise<AnswerResult> {
  const parsed = z.tuple([slugSchema, keySchema, keySchema, answerSchema]).safeParse([slug, activitySlug, questionKey, answer]);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  const ctx = await getTraveler(parsed.data[0]);
  if (!ctx) return { ok: false, error: 'not_found' };
  return answerQuestion(ctx, parsed.data[1], parsed.data[2], parsed.data[3]);
}

export async function revealAction(slug: string, activitySlug: string, questionKey: string) {
  const parsed = z.tuple([slugSchema, keySchema, keySchema]).safeParse([slug, activitySlug, questionKey]);
  if (!parsed.success) return null;
  const ctx = await getTraveler(parsed.data[0]);
  if (!ctx) return null;
  return revealAnswer(ctx, parsed.data[1], parsed.data[2]);
}

export async function viewAction(slug: string, destinationSlug: string): Promise<void> {
  const parsed = z.tuple([slugSchema, keySchema]).safeParse([slug, destinationSlug]);
  if (!parsed.success) return;
  const ctx = await getTraveler(parsed.data[0]);
  if (ctx) await recordView(ctx, parsed.data[1]);
}

export type EnterState = { error: string | null };

const ERRORS: Record<string, string> = {
  invalid: 'Não encontramos um convite ativo com esse código para esta caravana. Confira o código ou fale com a sua agência.',
  rate_limited: 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  device_limit: 'Este convite já está em uso no número máximo de aparelhos. Peça à agência para liberar um aparelho novo.',
  not_published: 'A sua agência ainda está preparando esta caravana. O convite vai funcionar assim que ela for publicada.',
};

export async function enterAction(_prev: EnterState, form: FormData): Promise<EnterState> {
  const slug = slugSchema.safeParse(form.get('slug'));
  const code = z.string().max(40).safeParse(form.get('codigo'));
  if (!slug.success || !code.success || !code.data.trim()) return { error: 'Digite o código do seu convite.' };
  try {
    const { token, expiresAt } = await claimInvite(slug.data, code.data, await clientKey());
    await setTravelerCookie(slug.data, token, expiresAt);
  } catch (e) {
    if (e instanceof AuthError) return { error: ERRORS[e.code] ?? ERRORS.invalid! };
    throw e;
  }
  redirect(`/c/${slug.data}`);
}

export async function leaveAction(form: FormData): Promise<void> {
  const slug = slugSchema.parse(form.get('slug'));
  const token = (await cookies()).get(TRAVELER_COOKIE)?.value;
  if (token) await leaveTraveler(token);
  await clearTravelerCookie(slug);
  redirect(`/c/${slug}/entrar?saiu=1`);
}

export async function demoDateAction(form: FormData): Promise<void> {
  const slug = slugSchema.parse(form.get('slug'));
  const mode = z.enum(['real', 'durante', 'depois']).parse(form.get('modo'));
  const jar = await cookies();
  if (mode === 'real') jar.set(DEMO_DATE_COOKIE, '', { path: `/c/${slug}`, maxAge: 0 });
  else jar.set(DEMO_DATE_COOKIE, mode, { path: `/c/${slug}`, httpOnly: true, sameSite: 'lax', maxAge: 86400 });
  redirect(`/c/${slug}`);
}
