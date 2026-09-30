/* Quem é o dono do curso.
 * ─────────────────────────────────────────────────────────────────────────
 * As contas listadas em `ADMIN_EMAILS` (wrangler.toml [vars], separadas por
 * vírgula). É o que abre o painel de /admin: a gravação das pronúncias
 * (api/audio.js), os depoimentos, as estatísticas e a marca. Uma conta
 * comum recebe 403 em toda rota de administrador, com sessão válida ou não.
 *
 * ── o segundo fator (30/09/2026) ─────────────────────────────────────────
 * A senha sozinha abria tudo isso - inclusive o e-mail dos alunos nos
 * depoimentos e o identificador de cópias. Agora a rota de administrador
 * pede, além da sessão, o cookie `__Host-hf_admin`, que só nasce depois de
 * a pessoa digitar o código de seis dígitos mandado ao e-mail da conta
 * (api/admin-codigo.js). Ele vale 12 horas e fica PRESO à sessão: mesma
 * conta, mesma versão de sessão (trocar a senha ou sair derruba) e mesmo
 * aparelho. Sem ele a resposta é 403 `admin-codigo`, que o painel entende
 * como "peça o código", e não como "esta conta não é administradora".
 */

import { fail, notSignedIn } from './http.js';
import { normalizeEmail } from './db.js';
import { b64url, b64urlDecode, hmacB64, timingSafeEqual } from './crypto.js';
import { readSession } from './session.js';
import { requireAccount } from '../api/auth.js';

export function isAdmin(account, env) {
  if (!account || !account.email) return false;
  const lista = String(env.ADMIN_EMAILS || '')
    .split(',').map(normalizeEmail).filter(Boolean);
  return lista.includes(normalizeEmail(account.email));
}

const COOKIE = '__Host-hf_admin';
export const ADMIN_HORAS = 12;
const enc = new TextEncoder();

/** O cookie do segundo fator para esta sessão (já conferida). */
export async function cookieDeAdmin(env, sess) {
  const payload = b64url(enc.encode(JSON.stringify({
    uid: sess.uid, sv: Number(sess.sv) || 0, ap: sess.ap || null,
    exp: Date.now() + ADMIN_HORAS * 3_600_000
  })));
  const sig = await hmacB64(env.SESSION_SECRET, 'admin:' + payload);
  return `${COOKIE}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${ADMIN_HORAS * 3600}`;
}

export const limparCookieDeAdmin = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

/** O segundo fator desta requisição confere com a sessão dela? */
export async function segundoFatorValido(request, env, sess) {
  if (!sess || !env.SESSION_SECRET) return false;
  const partes = (request.headers.get('Cookie') || '').split(/;\s*/)
    .filter(c => c.startsWith(COOKIE + '=') && c.length <= 512).slice(0, 8);
  for (const c of partes) {
    const val = c.slice(COOKIE.length + 1);
    const dot = val.lastIndexOf('.');
    if (dot < 0) continue;
    const payload = val.slice(0, dot), sig = val.slice(dot + 1);
    if (!timingSafeEqual(sig, await hmacB64(env.SESSION_SECRET, 'admin:' + payload))) continue;
    let d;
    try { d = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))); } catch { continue; }
    if (!d || typeof d.exp !== 'number' || d.exp < Date.now()) continue;
    if (d.uid === sess.uid && (Number(d.sv) || 0) === (Number(sess.sv) || 0) && (d.ap || null) === (sess.ap || null)) {
      return true;
    }
  }
  return false;
}

/** `{account}` para o administrador com o segundo fator em dia; `{erro}`
 *  com a resposta pronta para os outros. */
export async function exigirAdmin(request, env) {
  const account = await requireAccount(request, env);
  if (!account) return { erro: notSignedIn() };
  if (!isAdmin(account, env)) return { erro: fail('not-admin', 403) };
  const sess = await readSession(request, env);
  if (!await segundoFatorValido(request, env, sess)) return { erro: fail('admin-codigo', 403) };
  return { account };
}
