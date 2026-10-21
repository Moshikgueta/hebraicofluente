// O unico jeito de falar com o banco nas regras de negocio.
//
// Cada chamada abre uma transacao, troca para o papel do escopo e grava a
// agencia, a caravana e o participante em `app.*`. As politicas de RLS
// (db/migrations/0001_security.sql) leem dali. Uma consulta que esqueca o
// filtro por agencia volta vazia em vez de vazar dados de outra agencia.

import { sql } from 'drizzle-orm';
import { getDb, type Db } from './client';

export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export type Scope =
  | { kind: 'platform'; userId: string }
  | { kind: 'agency'; agencyId: string; userId: string }
  | { kind: 'participant'; agencyId: string; caravanId: string; accessId: string };

const ROLE: Record<Scope['kind'], string> = {
  platform: 'mcd_platform',
  agency: 'mcd_agency',
  participant: 'mcd_participant',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function withScope<T>(scope: Scope, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const agencyId = scope.kind === 'platform' ? '' : scope.agencyId;
  const caravanId = scope.kind === 'participant' ? scope.caravanId : '';
  const accessId = scope.kind === 'participant' ? scope.accessId : '';
  for (const v of [agencyId, caravanId, accessId]) {
    if (v && !UUID.test(v)) throw new Error('escopo invalido');
  }
  const db = await getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.agency_id', ${agencyId}, true),
      set_config('app.caravan_id', ${caravanId}, true),
      set_config('app.access_id', ${accessId}, true)`);
    await tx.execute(sql.raw(`set local role ${ROLE[scope.kind]}`));
    return fn(tx);
  });
}

// Sem papel: so para autenticacao (sessao, convite, freio) e para os scripts
// de manutencao. Codigo de pagina nao chama isto.
export async function withSystem<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction(fn);
}

// Os gatilhos levantam 'mcd:<codigo>'. Aqui o codigo vira algo que a tela entende.
export function dbErrorCode(err: unknown): string | null {
  let e: unknown = err;
  for (let i = 0; i < 5 && e; i++) {
    const msg = (e as { message?: string }).message ?? '';
    const m = /mcd:([a-z_]+)/.exec(msg);
    if (m) return m[1] ?? null;
    if (/permission denied|row-level security/i.test(msg)) return 'forbidden';
    e = (e as { cause?: unknown }).cause;
  }
  return null;
}
