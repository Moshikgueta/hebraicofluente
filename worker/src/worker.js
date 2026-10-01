/* A entrada do Worker.
 * ─────────────────────────────────────────────────────────────────────────
 * Roda ANTES dos arquivos estáticos (`run_worker_first` no wrangler.toml), o
 * que dá três trabalhos a este arquivo, nesta ordem:
 *
 *   1. /api/*   → responder;
 *   2. rota paga → portão, que decide se o HTML sai;
 *   3. o resto  → entregar o export do Next, que é o site inteiro.
 *
 * Com uma exceção, desde 01/10/2026: o que é público E imutável (os chunks
 * com hash de /_next/static, as fontes, as imagens da capa e os dois
 * traçados de amostra) é servido pelo servidor de ativos SEM passar por
 * aqui, pela lista de exclusões do `run_worker_first`. Esses pedidos não
 * contam na cota do plano, e os cabeçalhos deles vêm de app/public/_headers,
 * não de `blindar`. Os clipes de /amostra-audio ficam aqui por causa do
 * Range (ver abaixo). Tudo o que é pago (/audio, /stroke-order, as rotas do
 * curso) continua entrando por esta porta.
 *
 * O site é `output: 'export'` com `trailingSlash: true`, então cada rota é uma
 * pasta com index.html. Os ativos cuidam disso sozinhos - o que este arquivo
 * garante é que uma rota desconhecida caia no 404 do próprio site, e não num
 * 404 sem estilo do servidor.
 */

import { json } from './lib/http.js';
import { comRange } from './lib/range.js';
import { gate, isGatedPath } from './gate.js';
import { runReconcile } from './reconcile.js';
import * as auth from './api/auth.js';
import * as pay from './api/pay.js';
import * as progress from './api/progress.js';
import { content } from './api/content.js';
import * as audio from './api/audio.js';
import * as ab from './api/ab.js';
import * as novidades from './api/novidades.js';
import * as csp from './api/csp.js';
import * as marca from './api/marca.js';
import * as depoimentos from './api/depoimentos.js';
import * as estatisticas from './api/estatisticas.js';
import * as adminCodigo from './api/admin-codigo.js';
import * as estornosAdmin from './api/estornos-admin.js';

