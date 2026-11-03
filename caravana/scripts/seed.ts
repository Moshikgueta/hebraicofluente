// Carrega a biblioteca cultural e recria a agencia de demonstracao.
import { closeDb } from '../src/lib/db/client';
import { withSystem } from '../src/lib/db/tenant';
import { seedDemo, seedLibrary } from '../src/lib/seed';

await withSystem(async (tx) => {
  await seedLibrary(tx);
  const demo = await seedDemo(tx);
  console.log(`Biblioteca carregada. Demonstracao: agencia ${demo.agencyId}, caravana ${demo.caravanId}.`);
});
await closeDb();
