/* O lembrete para estudar: entrar e sair (28/10/2026, pedido do dono: "faz
 * tudo", item 6).
 * ─────────────────────────────────────────────────────────────────────────
 * Só existe com `privacidade.lembreteDeEstudo: true` em data/empresa.json, o
 * mesmo arquivo que o site lê para mostrar a caixa do perfil e o parágrafo da
 * Política de Privacidade. Desligado, as duas rotas respondem 404, o /api/me
 * não fala do lembrete e a varredura não manda nada (lembrete.js).
 *
 * Mesmo desenho da lista de novidades (api/novidades.js):
 *   · ENTRAR: a caixa do perfil, desmarcada. Nenhum outro caminho.
 *   · SAIR: a mesma caixa, ou o link de todo lembrete, sem entrar na conta.
 *     O link abre /sair-da-lista e é a página que manda o POST (cliente de
 *     e-mail abre link sozinho para gerar prévia).
 *   · APAGAR A CONTA apaga o pedido (lib/db.js, deleteAccount).
 *
 * O token de saída começa com `l` e tem a assinatura com prefixo próprio
 * ('lembrete:'): não serve para a lista de novidades nem para a de
 * interessados, e não expira.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { hmacB64, timingSafeEqual } from '../lib/crypto.js';
import { lembreteMarcar, log, throttled } from '../lib/db.js';
import { ip, requireAccount } from './auth.js';
import empresa from '../../../data/empresa.json';

/** A chave única do lembrete. Ver o `_notaLembrete` em data/empresa.json. */
export const lembreteLigado = () => !!(empresa.privacidade && empresa.privacidade.lembreteDeEstudo === true);

const assinatura = (env, id) => hmacB64(env.SESSION_SECRET, `lembrete:${id}`);

export async function tokenDeSaida(env, accountId) {
  return `l${accountId}.${await assinatura(env, accountId)}`;
}

export async function linkDeSaida(env, accountId, origem) {
  const base = String(origem || env.SITE_ORIGIN || '').replace(/\/+$/, '');
  return `${base}/sair-da-lista/?t=${encodeURIComponent(await tokenDeSaida(env, accountId))}`;
}

const desligado = () => fail('not-found', 404);

/** PUT /api/lembrete {quero: boolean} - a caixa do perfil. */
export async function marcar({ request, env }) {
  if (!lembreteLigado()) return desligado();
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();
  const body = await readJson(request);
  if (!body || typeof body.quero !== 'boolean') return fail('bad-request');
  /* O teto da hora por endereço vem antes do freio do minuto por conta:
     conta é de graça, e quem quer gastar a cota cria mais contas. */
  if (await throttled(env, `lembrete-ip-h:${ip(request)}`, 20, 3_600_000)) return fail('rate-limited', 429);
  if (await throttled(env, `lembrete:${account.id}`, 20, 60_000)) return fail('rate-limited', 429);
  await lembreteMarcar(env, account.id, body.quero);
  await log(env, account.id, body.quero ? 'lembrete-sim' : 'lembrete-nao', 'perfil');
  return json({ ok: true, lembrete: body.quero });
}

/** POST /api/lembrete/sair {t} - o link do e-mail, sem precisar entrar.
 *
 *  Funciona mesmo com o lembrete desligado: um e-mail velho sempre sabe
 *  tirar a pessoa. Sem freio por IP, pelo mesmo motivo de novidades.sair. */
export async function sair({ request, env }) {
  const body = await readJson(request);
  const t = body && typeof body.t === 'string' ? body.t : '';
  const m = /^l(\d{1,12})\.([A-Za-z0-9_-]{20,})$/.exec(t);
  if (!m || !env.SESSION_SECRET) return fail('link-invalido');
  const id = Number(m[1]);
  if (!timingSafeEqual(m[2], await assinatura(env, id))) return fail('link-invalido');
  await lembreteMarcar(env, id, false);
  await log(env, id, 'lembrete-nao', 'link do e-mail');
  return json({ ok: true });
}
