/* Entrar, criar conta, sair, e quem sou eu.
 * ─────────────────────────────────────────────────────────────────────────
 * O que merece atenção aqui não é o caminho feliz.
 *
 * · Criar conta e entrar demoram O MESMO TEMPO quando o e-mail não existe.
 *   `fakeVerify` queima exatamente as mesmas iterações do caminho real. Sem
 *   isso, a diferença de tempo de resposta responde "esse endereço é
 *   cliente?" - e a mensagem de erro genérica, que existe justamente para não
 *   responder, vira decoração.
 *
 * · O freio conta por IP E por e-mail. Só por IP, uma rede grande inteira
 *   apanha junto; só por e-mail, um ataque distribuído passa por baixo.
 *
 * · Criar conta com um e-mail que já existe responde 'email-taken', e isso é
 *   uma escolha consciente: ela ENTREGA que o endereço tem conta. A
 *   alternativa (mandar um e-mail dizendo "alguém tentou criar conta com o
 *   seu endereço") exige uma fila de mensagens que esta plataforma ainda não
 *   tem, e a versão silenciosa - fingir que criou - deixaria o comprador numa
 *   conta que não é dele, no meio de um pagamento. Entre vazar a existência
 *   do endereço e perder uma compra, escolhemos o primeiro, e está escrito.
 */

import { fail, json, notSignedIn, readJson } from '../lib/http.js';
import {
  b64url, fakeVerify, hashPassword, itersFor, sha256hex, verifyPassword
} from '../lib/crypto.js';
import { clearSessionCookie, makeSessionCookie, readSession } from '../lib/session.js';
import { isSandbox } from '../lib/mercadopago.js';
import { mailReady, mensagemDeRecuperacao, sendMail } from '../lib/mail.js';
import {
  activeEntitlements, changePassword, createAccount, findAccountByEmail, findAccountById,
  inviteRedeem, log, normalizeEmail, resetCreate, resetFind, resetUse,
  setPasswordHash, throttled
} from '../lib/db.js';

const MIN_PASSWORD = 8;
const emailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());

const ip = request =>
  request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

/* Uma hora. Curto o bastante para que um link esquecido numa caixa de entrada
   compartilhada não seja uma chave permanente, e longo o bastante para
   atravessar um almoço - a pessoa pede, sai, e volta. Quinze minutos parece
   mais seguro e só produz um segundo pedido. */
export const RESET_TTL_MIN = 60;
const RESET_TTL = RESET_TTL_MIN * 60_000;

/**
 * O endereço do site, para montar o link que vai no e-mail.
 *
 * Sai de `SITE_ORIGIN`, e não do Host da requisição, por um motivo específico:
 * o Host é um cabeçalho que quem chama escolhe. Montar um link de recuperação
 * a partir dele é o clássico "host header poisoning" - um pedido forjado com
 * `Host: site-do-atacante` faz A NOSSA plataforma mandar, para o endereço
 * certo do dono da conta, um e-mail legítimo cujo link entrega o token a
 * outra pessoa.
 *
 * A volta para o Host só acontece se SITE_ORIGIN não existir, e aí é melhor
 * do que um link quebrado.
 */
const siteOrigin = (env, request) =>
  String((env && env.SITE_ORIGIN) || '').replace(/\/+$/, '') || new URL(request.url).origin;

/** O que o app recebe como sessão. Os direitos vêm do BANCO, sempre - o
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

  /* Um presente esperando por este endereço vira acesso agora, antes de a
     pessoa ver qualquer tela. É a diferença entre "bem-vinda, seu curso está
     aqui" e "você não tem este curso - fale com quem te convidou". */
  await inviteRedeem(env, account.id, email);

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
     que acabou de ser digitada - o único instante em que ela existe em claro.
     Sem isto, elevar PBKDF2_ITERATIONS só protegeria quem se cadastrasse
     depois, e as contas antigas ficariam para trás para sempre.

     Só quando o alvo é MAIOR: nunca enfraquece um hash existente. E é feito
     depois de responder ao aluno estar garantido - se falhar, ele entra do
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

  /* Rede de segurança: o convite pode ter sido criado DEPOIS de a conta
     existir. Sem isto, presentear alguém já cadastrado não funcionaria, que é
     metade dos casos reais. */
  await inviteRedeem(env, account.id, email);

  return json(await sessionBody(env, account), 200,
    { 'Set-Cookie': await makeSessionCookie(env, account) });
}

