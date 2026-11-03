// Publicar = congelar um retrato da caravana.
//
// O viajante so le `caravan_publications`. Por isso:
//  - editar a biblioteca nao muda uma caravana publicada sem a agencia saber;
//  - a agencia edita o rascunho a vontade e o viajante so ve na proxima publicacao;
//  - o retrato de uma agencia real so leva texto aprovado pela revisao editorial
//    (e hebraico revisado por falante nativo). A agencia de demonstracao leva
//    tambem o que esta em revisao, e a tela marca.

import { and, asc, desc, eq, inArray, isNull, max } from 'drizzle-orm';
import { hebrewCategories } from '@content/hebrew';
import { addDays, daysBetween } from '../dates';
import {
  activities,
  activityQuestions,
  agencies,
  audioAssets,
  auditLogs,
  brandingSettings,
  caravanContents,
  caravanDays,
  caravanInfoItems,
  caravanPublications,
  caravans,
  culturalContents,
  destinations,
  hebrewExpressions,
  passportBadges,
  plans,
  stops,
} from '../db/schema';
import type { Tx } from '../db/tenant';
import { activityFeatureEnabled, effectiveFeatures } from './features';
import type { Snapshot } from './snapshot';

export class DomainError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const okContent = (isDemo: boolean, status: string) => status === 'approved' || (isDemo && status === 'in_review');