const ROUTES = {
  'POST /api/auth/signup': auth.signup,
  'POST /api/auth/login': auth.login,
  'POST /api/auth/logout': auth.logout,
  /* Recuperar a senha são duas rotas porque são dois momentos: uma pede o
     e-mail, a outra recebe o token que foi nele. Nenhuma das duas exige
     sessão - quem esqueceu a senha não tem como ter uma. */
  'POST /api/auth/forgot': auth.forgot,
  'POST /api/auth/reset': auth.reset,
  /* Estas duas, sim, exigem sessão E a senha atual. Ver as notas em
     api/auth.js. A segunda apaga a conta do próprio titular, que é o direito
     de exclusão da LGPD sem passar por um pedido de suporte. */
  /* Confirmar o e-mail: pedir o link de novo, e usar o link. As duas exigem
     sessão - ver as notas em api/auth.js. */
  'POST /api/auth/verify/send': auth.verifySend,
  'POST /api/auth/verify': auth.verify,
  'POST /api/auth/password': auth.password,
  'POST /api/auth/delete': auth.apagar,
  /* A lista do aviso do próximo curso: entrar e sair (api/novidades.js). */
  'PUT /api/novidades': novidades.marcar,
  'POST /api/novidades/sair': novidades.sair,
  'GET /api/me': auth.me,
  'GET /api/health': auth.health,

  'POST /api/pay/create': pay.create,
  'GET /api/pay/verify': pay.verify,
  /* A Mercado Pago manda o aviso como POST, mas alguns testes do painel dela
     disparam um GET na mesma URL. Os dois caem no mesmo lugar - e a validação
     de assinatura recusa o que não for legítimo, seja qual for o verbo. */
  'POST /api/pay/webhook': pay.webhook,
  'GET /api/pay/webhook': pay.webhook,

  'GET /api/orders': pay.orders,
  /* A desistência da compra pelo próprio site (CDC, art. 49; Decreto
     7.962/2013, art. 5º). Ver api/pay.js. */
  'POST /api/pay/desistir': pay.desistir,

  /* O curso em si. É a metade do controle de acesso que faltava: o portão
     recusa as ROTAS pagas, e esta rota recusa o MATERIAL - que até 20/09/2026
     viajava dentro do pacote que qualquer visitante baixava. Ver
     api/content.js. */
  'GET /api/content': content,

  /* O teste A/B da capa: só contagens diárias, sem identificar ninguém.
     Ver api/ab.js. */
  'POST /api/ab': ab.registrar,

  /* O que a CSP estrita, ainda em observação, teria bloqueado. Ver
     api/csp.js. */
  'POST /api/csp-report': csp.relatorio,

  /* O progresso do aluno. `rev` na escrita é o que impede o celular e o
     notebook de se apagarem - ver api/progress.js. */
  'GET /api/progress': progress.read,
  'PUT /api/progress': progress.write,
  'DELETE /api/progress': progress.drop,

  /* O áudio gravado pelo painel do dono do curso (/admin/gravar). O
     manifesto é público - só ids -, o resto exige conta de administrador.
     Ver api/audio.js. */
  'GET /api/audio/manifest': audio.manifesto,
  'GET /api/admin/audio': audio.lista,
  'PUT /api/admin/audio': audio.salvar,
  'DELETE /api/admin/audio': audio.apagar,
  'GET /api/admin/audio/arquivo': audio.arquivo,

  /* De qual conta saiu uma cópia do curso: lê a marca invisível de um
     trecho colado. Só administrador. Ver api/marca.js. */
  'POST /api/admin/marca': marca.identificar,

  /* Os depoimentos: o aluno escreve, autoriza (ou não) e retira o dele; o
     dono lê e aprova. Ver api/depoimentos.js. */
  'GET /api/depoimento': depoimentos.ler,
  'PUT /api/depoimento': depoimentos.salvar,
  'DELETE /api/depoimento': depoimentos.retirar,
  'GET /api/admin/depoimentos': depoimentos.listar,
  'PUT /api/admin/depoimentos': depoimentos.julgar,

  /* Onde os alunos erram e onde param: só contadores, sem identificar
     ninguém. Ver api/estatisticas.js. */
  'POST /api/estatisticas': estatisticas.registrar,
  'GET /api/admin/estatisticas': estatisticas.ler,

  /* O segundo fator do administrador: o código por e-mail. Ver
     lib/admin.js e api/admin-codigo.js. */
  'POST /api/admin/codigo': adminCodigo.enviar,
  'POST /api/admin/codigo/conferir': adminCodigo.conferir,
  /* Os estornos que dependem do dono (PIX direto, recusados): listar e
     marcar "já devolvi". Ver api/estornos-admin.js. */
  'GET /api/admin/estornos': estornosAdmin.listar,
  'POST /api/admin/estornos/feito': estornosAdmin.feito
};

export default {
  /* Toda resposta - página, API, redirect, recusa do portão - sai pelo
     `blindar`. A primeira versão só blindava as páginas, e o HSTS faltava
     justamente onde mais importa: no 301 do www e nas rotas que carregam
     senha. */
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    const res = await responder(request, env, ctx);
    return blindar(res, path, await hashesDaPagina(request, env, res, path));
  },

  /* O cron (ver [triggers] no wrangler.toml). Esperado, e não solto com
     waitUntil: a varredura É o trabalho desta execução, e reportá-la como
     terminada com as chamadas ainda no ar mascararia toda falha dela. */
  async scheduled(event, env) {
    return runReconcile(env);
  }
};