export async function logout() {
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie });
}

/* ── esqueci minha senha ──────────────────────────────────────────────────
 *
 * Esta rota responde `{ ok: true }` para TUDO: e-mail que existe, e-mail que
 * não existe, e-mail mal escrito. É a decisão central aqui, e ela custa uma
 * tela menos precisa em troca de não transformar o formulário de recuperação
 * numa lista de quem é cliente - que é exatamente o que um "esse e-mail não
 * está cadastrado" entrega, a qualquer pessoa, sem senha nenhuma.
 *
 * O envio sai por `ctx.waitUntil`, fora do caminho da resposta, e isso
 * também não é detalhe de desempenho: mandar um e-mail leva algumas centenas
 * de milissegundos, e não mandar leva zero. Se a resposta esperasse pelo
 * envio, o RELÓGIO responderia a pergunta que o texto se recusa a responder.
 */
export async function forgot({ request, env, ctx }) {
  const body = await readJson(request);
  if (!body) return fail('server');

  const email = normalizeEmail(body.email);

  /* Freio por IP e por e-mail. O de e-mail é o que impede usar esta rota para
     encher a caixa de entrada de alguém - o pedido é anônimo, e sem ele
     bastaria um laço. */
  if (await throttled(env, `forgot:${ip(request)}`, 6)) return fail('rate-limited', 429);
  if (await throttled(env, `forgot:${email}`, 3)) return fail('rate-limited', 429);

  const sempre = json({ ok: true, enviado: true });
  if (!emailOk(email)) return sempre;

  const account = await findAccountByEmail(env, email);
  if (!account) {
    await log(env, null, 'forgot-sem-conta', email);
    return sempre;
  }

  /* 32 bytes de aleatoriedade do sistema. Vai em claro na URL do e-mail; o
     banco guarda só o sha256 dele (ver worker/schema.sql). */
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256hex(token);
  await resetCreate(env, {
    accountId: account.id, tokenHash, ttlMs: RESET_TTL, ip: ip(request)
  });

  const link = `${siteOrigin(env, request)}/nova-senha/?token=${encodeURIComponent(token)}`;
  const msg = mensagemDeRecuperacao({
    nome: account.name || '',
    link,
    minutos: RESET_TTL_MIN,
    marca: 'Hebraico Fluente',
    suporte: env.SUPPORT_EMAIL || ''
  });

  const entregar = async () => {
    const r = await sendMail(env, { to: account.email, ...msg });
    /* O resultado vai para a trilha nos dois casos. "A pessoa diz que não
       recebeu" é a pergunta mais comum deste fluxo, e sem este registro a
       resposta é um palpite. */
    await log(env, account.id, r.ok ? 'forgot-enviado' : 'forgot-falhou',
      r.ok ? email : `${r.motivo}${r.detalhe ? ': ' + r.detalhe : ''}`);
    if (!r.ok) console.error('mail', r.motivo, r.status || '', r.detalhe || '');
  };

  /* `waitUntil` quando existe; sem ele (teste, runtime diferente) espera - o
     envio não pode simplesmente não acontecer porque o ambiente é outro. */
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(entregar());
  else await entregar();

  return sempre;
}

/* ── escolher a senha nova ─────────────────────────────────────────────── */

/**
 * Troca a senha a partir do token do e-mail, e já entra.
 *
 * Entrar na hora é deliberado: quem chegou aqui provou ter acesso à caixa de
 * entrada da conta e acabou de digitar uma senha. Mandar essa pessoa para a
 * tela de login para digitar tudo de novo é o passo em que ela desiste - e
 * não protege de nada, porque quem tem o token tem a conta.
 *
 * `bad-token` é a resposta para token errado, vencido, já usado e inexistente,
 * todos juntos. Separar os casos contaria ao visitante qual dos quatro é, o
 * que só ajuda quem está tentando adivinhar.
 */
