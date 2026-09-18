/* Supabase adapter — WRITTEN, NOT CONNECTED.
 *
 * There is no Supabase project provisioned for this app: creating one needs
 * your credentials. So this file exists to make the swap a one-line change
 * rather than a rewrite, and it is deliberately inert:
 *
 *   · `supabaseConfigured()` is false without the two env vars, and
 *     `createStore()` in ./store.ts falls back to localStorage;
 *   · the table shape it expects is in supabase/schema.sql, with RLS;
 *   · @supabase/supabase-js is NOT a dependency yet, so the client is created
 *     through a dynamic import that is only reached when the env vars exist.
 *
 * To turn it on: add the package, set the two env vars, run schema.sql. */

import { EMPTY_STATE, type LearnerState, type ProgressStore } from './types';
import { migrate } from './migrate';

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = (): boolean => Boolean(URL_ENV && KEY_ENV);

type MinimalClient = {
  auth: { getUser(): Promise<{ data: { user: { id: string } | null } }> };
  from(table: string): {
    select(cols: string): {
      eq(col: string, val: string): { maybeSingle(): Promise<{ data: { state: LearnerState } | null }> };
    };
    upsert(row: Record<string, unknown>, opts?: Record<string, unknown>): Promise<{ error: unknown }>;
    delete(): { eq(col: string, val: string): Promise<{ error: unknown }> };
  };
};

export class SupabaseProgressStore implements ProgressStore {
  #client: MinimalClient | null = null;

  async #get(): Promise<MinimalClient | null> {
    if (!supabaseConfigured()) return null;
    if (this.#client) return this.#client;
    /* The specifier is built at runtime on purpose: @supabase/supabase-js is
       not a dependency of this app yet, and a literal import would make the
       type-checker and the bundler both demand a package nobody has installed.
       This path is unreachable until the env vars exist. */
    const spec = ['@supabase', 'supabase-js'].join('/');
    const mod = (await import(/* webpackIgnore: true */ spec)) as {
      createClient(url: string, key: string): MinimalClient;
    };
    this.#client = mod.createClient(URL_ENV!, KEY_ENV!);
    return this.#client;
  }

  async #userId(): Promise<string | null> {
    const c = await this.#get();
    if (!c) return null;
    const { data } = await c.auth.getUser();
    return data.user?.id ?? null;
  }

  async load(): Promise<LearnerState> {
    const c = await this.#get();
    const uid = await this.#userId();
    if (!c || !uid) return EMPTY_STATE;
    const { data } = await c.from('learner_state').select('state').eq('user_id', uid).maybeSingle();
    /* Through the same migration as localStorage: a row written by an older
       build of the app is exactly the case migrate() exists for. */
    return data?.state ? migrate(data.state) : EMPTY_STATE;
  }

  async save(state: LearnerState): Promise<void> {
    const c = await this.#get();
    const uid = await this.#userId();
    if (!c || !uid) return;
    await c.from('learner_state').upsert(
      { user_id: uid, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }

  async clear(): Promise<void> {
    const c = await this.#get();
    const uid = await this.#userId();
    if (!c || !uid) return;
    await c.from('learner_state').delete().eq('user_id', uid);
  }
}
