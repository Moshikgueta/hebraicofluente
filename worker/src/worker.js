/* A entrada do Worker.
 * ─────────────────────────────────────────────────────────────────────────
 * Roda ANTES dos arquivos estáticos (`run_worker_first` no wrangler.toml), o
 * que dá três trabalhos a este arquivo, nesta ordem:
 *
 *   1. /api/*   → responder;
 *   2. rota paga → portão, que decide se o HTML sai;
 *   3. o resto  → entregar o export do Next, que é o site inteiro.
 *
 * O site é `output: 'export'` com `trailingSlash: true`, então cada rota é uma
 * pasta com index.html. Os ativos cuidam disso sozinhos - o que este arquivo
 * garante é que uma rota desconhecida caia no 404 do próprio site, e não num
 * 404 sem estilo do servidor.
 */

import { json } from './lib/http.js';
import { gate, isGatedPath } from './gate.js';
import { runReconcile } from './reconcile.js';
import * as auth from './api/auth.js';
import * as pay from './api/pay.js';
import * as progress from './api/progress.js';
import { content } from './api/content.js';

const ROUTES = {
  'POST /api/auth/signup': auth.signup,
  'POST /api/auth/login': auth.login,
  'POST /api/auth/logout': auth.logout,
  /* Recuperar a senha são duas rotas porque são dois momentos: uma pede o
     e-mail, a outra recebe o token que foi nele. Nenhuma das duas exige
     sessão - quem esqueceu a senha não tem como ter uma. */
  'POST /api/auth/forgot': auth.forgot,
  'POST /api/auth/reset': auth.reset,
  /* Esta, sim, exige sessão E a senha atual. Ver a nota em api/auth.js. */
  'POST /api/auth/password': auth.password,
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

  /* O curso em si. É a metade do controle de acesso que faltava: o portão
     recusa as ROTAS pagas, e esta rota recusa o MATERIAL - que até 20/09/2026
     viajava dentro do pacote que qualquer visitante baixava. Ver
     api/content.js. */
  'GET /api/content': content,

  /* O progresso do aluno. `rev` na escrita é o que impede o celular e o
     notebook de se apagarem - ver api/progress.js. */
  'GET /api/progress': progress.read,
  'PUT /api/progress': progress.write,
  'DELETE /api/progress': progress.drop
};

export default {
  /* Toda resposta - página, API, redirect, recusa do portão - sai pelo
     `blindar`. A primeira versão só blindava as páginas, e o HSTS faltava
     justamente onde mais importa: no 301 do www e nas rotas que carregam
     senha. */
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    return blindar(await responder(request, env, ctx), path);
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
         outra origem; a assinatura HMAC é a trava dele. */
      if (request.method !== 'GET' && request.method !== 'HEAD' && path !== '/api/pay/webhook') {
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

    /* ── o site ─────────────────────────────────────────────────────── */
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

function blindar(res, path) {
  /* Uma resposta sem corpo (304, 302, 403) é reconstruída sem corpo: passar
     um `body` nulo com esses status é permitido; passar um corpo em 304 não. */
  const out = new Response(res.body, res);
  const h = out.headers;
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  const tipo = h.get('Content-Type') || '';
  if (tipo.startsWith('text/html')) {
    h.set('Content-Security-Policy', CSP);
    h.set('X-Frame-Options', 'DENY');
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
