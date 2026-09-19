-- Hebraico Fluente - learner state.
-- Not applied to any project yet; see app/src/lib/state/supabase.ts.
--
-- The whole learner state is one JSONB document per user rather than a table
-- per concept. That is the right shape here: it is read once on load and
-- written on change, it is never queried across users, and it lets the client
-- evolve the schema (state.version) without a migration per release.
-- The analytics table is the opposite - append-only, queried in aggregate.

create table if not exists public.learner_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learner_state enable row level security;

create policy "read own state"   on public.learner_state
  for select using (auth.uid() = user_id);
create policy "write own state"  on public.learner_state
  for insert with check (auth.uid() = user_id);
create policy "update own state" on public.learner_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own state" on public.learner_state
  for delete using (auth.uid() = user_id);

-- Learning analytics. No PII beyond the user id, and no free text: `props` is
-- bounded to the event vocabulary in src/lib/analytics.ts.
create table if not exists public.learning_events (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_events_name_created
  on public.learning_events (name, created_at desc);
create index if not exists learning_events_user
  on public.learning_events (user_id, created_at desc);

alter table public.learning_events enable row level security;
create policy "insert own events" on public.learning_events
  for insert with check (auth.uid() = user_id);

-- Which letters cost learners the most. The question the course exists to
-- answer about itself.
create or replace view public.letter_difficulty as
  select props->>'letterId' as letter_id,
         count(*) filter (where name = 'exercise_wrong')    as wrong,
         count(*) filter (where name = 'exercise_answered') as answered,
         round(
           count(*) filter (where name = 'exercise_wrong')::numeric
           / nullif(count(*) filter (where name = 'exercise_answered'), 0), 3
         ) as miss_rate
  from public.learning_events
  where props ? 'letterId'
  group by 1
  order by miss_rate desc nulls last;