async function responder(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    /* ── um endereço só ─────────────────────────────────────────────────
       O www redireciona para o endereço sem www, e isso acontece ANTES de
       qualquer outra coisa - antes da API, antes do portão.

       A ordem é o ponto. `origin` das URLs de retorno da Mercado Pago sai da
       REQUISIÇÃO (worker/src/api/pay.js), então uma compra iniciada em
       www.hebraicofluente.com.br mandaria o comprador de volta para o www
       depois de pagar - e o cookie de sessão dele, emitido para o host sem
       www, não viajaria junto. O sintoma seria "paguei e caí deslogado", no
       pior momento possível.

       301 e não 302: é permanente, e é o que faz o navegador e o buscador
       pararem de perguntar. */
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    /* ── a API ──────────────────────────────────────────────────────── */
    if (path.startsWith('/api/')) {
      /* Escrita só da nossa própria origem.
         ──────────────────────────────────────────────────────────────
         O cookie é SameSite=Lax, e isso já segura a maior parte do CSRF -
         mas "a maior parte" inclui uma janela de dois minutos depois do
         login em que o Chrome ainda manda o cookie num POST de topo vindo
         de outro site, e não segura nada no dia em que alguém relaxar o
         cookie para None por causa de um redirect do meio de pagamento.
         Uma segunda trava, independente: um navegador declara de onde a
         requisição veio (`Origin`, `Sec-Fetch-Site`), e uma escrita que
         se declara de outro lugar é recusada. Quem não declara nada - o
         curl do e2e, um script de operação - passa: a defesa é contra o
         navegador da vítima, não contra ferramentas.
         O webhook fica de fora porque a Mercado Pago é, legitimamente,
         outra origem; a assinatura HMAC é a trava dele. O relato de CSP
         também: quem o manda é o próprio navegador, que nem sempre declara a
         origem do mesmo jeito, e ele não escreve nada além de uma linha de
         trilha com freio. */
      if (request.method !== 'GET' && request.method !== 'HEAD'
          && path !== '/api/pay/webhook' && path !== '/api/csp-report') {
        const site = request.headers.get('Sec-Fetch-Site');
        const origin = request.headers.get('Origin');
        const cruzada = site === 'cross-site' || site === 'same-site'
          || (origin && origin !== url.origin);
        if (cruzada) return json({ error: 'server' }, 403);
      }

      const handler = ROUTES[`${request.method} ${path}`];
      if (handler) {
        try {
          return await handler({ request, env, ctx });
        } catch (e) {
          /* O detalhe fica no log do Worker; o cliente recebe um código. Uma
             mensagem de exceção devolvida na resposta entrega nome de tabela,
             caminho de arquivo e às vezes o próprio SQL. */
          console.error('api', path, e && e.stack || e);
          return json({ error: 'server' }, 500);
        }
      }
      return json({ error: 'server' }, 404);
    }

    /* ── o portão ───────────────────────────────────────────────────── */
    const blocked = await gate(request, env).catch(e => {
      /* Um erro aqui não pode virar porta aberta. Se o banco está fora, a
         resposta certa é mandar para o login - nunca entregar a aula. */
      console.error('gate', path, e && e.stack || e);
      return new Response(null, {
        status: 302,
        headers: { Location: new URL('/entrar/', url.origin).toString(), 'Cache-Control': 'no-store' }
      });
    });
    if (blocked) return blocked;

    /* ── o áudio gravado pelo painel ────────────────────────────────────
       Depois do portão: `/audio` é rota paga. Com gravação do painel para
       esse id, ela sai do banco; sem, segue para o arquivo do git, como
       sempre. Um banco fora do ar também segue para o arquivo - o curso
       perde a gravação nova por um instante, nunca o som que já tinha. */
    const clipe = path.match(/^\/audio\/(he-[0-9a-f]{8})\.mp3$/);
    if (clipe && (request.method === 'GET' || request.method === 'HEAD')) {
      const doPainel = await audio.servir(request, env, clipe[1]).catch(e => {
        console.error('audio', path, e && e.stack || e);
        return null;
      });
      if (doPainel) return doPainel;
      /* O mp3 do git, pelo servidor de ativos. O Safari pede `bytes=0-1`
         antes de tocar e exige 206; em produção o servidor de ativos já
         responde assim, mas o `wrangler dev` devolve 200 inteiro e ignora o
         Range. Se vier 200 com Range no pedido, a fatia é feita aqui
         (lib/range.js); um 206 pronto passa como veio. */
      return comRange(request, await env.ASSETS.fetch(request));
    }

    /* ── o site ─────────────────────────────────────────────────────── */
    /* A lista de hashes da CSP é do Worker, não do visitante. */
    if (path === '/' + ARQUIVO_HASHES) return new Response('Not found', { status: 404 });
    /* Os clipes da capa: públicos, mas o Safari só toca o que responde 206
       a `Range` (auditoria de 01/10/2026, PERF-002). Por isso continuam no
       Worker, e não na lista de exceções do `run_worker_first`. */
    if (/^\/amostra-audio\/[^/]+\.mp3$/.test(path) && (request.method === 'GET' || request.method === 'HEAD')) {
      return comRange(request, await env.ASSETS.fetch(request));
    }
    return env.ASSETS.fetch(request);
}

