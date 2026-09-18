/* Entrar, criar conta, sair, e quem sou eu.
 * ─────────────────────────────────────────────────────────────────────────
 * O que merece atenção aqui não é o caminho feliz.
 *
 * · Criar conta e entrar demoram O MESMO TEMPO quando o e-mail não existe.
 *   `fakeVerify` queima as mesmas 310.000 iterações. Sem isso, a diferença de
 *   tempo de resposta responde "esse endereço é cliente?" — e a mensagem de
 *   erro genérica, que existe justamente para não responder, vira decoração.
 *
 * · O freio conta por IP E por e-mail. Só por IP, uma rede grande inteira
 *   apanha junto; só por e-mail, um ataque distribuído passa por baixo.
 *
 * · Criar conta com um e-mail que já existe responde 'email-taken', e isso é
 *   uma escolha consciente: ela ENTREGA que o endereço tem conta. A
 *   alternativa (mandar um e-mail dizendo "alguém tentou criar conta com o
 *   seu endereço") exige uma fila de mensagens que esta plataforma ainda não
 *   tem, e a versão silenciosa — fingir que criou — deixaria o comprador numa
 *   conta que não é dele, no meio de um pagamento. Entre vazar a existência
 *   do endereço e perder uma compra, escolhemos o primeiro, e está escrito.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import { fakeVerify, hashPassword, PBKDF2_ITER, verifyPassword } from '../lib/crypto.js';
import { clearSessionCookie, makeSessionCookie, readSession } from '../lib/session.js';
import {
  activeEntitlements, createAccount, findAccountByEmail, findAccountById,
  log, normalizeEmail, throttled
} from '../lib/db.js';

const MIN_PASSWORD = 8;
const emailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());

const ip = request =>
  request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

/** O que o app recebe como sessão. Os direitos vêm do BANCO, sempre — o
 *  cookie não os carrega, justamente para que um estorno feche na hora. */
async function sessionBody(env, account) {
  return {
    account: {
      id: String(account.id),
      name: account.name || '',
      email: account.email,
      createdAt: new Date(account.created_at).toISOString()
    },
    entitlements: await activeEntitlements(env, account.id)
  };
}

export async function signup({ request, env }) {
  const body = await readJson(request);
  if (!body) return fail('server');

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const name = String(body.name || '').trim();

  if (!emailOk(email)) return fail('invalid-email');
  if (password.length < MIN_PASSWORD) return fail('weak-password');

  if (await throttled(env, `signup:${ip(request)}`, 10)) return fail('rate-limited', 429);

  const existing = await findAccountByEmail(env, email);
  if (existing) {
    await fakeVerify(password);          // mesmo custo do caminho que cria
    return fail('email-taken', 409);
  }

  const { hash, salt, iterations } = await hashPassword(password, null, PBKDF2_ITER);
  const account = await createAccount(env, { email, name, hash, salt, iterations });
  await log(env, account.id, 'signup', email);

  return json(await sessionBody(env, account), 200,
    { 'Set-Cookie': await makeSessionCookie(env, account) });
}

export async function login({ request, env }) {
  const body = await readJson(request);
  if (!body) return fail('server');

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  /* Dois freios. O de e-mail é mais apertado: mil tentativas contra UMA conta
     é o ataque que importa. */
  if (await throttled(env, `login:${ip(request)}`, 20)) return fail('rate-limited', 429);
  if (await throttled(env, `login:${email}`, 8)) return fail('rate-limited', 429);

  const account = await findAccountByEmail(env, email);
  const ok = account
    ? await verifyPassword(password, account.pass_salt, account.pass_hash, account.pass_iter)
    : await fakeVerify(password);

  if (!account || !ok) {
    await log(env, account ? account.id : null, 'login-failed', email);
    return fail('bad-credentials', 401);
  }

  return json(await sessionBody(env, account), 200,
    { 'Set-Cookie': await makeSessionCookie(env, account) });
}

export async function logout() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie });
}

export async function me({ request, env }) {
  const sess = await readSession(request, env);
  if (!sess) return notSignedIn();

  const account = await findAccountById(env, sess.uid);
  /* A conta sumiu, ou a versão de sessão foi subida (troca de senha, suspeita
     de vazamento). O cookie ainda tem assinatura válida e mesmo assim não
     vale mais — é para isto que `sv` existe. */
  if (!account || (Number(account.session_version) || 0) !== (Number(sess.sv) || 0)) {
    return json({ error: 'not-signed-in' }, 401, { 'Set-Cookie': clearSessionCookie });
  }

  return json(await sessionBody(env, account));
}

/** A conta desta requisição, ou null. Usado por tudo que exige sessão. */
export async function requireAccount(request, env) {
  const sess = await readSession(request, env);
  if (!sess) return null;
  const account = await findAccountById(env, sess.uid);
  if (!account || (Number(account.session_version) || 0) !== (Number(sess.sv) || 0)) return null;
  return account;
}
