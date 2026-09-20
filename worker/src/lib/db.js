/* O banco: todas as consultas num lugar só.
 * ─────────────────────────────────────────────────────────────────────────
 * Nenhum handler escreve SQL. Não é gosto por camada - é que duas dessas
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

/** Regrava o hash da senha, sem mexer em mais nada. Usado pelo re-hasheamento
 *  do login, quando o custo do PBKDF2 sobe - ver a nota em lib/crypto.js. */
export async function setPasswordHash(env, accountId, { hash, salt, iterations }) {
  await env.DB.prepare(
    'UPDATE accounts SET pass_hash = ?, pass_salt = ?, pass_iter = ? WHERE id = ?'
  ).bind(hash, salt, iterations, accountId).run();
}

/**
 * Troca a senha DE VERDADE: grava o hash novo e derruba toda sessão aberta.
 *
 * O `session_version + 1` é a metade que se esquece. Trocar a senha porque
 * alguém entrou na conta e não expulsar esse alguém é não ter trocado nada -
 * o cookie dele continua assinado e válido por até sete dias. Quem troca a
 * senha recebe um cookie novo na mesma resposta; todo o resto cai.
 *
 * É uma consulta só, e os dois campos andam juntos por isso: separados, um
 * `await` entre eles é uma janela em que a senha é nova e a sessão é velha.
 */
export async function changePassword(env, accountId, { hash, salt, iterations }) {
  await env.DB.prepare(
    `UPDATE accounts
        SET pass_hash = ?, pass_salt = ?, pass_iter = ?,
            session_version = session_version + 1
      WHERE id = ?`
  ).bind(hash, salt, iterations, accountId).run();
  /* Um pedido de recuperação que ainda não foi usado deixa de valer aqui.
     Sem isto, um link pedido por um invasor continuaria de pé depois de o
     dono trocar a senha - que é justamente a hora em que ele não pode
     continuar. */
  await resetInvalidateAll(env, accountId);
  return findAccountById(env, accountId);
}

/* ── recuperação de senha ───────────────────────────────────────────────── */

/**
 * Registra um pedido. Recebe o HASH do token, nunca o token.
 *
 * Os pedidos anteriores da conta morrem aqui: pedir de novo invalida o link
 * anterior. É o que a pessoa espera de "não chegou, mandei outro" - e fecha a
 * janela em que três links válidos circulam por caixas de entrada diferentes.
 */
