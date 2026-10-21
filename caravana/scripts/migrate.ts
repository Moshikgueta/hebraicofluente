// Aplica as migracoes de db/migrations. Local (PGlite): getDb() ja migra ao
// abrir. Producao (DATABASE_URL): este script e o unico caminho, rodado por
// quem tem a credencial da dona do banco.
import { closeDb, getDb, MIGRATIONS_DIR } from '../src/lib/db/client';

const db = await getDb();
if (process.env.DATABASE_URL) {
  const { migrate } = await import('drizzle-orm/postgres-js/migrator');
  await migrate(db as never, { migrationsFolder: MIGRATIONS_DIR });
}
console.log('Migracoes aplicadas.');
await closeDb();
