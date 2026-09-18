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
 * pasta com index.html. Os ativos cuidam disso sozinhos — o que este arquivo
 * garante é que uma rota desconhecida caia no 404 do próprio site, e não num
 * 404 sem estilo do servidor.
 */

import { json } from './lib/http.js';
import { gate } from './gate.js';
import { runReconcile } from './reconcile.js';
import * as auth from './api/auth.js';
import * as pay from './api/pay.js';

const ROUTES = {
  'POST /api/auth/signup': auth.signup,
  'POST /api/auth/login': auth.login,
  'POST /api/auth/logout': auth.logout,
  'GET /api/me': auth.me,
  'GET /api/health': auth.health,

  'POST /api/pay/create': pay.create,
  'GET /api/pay/verify': pay.verify,
  /* A Mercado Pago manda o aviso como POST, mas alguns testes do painel dela
     disparam um GET na mesma URL. Os dois caem no mesmo lugar — e a validação
     de assinatura recusa o que não for legítimo, seja qual for o verbo. */
  'POST /api/pay/webhook': pay.webhook,
  'GET /api/pay/webhook': pay.webhook,

  'GET /api/orders': pay.orders
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    /* ── a API ──────────────────────────────────────────────────────── */
    if (path.startsWith('/api/')) {
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
         resposta certa é mandar para o login — nunca entregar a aula. */
      console.error('gate', path, e && e.stack || e);
      return new Response(null, {
        status: 302,
        headers: { Location: new URL('/entrar/', url.origin).toString(), 'Cache-Control': 'no-store' }
      });
    });
    if (blocked) return blocked;

    /* ── o site ─────────────────────────────────────────────────────── */
    return env.ASSETS.fetch(request);
  },

  /* O cron (ver [triggers] no wrangler.toml). Esperado, e não solto com
     waitUntil: a varredura É o trabalho desta execução, e reportá-la como
     terminada com as chamadas ainda no ar mascararia toda falha dela. */
  async scheduled(event, env) {
    return runReconcile(env);
  }
};