export async function resetCreate(env, { accountId, tokenHash, ttlMs, ip }) {
  const t = now();
  await resetInvalidateAll(env, accountId);
  await env.DB.prepare(
    `INSERT INTO password_resets (token_hash, account_id, created_at, expires_at, request_ip)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(tokenHash, accountId, t, t + ttlMs, String(ip || '').slice(0, 60)).run();
  return t + ttlMs;
}

/** O pedido, se ele existe. Vencido ou usado vem do mesmo jeito - quem chama
 *  decide, e os dois casos respondem igual para quem está do outro lado. */
export const resetFind = (env, tokenHash) =>
  env.DB.prepare(
    `SELECT token_hash, account_id, created_at, expires_at, used_at
       FROM password_resets WHERE token_hash = ?`
  ).bind(tokenHash).first();

/**
 * Consome o pedido, e responde se ELE ainda estava lá para ser consumido.
 *
 * O `used_at IS NULL` dentro do UPDATE é o que torna isso uma operação só.
 * Conferir antes e marcar depois deixa uma janela entre as duas em que dois
 * cliques simultâneos no mesmo link passam os dois - e o segundo troca a
 * senha de novo, depois de o primeiro já ter entrado.
 */
export async function resetUse(env, tokenHash, at = now()) {
  const r = await env.DB.prepare(
    `UPDATE password_resets SET used_at = ?
      WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`
  ).bind(at, tokenHash, at).run();
  return !!(r.meta && r.meta.changes);
}

/** Derruba os pedidos abertos da conta. Chamado ao criar um novo e ao trocar
 *  a senha por qualquer caminho. */
export async function resetInvalidateAll(env, accountId, at = now()) {
  await env.DB.prepare(
    'UPDATE password_resets SET used_at = ? WHERE account_id = ? AND used_at IS NULL'
  ).bind(at, accountId).run();
}

/** Faxina dos vencidos. Roda junto com a varredura de pagamentos - um cron a
 *  mais só para isto seria um cron a mais para manter. */
export async function resetPurge(env, at = now()) {
  await env.DB.prepare('DELETE FROM password_resets WHERE expires_at < ?')
    .bind(at - 7 * 86_400_000).run();
}

/**
 * Faxina da trilha. Cento e oitenta dias, e depois some.
 *
 * A trilha existe para responder "o que aconteceu com esta conta" na semana
 * em que alguém pergunta - não para guardar, para sempre, cada login que
 * falhou e cada aviso de webhook recusado. Uma tabela que só cresce é a que
 * vira o maior arquivo de dados pessoais do sistema sem ninguém decidir isso,
 * e é a que qualquer um pode encher de graça pela rota do webhook.
 */
export async function logPurge(env, at = now()) {
  await env.DB.prepare('DELETE FROM access_log WHERE created_at < ?')
    .bind(at - 180 * 86_400_000).run();
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

/** Usado por um estorno. Fecha a porta imediatamente - o cookie de sessão não
 *  carrega direito nenhum, então não há atraso de sete dias. */
export async function revokeAccess(env, accountId, courseSlug, why = '') {
  await env.DB.prepare(
    'DELETE FROM entitlements WHERE account_id = ? AND course_slug = ?'
  ).bind(accountId, courseSlug).run();
  await log(env, accountId, 'revoke', `${courseSlug} ${why}`.trim());
}

/* ── convites ───────────────────────────────────────────────────────────── */

/** Registra (ou atualiza) um convite. Vale mesmo sem conta existir ainda. */
export async function inviteCreate(env, { email, courseSlug, months, note }) {
  await env.DB.prepare(
    `INSERT INTO invites (email, course_slug, months, note, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email, course_slug) DO UPDATE SET
       months = excluded.months, note = excluded.note,
       created_at = excluded.created_at, used_at = NULL`
  ).bind(normalizeEmail(email), courseSlug, Number(months) || 12,
         String(note || '').slice(0, 200), now()).run();
}

/**
 * Transforma em acesso todos os convites pendentes deste e-mail.
 *
 * Chamado no cadastro, e de novo no login - o segundo é a rede de segurança
 * para quem já tinha conta quando o convite foi criado. As duas chamadas são
 * seguras de repetir: `used_at` faz o convite valer uma vez só.
 *
 * Nunca derruba o cadastro: um presente que falha não pode impedir alguém de
 * criar a conta. Por isso o try, e por isso ele devolve quantos aplicou em vez
 * de lançar.
 */
export async function inviteRedeem(env, accountId, email) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT course_slug, months FROM invites WHERE email = ? AND used_at IS NULL'
    ).bind(normalizeEmail(email)).all();

    let n = 0;
    for (const row of results || []) {
      await grantAccess(env, {
        accountId, courseSlug: row.course_slug,
        orderId: 'CONVITE', months: row.months
      });
      await env.DB.prepare(
        'UPDATE invites SET used_at = ? WHERE email = ? AND course_slug = ?'
      ).bind(now(), normalizeEmail(email), row.course_slug).run();
      n++;
    }
    if (n) await log(env, accountId, 'convite-usado', `${n} curso(s)`);
    return n;
  } catch {
    return 0;
  }
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
 * `false` significa "já processado" - a Mercado Pago reenvia o mesmo aviso por
 * desenho, e sem esta trava um pedido poderia liberar acesso duas vezes.
 */
export async function recordEvent(env, { eventId, orderId, status, raw, source }) {
  try {
    await env.DB.prepare(
      `INSERT INTO payment_events (event_id, order_id, status, raw, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(String(eventId), orderId || null, status || null,
           JSON.stringify(enxuto(raw)).slice(0, 8000), source, now()).run();
    return true;
  } catch {
    /* Violação do UNIQUE: aviso repetido. Não é erro, é o caso normal. */
    return false;
  }
}

/**
 * O que do pagamento vale a pena guardar.
 *
 * O objeto inteiro que a Mercado Pago devolve traz o e-mail do pagador, o
 * CPF dele e, num cartão, o nome do titular e os primeiros e últimos dígitos.
 * Nada disso é lido por ninguém aqui - a liberação usa status, valor, moeda
 * e referência - e guardá-lo para sempre numa tabela sem faxina é um dossiê
 * de identidade esperando um vazamento. Fica só o que responde "o que a
 * Mercado Pago disse sobre este pagamento", que é o propósito da tabela.
 */
const GUARDAR = [
  'id', 'status', 'status_detail', 'transaction_amount', 'currency_id',
  'external_reference', 'date_created', 'date_approved', 'payment_method_id',
  'payment_type_id', 'live_mode'
];
export function enxuto(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  return Object.fromEntries(GUARDAR.filter(k => k in raw).map(k => [k, raw[k]]));
}

/* ── freio ──────────────────────────────────────────────────────────────── */

/**
 * Verdadeiro quando a chave estourou o limite nesta janela de um minuto.
 *
 * Contagem simples, e de propósito: um freio exato exigiria coordenação, e o
 * que este precisa impedir é uma máquina tentando mil senhas - não um humano
 * digitando errado três vezes.
 */
export async function throttled(env, key, limit = 10, janelaMs = 60_000) {
  /* `window_at` é o INÍCIO da janela, em milissegundos - a mesma escala para
     toda janela, de um minuto ou de uma hora. Já foi um índice
     (`floor(now / janela)`), e aí a limpeza feita por uma chave de um minuto
     apagava as linhas das chaves de uma hora, cujos índices são cem vezes
     menores: o teto de uma hora do pedido de senha sumia a cada login. A
     janela também vai na chave, para que dois tetos sobre o mesmo nome não
     colidam. */
  const window_at = Math.floor(now() / janelaMs) * janelaMs;
  const k = janelaMs === 60_000 ? key : `${key}@${janelaMs}`;

  /* Lê ANTES de gravar. Uma chave que já estourou não custa mais uma escrita
     no D1 por tentativa - senão o freio é o próprio amplificador: quem está
     sendo barrado continua gastando a cota de escrita da plataforma inteira,
     uma linha por requisição, até ela acabar para os alunos de verdade. */
  const antes = await env.DB.prepare(
    'SELECT hits FROM throttle WHERE key = ? AND window_at = ?'
  ).bind(k, window_at).first();
  if (antes && antes.hits >= limit) return true;

  await env.DB.prepare(
    `INSERT INTO throttle (key, window_at, hits) VALUES (?, ?, 1)
     ON CONFLICT(key, window_at) DO UPDATE SET hits = hits + 1`
  ).bind(k, window_at).run();
  const hits = (antes ? antes.hits : 0) + 1;
  /* Limpeza oportunista: sem ela a tabela cresce para sempre, e um cron só
     para isso seria um cron a mais para manter. Duas horas atrás cobre a
     maior janela em uso. */
  if (hits === 1) {
    await env.DB.prepare('DELETE FROM throttle WHERE window_at < ?')
      .bind(now() - 2 * 3_600_000).run();
  }
  return hits > limit;
}

/**
 * A chave já estourou? Só lê, não conta.
 *
 * É a metade "pergunta" do freio, para quando gastar o orçamento tem de ser
 * uma decisão separada de conferi-lo: o login gasta o orçamento do e-mail só
 * quando a senha ERRA. Antes, nove tentativas erradas de um estranho
 * trancavam a dona da conta para fora com a senha certa na mão.
 */
export async function estourou(env, key, limit = 10, janelaMs = 60_000) {
  const window_at = Math.floor(now() / janelaMs) * janelaMs;
  const k = janelaMs === 60_000 ? key : `${key}@${janelaMs}`;
  const row = await env.DB.prepare(
    'SELECT hits FROM throttle WHERE key = ? AND window_at = ?'
  ).bind(k, window_at).first();
  return !!row && row.hits >= limit;
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

/**
 * O último e-mail de recuperação SAIU?
 *
 * `true`, `false`, ou `null` quando ninguém pediu um link ainda.
 *
 * Existe porque "a chave está configurada" e "o e-mail está chegando" são
 * duas perguntas diferentes, e a distância entre as duas é uma armadilha de
 * verdade: a Resend recusa com 403 enquanto o domínio do remetente não
 * estiver verificado, e o sintoma é NADA. A tela diz "o link está a
 * caminho", o pedido responde 200, a saúde diz `email: true` - e ninguém
 * recebe coisa nenhuma. Dá para ficar semanas assim sem desconfiar.
 *
 * Lê a trilha em vez de guardar estado novo: a informação já está lá,
 * gravada por `forgot` a cada tentativa.
 */
export async function ultimoEnvioDeSenha(env) {
  try {
    const row = await env.DB.prepare(
      `SELECT action FROM access_log
        WHERE action IN ('forgot-enviado', 'forgot-falhou')
        ORDER BY id DESC LIMIT 1`
    ).first();
    if (!row) return null;
    return row.action === 'forgot-enviado';
  } catch {
    /* Sem tabela, sem resposta - e isso não é falha de saúde. */
    return null;
  }
}

/* ── progresso ──────────────────────────────────────────────────────────── */

/** O estado gravado, ou `null` para quem nunca sincronizou. */
export async function getProgress(env, accountId) {
  const row = await env.DB.prepare(
    'SELECT state, version, rev, updated_at FROM progress WHERE account_id = ?'
  ).bind(accountId).first();
  if (!row) return null;
  let state = null;
  /* Um JSON quebrado aqui não pode derrubar a carga do curso. Vale o mesmo
     que "nunca sincronizou": o aparelho manda o que tem e a linha se
     conserta na próxima escrita. */
  try { state = JSON.parse(row.state); } catch { return null; }
  return { state, version: row.version, rev: row.rev, updatedAt: row.updated_at };
}

/**
 * Grava, mas só por cima da revisão que o cliente declara ter lido.
 *
 * Devolve `{ ok: true, rev }` quando gravou, e `{ ok: false, atual }` quando
 * outro aparelho escreveu no meio - aí quem chamou funde e tenta de novo. É
 * a trava que faz o celular e o notebook somarem em vez de se sobrescreverem.
 *
 * `expected === 0` significa "não li nada, esta linha deveria não existir":
 * é o primeiro envio de um aparelho. Se a linha já existir, é conflito.
 */
export async function putProgress(env, accountId, { state, version, expected }) {
  const t = now();
  const texto = JSON.stringify(state);

  if (!expected) {
    try {
      await env.DB.prepare(
        `INSERT INTO progress (account_id, state, version, rev, updated_at)
         VALUES (?, ?, ?, 1, ?)`
      ).bind(accountId, texto, Number(version) || 2, t).run();
      return { ok: true, rev: 1, updatedAt: t };
    } catch {
      /* A chave primária recusou: já existe linha. É conflito, não erro. */
      const atual = await getProgress(env, accountId);
      return { ok: false, atual };
    }
  }

  /* O `rev = ?` no WHERE é a comparação e a escrita no mesmo comando - é
     isso que torna a troca atômica sem precisar de transação. */
  const r = await env.DB.prepare(
    `UPDATE progress SET state = ?, version = ?, rev = rev + 1, updated_at = ?
      WHERE account_id = ? AND rev = ?`
  ).bind(texto, Number(version) || 2, t, accountId, Number(expected)).run();

  if (r.meta && r.meta.changes) {
    return { ok: true, rev: Number(expected) + 1, updatedAt: t };
  }
  return { ok: false, atual: await getProgress(env, accountId) };
}

/** Apaga o progresso do servidor. O "apagar meu progresso" do perfil. */
export async function clearProgress(env, accountId) {
  await env.DB.prepare('DELETE FROM progress WHERE account_id = ?').bind(accountId).run();
}
