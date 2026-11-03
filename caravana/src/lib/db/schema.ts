// Esquema relacional da Minha Caravana Digital.
//
// Plataforma -> Agencias -> Caravanas -> Participantes. Toda tabela que pertence
// a uma agencia carrega `agency_id`, mesmo quando daria para chegar nele por
// junção: e essa coluna que as politicas de RLS (db/migrations/0001_security.sql)
// comparam com a agencia da requisicao. Sem ela o isolamento dependeria de cada
// consulta lembrar do filtro.
//
// O que o viajante ve nunca sai destas tabelas direto: sai do retrato
// (`caravan_publications.snapshot`) montado na publicacao. Editar a biblioteca
// nao muda uma caravana ja publicada ate a agencia publicar de novo.

import { sql } from 'drizzle-orm';
import {
  bigserial,
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const id = () => uuid('id').primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

// ─── Comercial ──────────────────────────────────────────────────────────────

export const plans = pgTable('plans', {
  id: text('id').primaryKey(), // 'essencial' | 'completa' | 'white_label'
  name: text('name').notNull(),
  priceCents: integer('price_cents').notNull(),
  priceUnit: text('price_unit').notNull(), // 'participant' | 'group'
  groupSize: integer('group_size'),
  features: jsonb('features').$type<string[]>().notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: createdAt(),
});

// ─── Agencias e pessoas ─────────────────────────────────────────────────────

export const agencies = pgTable(
  'agencies',
  {
    id: id(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    isDemo: boolean('is_demo').notNull().default(false),
    status: text('status').notNull().default('active'), // active | suspended | archived
    defaultPlanId: text('default_plan_id').notNull().references(() => plans.id),
    defaultSeatLimit: integer('default_seat_limit').notNull().default(50),
    maxActiveCaravans: integer('max_active_caravans').notNull().default(5),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    whatsapp: text('whatsapp'),
    website: text('website'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('agencies_slug_key').on(t.slug)],
);

export const brandingSettings = pgTable('branding_settings', {
  agencyId: uuid('agency_id')
    .primaryKey()
    .references(() => agencies.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  logoText: text('logo_text').notNull(), // monograma quando nao ha logo enviado
  logoAssetId: uuid('logo_asset_id'),
  primaryColor: text('primary_color').notNull().default('#1F3B57'),
  secondaryColor: text('secondary_color').notNull().default('#B4823C'),
  welcomeMessage: text('welcome_message'),
  updatedAt: updatedAt(),
});

export const users = pgTable(
  'users',
  {
    id: id(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash'), // null = nao entra por senha (ex.: visitante da demo)
    isPlatformAdmin: boolean('is_platform_admin').notNull().default(false),
    isDemo: boolean('is_demo').notNull().default(false),
    status: text('status').notNull().default('active'),
    createdAt: createdAt(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('users_email_key').on(sql`lower(${t.email})`)],
);

export const agencyMemberships = pgTable(
  'agency_memberships',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id')
      .notNull()
      .references(() => agencies.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // owner | admin | editor | viewer
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.agencyId] }), index('memberships_agency_idx').on(t.agencyId)],
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(), // sha256 do token; o token so existe no cookie
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

// Definir a senha pela primeira vez (conta criada pelo superadministrador) ou
// redefinir: so o hash do token fica no banco.
export const userTokens = pgTable('user_tokens', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  purpose: text('purpose').notNull(), // set_password
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: createdAt(),
});

export const rateLimits = pgTable(
  'rate_limits',
  {
    key: text('key').notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    hits: integer('hits').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'set null' }),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index('audit_agency_idx').on(t.agencyId, t.createdAt)],
);

// ─── Biblioteca cultural (da plataforma, reutilizada por todas as agencias) ─

export type EditorialStatus = 'placeholder' | 'draft' | 'in_review' | 'approved';

export const mediaAssets = pgTable('media_assets', {
  id: id(),
  agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }), // null = biblioteca
  kind: text('kind').notNull(), // 'illustration' | 'photo'
  key: text('key').notNull(), // ilustracao: chave do componente; foto: caminho no armazenamento
  alt: text('alt').notNull(),
  credit: text('credit'),
  license: text('license'),
  sourceUrl: text('source_url'),
  createdAt: createdAt(),
});

