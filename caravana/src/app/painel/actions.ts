'use server';

import { z } from 'zod';
import { updateAgencyBranding } from '@/lib/domain/agency';
import { DomainError } from '@/lib/domain/publication';
import { runAgency } from '@/lib/panel';
import { isHexColor } from '@/lib/theme';

export async function updateAgencyBrandingAction(form: FormData) {
  await runAgency('admin', '/painel/marca', async (tx, actor) => {
    const r = z
      .object({
        displayName: z.string().trim().min(2).max(80),
        logoText: z.string().trim().min(1).max(3),
        primaryColor: z.string().refine(isHexColor),
        secondaryColor: z.string().refine(isHexColor),
        welcomeMessage: z
          .string()
          .trim()
          .max(700)
          .transform((v) => v || null),
      })
      .safeParse(Object.fromEntries(['displayName', 'logoText', 'primaryColor', 'secondaryColor', 'welcomeMessage'].map((k) => [k, String(form.get(k) ?? '')])));
    if (!r.success) throw new DomainError('invalido');
    await updateAgencyBranding(tx, actor, { ...r.data, logoText: r.data.logoText.toUpperCase() });
  });
}
