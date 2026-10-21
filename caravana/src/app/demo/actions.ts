'use server';

import { redirect } from 'next/navigation';
import { clientKey, setStaffCookie, setTravelerCookie } from '@/lib/auth/next';
import { AuthError, createDemoTraveler, createDemoViewerSession } from '@/lib/auth/sessions';

export async function enterDemoTraveler(): Promise<void> {
  let slug: string;
  try {
    const r = await createDemoTraveler(await clientKey());
    await setTravelerCookie(r.slug, r.token, r.expiresAt);
    slug = r.slug;
  } catch (e) {
    if (e instanceof AuthError) redirect(`/demo?erro=${e.code}`);
    throw e;
  }
  redirect(`/c/${slug}`);
}

export async function enterDemoAgency(): Promise<void> {
  try {
    const r = await createDemoViewerSession(await clientKey());
    await setStaffCookie(r.token, r.expiresAt);
  } catch (e) {
    if (e instanceof AuthError) redirect(`/demo?erro=${e.code}`);
    throw e;
  }
  redirect('/painel');
}