export const destinations = pgTable(
  'destinations',
  {
    id: id(),
    slug: text('slug').notNull(),
    region: text('region').notNull(),
    namePt: text('name_pt').notNull(),
    nameHe: text('name_he').notNull(),
    transliteration: text('transliteration').notNull(),
    pronunciation: text('pronunciation'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    art: text('art').notNull().default('stone'),
    status: text('status').$type<EditorialStatus>().notNull().default('placeholder'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('destinations_slug_key').on(t.slug)],
);

export type ContentBlock = { kind: 'fact' | 'tradition' | 'interpretation' | 'tip'; text: string; source?: string };
export type ContentSection = { id: string; title: string; blocks: ContentBlock[] };
export type ContentReference = { label: string; detail?: string };

export const culturalContents = pgTable(
  'cultural_contents',
  {
    id: id(),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull().default('pt-BR'),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    geography: text('geography'),
    sections: jsonb('sections').$type<ContentSection[]>().notNull(),
    observe: jsonb('observe').$type<string[]>().notNull().default([]),
    references: jsonb('references').$type<ContentReference[]>().notNull().default([]),
    editorialStatus: text('editorial_status').$type<EditorialStatus>().notNull().default('draft'),
    revision: integer('revision').notNull().default(1),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('cultural_contents_dest_locale_key').on(t.destinationId, t.locale)],
);

// Historico: cada revisao aprovada fica guardada inteira. O retrato publicado
// guarda o numero, e a tela da agencia compara para avisar "ha versao nova".
export const culturalContentRevisions = pgTable(
  'cultural_content_revisions',
  {
    contentId: uuid('content_id')
      .notNull()
      .references(() => culturalContents.id, { onDelete: 'cascade' }),
    revision: integer('revision').notNull(),
    body: jsonb('body').$type<Record<string, unknown>>().notNull(),
    createdBy: uuid('created_by'),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.contentId, t.revision] })],
);

export const audioAssets = pgTable('audio_assets', {
  id: id(),
  url: text('url').notNull(),
  // 'native_recording' e gravacao de pessoa. Voz sintetica nunca e cadastrada
  // como gravacao: a tela mostra a origem ao lado do botao.
  source: text('source').notNull(),
  speakerName: text('speaker_name'),
  license: text('license'),
  durationMs: integer('duration_ms'),
  createdAt: createdAt(),
});

export const hebrewExpressions = pgTable(
  'hebrew_expressions',
  {
    id: id(),
    slug: text('slug').notNull(),
    category: text('category').notNull(),
    hebrew: text('hebrew').notNull(), // como aparece nas placas: sem nikud
    hebrewPointed: text('hebrew_pointed'),
    transliteration: text('transliteration').notNull(),
    translation: text('translation').notNull(),
    exampleHe: text('example_he'),
    exampleTranslit: text('example_translit'),
    exampleTranslation: text('example_translation'),
    usageNote: text('usage_note'),
    reviewStatus: text('review_status').notNull().default('pending_native_review'),
    audioAssetId: uuid('audio_asset_id').references(() => audioAssets.id, { onDelete: 'set null' }),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('hebrew_slug_key').on(t.slug), index('hebrew_category_idx').on(t.category, t.position)],
);

export type QuestionOption = { id: string; text: string; he?: string };
export type QuestionKind = 'multiple_choice' | 'true_false' | 'match_pairs';
export type MatchPair = { left: string; leftHe?: string; right: string };

export const activities = pgTable(
  'activities',
  {
    id: id(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }), // null = biblioteca
    slug: text('slug').notNull(),
    type: text('type').notNull(), // quiz | hebrew | challenge
    feature: text('feature').notNull(), // recurso do plano que habilita: quizzes | hebrew | challenges
    title: text('title').notNull(),
    intro: text('intro'),
    destinationId: uuid('destination_id').references(() => destinations.id, { onDelete: 'set null' }),
    status: text('status').$type<EditorialStatus>().notNull().default('draft'),
    revision: integer('revision').notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('activities_slug_key').on(t.slug)],
);

