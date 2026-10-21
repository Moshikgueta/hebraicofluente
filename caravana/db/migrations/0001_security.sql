-- Isolamento entre agencias no BANCO, nao so no codigo.
--
-- A aplicacao conecta como dona das tabelas e, em toda operacao de negocio,
-- abre uma transacao com `SET LOCAL ROLE` para um destes tres papeis e grava a
-- agencia (e a caravana / o participante) em `app.*` com set_config(..., true).
-- A dona das tabelas so e usada sem papel nos caminhos de autenticacao
-- (src/lib/db/tenant.ts, withSystem): achar sessao, achar convite, freio.
--
--   mcd_platform     superadministrador: le e escreve tudo
--   mcd_agency       equipe de uma agencia: so linhas com agency_id = app.agency_id
--   mcd_participant  viajante: le o retrato publicado da propria caravana e
--                    grava o proprio progresso; nada mais
--
-- Tres camadas seguram uma agencia dentro do proprio espaco:
--   1. RLS por papel (abaixo);
--   2. chaves estrangeiras COMPOSTAS (caravan_id, agency_id): uma linha filha
--      nao consegue apontar para a caravana de outra agencia, mesmo que a
--      consulta erre, porque a FK nao enxerga RLS mas exige o par certo;
--   3. gatilhos que cobram o contrato: plano e limite de vagas sao da
--      plataforma, e o convite que passaria do limite e recusado aqui.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mcd_platform') THEN CREATE ROLE mcd_platform NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mcd_agency') THEN CREATE ROLE mcd_agency NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mcd_participant') THEN CREATE ROLE mcd_participant NOLOGIN; END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  EXECUTE format('GRANT mcd_platform, mcd_agency, mcd_participant TO %I', current_user);
EXCEPTION WHEN others THEN NULL; -- superusuario (PGlite local) ja pode tudo
END $$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO mcd_platform, mcd_agency, mcd_participant;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION mcd_agency() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.agency_id', true), '')::uuid $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION mcd_caravan() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.caravan_id', true), '')::uuid $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION mcd_access() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.access_id', true), '')::uuid $$;
--> statement-breakpoint