export async function reset({ request, env }) {
  const body = await readJson(request);
  if (!body) return fail('server');

  const token = String(body.token || '');
  const password = String(body.password || '');

  if (await throttled(env, `reset:${ip(request)}`, 12)) return fail('rate-limited', 429);
  if (!token) return fail('bad-token', 400);
  if (password.length < MIN_PASSWORD) return fail('weak-password');

  const tokenHash = await sha256hex(token);
  const pedido = await resetFind(env, tokenHash);
  if (!pedido) return fail('bad-token', 400);

  /* Consome ANTES de trocar a senha. O `used_at IS NULL` dentro do UPDATE faz
     desta linha a corrida inteira: dois cliques simultâneos no mesmo link,
     um ganha. Trocar primeiro e marcar depois deixaria os dois passarem. */
  if (!(await resetUse(env, tokenHash))) return fail('bad-token', 400);

  const account = await findAccountById(env, pedido.account_id);
  if (!account) return fail('bad-token', 400);

  const novo = await hashPassword(password, null, itersFor(env));
  const atualizada = await changePassword(env, account.id, novo);
  await log(env, account.id, 'senha-redefinida', account.email);

  /* `changePassword` subiu a `session_version`, então todo cookie anterior
     morreu - inclusive o de quem eventualmente estivesse dentro da conta sem
     ser o dono. O cookie novo desta resposta é o único que vale. */
  return json(await sessionBody(env, atualizada), 200,
    { 'Set-Cookie': await makeSessionCookie(env, atualizada) });
}

/* ── trocar a senha já estando dentro ──────────────────────────────────── */

/**
 * Exige a senha atual, e não só a sessão.
 *
 * O motivo é um celular emprestado ou esquecido aberto: com a sessão
 * bastando, qualquer pessoa em frente a uma tela destrancada troca a senha e
 * fica com a conta. Com a senha atual, ela precisa saber o que já sabia.
 */
