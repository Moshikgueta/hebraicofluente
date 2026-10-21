// Conexao com o Postgres.
//
//   DATABASE_URL=postgres://...  Postgres de verdade (producao; no Workers, via Hyperdrive)
//   MCD_DB=memory                PGlite em memoria (testes)
//   nada                         PGlite gravado em .data/pglite (desenvolvimento)
//
// PGlite e o proprio Postgres compilado para WebAssembly: as mesmas politicas de
// RLS, gatilhos e papeis rodam aqui e em producao. Ele aceita uma conexao so,
// entao a instancia mora em globalThis (o Next carrega este modulo mais de uma
// vez em desenvolvimento, e dois PGlite no mesmo diretorio corrompem os dados).

import path from 'node:path';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

type Holder = { promise?: Promise<Db> };
const holder: Holder = ((globalThis as Record<string, unknown>).__mcdDb ??= {}) as Holder;

export const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');

export function getDb(): Promise<Db> {
  holder.promise ??= connect().catch((err) => {
    holder.promise = undefined;
    throw err;
  });
  return holder.promise;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const client = postgres(url, { max: Number(process.env.MCD_DB_POOL ?? 5), prepare: false });
    return drizzle(client, { schema }) as unknown as Db;
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const memory = process.env.MCD_DB === 'memory';
  const dataDir = memory ? undefined : (process.env.MCD_PGLITE_DIR ?? path.join(process.cwd(), '.data', 'pglite'));
  if (dataDir) await lockDataDir(dataDir);
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  // Local: as migracoes rodam sozinhas. Em producao so pelo script, por quem
  // tem a senha da dona do banco.
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db as unknown as Db;
}

// Dois processos no mesmo diretorio do PGlite corrompem o banco (ex.: o
// servidor de desenvolvimento aberto e um script de carga ao mesmo tempo).
// A trava guarda o pid de quem abriu e recusa um segundo processo vivo.
async function lockDataDir(dataDir: string) {
  const fs = await import('node:fs');
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const lock = `${dataDir}.lock`;
  try {
    const pid = Number(fs.readFileSync(lock, 'utf8'));
    if (pid && pid !== process.pid) {
      let alive = true;
      try {
        process.kill(pid, 0);
      } catch {
        alive = false;
      }
      if (alive) throw new Error(`O banco local (${dataDir}) esta aberto pelo processo ${pid}. Pare o "npm run dev" antes de rodar este comando.`);
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  fs.writeFileSync(lock, String(process.pid));
  process.once('exit', () => {
    try {
      if (fs.readFileSync(lock, 'utf8') === String(process.pid)) fs.unlinkSync(lock);
    } catch {
      /* ja saiu */
    }
  });
}

// Para testes e scripts: solta a conexao atual.
export async function closeDb(): Promise<void> {
  const p = holder.promise;
  holder.promise = undefined;
  if (!p) return;
  const db = (await p) as unknown as { $client?: { close?: () => Promise<void>; end?: () => Promise<void> } };
  await db.$client?.close?.();
  await db.$client?.end?.();
}
