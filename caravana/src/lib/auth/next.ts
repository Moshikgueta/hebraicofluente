// Cola entre a autenticacao e o Next: cookies, cabecalhos e redirecionamentos.

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { hmacHex } from '../crypto';
import { isProduction } from '../env';
import { resolveStaffSession, resolveTraveler, roleAtLeast, type Role, type StaffContext, type TravelerContext } from './sessions';

export const STAFF_COOKIE = isProduction() ? '__Host-mcd_staff' : 'mcd_staff';
export const TRAVELER_COOKIE = isProduction() ? '__Secure-mcd_viajante' : 'mcd_viajante';

// O endereco do cliente vira um HMAC antes de qualquer uso: o freio precisa
// distinguir quem pede, nao saber quem e (minimizacao, LGPD art. 6, III).
export async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get('cf-connecting-ip') ?? h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  return (await hmacHex(`ip:${ip}`)).slice(0, 32);
}

export async function setStaffCookie(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(STAFF_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearStaffCookie(): Promise<void> {
  (await cookies()).delete(STAFF_COOKIE);
}

export const getStaff = cache(async (): Promise<StaffContext | null> => {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  return token ? resolveStaffSession(token) : null;
});

export async function requireStaff(): Promise<StaffContext> {
  const staff = await getStaff();
  if (!staff) redirect('/entrar');
  return staff;
}

export type AgencyStaff = StaffContext & { agencyId: string; role: Role; agencyName: string };

export async function requireAgency(min: Role = 'viewer'): Promise<AgencyStaff> {
  const staff = await requireStaff();
  if (!staff.agencyId || !staff.role) {
    if (staff.isPlatformAdmin) redirect('/admin');
    redirect('/entrar?erro=sem-agencia');
  }
  if (!roleAtLeast(staff.role, min)) throw new Error('forbidden');
  return staff as AgencyStaff;
}

export async function requirePlatform(): Promise<StaffContext> {
  const staff = await requireStaff();
  if (!staff.isPlatformAdmin) notFound();
  return staff;
}

// Viajante: um cookie por caravana, preso ao caminho /c/<slug>.
export async function setTravelerCookie(slug: string, token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(TRAVELER_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: `/c/${slug}`,
    expires: expiresAt,
  });
}

export async function clearTravelerCookie(slug: string): Promise<void> {
  (await cookies()).set(TRAVELER_COOKIE, '', { path: `/c/${slug}`, maxAge: 0 });
}

export const getTraveler = cache(async (slug: string): Promise<TravelerContext | null> => {
  const token = (await cookies()).get(TRAVELER_COOKIE)?.value;
  return token ? resolveTraveler(slug, token) : null;
});