export async function password({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  const body = await readJson(request);
  if (!body) return fail('server');

  const atual = String(body.current || '');
  const nova = String(body.password || '');

  if (await throttled(env, `senha:${account.id}`, 8)) return fail('rate-limited', 429);
  if (nova.length < MIN_PASSWORD) return fail('weak-password');

  const ok = await verifyPassword(atual, account.pass_salt, account.pass_hash, account.pass_iter);
  if (!ok) {
    await log(env, account.id, 'senha-atual-errada', account.email);
    return fail('bad-credentials', 401);
  }

  const novo = await hashPassword(nova, null, itersFor(env));
  const atualizada = await changePassword(env, account.id, novo);
  await log(env, account.id, 'senha-trocada', account.email);

  /* Um cookie novo na mesma resposta. Sem ele, quem acabou de trocar a senha
     com sucesso seria deslogado pela própria troca - a `session_version`
     subiu e o cookie do navegador é o da versão anterior. */
  return json(await sessionBody(env, atualizada), 200,
    { 'Set-Cookie': await makeSessionCookie(env, atualizada) });
}

export async function me({ request, env }) {
  const sess = await readSession(request, env);
  if (!sess) return notSignedIn();

  const account = await findAccountById(env, sess.uid);
  /* A conta sumiu, ou a versão de sessão foi subida (troca de senha, suspeita
     de vazamento). O cookie ainda tem assinatura válida e mesmo assim não
     vale mais - é para isto que `sv` existe. */
  if (!account || (Number(account.session_version) || 0) !== (Number(sess.sv) || 0)) {
    return json({ error: 'not-signed-in' }, 401, { 'Set-Cookie': clearSessionCookie });
  }

  return json(await sessionBody(env, account));
}

/**
 * GET /api/health - o que está configurado, sem dizer o quê.
 * ─────────────────────────────────────────────────────────────────────────
 * Existe porque "500" não é diagnóstico. Quando a publicação vai ao ar com um
 * pedaço faltando - a ligação com o banco, a tabela, o segredo da sessão -
 * toda rota de conta responde igual, e descobrir qual dos três é o problema
 * exige acesso ao painel que quem está depurando muitas vezes não tem à mão.
 *
 * Responde só BOOLEANOS. Nenhum valor, nenhum nome de variável, nenhuma
 * mensagem de erro do banco. O que um curioso aprende com isto - que o site
 * usa D1 e tem uma tabela `accounts` - já está no repositório, que é público.
 * O que ele não aprende é nada que ajude a entrar.
 */
export async function health({ env }) {
  const out = {
    /* A ligação com o D1 existe no Worker? `false` = binding ausente ou
       database_id errado no wrangler.toml. */
    db: false,
    /* As tabelas foram criadas? `false` = falta rodar worker/schema.sql. */
    schema: false,
    /* A tabela de progresso existe? Ela entrou depois das outras, e a falta
       dela é SILENCIOSA: nada quebra, o app só volta a guardar progresso no
       aparelho para sempre. É o tipo de migração esquecida que ninguém nota
       até um aluno trocar de celular - então ela se reporta aqui, em vez de
       ficar implícita no `schema`. */
    progresso: false,
    /* A tabela de recuperação de senha existe? Mesma história da de
       progresso: a falta dela não derruba nada, só faz "esqueci minha senha"
       falhar para todo mundo, em silêncio, até alguém reclamar. */
    recuperacao: false,
    /* O cookie de sessão tem como ser assinado? `false` = SESSION_SECRET
       não foi definido, e aí NENHUM login funciona. */
    session: !!env.SESSION_SECRET,
    /* Dá para mandar e-mail? `false` = falta RESEND_API_KEY ou EMAIL_FROM, e
       aí o link de recuperação nunca chega a ninguém. O site continua
       funcionando inteiro, e por isso isto fica fora do `ok` - mas um `false`
       aqui significa que todo aluno que esquecer a senha vira um e-mail para
       o suporte. */
    email: mailReady(env),
    /* Cobrança ligada? `false` é um estado legítimo - ver o checkout. */
    payments: !!env.MP_ACCESS_TOKEN,
    /* Webhook verificável? `false` faz /api/pay/webhook recusar tudo. */
    webhook: !!env.MP_WEBHOOK_SECRET,
    /* O custo do hash de senha em vigor. Não é segredo - está no repositório
       - e é a única forma de confirmar, de fora, que uma subida de custo
       realmente entrou em vigor. */
    iterations: itersFor(env),
    /* "teste" cobra nada; "producao" cobra de verdade. Deriva do prefixo do
       token, então esta linha é a confirmação de qual credencial está no ar -
       a pergunta que, errada, custa semanas de venda em silêncio. */
    modo: env.MP_ACCESS_TOKEN ? (isSandbox(env) ? 'teste' : 'producao') : 'desligado'
  };

  if (env.DB) {
    out.db = true;
    try {
      await env.DB.prepare('SELECT 1 FROM accounts LIMIT 1').first();
      out.schema = true;
    } catch {
      /* A tabela não existe. É a resposta, não uma falha. */
    }
    try {
      await env.DB.prepare('SELECT 1 FROM progress LIMIT 1').first();
      out.progresso = true;
    } catch {
      /* idem */
    }
    try {
      await env.DB.prepare('SELECT 1 FROM password_resets LIMIT 1').first();
      out.recuperacao = true;
    } catch {
      /* idem */
    }
  }

  /* `progresso`, `recuperacao` e `email` ficam FORA do `ok` de propósito: sem
     eles o curso funciona inteiro - um não sincroniza entre aparelhos, os
     outros dois fecham a porta de quem esqueceu a senha. São degradações, e
     derrubar a saúde por elas apagaria a diferença entre "o site caiu" e "o
     site está no ar com um pedaço a menos". */
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