export async function buildSnapshot(tx: Tx, caravanId: string, version: number): Promise<Snapshot> {
  const [car] = await tx.select().from(caravans).where(eq(caravans.id, caravanId));
  if (!car) throw new DomainError('caravan_not_found');
  const [ag] = await tx.select().from(agencies).where(eq(agencies.id, car.agencyId));
  const [brand] = await tx.select().from(brandingSettings).where(eq(brandingSettings.agencyId, car.agencyId));
  const [plan] = await tx.select().from(plans).where(eq(plans.id, car.planId));
  if (!ag || !plan) throw new DomainError('caravan_not_found');
  const isDemo = ag.isDemo;
  const planFeatures = plan.features;
  const features = effectiveFeatures(car.features, planFeatures);

  // Destinos escolhidos
  const chosen = await tx
    .select({ d: destinations })
    .from(caravanContents)
    .innerJoin(destinations, eq(destinations.id, caravanContents.destinationId))
    .where(eq(caravanContents.caravanId, caravanId));
  const destIds = chosen.map((c) => c.d.id);
  const contents = destIds.length
    ? await tx
        .select()
        .from(culturalContents)
        .where(and(inArray(culturalContents.destinationId, destIds), eq(culturalContents.locale, 'pt-BR')))
    : [];
  const cultureOn = planFeatures.includes('culture');
  const snapshotDestinations = chosen
    .map(({ d }) => {
      const c = contents.find((x) => x.destinationId === d.id);
      const usable = cultureOn && c && okContent(isDemo, c.editorialStatus);
      return {
        slug: d.slug,
        namePt: d.namePt,
        nameHe: d.nameHe,
        transliteration: d.transliteration,
        pronunciation: d.pronunciation,
        region: d.region,
        art: d.art,
        latitude: d.latitude,
        longitude: d.longitude,
        editorialStatus: usable ? c.editorialStatus : 'placeholder',
        revision: usable ? c.revision : null,
        content: usable
          ? {
              title: c.title,
              summary: c.summary,
              geography: c.geography,
              sections: c.sections,
              observe: c.observe,
              references: c.references,
            }
          : null,
      };
    })
    .sort((a, b) => a.namePt.localeCompare(b.namePt, 'pt-BR'));
  const destById = new Map(chosen.map(({ d }) => [d.id, d.slug]));

  // Roteiro
  const dayRows = await tx.select().from(caravanDays).where(eq(caravanDays.caravanId, caravanId)).orderBy(asc(caravanDays.dayNumber));
  const stopRows = await tx.select().from(stops).where(eq(stops.caravanId, caravanId)).orderBy(asc(stops.position));
  const days = dayRows.map((d) => ({
    number: d.dayNumber,
    date: addDays(car.startDate, d.dayNumber - 1),
    title: d.title,
    summary: d.summary,
    practicalNotes: d.practicalNotes,
    art: d.art,
    stops: stopRows
      .filter((s) => s.dayId === d.id)
      .map((s) => ({
        title: s.title,
        timeLabel: s.timeLabel,
        description: s.description,
        practicalNote: s.practicalNote,
        // Parada aponta para um destino so se ele foi escolhido para a caravana.
        destinationSlug: s.destinationId ? (destById.get(s.destinationId) ?? null) : null,
      })),
  }));

  // Hebraico
  let hebrew: Snapshot['hebrew'] = null;
  if (features.hebrew) {
    const rows = await tx
      .select({ e: hebrewExpressions, a: audioAssets })
      .from(hebrewExpressions)
      .leftJoin(audioAssets, eq(audioAssets.id, hebrewExpressions.audioAssetId))
      .orderBy(asc(hebrewExpressions.category), asc(hebrewExpressions.position));
    const usable = rows.filter(({ e }) => isDemo || e.reviewStatus === 'reviewed');
    const withAudio = planFeatures.includes('audio');
    hebrew = {
      categories: hebrewCategories.filter((c) => usable.some(({ e }) => e.category === c.id)),
      expressions: usable.map(({ e, a }) => ({
        slug: e.slug,
        category: e.category,
        hebrew: e.hebrew,
        hebrewPointed: e.hebrewPointed,
        transliteration: e.transliteration,
        translation: e.translation,
        exampleHe: e.exampleHe,
        exampleTranslit: e.exampleTranslit,
        exampleTranslation: e.exampleTranslation,
        usageNote: e.usageNote,
        reviewed: e.reviewStatus === 'reviewed',
        audio: withAudio && a ? { url: a.url, source: a.source, speakerName: a.speakerName } : null,
      })),
    };
  }

  // Atividades: da biblioteca (agency_id nulo) ou da propria agencia.
  const acts = await tx.select().from(activities).orderBy(asc(activities.slug));
  const destIdSet = new Set(destIds);
  const usableActs = acts.filter(
    (a) =>
      okContent(isDemo, a.status) &&
      activityFeatureEnabled(a.feature, features) &&
      (!a.destinationId || destIdSet.has(a.destinationId)) &&
      (a.agencyId === null || a.agencyId === car.agencyId),
  );
  const questions = usableActs.length
    ? await tx
        .select()
        .from(activityQuestions)
        .where(inArray(activityQuestions.activityId, usableActs.map((a) => a.id)))
        .orderBy(asc(activityQuestions.position))
    : [];
  const snapshotActivities = usableActs.map((a) => ({
    slug: a.slug,
    type: a.type,
    feature: a.feature,
    title: a.title,
    intro: a.intro,
    destinationSlug: a.destinationId ? (destById.get(a.destinationId) ?? null) : null,
    revision: a.revision,
    questions: questions
      .filter((q) => q.activityId === a.id)
      .map((q) => ({
        key: q.key,
        kind: q.kind,
        prompt: q.prompt,
        promptHe: q.promptHe,
        options: q.options,
        pairs: q.pairs,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
      })),
  }));
  const actSlugs = new Set(snapshotActivities.map((a) => a.slug));

  // Selos: so com o passaporte ligado, e so os que tem todas as atividades.
  const badgeRows = features.passport ? await tx.select().from(passportBadges).orderBy(asc(passportBadges.position)) : [];
  const badges = badgeRows
    .filter((b) => b.criteria.activities.length > 0 && b.criteria.activities.every((s) => actSlugs.has(s)))
    .map((b) => ({ slug: b.slug, title: b.title, description: b.description, art: b.art, ink: b.ink, activities: b.criteria.activities }));

  const info = await tx
    .select()
    .from(caravanInfoItems)
    .where(eq(caravanInfoItems.caravanId, caravanId))
    .orderBy(asc(caravanInfoItems.section), asc(caravanInfoItems.position));

  return {
    schemaVersion: 1,
    version,
    publishedAt: new Date().toISOString(),
    agency: {
      name: ag.name,
      displayName: brand?.displayName ?? ag.name,
      logoText: brand?.logoText ?? ag.name.slice(0, 2).toUpperCase(),
      primaryColor: car.primaryColor ?? brand?.primaryColor ?? '#1F3B57',
      secondaryColor: car.secondaryColor ?? brand?.secondaryColor ?? '#B4823C',
      isDemo,
    },
    caravan: {
      id: car.id,
      slug: car.slug,
      name: car.name,
      description: car.description,
      startDate: car.startDate,
      endDate: car.endDate,
      timezone: car.timezone,
      organizerName: car.organizerName,
      welcomeMessage: car.welcomeMessage ?? brand?.welcomeMessage ?? null,
      postTripMessage: car.postTripMessage,
      coverArt: car.coverArt,
      features,
      planFeatures: [...planFeatures],
    },
    days,
    destinations: snapshotDestinations,
    hebrew,
    activities: snapshotActivities,
    badges,
    info: info.map((i) => ({
      section: i.section,
      title: i.title,
      body: i.body,
      contactValue: i.contactValue,
      contactKind: i.contactKind,
      isTimeSensitive: i.isTimeSensitive,
      updatedAt: i.updatedAt.toISOString(),
    })),
    postTripOffer: null,
  };
}

export type PublicationCheck = { blocking: string[]; warnings: string[] };