export const activityQuestions = pgTable(
  'activity_questions',
  {
    id: id(),
    activityId: uuid('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    key: text('key').notNull(), // estavel entre revisoes: o progresso aponta para ele
    position: integer('position').notNull(),
    kind: text('kind').$type<QuestionKind>().notNull(),
    prompt: text('prompt').notNull(),
    promptHe: text('prompt_he'),
    options: jsonb('options').$type<QuestionOption[]>().notNull().default([]),
    pairs: jsonb('pairs').$type<MatchPair[]>(),
    correctOptionId: text('correct_option_id'),
    explanation: text('explanation').notNull(),
  },
  (t) => [uniqueIndex('questions_activity_key').on(t.activityId, t.key)],
);

export type BadgeCriteria = { activities: string[] }; // slugs: todas concluidas

export const passportBadges = pgTable(
  'passport_badges',
  {
    id: id(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    criteria: jsonb('criteria').$type<BadgeCriteria>().notNull(),
    art: text('art').notNull(),
    ink: text('ink').notNull().default('#1F3B57'),
    position: integer('position').notNull().default(0),
  },
  (t) => [uniqueIndex('badges_slug_key').on(t.slug)],
);

// ─── Caravanas ──────────────────────────────────────────────────────────────

export type CaravanFeatures = { hebrew: boolean; quizzes: boolean; challenges: boolean; passport: boolean };

export const caravans = pgTable(
  'caravans',
  {
    id: id(),
    agencyId: uuid('agency_id')
      .notNull()
      .references(() => agencies.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    timezone: text('timezone').notNull().default('Asia/Jerusalem'),
    status: text('status').notNull().default('draft'), // draft | published | archived
    // plan_id e seat_limit sao do contrato: a agencia nao tem permissao de
    // coluna para muda-los (GRANT por coluna na migracao de seguranca).
    planId: text('plan_id')
      .notNull()
      .references(() => plans.id),
    seatLimit: integer('seat_limit').notNull(),
    organizerName: text('organizer_name'),
    welcomeMessage: text('welcome_message'),
    postTripMessage: text('post_trip_message'),
    coverArt: text('cover_art').notNull().default('jerusalem'),
    primaryColor: text('primary_color'),
    secondaryColor: text('secondary_color'),
    features: jsonb('features')
      .$type<CaravanFeatures>()
      .notNull()
      .default({ hebrew: true, quizzes: true, challenges: true, passport: true }),
    currentPublicationId: uuid('current_publication_id'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('caravans_slug_key').on(t.slug), index('caravans_agency_idx').on(t.agencyId)],
);

export const caravanDays = pgTable(
  'caravan_days',
  {
    id: id(),
    caravanId: uuid('caravan_id')
      .notNull()
      .references(() => caravans.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    dayNumber: integer('day_number').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    practicalNotes: text('practical_notes'),
    art: text('art'),
  },
  (t) => [index('days_caravan_idx').on(t.caravanId, t.dayNumber)],
);

export const stops = pgTable(
  'stops',
  {
    id: id(),
    dayId: uuid('day_id')
      .notNull()
      .references(() => caravanDays.id, { onDelete: 'cascade' }),
    caravanId: uuid('caravan_id')
      .notNull()
      .references(() => caravans.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    position: integer('position').notNull(),
    title: text('title').notNull(),
    timeLabel: text('time_label'), // so quando a agencia informa
    description: text('description'),
    practicalNote: text('practical_note'),
    destinationId: uuid('destination_id').references(() => destinations.id, { onDelete: 'set null' }),
  },
  (t) => [index('stops_day_idx').on(t.dayId, t.position)],
);

// Conteudos da biblioteca escolhidos pela agencia. A sugestao vem das paradas
// que apontam para um destino cadastrado, nunca de nome parecido.
export const caravanContents = pgTable(
  'caravan_contents',
  {
    caravanId: uuid('caravan_id')
      .notNull()
      .references(() => caravans.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.caravanId, t.destinationId] })],
);

export const caravanInfoItems = pgTable(
  'caravan_info_items',
  {
    id: id(),
    caravanId: uuid('caravan_id')
      .notNull()
      .references(() => caravans.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    section: text('section').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    contactValue: text('contact_value'),
    contactKind: text('contact_kind'), // phone | whatsapp | email | url
    isTimeSensitive: boolean('is_time_sensitive').notNull().default(false),
    position: integer('position').notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [index('info_caravan_idx').on(t.caravanId, t.section, t.position)],
);

export const caravanPublications = pgTable(
  'caravan_publications',
  {
    id: id(),
    caravanId: uuid('caravan_id')
      .notNull()
      .references(() => caravans.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    version: integer('version').notNull(),
    snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull(),
    publishedBy: uuid('published_by'),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('publications_caravan_version').on(t.caravanId, t.version)],
);

// ─── Participantes ──────────────────────────────────────────────────────────

export const participantAccess = pgTable(
  'participant_access',
  {
    id: id(),
    caravanId: uuid('caravan_id')
      .notNull()
      .references(() => caravans.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    codeHash: text('code_hash').notNull(),
    // O codigo do convite: o hash serve para achar, a cifra (AES-GCM com a
    // chave do servidor) deixa a agencia reenviar o link sem gerar outro. Um
    // vazamento so do banco nao entrega codigo nenhum.
    codeCipher: text('code_cipher').notNull(),
    codeHint: text('code_hint').notNull(), // ultimos 4 caracteres, para a agencia achar o convite
    label: text('label'), // primeiro nome, opcional (minimizacao)
    kind: text('kind').notNull().default('invite'), // invite | demo
    status: text('status').notNull().default('active'), // active | revoked
    maxDevices: integer('max_devices').notNull().default(3),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    firstUsedAt: timestamp('first_used_at', { withTimezone: true }),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('participant_code_key').on(t.codeHash), index('participant_caravan_idx').on(t.caravanId, t.status)],
);

export const participantDevices = pgTable(
  'participant_devices',
  {
    id: text('id').primaryKey(), // sha256 do token do cookie
    accessId: uuid('access_id')
      .notNull()
      .references(() => participantAccess.id, { onDelete: 'cascade' }),
    caravanId: uuid('caravan_id').notNull(),
    agencyId: uuid('agency_id').notNull(),
    createdAt: createdAt(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => [index('devices_access_idx').on(t.accessId)],
);

export const questionAnswers = pgTable(
  'question_answers',
  {
    accessId: uuid('access_id')
      .notNull()
      .references(() => participantAccess.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    caravanId: uuid('caravan_id').notNull(),
    activitySlug: text('activity_slug').notNull(),
    questionKey: text('question_key').notNull(),
    correct: boolean('correct').notNull(),
    attempts: integer('attempts').notNull().default(1),
    answeredAt: timestamp('answered_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.accessId, t.activitySlug, t.questionKey] })],
);

export const activityCompletions = pgTable(
  'activity_completions',
  {
    accessId: uuid('access_id')
      .notNull()
      .references(() => participantAccess.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    caravanId: uuid('caravan_id').notNull(),
    activitySlug: text('activity_slug').notNull(),
    score: integer('score').notNull(),
    total: integer('total').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.accessId, t.activitySlug] }), index('completions_caravan_idx').on(t.caravanId)],
);

export const participantBadges = pgTable(
  'participant_badges',
  {
    accessId: uuid('access_id')
      .notNull()
      .references(() => participantAccess.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    caravanId: uuid('caravan_id').notNull(),
    badgeSlug: text('badge_slug').notNull(),
    awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.accessId, t.badgeSlug] })],
);

export const contentViews = pgTable(
  'content_views',
  {
    accessId: uuid('access_id')
      .notNull()
      .references(() => participantAccess.id, { onDelete: 'cascade' }),
    agencyId: uuid('agency_id').notNull(),
    caravanId: uuid('caravan_id').notNull(),
    destinationSlug: text('destination_slug').notNull(),
    firstViewedAt: timestamp('first_viewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.accessId, t.destinationSlug] })],
);