-- ─── Chaves compostas ───────────────────────────────────────────────────────
ALTER TABLE caravans ADD CONSTRAINT caravans_id_agency_key UNIQUE (id, agency_id);
--> statement-breakpoint
ALTER TABLE caravan_days ADD CONSTRAINT caravan_days_id_caravan_key UNIQUE (id, caravan_id);
--> statement-breakpoint
ALTER TABLE caravan_days ADD CONSTRAINT caravan_days_tenant_fk FOREIGN KEY (caravan_id, agency_id) REFERENCES caravans (id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE stops ADD CONSTRAINT stops_tenant_fk FOREIGN KEY (caravan_id, agency_id) REFERENCES caravans (id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE stops ADD CONSTRAINT stops_day_caravan_fk FOREIGN KEY (day_id, caravan_id) REFERENCES caravan_days (id, caravan_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE caravan_contents ADD CONSTRAINT caravan_contents_tenant_fk FOREIGN KEY (caravan_id, agency_id) REFERENCES caravans (id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE caravan_info_items ADD CONSTRAINT caravan_info_tenant_fk FOREIGN KEY (caravan_id, agency_id) REFERENCES caravans (id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE caravan_publications ADD CONSTRAINT caravan_publications_tenant_fk FOREIGN KEY (caravan_id, agency_id) REFERENCES caravans (id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE participant_access ADD CONSTRAINT participant_access_tenant_fk FOREIGN KEY (caravan_id, agency_id) REFERENCES caravans (id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE participant_access ADD CONSTRAINT participant_access_scope_key UNIQUE (id, caravan_id, agency_id);
--> statement-breakpoint
ALTER TABLE participant_devices ADD CONSTRAINT participant_devices_scope_fk FOREIGN KEY (access_id, caravan_id, agency_id) REFERENCES participant_access (id, caravan_id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE question_answers ADD CONSTRAINT question_answers_scope_fk FOREIGN KEY (access_id, caravan_id, agency_id) REFERENCES participant_access (id, caravan_id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE activity_completions ADD CONSTRAINT activity_completions_scope_fk FOREIGN KEY (access_id, caravan_id, agency_id) REFERENCES participant_access (id, caravan_id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE participant_badges ADD CONSTRAINT participant_badges_scope_fk FOREIGN KEY (access_id, caravan_id, agency_id) REFERENCES participant_access (id, caravan_id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE content_views ADD CONSTRAINT content_views_scope_fk FOREIGN KEY (access_id, caravan_id, agency_id) REFERENCES participant_access (id, caravan_id, agency_id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE caravans ADD CONSTRAINT caravans_dates_check CHECK (end_date >= start_date);
--> statement-breakpoint
ALTER TABLE caravans ADD CONSTRAINT caravans_seat_limit_check CHECK (seat_limit >= 0);
--> statement-breakpoint
ALTER TABLE caravans ADD CONSTRAINT caravans_publication_fk FOREIGN KEY (current_publication_id) REFERENCES caravan_publications (id) ON DELETE SET NULL;
--> statement-breakpoint

-- ─── Permissoes por tabela ──────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO mcd_platform;
--> statement-breakpoint
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO mcd_platform, mcd_agency;
--> statement-breakpoint
-- Sessoes, tokens e freios so passam pelo caminho de autenticacao.
REVOKE ALL ON sessions, user_tokens, rate_limits FROM mcd_platform;
--> statement-breakpoint
REVOKE UPDATE, DELETE ON audit_logs FROM mcd_platform;
--> statement-breakpoint

-- Biblioteca: a agencia le; so a plataforma escreve.
GRANT SELECT ON plans, destinations, cultural_contents, cultural_content_revisions, audio_assets,
  hebrew_expressions, activities, activity_questions, passport_badges, media_assets TO mcd_agency;
--> statement-breakpoint
GRANT SELECT ON agencies, agency_memberships TO mcd_agency;
--> statement-breakpoint
GRANT UPDATE (contact_email, contact_phone, whatsapp, website, updated_at) ON agencies TO mcd_agency;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON branding_settings TO mcd_agency;
--> statement-breakpoint
GRANT SELECT, INSERT ON audit_logs TO mcd_agency;
--> statement-breakpoint
GRANT SELECT, INSERT ON caravans TO mcd_agency;
--> statement-breakpoint
-- Sem plan_id, seat_limit nem agency_id: contrato e dono nao se mudam daqui.
GRANT UPDATE (name, slug, description, start_date, end_date, timezone, status, organizer_name,
  welcome_message, post_trip_message, cover_art, primary_color, secondary_color, features,
  current_publication_id, updated_at, archived_at) ON caravans TO mcd_agency;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON caravan_days, stops, caravan_contents, caravan_info_items TO mcd_agency;
--> statement-breakpoint
GRANT SELECT, INSERT ON caravan_publications TO mcd_agency;
--> statement-breakpoint
GRANT SELECT, INSERT ON participant_access TO mcd_agency;
--> statement-breakpoint
GRANT UPDATE (label, status, revoked_at, max_devices, expires_at) ON participant_access TO mcd_agency;
--> statement-breakpoint
GRANT SELECT ON participant_devices TO mcd_agency;
--> statement-breakpoint
GRANT UPDATE (revoked_at) ON participant_devices TO mcd_agency;
--> statement-breakpoint
GRANT SELECT ON question_answers, activity_completions, participant_badges, content_views TO mcd_agency;
--> statement-breakpoint

GRANT SELECT (id, agency_id, slug, status, current_publication_id) ON caravans TO mcd_participant;
--> statement-breakpoint
GRANT SELECT ON caravan_publications TO mcd_participant;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON question_answers, activity_completions, participant_badges, content_views TO mcd_participant;
--> statement-breakpoint

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Sem FORCE: a dona das tabelas (caminho de autenticacao) passa; os tres papeis nao.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['plans','agencies','branding_settings','users','agency_memberships','sessions',
    'user_tokens','rate_limits','audit_logs','media_assets','destinations','cultural_contents',
    'cultural_content_revisions','audio_assets','hebrew_expressions','activities','activity_questions',
    'passport_badges','caravans','caravan_days','stops','caravan_contents','caravan_info_items',
    'caravan_publications','participant_access','participant_devices','question_answers',
    'activity_completions','participant_badges','content_views']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY platform_all ON %I TO mcd_platform USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- Biblioteca global: leitura para a agencia. Atividade e midia podem ser
-- proprias de uma agencia (agency_id preenchido): essas so a dona ve.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['plans','destinations','cultural_contents','cultural_content_revisions',
    'audio_assets','hebrew_expressions','passport_badges']
  LOOP
    EXECUTE format('CREATE POLICY agency_read ON %I FOR SELECT TO mcd_agency USING (true)', t);
  END LOOP;
END $$;
--> statement-breakpoint
CREATE POLICY agency_read ON activities FOR SELECT TO mcd_agency USING (agency_id IS NULL OR agency_id = mcd_agency());
--> statement-breakpoint
CREATE POLICY agency_read ON activity_questions FOR SELECT TO mcd_agency
  USING (EXISTS (SELECT 1 FROM activities a WHERE a.id = activity_id AND (a.agency_id IS NULL OR a.agency_id = mcd_agency())));
--> statement-breakpoint
CREATE POLICY agency_read ON media_assets FOR SELECT TO mcd_agency USING (agency_id IS NULL OR agency_id = mcd_agency());
--> statement-breakpoint

CREATE POLICY agency_own ON agencies TO mcd_agency USING (id = mcd_agency()) WITH CHECK (id = mcd_agency());
--> statement-breakpoint
CREATE POLICY agency_own ON agency_memberships FOR SELECT TO mcd_agency USING (agency_id = mcd_agency());
--> statement-breakpoint
CREATE POLICY agency_own ON audit_logs TO mcd_agency USING (agency_id = mcd_agency()) WITH CHECK (agency_id = mcd_agency());
--> statement-breakpoint

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['branding_settings','caravans','caravan_days','stops','caravan_contents',
    'caravan_info_items','caravan_publications','participant_access','participant_devices',
    'question_answers','activity_completions','participant_badges','content_views']
  LOOP
    EXECUTE format('CREATE POLICY agency_own ON %I TO mcd_agency USING (agency_id = mcd_agency()) WITH CHECK (agency_id = mcd_agency())', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- Viajante: so a propria caravana, e so o proprio progresso.
CREATE POLICY participant_own ON caravans FOR SELECT TO mcd_participant
  USING (id = mcd_caravan() AND agency_id = mcd_agency());
--> statement-breakpoint
CREATE POLICY participant_own ON caravan_publications FOR SELECT TO mcd_participant
  USING (caravan_id = mcd_caravan() AND agency_id = mcd_agency());
--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['question_answers','activity_completions','participant_badges','content_views']
  LOOP
    EXECUTE format('CREATE POLICY participant_own ON %I TO mcd_participant
      USING (access_id = mcd_access() AND caravan_id = mcd_caravan() AND agency_id = mcd_agency())
      WITH CHECK (access_id = mcd_access() AND caravan_id = mcd_caravan() AND agency_id = mcd_agency())', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- ─── Gatilhos do contrato ───────────────────────────────────────────────────

-- Caravana criada pela agencia nasce com o plano e o limite de vagas do
-- contrato dela, seja o que for que a requisicao tenha mandado, e respeita o
-- teto de caravanas ativas.
CREATE OR REPLACE FUNCTION mcd_caravan_contract() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE ag agencies%ROWTYPE; ativas integer;
BEGIN
  IF current_user <> 'mcd_agency' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT * INTO ag FROM agencies WHERE id = NEW.agency_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'mcd:agency_not_found'; END IF;
    IF ag.status <> 'active' THEN RAISE EXCEPTION 'mcd:agency_inactive'; END IF;
    SELECT count(*) INTO ativas FROM caravans WHERE agency_id = NEW.agency_id AND status <> 'archived';
    IF ativas >= ag.max_active_caravans THEN RAISE EXCEPTION 'mcd:caravan_limit'; END IF;
    NEW.plan_id := ag.default_plan_id;
    NEW.seat_limit := ag.default_seat_limit;
  ELSE
    IF NEW.plan_id IS DISTINCT FROM OLD.plan_id OR NEW.seat_limit IS DISTINCT FROM OLD.seat_limit
       OR NEW.agency_id IS DISTINCT FROM OLD.agency_id THEN
      RAISE EXCEPTION 'mcd:contract_fields';
    END IF;
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER caravans_contract BEFORE INSERT OR UPDATE ON caravans FOR EACH ROW EXECUTE FUNCTION mcd_caravan_contract();
--> statement-breakpoint

-- Vagas: convites ativos e dentro da validade nunca passam do contratado. A
-- linha da caravana fica travada durante a contagem, entao dois pedidos ao
-- mesmo tempo nao passam juntos pela ultima vaga.
CREATE OR REPLACE FUNCTION mcd_seat_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE limite integer; usados integer;
BEGIN
  IF NEW.kind <> 'invite' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'revoked' AND NEW.status <> 'revoked' THEN RAISE EXCEPTION 'mcd:invite_revoked_final'; END IF;
    IF NEW.status <> 'active' OR (OLD.status = 'active' AND NEW.expires_at <= OLD.expires_at) THEN RETURN NEW; END IF;
  END IF;
  SELECT seat_limit INTO limite FROM caravans WHERE id = NEW.caravan_id AND agency_id = NEW.agency_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'mcd:caravan_not_found'; END IF;
  SELECT count(*) INTO usados FROM participant_access
    WHERE caravan_id = NEW.caravan_id AND kind = 'invite' AND status = 'active' AND expires_at > now()
      AND id <> NEW.id;
  IF usados >= limite THEN RAISE EXCEPTION 'mcd:seat_limit'; END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER participant_access_seats BEFORE INSERT OR UPDATE ON participant_access FOR EACH ROW EXECUTE FUNCTION mcd_seat_guard();
--> statement-breakpoint

-- A trilha de auditoria so cresce. A unica mudanca aceita e a das chaves
-- estrangeiras virando NULL (ON DELETE SET NULL de uma conta apagada).
CREATE OR REPLACE FUNCTION mcd_audit_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.action = OLD.action AND NEW.metadata IS NOT DISTINCT FROM OLD.metadata
     AND NEW.created_at = OLD.created_at AND NEW.target_id IS NOT DISTINCT FROM OLD.target_id
     AND (NEW.agency_id IS NULL OR NEW.agency_id = OLD.agency_id)
     AND (NEW.actor_user_id IS NULL OR NEW.actor_user_id = OLD.actor_user_id) THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'mcd:audit_append_only';
END $$;
--> statement-breakpoint
CREATE TRIGGER audit_logs_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION mcd_audit_append_only();
