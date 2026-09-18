/* Entrar, criar conta, sair, e quem sou eu.
 * ─────────────────────────────────────────────────────────────────────────
 * O que merece atenção aqui não é o caminho feliz.
 *
 * · Criar conta e entrar demoram O MESMO TEMPO quando o e-mail não existe.
 *   `fakeVerify` queima exatamente as mesmas iterações do caminho real. Sem
 *   isso, a diferença de tempo de resposta responde "esse endereço é
 *   cliente?" — e a mensagem de erro genérica, que existe justamente para não
 *   responder, vira decoração.
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
import { fakeVerify, hashPassword, itersFor, verifyPassword } from '../lib/crypto.js';
import { clearSessionCookie, makeSessionCookie, readSession } from '../lib/session.js';
import {
  activeEntitlements, createAccount, findAccountByEmail, findAccountById,
  log, normalizeEmail, setPasswordHash, throttled
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
    await fakeVerify(password, itersFor(env));   // mesmo custo do caminho que cria
    return fail('email-taken', 409);
  }

  const { hash, salt, iterations } = await hashPassword(password, null, itersFor(env));
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
    : await fakeVerify(password, itersFor(env));

  if (!account || !ok) {
    await log(env, account ? account.id : null, 'login-failed', email);
    return fail('bad-credentials', 401);
  }

  /* Subiu o custo do hash? Esta conta se atualiza sozinha, agora, com a senha
     que acabou de ser digitada — o único instante em que ela existe em claro.
     Sem isto, elevar PBKDF2_ITERATIONS só protegeria quem se cadastrasse
     depois, e as contas antigas ficariam para trás para sempre.

     Só quando o alvo é MAIOR: nunca enfraquece um hash existente. E é feito
     depois de responder ao aluno estar garantido — se falhar, ele entra do
     mesmo jeito e a próxima vez tenta de novo. */
  const target = itersFor(env);
  if (Number(account.pass_iter) < target) {
    try {
      const next = await hashPassword(password, null, target);
      await setPasswordHash(env, account.id, next);
      await log(env, account.id, 'rehash', `${account.pass_iter} → ${target}`);
    } catch {
      /* Custo de CPU estourado, ou o banco fora. O login não pode cair por
         causa de uma melhoria opcional. */
    }
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

/**
 * GET /api/health — o que está configurado, sem dizer o quê.
 * ─────────────────────────────────────────────────────────────────────────
 * Existe porque "500" não é diagnóstico. Quando a publicação vai ao ar com um
 * pedaço faltando — a ligação com o banco, a tabela, o segredo da sessão —
 * toda rota de conta responde igual, e descobrir qual dos três é o problema
 * exige acesso ao painel que quem está depurando muitas vezes não tem à mão.
 *
 * Responde só BOOLEANOS. Nenhum valor, nenhum nome de variável, nenhuma
 * mensagem de erro do banco. O que um curioso aprende com isto — que o site
 * usa D1 e tem uma tabela `accounts` — já está no repositório, que é público.
 * O que ele não aprende é nada que ajude a entrar.
 */
export async function health({ env }) {
  const out = {
    /* A ligação com o D1 existe no Worker? `false` = binding ausente ou
       database_id errado no wrangler.toml. */
    db: false,
    /* As tabelas foram criadas? `false` = falta rodar worker/schema.sql. */
    schema: false,
    /* O cookie de sessão tem como ser assinado? `false` = SESSION_SECRET
       não foi definido, e aí NENHUM login funciona. */
    session: !!env.SESSION_SECRET,
    /* Cobrança ligada? `false` é um estado legítimo — ver o checkout. */
    payments: !!env.MP_ACCESS_TOKEN,
    /* Webhook verificável? `false` faz /api/pay/webhook recusar tudo. */
    webhook: !!env.MP_WEBHOOK_SECRET,
    /* O custo do hash de senha em vigor. Não é segredo — está no repositório
       — e é a única forma de confirmar, de fora, que uma subida de custo
       realmente entrou em vigor. */
    iterations: itersFor(env)
  };

  if (env.DB) {
    out.db = true;
    try {
      await env.DB.prepare('SELECT 1 FROM accounts LIMIT 1').first();
      out.schema = true;
    } catch {
      /* A tabela não existe. É a resposta, não uma falha. */
    }
  }

  out.ok = out.db && out.schema && out.session;
  return json(out);
}

/** A conta desta requisição, ou null. Usado por tudo que exige sessão. */
export async function requireAccount(request, env) {
  const sess = await readSession(request, env);
  if (!sess) return null;
  const account = await findAccountById(env, sess.uid);
  if (!account || (Number(account.session_version) || 0) !== (Number(sess.sv) || 0)) return null;
  return account;
}
