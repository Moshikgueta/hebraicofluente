// Carregador da area do viajante: quem esta pedindo, o retrato publicado, o
// progresso e o "hoje" no fuso da caravana. React cache: layout e pagina
// chamam e o banco e consultado uma vez por requisicao.

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTraveler } from './auth/next';
import { addDays, todayIn, tripPhase, type TripPhase } from './dates';
import type { Snapshot } from './domain/snapshot';
import { loadTrip, type Progress } from './domain/traveler';
import type { TravelerContext } from './auth/sessions';

export const DEMO_DATE_COOKIE = 'mcd_demo_hoje';

export type Trip = {
  ctx: TravelerContext;
  snapshot: Snapshot;
  progress: Progress;
  today: string;
  phase: TripPhase;
  simulated: string | null; // modo de data simulada (so demonstracao)
  base: string; // /c/<slug>
};

export const getTrip = cache(async (slug: string): Promise<Trip> => {
  const ctx = await getTraveler(slug);
  if (!ctx) redirect(`/c/${slug}/entrar`);
  const trip = await loadTrip(ctx);
  if (!trip) redirect(`/c/${slug}/entrar?indisponivel=1`);
  const { snapshot, progress } = trip;
  let today = todayIn(snapshot.caravan.timezone);
  let simulated: string | null = null;
  // Data simulada: so na caravana de demonstracao, para mostrar os tres
  // momentos da viagem (antes, durante, depois) a uma agencia.
  if (snapshot.agency.isDemo) {
    const mode = (await cookies()).get(DEMO_DATE_COOKIE)?.value;
    if (mode === 'durante') today = addDays(snapshot.caravan.startDate, 3);
    else if (mode === 'depois') today = addDays(snapshot.caravan.endDate, 2);
    if (mode === 'durante' || mode === 'depois') simulated = mode;
  }
  return {
    ctx,
    snapshot,
    progress,
    today,
    phase: tripPhase(snapshot.caravan.startDate, snapshot.caravan.endDate, today),
    simulated,
    base: `/c/${slug}`,
  };
});

export function destinationBySlug(s: Snapshot, slug: string | null | undefined) {
  return slug ? (s.destinations.find((d) => d.slug === slug) ?? null) : null;
}

export function activitiesFor(s: Snapshot, destinationSlug: string) {
  return s.activities.filter((a) => a.destinationSlug === destinationSlug);
}

export function badgeProgress(s: Snapshot, p: Progress) {
  return { earned: s.badges.filter((b) => p.badges[b.slug]).length, total: s.badges.length };
}
