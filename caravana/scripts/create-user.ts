// Cria uma conta de equipe e imprime o link para definir a senha.
//
//   npm run user:create -- --email voce@exemplo.com --name "Seu Nome" --platform
//   npm run user:create -- --email x@agencia.com --name "Fulana" --agency slug-da-agencia --role admin
//
// Nenhuma senha passa pela linha de comando: quem recebe o link escolhe a sua.
import { parseArgs } from 'node:util';
import { eq } from 'drizzle-orm';
import { createUser, type Role } from '../src/lib/auth/sessions';
import { closeDb } from '../src/lib/db/client';
import { agencies, users } from '../src/lib/db/schema';
import { withSystem } from '../src/lib/db/tenant';
import { publicUrl } from '../src/lib/env';

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' }, platform: { type: 'boolean' }, agency: { type: 'string' }, role: { type: 'string' } },
});
if (!values.email || !values.name || (!values.platform && !values.agency)) {
  console.error('Uso: --email E --name N (--platform | --agency SLUG [--role owner|admin|editor|viewer])');
  process.exit(1);
}
const role = (values.role ?? 'admin') as Role;
if (!['owner', 'admin', 'editor', 'viewer'].includes(role)) {
  console.error('Papel invalido.');
  process.exit(1);
}
const token = await withSystem(async (tx) => {
  let agencyId: string | undefined;
  if (values.agency) {
    const [ag] = await tx.select().from(agencies).where(eq(agencies.slug, values.agency));
    if (!ag) throw new Error(`Agencia ${values.agency} nao existe.`);
    if (ag.isDemo) throw new Error('A agencia de demonstracao nao recebe contas.');
    agencyId = ag.id;
  }
  const { userId, setupToken } = await createUser(tx, { email: values.email!, name: values.name!, isPlatformAdmin: values.platform, agencyId, role });
  if (values.platform) await tx.update(users).set({ isPlatformAdmin: true }).where(eq(users.id, userId));
  return setupToken;
});
console.log(`Conta pronta. Link para definir a senha (vale uma vez, por 3 dias):\n${publicUrl()}/definir-senha?token=${token}`);
await closeDb();
