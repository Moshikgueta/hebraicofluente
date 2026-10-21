// Apaga o banco LOCAL (PGlite em .data/). Recusa se DATABASE_URL existir:
// nunca apaga um Postgres de verdade.
import { rmSync } from 'node:fs';
import path from 'node:path';

if (process.env.DATABASE_URL) {
  console.error('DATABASE_URL definido: reset-local so apaga o PGlite local.');
  process.exit(1);
}
const dir = process.env.MCD_PGLITE_DIR ?? path.join(process.cwd(), '.data', 'pglite');
rmSync(dir, { recursive: true, force: true });
console.log(`Banco local apagado: ${dir}`);