/* ── os cabeçalhos do site ─────────────────────────────────────────────────
 * O export do Next sai do servidor de ativos sem nenhum cabeçalho de
 * segurança, e este é o único lugar por onde toda resposta passa.
 *
 * A CSP é apertada porque o site permite: nenhum script de terceiro, nenhuma
 * fonte externa, nenhuma analítica. `'unsafe-inline'` em script fica porque o
 * export estático do Next injeta o próprio bootstrap em <script> inline e um
 * export não tem como carimbar nonce por requisição; o que a diretiva ainda
 * garante é que nada saia do próprio domínio - `connect-src 'self'` é o que
 * impede um script injetado de mandar uma senha para fora, e
 * `frame-ancestors 'none'` é o que impede o checkout e o login de serem
 * emoldurados por outro site.
 *
 * A saída do `'unsafe-inline'` já está a caminho: a mesma política, com o
 * hash de cada script no lugar dele, vai em observação ao lado desta (ver
 * `cspEstrita` abaixo). Quando valer, esta linha muda.
 *
 * Uma página paga que passou pelo portão sai `private, no-store`: o servidor
 * de ativos a marca `public`, e um cache compartilhado no caminho poderia
 * entregar a aula de quem pagou para quem não pagou.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'"
].join('; ');

/* A CSP estrita, em observação (auditoria, SEC-003).
 * ─────────────────────────────────────────────────────────────────────────
 * A mesma política, com uma diferença: em vez de `'unsafe-inline'`, o hash
 * de cada script inline QUE AQUELA PÁGINA TRAZ, calculado no build por
 * tools/csp-hashes.mjs. Sai em `Content-Security-Policy-Report-Only`: o
 * navegador não bloqueia nada, só relata em /api/csp-report o que teria
 * bloqueado (api/csp.js). Quando os relatos ficarem limpos por alguns dias,
 * esta vira a `Content-Security-Policy` e a de cima sai - decisão do dono.
 *
 * A lista é lida uma vez por isolate, do próprio servidor de ativos: ela
 * muda a cada publicação, e cada publicação sobe isolates novos. Sem a lista
 * (build antiga, arquivo fora do ar), a página sai só com a política de
 * sempre - a observação nunca pode custar uma página.
 */
const ARQUIVO_HASHES = '_csp-hashes.json';
let mapaHashes = null;

async function carregarHashes(request, env) {
  if (mapaHashes) return mapaHashes;
  try {
    const r = await env.ASSETS.fetch(new Request(new URL('/' + ARQUIVO_HASHES, request.url)));
    if (!r.ok) return {};
    mapaHashes = await r.json();
    return mapaHashes;
  } catch {
    return {};
  }
}

/** A rota como tools/csp-hashes.mjs a grava: `/faq`, `/`, ou "404". */
function rotaDaPagina(path, status) {
  if (status === 404) return '404';
  const p = path.replace(/\/index\.html$/i, '').replace(/\.html$/i, '');
  return p || '/';
}

async function hashesDaPagina(request, env, res, path) {
  if (!(res.headers.get('Content-Type') || '').startsWith('text/html')) return null;
  const mapa = await carregarHashes(request, env);
  const hs = mapa[rotaDaPagina(path, res.status)];
  return Array.isArray(hs) ? hs : null;
}

/* O nonce é para o script que a PRÓPRIA Cloudflare injeta no HTML (a
   detecção de robôs, "JavaScript detections"). Ele muda a cada resposta e
   não tem hash fixo; a Cloudflare lê o nonce do cabeçalho de CSP e o
   carimba no script que injeta. Foi o único relato das primeiras horas de
   observação (29/09/2026), em todas as páginas. Um valor novo por resposta,
   e só nesta política: posto na que vale, ao lado de `'unsafe-inline'`, ele
   DESLIGARIA o `'unsafe-inline'` nos navegadores e quebraria o site. */
function novoNonce() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b));
}

