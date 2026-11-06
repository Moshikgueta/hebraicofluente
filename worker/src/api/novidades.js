/* A lista de quem quer saber quando o próximo curso abrir.
 * ─────────────────────────────────────────────────────────────────────────
 * A landing dizia "alunos da Alfabetização são avisados primeiro quando o A1
 * abre", e a política dizia "não mandamos e-mail de propaganda" - sem
 * consentimento, sem jeito de sair (auditoria de 28/09/2026, LEGAL-019).
 *
 * Agora é uma escolha da pessoa, e só dela:
 *
 *   · ENTRAR: a caixa "Quero receber um e-mail quando o Hebraico A1 abrir",
 *     no perfil. Começa desmarcada. Nenhum outro caminho põe alguém na lista.
 *   · SAIR: a mesma caixa, ou o link de todo e-mail da lista, que funciona
 *     sem entrar na conta. O link abre /sair-da-lista, e é a PÁGINA que manda
 *     o POST: clientes de e-mail abrem os links sozinhos para gerar prévia, e
 *     um GET que descadastrasse tiraria gente da lista sem ela pedir.
 *   · APAGAR A CONTA tira da lista (lib/db.js, deleteAccount).
 *
 * O link de saída leva o id da conta e uma assinatura HMAC com prefixo de
 * domínio próprio ('novidades:'), então não serve para nada além disto e não
 * expira: um e-mail velho continua sabendo tirar a pessoa da lista.
 *
 * QUEM MANDA o e-mail do lançamento ainda não existe, porque o A1 ainda não
 * existe. Quando existir: a lista é `SELECT a.email, a.name, a.id FROM
 * novidades n JOIN accounts a ON a.id = n.account_id`, e cada mensagem leva
 * `await linkDeSaida(env, id)` no corpo e nos cabeçalhos List-Unsubscribe.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { hmacB64, timingSafeEqual } from '../lib/crypto.js';
import { log, novidadesMarcar, throttled } from '../lib/db.js';
import { requireAccount } from './auth.js';

const assinatura = (env, id) => hmacB64(env.SESSION_SECRET, `novidades:${id}`);

export async function tokenDeSaida(env, accountId) {
  return `${accountId}.${await assinatura(env, accountId)}`;
}

export async function linkDeSaida(env, accountId) {
  const origem = String(env.SITE_ORIGIN || '').replace(/\/+$/, '');
  return `${origem}/sair-da-lista/?t=${encodeURIComponent(await tokenDeSaida(env, accountId))}`;
}

/** PUT /api/novidades {quero: boolean} - a caixa do perfil. */
export async function marcar({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  const body = await readJson(request);
  if (!body || typeof body.quero !== 'boolean') return fail('bad-request');
  if (await throttled(env, `novidades:${account.id}`, 20, 60_000)) return fail('rate-limited', 429);
  await novidadesMarcar(env, account.id, body.quero);
  await log(env, account.id, body.quero ? 'novidades-sim' : 'novidades-nao', 'perfil');
  return json({ ok: true, novidades: body.quero });
}

/** POST /api/novidades/sair {t} - o link do e-mail, sem precisar entrar.
 *
 *  Não é freado por IP: sair de uma lista nunca pode esbarrar num "tente mais
 *  tarde". A assinatura já barra quem tenta tirar outra pessoa. */
export async function sair({ request, env }) {
  const body = await readJson(request);
  const t = body && typeof body.t === 'string' ? body.t : '';
  const m = /^(\d{1,12})\.([A-Za-z0-9_-]{20,})$/.exec(t);
  if (!m || !env.SESSION_SECRET) return fail('link-invalido');
  const id = Number(m[1]);
  if (!timingSafeEqual(m[2], await assinatura(env, id))) return fail('link-invalido');
  await novidadesMarcar(env, id, false);
  await log(env, id, 'novidades-nao', 'link do e-mail');
  return json({ ok: true });
}
