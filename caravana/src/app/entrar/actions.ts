'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearStaffCookie, clientKey, setStaffCookie, STAFF_COOKIE } from '@/lib/auth/next';
import { AuthError, loginWithPassword, MIN_PASSWORD, revokeStaffSession, setPasswordWithToken } from '@/lib/auth/sessions';

export type FormState = { error: string | null };

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }).safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: 'Preencha e-mail e senha.' };
  let dest = '/painel';
  try {
    const { token, expiresAt, ctx } = await loginWithPassword(parsed.data.email, parsed.data.password, await clientKey());
    await setStaffCookie(token, expiresAt);
    if (ctx.isPlatformAdmin && !ctx.agencyId) dest = '/admin';
  } catch (e) {
    if (e instanceof AuthError) return { error: e.code === 'rate_limited' ? 'Muitas tentativas. Espere 15 minutos e tente de novo.' : 'E-mail ou senha incorretos.' };
    throw e;
  }
  redirect(dest);
}

export async function setPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get('token') ?? '');
  const password = String(form.get('password') ?? '');
  const confirm = String(form.get('confirm') ?? '');
  if (password.length < MIN_PASSWORD) return { error: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };
  if (password !== confirm) return { error: 'As duas senhas não são iguais.' };
  try {
    await setPasswordWithToken(token, password, await clientKey());
  } catch (e) {
    if (e instanceof AuthError) return { error: e.code === 'expired' ? 'Este link já foi usado ou venceu. Peça um novo.' : e.code === 'rate_limited' ? 'Muitas tentativas. Espere um pouco.' : 'Senha inválida.' };
    throw e;
  }
  redirect('/entrar?senha=1');
}

export async function logoutAction(): Promise<void> {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  if (token) await revokeStaffSession(token);
  await clearStaffCookie();
  redirect('/entrar?saiu=1');
}
