// O retrato publicado de uma caravana: tudo que o viajante ve, numa peca so.
// Sai de `buildSnapshot` (publication.ts) e fica congelado em
// caravan_publications ate a proxima publicacao.

import type { CaravanFeatures, ContentReference, ContentSection, MatchPair, QuestionKind, QuestionOption } from '../db/schema';

export type SnapshotDestination = {
  slug: string;
  namePt: string;
  nameHe: string;
  transliteration: string;
  pronunciation: string | null;
  region: string;
  art: string;
  latitude: number | null;
  longitude: number | null;
  editorialStatus: string;
  revision: number | null;
  content: null | {
    title: string;
    summary: string;
    geography: string | null;
    sections: ContentSection[];
    observe: string[];
    references: ContentReference[];
  };
};

export type SnapshotExpression = {
  slug: string;
  category: string;
  hebrew: string;
  hebrewPointed: string | null;
  transliteration: string;
  translation: string;
  exampleHe: string | null;
  exampleTranslit: string | null;
  exampleTranslation: string | null;
  usageNote: string | null;
  reviewed: boolean;
  audio: null | { url: string; source: string; speakerName: string | null };
};

export type SnapshotQuestion = {
  key: string;
  kind: QuestionKind;
  prompt: string;
  promptHe: string | null;
  options: QuestionOption[];
  pairs: MatchPair[] | null;
  correctOptionId: string | null;
  explanation: string;
};

export type SnapshotActivity = {
  slug: string;
  type: string;
  feature: string;
  title: string;
  intro: string | null;
  destinationSlug: string | null;
  revision: number;
  questions: SnapshotQuestion[];
};

export type SnapshotBadge = {
  slug: string;
  title: string;
  description: string;
  art: string;
  ink: string;
  activities: string[];
};

export type SnapshotInfoItem = {
  section: string;
  title: string;
  body: string;
  contactValue: string | null;
  contactKind: string | null;
  isTimeSensitive: boolean;
  updatedAt: string;
};

export type Snapshot = {
  schemaVersion: 1;
  version: number;
  publishedAt: string;
  agency: {
    name: string;
    displayName: string;
    logoText: string;
    primaryColor: string;
    secondaryColor: string;
    isDemo: boolean;
  };
  caravan: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string;
    timezone: string;
    organizerName: string | null;
    welcomeMessage: string | null;
    postTripMessage: string | null;
    coverArt: string;
    features: CaravanFeatures;
    planFeatures: string[];
  };
  days: {
    number: number;
    date: string;
    title: string;
    summary: string | null;
    practicalNotes: string | null;
    art: string | null;
    stops: {
      title: string;
      timeLabel: string | null;
      description: string | null;
      practicalNote: string | null;
      destinationSlug: string | null;
    }[];
  }[];
  destinations: SnapshotDestination[];
  hebrew: null | { categories: { id: string; label: string; intro: string }[]; expressions: SnapshotExpression[] };
  activities: SnapshotActivity[];
  badges: SnapshotBadge[];
  info: SnapshotInfoItem[];
  // Espaco previsto para uma oferta de continuidade depois da viagem. Nulo
  // nesta etapa: nao ha produto nem cobranca ligados a ele.
  postTripOffer: null;
};

// O que vai ao navegador: a pergunta sem o gabarito.
export type PublicQuestion = Omit<SnapshotQuestion, 'correctOptionId' | 'explanation' | 'pairs'> & {
  left: { text: string; he?: string }[] | null;
  right: string[] | null;
};

export function publicQuestion(q: SnapshotQuestion): PublicQuestion {
  const pairs = q.pairs;
  return {
    key: q.key,
    kind: q.kind,
    prompt: q.prompt,
    promptHe: q.promptHe,
    options: q.options,
    left: pairs ? pairs.map((p) => ({ text: p.left, he: p.leftHe })) : null,
    // Embaralhamento estavel (mesmo resultado no servidor e no navegador).
    right: pairs ? stableShuffle(pairs.map((p) => p.right), q.key) : null,
  };
}

export function stableShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  // Nunca devolver na ordem original: ligar os pares ficaria trivial.
  if (out.length > 1 && out.every((v, i) => v === items[i])) out.push(out.shift() as T);
  return out;
}