function cspEstrita(hashes, nonce = novoNonce()) {
  const scripts = ["'self'", "'report-sample'", `'nonce-${nonce}'`, ...hashes.map(h => `'${h}'`)].join(' ');
  return CSP.replace("script-src 'self' 'unsafe-inline'", `script-src ${scripts}`)
    + '; report-uri /api/csp-report';
}

/* O painel do dono do curso. Também libera o microfone: é onde as
   pronúncias do curso são gravadas (app/src/app/admin/gravar). */
const isAdminPath = path => /^\/admin(\/|$)/i.test(path);

function blindar(res, path, hashes = null) {
  /* Uma resposta sem corpo (304, 302, 403) é reconstruída sem corpo: passar
     um `body` nulo com esses status é permitido; passar um corpo em 304 não. */
  const out = new Response(res.body, res);
  const h = out.headers;
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  /* `preload` (auditoria de 28/09, INFRA-015): o domínio já cumpre os
     requisitos da lista de pré-carga dos navegadores (um ano, subdomínios
     inclusos, HTTPS em tudo). O cabeçalho só declara que aceita; entrar na
     lista é um pedido à parte, em hstspreload.org, e difícil de desfazer -
     fica para o dono decidir. */
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  /* O microfone: bloqueado no site público, liberado SÓ para o próprio site
     nas páginas do curso, onde o aluno grava a própria leitura
     (components/learn/GravarLeitura.tsx - a gravação não sai do aparelho).
     Nenhum terceiro, nem num iframe, ganha o microfone em lugar nenhum. */
  /* 28/09/2026: e na CAPA, só nela. A landing ganhou "Ouça e fale"
     (components/landing/OuvirEFalar.tsx): o visitante se grava falando
     שָׁלוֹם e é corrigido, antes de comprar - a pedido do dono do curso. As
     outras páginas públicas e a API continuam fechadas. */
  const naCapa = path === '/' || path === '/index.html';
  const mic = isGatedPath(path) || isAdminPath(path) || naCapa ? 'microphone=(self)' : 'microphone=()';
  h.set('Permissions-Policy', `camera=(), ${mic}, geolocation=(), payment=()`);
  const tipo = h.get('Content-Type') || '';
  if (tipo.startsWith('text/html')) {
    h.set('Content-Security-Policy', CSP);
    if (hashes) h.set('Content-Security-Policy-Report-Only', cspEstrita(hashes));
    h.set('X-Frame-Options', 'DENY');
  }
  /* O painel do dono do curso: fora de busca e fora de cache. A página em
     si não tem nada secreto (os dados vêm de /api/admin/*, que confere a
     conta), mas não tem por que existir num índice. */
  if (isAdminPath(path)) {
    h.set('Cache-Control', 'private, no-store');
    h.set('X-Robots-Tag', 'noindex, nofollow');
  }
  /* Os arquivos de /_next/static têm o hash do conteúdo no nome: mudar o
     conteúdo muda o nome, então o navegador pode guardá-los por um ano sem
     perguntar (`immutable`). O servidor de ativos os marca `max-age=0,
     must-revalidate`, e cada "posso usar o que tenho?" era uma ida à rede e
     uma invocação do Worker (auditoria de 01/10/2026, PERF-001). Em
     produção esses pedidos nem chegam aqui (lista do `run_worker_first`) e o
     cabeçalho vem de app/public/_headers; esta linha é a mesma regra para o
     `wrangler dev` e para o dia em que a lista mudar. Nunca em rota paga:
     a regra do portão, abaixo, vem depois e vence. */
  if (path.startsWith('/_next/static/')) {
    h.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  if (!path.startsWith('/api/') && isGatedPath(path)) {
    h.set('Cache-Control', 'private, no-store');
    /* E não entra em buscador. Isto é cinto e suspensório, de propósito: um
       rastreador já leva 302 do portão e nunca vê o HTML da aula. Mas o
       portão JÁ teve uma brecha - a exceção de `Sec-Fetch-Dest`, contada em
       gate.js -, e num dia em que ele volte a deixar passar, o endereço não
       pode virar resultado de busca. Sai daqui, e não de um `metadata` por
       página: assim uma rota nova do curso nasce fora do índice pelo mesmo
       motivo que nasce atrás do login, sem depender de alguém lembrar. */
    h.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return out;
}
