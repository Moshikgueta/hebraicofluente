// Carga da biblioteca e da demonstracao. Idempotente: rodar de novo atualiza a
// biblioteca (subindo a revisao do que mudou) e recria SO a agencia de
// demonstracao. Nenhuma agencia real e tocada.

import { and, eq, sql } from 'drizzle-orm';
import { activities as activitySeeds, badges as badgeSeeds } from '@content/activities';
import { DEMO_AGENCY, DEMO_CARAVAN, DEMO_DAYS, DEMO_INFO, DEMO_TRAVELERS } from '@content/demo';
import { destinations as destinationSeeds } from '@content/destinations';
import { expressions as expressionSeeds } from '@content/hebrew';
import { infoTemplates } from '@content/info-templates';
import { plans as planSeeds } from '@content/plans';
import { addDays } from './dates';
import {
  activities,
  activityCompletions,
  activityQuestions,
  agencies,
  agencyMemberships,
  brandingSettings,
  caravanContents,
  caravanDays,
  caravanInfoItems,
  caravans,
  contentViews,
  culturalContentRevisions,
  culturalContents,
  destinations,
  hebrewExpressions,
  participantAccess,
  participantBadges,
  participantDevices,
  passportBadges,
  plans,
  questionAnswers,
  stops,
  users,
} from './db/schema';
import type { Tx } from './db/tenant';
import { newInviteCode } from './domain/codes';
import { publishCaravan } from './domain/publication';
import { randomToken, sha256Hex } from './crypto';

export const DEMO_VIEWER_EMAIL = 'demo-agencia@exemplo.invalid';

export async function seedLibrary(tx: Tx): Promise<void> {
  for (const p of planSeeds) {
    await tx
      .insert(plans)
      .values({ ...p, features: [...p.features] })
      .onConflictDoUpdate({ target: plans.id, set: { name: p.name, priceCents: p.priceCents, priceUnit: p.priceUnit, groupSize: p.groupSize, features: [...p.features] } });
  }

  for (const d of destinationSeeds) {
    const values = {
      slug: d.slug,
      region: d.region,
      namePt: d.namePt,
      nameHe: d.nameHe,
      transliteration: d.transliteration,
      pronunciation: d.pronunciation ?? null,
      latitude: d.latitude,
      longitude: d.longitude,
      art: d.art,
      status: d.status,
    };
    const [row] = await tx
      .insert(destinations)
      .values(values)
      .onConflictDoUpdate({ target: destinations.slug, set: { ...values, updatedAt: new Date() } })
      .returning({ id: destinations.id });
    if (!d.content || !row) continue;
    const body = { ...d.content };
    const [existing] = await tx
      .select()
      .from(culturalContents)
      .where(and(eq(culturalContents.destinationId, row.id), eq(culturalContents.locale, 'pt-BR')));
    if (!existing) {
      const [c] = await tx
        .insert(culturalContents)
        .values({ destinationId: row.id, ...body, editorialStatus: d.status, revision: 1 })
        .returning({ id: culturalContents.id });
      await tx.insert(culturalContentRevisions).values({ contentId: c!.id, revision: 1, body });
      continue;
    }
    const before = JSON.stringify({
      title: existing.title,
      summary: existing.summary,
      geography: existing.geography,
      sections: existing.sections,
      observe: existing.observe,
      references: existing.references,
    });
    if (before === JSON.stringify(body)) continue;
    const revision = existing.revision + 1;
    await tx.update(culturalContents).set({ ...body, revision, updatedAt: new Date() }).where(eq(culturalContents.id, existing.id));
    await tx.insert(culturalContentRevisions).values({ contentId: existing.id, revision, body }).onConflictDoNothing();
  }

  let position = 0;
  for (const e of expressionSeeds) {
    const values = {
      slug: e.slug,
      category: e.category,
      hebrew: e.hebrew,
      hebrewPointed: e.hebrewPointed ?? null,
      transliteration: e.transliteration,
      translation: e.translation,
      exampleHe: e.exampleHe ?? null,
      exampleTranslit: e.exampleTranslit ?? null,
      exampleTranslation: e.exampleTranslation ?? null,
      usageNote: e.usageNote ?? null,
      position: position++,
    };
    await tx.insert(hebrewExpressions).values(values).onConflictDoUpdate({ target: hebrewExpressions.slug, set: values });
  }

  const destId = new Map((await tx.select({ id: destinations.id, slug: destinations.slug }).from(destinations)).map((d) => [d.slug, d.id]));
  for (const a of activitySeeds) {
    const values = {
      slug: a.slug,
      type: a.type,
      feature: a.feature,
      title: a.title,
      intro: a.intro,
      destinationId: a.destination ? (destId.get(a.destination) ?? null) : null,
      status: 'in_review' as const,
    };
    const [row] = await tx
      .insert(activities)
      .values(values)
      .onConflictDoUpdate({ target: activities.slug, set: { ...values, updatedAt: new Date() } })
      .returning({ id: activities.id });
    let pos = 0;
    for (const q of a.questions) {
      const qv = {
        activityId: row!.id,
        key: q.key,
        position: pos++,
        kind: q.kind,
        prompt: q.prompt,
        promptHe: q.promptHe ?? null,
        options: q.options ?? [],
        pairs: q.pairs ?? null,
        correctOptionId: q.correct ?? null,
        explanation: q.explanation,
      };
      await tx
        .insert(activityQuestions)
        .values(qv)
        .onConflictDoUpdate({ target: [activityQuestions.activityId, activityQuestions.key], set: qv });
    }
  }

  let bpos = 0;
  for (const b of badgeSeeds) {
    const values = { slug: b.slug, title: b.title, description: b.description, criteria: { activities: b.activities }, art: b.art, ink: b.ink, position: bpos++ };
    await tx.insert(passportBadges).values(values).onConflictDoUpdate({ target: passportBadges.slug, set: values });
  }
}

