/* A licença do e-book Israel Além do Roteiro (22/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * A versão web do livro (/israel/) é uma página estática: não passa pelo app
 * e não tem a sessão em memória. Para pôr a marca d'água na margem, como nas
 * aulas (components/shell/MarcaDagua.tsx), ela pede aqui o e-mail da conta,
 * parcialmente escondido, e o número da cópia: o mesmo número da marca
 * invisível do curso (lib/marca.js), que o painel /admin/marca reconhece.
 * Num print compartilhado vai o número, que só o dono liga à conta.
 *
 * Só responde a quem tem o direito do livro. Escreve no máximo uma linha por
 * conta em toda a vida dela (a marca, criada no primeiro pedido), e por isso
 * não tem freio próprio.
 */

import { notSignedIn, fail, json } from '../lib/http.js';
import { requireAccount } from './auth.js';
import { hasEntitlement } from '../lib/db.js';
import { marcaDaConta } from '../lib/marca.js';

export const LIVRO = 'israel-alem-do-roteiro';

/** O começo do e-mail e o domínio, como na marca d'água das aulas
 *  (app/src/lib/marca-dagua.ts). */
export function mascarar(email) {
  const [local = '', dominio = ''] = String(email || '').split('@');
  return `${local.slice(0, 2)}•••@${dominio}`;
}

export async function licenca({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  if (!await hasEntitlement(env, account.id, LIVRO)) return fail('not-owned', 403);
  const marca = await marcaDaConta(env, account.id);
  return json({ email: mascarar(account.email), copia: marca ? marca.toUpperCase() : null });
}
