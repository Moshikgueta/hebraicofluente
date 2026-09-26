/* Quem é o dono do curso.
 * ─────────────────────────────────────────────────────────────────────────
 * As contas listadas em `ADMIN_EMAILS` (wrangler.toml [vars], separadas por
 * vírgula). É o que abre os painéis de /admin: a gravação das pronúncias
 * (api/audio.js) e os relatos de erro dos alunos (api/relatos.js). Uma conta
 * comum recebe 403 em toda rota de administrador, com sessão válida ou não.
 */

import { fail, notSignedIn } from './http.js';
import { normalizeEmail } from './db.js';
import { requireAccount } from '../api/auth.js';

export function isAdmin(account, env) {
  if (!account || !account.email) return false;
  const lista = String(env.ADMIN_EMAILS || '')
    .split(',').map(normalizeEmail).filter(Boolean);
  return lista.includes(normalizeEmail(account.email));
}

/** `{account}` para o administrador; `{erro}` com a resposta pronta para os outros. */
export async function exigirAdmin(request, env) {
  const account = await requireAccount(request, env);
  if (!account) return { erro: notSignedIn() };
  if (!isAdmin(account, env)) return { erro: fail('not-admin', 403) };
  return { account };
}
