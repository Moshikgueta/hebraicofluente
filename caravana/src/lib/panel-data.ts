// Dados comuns das paginas de uma caravana no painel.

import { cache } from 'react';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireAgency, type AgencyStaff } from './auth/next';
import { roleAtLeast } from './auth/sessions';
import { caravans, plans } from './db/schema';
import { withScope, type Tx } from './db/tenant';

export const getPanelCaravan = cache(async (id: string) => {
  const staff = await requireAgency('viewer');
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const data = await withScope({ kind: 'agency', agencyId: staff.agencyId, userId: staff.userId }, async (tx) => {
    const [car] = await tx.select().from(caravans).where(eq(caravans.id, id));
    if (!car) return null;
    const [plan] = await tx.select().from(plans).where(eq(plans.id, car.planId));
    return { car, plan: plan! };
  });
  if (!data) notFound();
  return {
    staff,
    ...data,
    canEdit: roleAtLeast(staff.role, 'editor'),
    canPublish: roleAtLeast(staff.role, 'admin'),
  };
});

export function agencyTx<T>(staff: AgencyStaff, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return withScope({ kind: 'agency', agencyId: staff.agencyId, userId: staff.userId }, fn);
}
