/* O banco: todas as consultas num lugar só.
 * ─────────────────────────────────────────────────────────────────────────
 * Nenhum handler escreve SQL. Não é gosto por camada — é que duas dessas
 * funções decidem quem tem acesso ao curso, e regra de acesso espalhada por
 * seis arquivos é regra que diverge.
 *
 * Tudo aqui usa parâmetros ligados (`?`). Não existe uma única string de SQL
 * montada por concatenação neste arquivo, e não deve passar a existir.
 */

import { newId, PBKDF2_ITER } from './crypto.js';

const now = () => Date.now();

/* ── contas ─────────────────────────────────────────────────────────────── */

export const normalizeEmail = s => String(s || '').trim().toLowerCase();

export const findAccountByEmail = (env, email) =>
  env.DB.prepare('SELECT * FROM accounts WHERE email = ?').bind(normalizeEmail(email)).first();

export const findAccountById = (env, id) =>
  env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first();

export async function createAccount(env, { email, name, hash, salt, iterations }) {
  const mail = normalizeEmail(email);
  await env.DB.prepare(
    `INSERT INTO accounts (email, name, pass_hash, pass_salt, pass_iter, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(mail, String(name || '').trim().slice(0, 80), hash, salt,
         iterations || PBKDF2_ITER, now()).run();
  return findAccountByEmail(env, mail);
}

/** Regrava o hash da senha. Usado só pela re-hasheamento no login, quando o
 *  custo do PBKDF2 sobe — ver a nota em lib/crypto.js. */
export async function setPasswordHash(env, accountId, { hash, salt, iterations }) {
  await env.DB.prepare(
    'UPDATE accounts SET pass_hash = ?, pass_salt = ?, pass_iter = ? WHERE id = ?'
  ).bind(hash, salt, iterations, accountId).run();
}

/* ── direitos de acesso ─────────────────────────────────────────────────── */

/** Só os que ainda valem. Um direito vencido não é devolvido: nada acima
 *  deveria precisar saber a diferença entre "nunca teve" e "não tem mais". */
export async function activeEntitlements(env, accountId, at = now()) {
  const { results } = await env.DB.prepare(
    `SELECT course_slug, granted_at, expires_at, order_id
       FROM entitlements
      WHERE account_id = ? AND (expires_at IS NULL OR expires_at > ?)`
  ).bind(accountId, at).all();
  return (results || []).map(r => ({
    courseSlug: r.course_slug,
    grantedAt: new Date(r.granted_at).toISOString(),
    expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    orderId: r.order_id
  }));
}

export async function hasEntitlement(env, accountId, slug, at = now()) {
  const row = await env.DB.prepare(
    `SELECT 1 FROM entitlements
      WHERE account_id = ? AND course_slug = ? AND (expires_at IS NULL OR expires_at > ?)`
  ).bind(accountId, slug, at).first();
  return !!row;
}

/**
 * Concede (ou renova) o acesso.
 *
 * Renovar ESTENDE o que ainda vale, em vez de recomeçar a contagem: quem
 * renova com dois meses sobrando não pode perder esses dois meses por ter
 * pagado cedo. Se já venceu, conta a partir de hoje.
 */
export async function grantAccess(env, { accountId, courseSlug, orderId, months }) {
  const t = now();
  const current = await env.DB.prepare(
    'SELECT expires_at FROM entitlements WHERE account_id = ? AND course_slug = ?'
  ).bind(accountId, courseSlug).first();

  const from = current && current.expires_at && current.expires_at > t ? current.expires_at : t;
  const until = new Date(from);
  until.setMonth(until.getMonth() + (Number(months) || 12));

  await env.DB.prepare(
    `INSERT INTO entitlements (account_id, course_slug, granted_at, expires_at, order_id)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(account_id, course_slug)
       DO UPDATE SET expires_at = excluded.expires_at, order_id = excluded.order_id`
  ).bind(accountId, courseSlug, t, until.getTime(), orderId).run();

  await log(env, accountId, 'grant', `${courseSlug} até ${until.toISOString()} (${orderId})`);
  return until.getTime();
}

/** Usado por um estorno. Fecha a porta imediatamente — o cookie de sessão não
 *  carrega direito nenhum, então não há atraso de sete dias. */
export async function revokeAccess(env, accountId, courseSlug, why = '') {
  await env.DB.prepare(
    'DELETE FROM entitlements WHERE account_id = ? AND course_slug = ?'
  ).bind(accountId, courseSlug).run();
  await log(env, accountId, 'revoke', `${courseSlug} ${why}`.trim());
}

/* ── pedidos ────────────────────────────────────────────────────────────── */

export async function createOrder(env, o) {
  const id = newId('HF');
  await env.DB.prepare(
    `INSERT INTO orders (id, account_id, course_slug, amount_cents, currency, method,
                         installments, status, provider, created_at)
     VALUES (?, ?, ?, ?, 'BRL', ?, ?, 'pending', 'mercadopago', ?)`
  ).bind(id, o.accountId, o.courseSlug, o.amountCents, o.method,
         o.installments || 1, now()).run();
  return getOrder(env, id);
}

export const getOrder = (env, id) =>
  env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();

export const ordersOf = (env, accountId, limit = 50) =>
  env.DB.prepare(
    'SELECT * FROM orders WHERE account_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(accountId, limit).all().then(r => r.results || []);

export async function updateOrder(env, id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  /* Os nomes vêm de literais deste arquivo, nunca de entrada externa; os
     valores vão ligados. Uma lista branca explícita deixa isso verificável em
     vez de confiável. */
  const ALLOWED = new Set([
    'status', 'provider_ref', 'pay_url', 'pix_code', 'pix_expires_at', 'paid_at', 'checked_at'
  ]);
  const safe = keys.filter(k => ALLOWED.has(k));
  if (!safe.length) return;
  await env.DB.prepare(
    `UPDATE orders SET ${safe.map(k => `${k} = ?`).join(', ')} WHERE id = ?`
  ).bind(...safe.map(k => fields[k]), id).run();
}

/** Pendentes que já têm idade para valer uma pergunta ao provedor. */
export function stalePendingOrders(env, { olderThanMs = 60_000, limit = 25 } = {}) {
  return env.DB.prepare(
    `SELECT * FROM orders
      WHERE status = 'pending' AND created_at < ?
      ORDER BY created_at ASC LIMIT ?`
  ).bind(now() - olderThanMs, limit).all().then(r => r.results || []);
}

/* ── eventos de pagamento ───────────────────────────────────────────────── */

/**
 * Grava o que o provedor disse e responde se ESTE aviso é novo.
 *
 * `false` significa "já processado" — a Mercado Pago reenvia o mesmo aviso por
 * desenho, e sem esta trava um pedido poderia liberar acesso duas vezes.
 */
export async function recordEvent(env, { eventId, orderId, status, raw, source }) {
  try {
    await env.DB.prepare(
      `INSERT INTO payment_events (event_id, order_id, status, raw, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(String(eventId), orderId || null, status || null,
           JSON.stringify(raw).slice(0, 8000), source, now()).run();
    return true;
  } catch {
    /* Violação do UNIQUE: aviso repetido. Não é erro, é o caso normal. */
    return false;
  }
}

/* ── freio ──────────────────────────────────────────────────────────────── */

/**
 * Verdadeiro quando a chave estourou o limite nesta janela de um minuto.
 *
 * Contagem simples, e de propósito: um freio exato exigiria coordenação, e o
 * que este precisa impedir é uma máquina tentando mil senhas — não um humano
 * digitando errado três vezes.
 */
export async function throttled(env, key, limit = 10) {
  const window_at = Math.floor(now() / 60_000);
  await env.DB.prepare(
    `INSERT INTO throttle (key, window_at, hits) VALUES (?, ?, 1)
     ON CONFLICT(key, window_at) DO UPDATE SET hits = hits + 1`
  ).bind(key, window_at).run();
  const row = await env.DB.prepare(
    'SELECT hits FROM throttle WHERE key = ? AND window_at = ?'
  ).bind(key, window_at).first();
  /* Limpeza oportunista: sem ela a tabela cresce para sempre, e um cron só
     para isso seria um cron a mais para manter. */
  if (row && row.hits === 1) {
    await env.DB.prepare('DELETE FROM throttle WHERE window_at < ?')
      .bind(window_at - 10).run();
  }
  return !!row && row.hits > limit;
}

/* ── trilha ─────────────────────────────────────────────────────────────── */

export async function log(env, accountId, action, detail = '') {
  try {
    await env.DB.prepare(
      'INSERT INTO access_log (account_id, action, detail, created_at) VALUES (?, ?, ?, ?)'
    ).bind(accountId || null, action, String(detail).slice(0, 500), now()).run();
  } catch {
    /* A trilha nunca derruba a operação que ela registra. */
  }
}