export async function publicationChecks(tx: Tx, caravanId: string): Promise<PublicationCheck> {
  const [car] = await tx.select().from(caravans).where(eq(caravans.id, caravanId));
  if (!car) throw new DomainError('caravan_not_found');
  const blocking: string[] = [];
  const warnings: string[] = [];
  const dayRows = await tx.select().from(caravanDays).where(eq(caravanDays.caravanId, caravanId));
  const duration = daysBetween(car.startDate, car.endDate) + 1;
  if (car.status === 'archived') blocking.push('A caravana está arquivada.');
  if (dayRows.length === 0) blocking.push('O roteiro ainda não tem nenhum dia.');
  if (dayRows.some((d) => d.dayNumber > duration))
    blocking.push(`O roteiro tem dias depois do fim da viagem (a viagem dura ${duration} dias).`);
  if (dayRows.length > 0 && dayRows.length < duration)
    warnings.push(`O roteiro tem ${dayRows.length} de ${duration} dias preenchidos.`);

  const stopRows = await tx.select().from(stops).where(eq(stops.caravanId, caravanId));
  const chosen = await tx.select().from(caravanContents).where(eq(caravanContents.caravanId, caravanId));
  const chosenIds = new Set(chosen.map((c) => c.destinationId));
  const missing = new Set(stopRows.filter((s) => s.destinationId && !chosenIds.has(s.destinationId)).map((s) => s.destinationId));
  if (missing.size) warnings.push(`${missing.size} parada(s) apontam para destinos que não foram escolhidos em Conteúdo cultural.`);

  const info = await tx.select().from(caravanInfoItems).where(eq(caravanInfoItems.caravanId, caravanId));
  if (!info.some((i) => i.section === 'contatos')) warnings.push('Nenhum contato da agência em Informações úteis.');
  if (!info.some((i) => i.section === 'emergencia')) warnings.push('Nenhum contato de emergência em Informações úteis.');
  return { blocking, warnings };
}

export async function publishCaravan(tx: Tx, caravanId: string, userId: string | null): Promise<{ version: number }> {
  const checks = await publicationChecks(tx, caravanId);
  if (checks.blocking.length) throw new DomainError('publication_blocked', checks.blocking.join(' '));
  const [car] = await tx.select().from(caravans).where(eq(caravans.id, caravanId));
  if (!car) throw new DomainError('caravan_not_found');
  const [last] = await tx
    .select({ v: max(caravanPublications.version) })
    .from(caravanPublications)
    .where(eq(caravanPublications.caravanId, caravanId));
  const version = (last?.v ?? 0) + 1;
  const snapshot = await buildSnapshot(tx, caravanId, version);
  const [pub] = await tx
    .insert(caravanPublications)
    .values({ caravanId, agencyId: car.agencyId, version, snapshot: snapshot as unknown as Record<string, unknown>, publishedBy: userId })
    .returning({ id: caravanPublications.id });
  await tx
    .update(caravans)
    .set({ status: 'published', currentPublicationId: pub!.id, updatedAt: new Date() })
    .where(eq(caravans.id, caravanId));
  await tx.insert(auditLogs).values({
    agencyId: car.agencyId,
    actorUserId: userId,
    action: 'caravan.publish',
    targetType: 'caravan',
    targetId: caravanId,
    metadata: { version },
  });
  return { version };
}

export async function unpublishCaravan(tx: Tx, caravanId: string, userId: string | null): Promise<void> {
  const [car] = await tx.select().from(caravans).where(eq(caravans.id, caravanId));
  if (!car) throw new DomainError('caravan_not_found');
  await tx.update(caravans).set({ status: 'draft', currentPublicationId: null, updatedAt: new Date() }).where(eq(caravans.id, caravanId));
  await tx.insert(auditLogs).values({
    agencyId: car.agencyId,
    actorUserId: userId,
    action: 'caravan.unpublish',
    targetType: 'caravan',
    targetId: caravanId,
  });
}

export async function currentSnapshot(tx: Tx, caravanId: string): Promise<Snapshot | null> {
  const [car] = await tx
    .select({ pub: caravans.currentPublicationId, status: caravans.status })
    .from(caravans)
    .where(eq(caravans.id, caravanId));
  if (!car?.pub || car.status !== 'published') return null;
  const [row] = await tx.select().from(caravanPublications).where(eq(caravanPublications.id, car.pub));
  return (row?.snapshot as unknown as Snapshot) ?? null;
}

// Para a tela da agencia: o que mudou na biblioteca desde a publicacao atual.
export async function libraryUpdatesSince(tx: Tx, snapshot: Snapshot | null): Promise<string[]> {
  if (!snapshot) return [];
  const out: string[] = [];
  const slugs = snapshot.destinations.map((d) => d.slug);
  if (slugs.length) {
    const rows = await tx
      .select({ slug: destinations.slug, name: destinations.namePt, rev: culturalContents.revision, status: culturalContents.editorialStatus })
      .from(destinations)
      .innerJoin(culturalContents, eq(culturalContents.destinationId, destinations.id))
      .where(inArray(destinations.slug, slugs));
    for (const r of rows) {
      const pub = snapshot.destinations.find((d) => d.slug === r.slug);
      if (!pub) continue;
      const usable = okContent(snapshot.agency.isDemo, r.status);
      if (usable && (pub.revision === null || r.rev > pub.revision)) out.push(`Há uma versão nova do texto de ${r.name}.`);
    }
  }
  const acts = await tx.select({ slug: activities.slug, rev: activities.revision, title: activities.title }).from(activities).where(isNull(activities.agencyId)).orderBy(desc(activities.revision));
  for (const a of acts) {
    const pub = snapshot.activities.find((x) => x.slug === a.slug);
    if (pub && a.rev > pub.revision) out.push(`A atividade "${a.title}" foi atualizada na biblioteca.`);
  }
  return out;
}