export async function seedDemo(tx: Tx): Promise<{ agencyId: string; caravanId: string }> {
  // Recria a agencia de demonstracao do zero (so ela: is_demo = true).
  await tx.delete(agencies).where(and(eq(agencies.slug, DEMO_AGENCY.slug), eq(agencies.isDemo, true)));
  const [ag] = await tx
    .insert(agencies)
    .values({ slug: DEMO_AGENCY.slug, name: DEMO_AGENCY.name, isDemo: true, defaultPlanId: 'completa', defaultSeatLimit: DEMO_CARAVAN.seatLimit, maxActiveCaravans: 3 })
    .returning({ id: agencies.id });
  const agencyId = ag!.id;
  await tx.insert(brandingSettings).values({
    agencyId,
    displayName: DEMO_AGENCY.displayName,
    logoText: DEMO_AGENCY.logoText,
    primaryColor: DEMO_AGENCY.primaryColor,
    secondaryColor: DEMO_AGENCY.secondaryColor,
  });

  // Visitante do painel de demonstracao: sem senha (so entra pelo botao da
  // demonstracao) e com papel de leitura.
  let [viewer] = await tx.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${DEMO_VIEWER_EMAIL}`);
  viewer ??= (
    await tx.insert(users).values({ email: DEMO_VIEWER_EMAIL, name: 'Visitante da demonstração', isDemo: true }).returning({ id: users.id })
  )[0];
  await tx.insert(agencyMemberships).values({ userId: viewer!.id, agencyId, role: 'viewer' }).onConflictDoNothing();

  const [car] = await tx
    .insert(caravans)
    .values({
      agencyId,
      slug: DEMO_CARAVAN.slug,
      name: DEMO_CARAVAN.name,
      description: DEMO_CARAVAN.description,
      startDate: DEMO_CARAVAN.startDate,
      endDate: DEMO_CARAVAN.endDate,
      planId: 'completa',
      seatLimit: DEMO_CARAVAN.seatLimit,
      organizerName: DEMO_CARAVAN.organizerName,
      welcomeMessage: DEMO_CARAVAN.welcomeMessage,
      postTripMessage: DEMO_CARAVAN.postTripMessage,
      coverArt: DEMO_CARAVAN.coverArt,
    })
    .returning({ id: caravans.id });
  const caravanId = car!.id;

  const destId = new Map((await tx.select({ id: destinations.id, slug: destinations.slug }).from(destinations)).map((d) => [d.slug, d.id]));
  const chosen = new Set<string>();
  let n = 1;
  for (const day of DEMO_DAYS) {
    const [d] = await tx
      .insert(caravanDays)
      .values({ caravanId, agencyId, dayNumber: n++, title: day.title, summary: day.summary, practicalNotes: day.practicalNotes ?? null, art: day.art })
      .returning({ id: caravanDays.id });
    let pos = 0;
    for (const s of day.stops) {
      const did = s.destination ? (destId.get(s.destination) ?? null) : null;
      if (did) chosen.add(did);
      await tx.insert(stops).values({
        dayId: d!.id,
        caravanId,
        agencyId,
        position: pos++,
        title: s.title,
        description: s.description ?? null,
        practicalNote: s.practicalNote ?? null,
        destinationId: did,
      });
    }
  }
  for (const destinationId of chosen) await tx.insert(caravanContents).values({ caravanId, agencyId, destinationId });

  let ipos = 0;
  for (const item of [...DEMO_INFO, ...infoTemplates]) {
    await tx.insert(caravanInfoItems).values({
      caravanId,
      agencyId,
      section: item.section,
      title: item.title,
      body: item.body,
      contactValue: item.contactValue ?? null,
      contactKind: item.contactKind ?? null,
      isTimeSensitive: item.isTimeSensitive ?? false,
      position: ipos++,
    });
  }

  await publishCaravan(tx, caravanId, null);
  await seedDemoTravelers(tx, agencyId, caravanId);
  return { agencyId, caravanId };
}

// Convites e progresso ficticios, para o painel da demonstracao ter numeros.
async function seedDemoTravelers(tx: Tx, agencyId: string, caravanId: string): Promise<void> {
  const acts = activitySeeds.map((a) => a);
  const expires = new Date(`${addDays(DEMO_CARAVAN.endDate, 180)}T23:59:59Z`);
  for (let i = 0; i < DEMO_TRAVELERS.length; i++) {
    const code = await newInviteCode();
    const [acc] = await tx
      .insert(participantAccess)
      .values({ caravanId, agencyId, codeHash: code.hash, codeCipher: code.cipher, codeHint: code.hint, label: DEMO_TRAVELERS[i], expiresAt: expires })
      .returning({ id: participantAccess.id });
    const accessId = acc!.id;
    if (i >= 13) continue; // os ultimos ainda nao abriram o convite
    await tx.update(participantAccess).set({ firstUsedAt: new Date(), lastSeenAt: new Date() }).where(eq(participantAccess.id, accessId));
    await tx.insert(participantDevices).values({
      id: await sha256Hex(randomToken()),
      accessId,
      caravanId,
      agencyId,
      expiresAt: expires,
    });
    const done = acts.slice(0, (i * 3) % (acts.length + 1));
    for (const a of done) {
      for (const q of a.questions) {
        await tx.insert(questionAnswers).values({ accessId, agencyId, caravanId, activitySlug: a.slug, questionKey: q.key, correct: true, attempts: 1 + ((i + q.key.length) % 2) });
      }
      await tx.insert(activityCompletions).values({ accessId, agencyId, caravanId, activitySlug: a.slug, score: a.questions.length - (i % 2), total: a.questions.length });
      if (a.destination) await tx.insert(contentViews).values({ accessId, agencyId, caravanId, destinationSlug: a.destination }).onConflictDoNothing();
      const badge = badgeSeeds.find((b) => b.activities.length === 1 && b.activities[0] === a.slug);
      if (badge) await tx.insert(participantBadges).values({ accessId, agencyId, caravanId, badgeSlug: badge.slug });
    }
  }
}
