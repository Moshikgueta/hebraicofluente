CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"feature" text NOT NULL,
	"title" text NOT NULL,
	"intro" text,
	"destination_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_completions" (
	"access_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"caravan_id" uuid NOT NULL,
	"activity_slug" text NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_completions_access_id_activity_slug_pk" PRIMARY KEY("access_id","activity_slug")
);
--> statement-breakpoint
CREATE TABLE "activity_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"key" text NOT NULL,
	"position" integer NOT NULL,
	"kind" text NOT NULL,
	"prompt" text NOT NULL,
	"prompt_he" text,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pairs" jsonb,
	"correct_option_id" text,
	"explanation" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"default_plan_id" text NOT NULL,
	"default_seat_limit" integer DEFAULT 50 NOT NULL,
	"max_active_caravans" integer DEFAULT 5 NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"whatsapp" text,
	"website" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_memberships" (
	"user_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agency_memberships_user_id_agency_id_pk" PRIMARY KEY("user_id","agency_id")
);
--> statement-breakpoint
CREATE TABLE "audio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"source" text NOT NULL,
	"speaker_name" text,
	"license" text,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"agency_id" uuid,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"agency_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"logo_text" text NOT NULL,
	"logo_asset_id" uuid,
	"primary_color" text DEFAULT '#1F3B57' NOT NULL,
	"secondary_color" text DEFAULT '#B4823C' NOT NULL,
	"welcome_message" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caravan_contents" (
	"caravan_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caravan_contents_caravan_id_destination_id_pk" PRIMARY KEY("caravan_id","destination_id")
);
--> statement-breakpoint
CREATE TABLE "caravan_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caravan_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"practical_notes" text,
	"art" text
);
--> statement-breakpoint
CREATE TABLE "caravan_info_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caravan_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"section" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"contact_value" text,
	"contact_kind" text,
	"is_time_sensitive" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caravan_publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caravan_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"published_by" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caravans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"timezone" text DEFAULT 'Asia/Jerusalem' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"plan_id" text NOT NULL,
	"seat_limit" integer NOT NULL,
	"organizer_name" text,
	"welcome_message" text,
	"post_trip_message" text,
	"cover_art" text DEFAULT 'jerusalem' NOT NULL,
	"primary_color" text,
	"secondary_color" text,
	"features" jsonb DEFAULT '{"hebrew":true,"quizzes":true,"challenges":true,"passport":true}'::jsonb NOT NULL,
	"current_publication_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "content_views" (
	"access_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"caravan_id" uuid NOT NULL,
	"destination_slug" text NOT NULL,
	"first_viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_views_access_id_destination_slug_pk" PRIMARY KEY("access_id","destination_slug")
);
--> statement-breakpoint
CREATE TABLE "cultural_content_revisions" (
	"content_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"body" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cultural_content_revisions_content_id_revision_pk" PRIMARY KEY("content_id","revision")
);
--> statement-breakpoint
CREATE TABLE "cultural_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"destination_id" uuid NOT NULL,
	"locale" text DEFAULT 'pt-BR' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"geography" text,
	"sections" jsonb NOT NULL,
	"observe" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"editorial_status" text DEFAULT 'draft' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"region" text NOT NULL,
	"name_pt" text NOT NULL,
	"name_he" text NOT NULL,
	"transliteration" text NOT NULL,
	"pronunciation" text,
	"latitude" double precision,
	"longitude" double precision,
	"art" text DEFAULT 'stone' NOT NULL,
	"status" text DEFAULT 'placeholder' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hebrew_expressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"hebrew" text NOT NULL,
	"hebrew_pointed" text,
	"transliteration" text NOT NULL,
	"translation" text NOT NULL,
	"example_he" text,
	"example_translit" text,
	"example_translation" text,
	"usage_note" text,
	"review_status" text DEFAULT 'pending_native_review' NOT NULL,
	"audio_asset_id" uuid,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid,
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"alt" text NOT NULL,
	"credit" text,
	"license" text,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participant_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caravan_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"code_cipher" text NOT NULL,
	"code_hint" text NOT NULL,
	"label" text,
	"kind" text DEFAULT 'invite' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"max_devices" integer DEFAULT 3 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"first_used_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "participant_badges" (
	"access_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"caravan_id" uuid NOT NULL,
	"badge_slug" text NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participant_badges_access_id_badge_slug_pk" PRIMARY KEY("access_id","badge_slug")
);
--> statement-breakpoint
CREATE TABLE "participant_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"access_id" uuid NOT NULL,
	"caravan_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "passport_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"art" text NOT NULL,
	"ink" text DEFAULT '#1F3B57' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"price_unit" text NOT NULL,
	"group_size" integer,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_answers" (
	"access_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"caravan_id" uuid NOT NULL,
	"activity_slug" text NOT NULL,
	"question_key" text NOT NULL,
	"correct" boolean NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_answers_access_id_activity_slug_question_key_pk" PRIMARY KEY("access_id","activity_slug","question_key")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"agency_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "stops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"caravan_id" uuid NOT NULL,
	"agency_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"time_label" text,
	"description" text,
	"practical_note" text,
	"destination_id" uuid
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"is_platform_admin" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_access_id_participant_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."participant_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_questions" ADD CONSTRAINT "activity_questions_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_default_plan_id_plans_id_fk" FOREIGN KEY ("default_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_memberships" ADD CONSTRAINT "agency_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_memberships" ADD CONSTRAINT "agency_memberships_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branding_settings" ADD CONSTRAINT "branding_settings_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravan_contents" ADD CONSTRAINT "caravan_contents_caravan_id_caravans_id_fk" FOREIGN KEY ("caravan_id") REFERENCES "public"."caravans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravan_contents" ADD CONSTRAINT "caravan_contents_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravan_days" ADD CONSTRAINT "caravan_days_caravan_id_caravans_id_fk" FOREIGN KEY ("caravan_id") REFERENCES "public"."caravans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravan_info_items" ADD CONSTRAINT "caravan_info_items_caravan_id_caravans_id_fk" FOREIGN KEY ("caravan_id") REFERENCES "public"."caravans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravan_publications" ADD CONSTRAINT "caravan_publications_caravan_id_caravans_id_fk" FOREIGN KEY ("caravan_id") REFERENCES "public"."caravans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravans" ADD CONSTRAINT "caravans_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caravans" ADD CONSTRAINT "caravans_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_access_id_participant_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."participant_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_content_revisions" ADD CONSTRAINT "cultural_content_revisions_content_id_cultural_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."cultural_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultural_contents" ADD CONSTRAINT "cultural_contents_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hebrew_expressions" ADD CONSTRAINT "hebrew_expressions_audio_asset_id_audio_assets_id_fk" FOREIGN KEY ("audio_asset_id") REFERENCES "public"."audio_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_access" ADD CONSTRAINT "participant_access_caravan_id_caravans_id_fk" FOREIGN KEY ("caravan_id") REFERENCES "public"."caravans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_badges" ADD CONSTRAINT "participant_badges_access_id_participant_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."participant_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_devices" ADD CONSTRAINT "participant_devices_access_id_participant_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."participant_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_access_id_participant_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."participant_access"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_day_id_caravan_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."caravan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_caravan_id_caravans_id_fk" FOREIGN KEY ("caravan_id") REFERENCES "public"."caravans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_slug_key" ON "activities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "completions_caravan_idx" ON "activity_completions" USING btree ("caravan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_activity_key" ON "activity_questions" USING btree ("activity_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "memberships_agency_idx" ON "agency_memberships" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX "audit_agency_idx" ON "audit_logs" USING btree ("agency_id","created_at");--> statement-breakpoint
CREATE INDEX "days_caravan_idx" ON "caravan_days" USING btree ("caravan_id","day_number");--> statement-breakpoint
CREATE INDEX "info_caravan_idx" ON "caravan_info_items" USING btree ("caravan_id","section","position");--> statement-breakpoint
CREATE UNIQUE INDEX "publications_caravan_version" ON "caravan_publications" USING btree ("caravan_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "caravans_slug_key" ON "caravans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "caravans_agency_idx" ON "caravans" USING btree ("agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cultural_contents_dest_locale_key" ON "cultural_contents" USING btree ("destination_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "hebrew_slug_key" ON "hebrew_expressions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "hebrew_category_idx" ON "hebrew_expressions" USING btree ("category","position");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_code_key" ON "participant_access" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "participant_caravan_idx" ON "participant_access" USING btree ("caravan_id","status");--> statement-breakpoint
CREATE INDEX "devices_access_idx" ON "participant_devices" USING btree ("access_id");--> statement-breakpoint
CREATE UNIQUE INDEX "badges_slug_key" ON "passport_badges" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stops_day_idx" ON "stops" USING btree ("day_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree (lower("email"));