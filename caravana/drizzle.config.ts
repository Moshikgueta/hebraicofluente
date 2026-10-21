import { defineConfig } from 'drizzle-kit';

// So gera SQL a partir de src/lib/db/schema.ts. Quem aplica e scripts/migrate.ts,
// que usa o mesmo migrador no PGlite (local) e no Postgres (producao).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './db/migrations',
});
