import { eq } from 'drizzle-orm';
import { closeDb } from '@/lib/db/client';
import { agencies, brandingSettings, caravans } from '@/lib/db/schema';
import { withScope, withSystem } from '@/lib/db/tenant';
import { createUser } from '@/lib/auth/sessions';
import { seedDemo, seedLibrary } from '@/lib/seed';

export async function seedAll() {
  return withSystem(async (tx) => {
    await seedLibrary(tx);
    return seedDemo(tx);
  });
}

export async function makeAgency(slug: string, opts: { plan?: string; seats?: number; maxCaravans?: number } = {}) {
  return withSystem(async (tx) => {
    const [ag] = await tx
      .insert(agencies)
      .values({ slug, name: `Agencia ${slug}`, defaultPlanId: opts.plan ?? 'completa', defaultSeatLimit: opts.seats ?? 3, maxActiveCaravans: opts.maxCaravans ?? 5 })
      .returning({ id: agencies.id });
    await tx.insert(brandingSettings).values({ agencyId: ag!.id, displayName: `Agencia ${slug}`, logoText: slug.slice(0, 2).toUpperCase() });
    const { userId, setupToken } = await createUser(tx, { email: `admin@${slug}.test`, name: 'Admin', agencyId: ag!.id, role: 'admin' });
    return { agencyId: ag!.id, userId, setupToken };
  });
}

export function agencyScope(a: { agencyId: string; userId: string }) {
  return { kind: 'agency' as const, agencyId: a.agencyId, userId: a.userId };
}

export async function caravanBySlug(slug: string) {
  return withSystem(async (tx) => (await tx.select().from(caravans).where(eq(caravans.slug, slug)))[0]!);
}

export { closeDb, withScope, withSystem };
