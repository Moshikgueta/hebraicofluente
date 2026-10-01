/* O teste A/B da capa (28/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O site não coleta analítica (ver app/src/lib/analytics.ts: os eventos
 * ficam no navegador). Este é o único contador, e é mínimo de propósito:
 * só TOTAIS por dia - quantos viram cada versão do hero, clicaram no botão,
 * chegaram ao checkout e compraram. Sem cookie, sem conta, sem IP guardado
 * (o IP só entra na chave do freio, que expira em um minuto).
 *
 * Aceita apenas o experimento, a versão e o evento conhecidos; qualquer
 * outra coisa é recusada. O relatório sai pela Action "Relatório do teste
 * A/B" (.github/workflows/relatorio-ab.yml), que lê a tabela `ab_contagens`.
 *
 * ── o que um script não infla (auditoria de 01/10/2026, SEC-A-008) ──────
 * O dono escolhe a capa por estes números, e o contador é anônimo: um
 * script mandava 30 por minuto, o dia inteiro, para o lado que quisesse.
 *   · Teto por DIA por endereço, além do do minuto: um visitante de
 *     verdade gera meia dúzia de eventos, e o teto é folgado para uma casa
 *     ou um celular atrás de NAT. A chave do freio leva um HMAC do IP, não o
 *     IP: a linha fica até 48 h na tabela do freio.
 *   · `compra` só conta com um PEDIDO PAGO de verdade: o pedido de uma
 *     sessão válida, pago nos últimos 7 dias e ainda não contado
 *     (`ab_compras` guarda só o id do pedido, para contar uma vez). Antes,
 *     "comprei" era uma frase que qualquer anônimo podia mandar. A versão
 *     (A ou B) ainda é a que o navegador diz: atribuir a versão no servidor
 *     pediria o checkout mandar a versão junto do pedido, e isso é uma
 *     mudança no app (ver o relatório da fase 1 de 01/10/2026).
 */

import { json, fail, readJson } from '../lib/http.js';
import { throttled } from '../lib/db.js';
import { hmacHex } from '../lib/crypto.js';
import { requireAccount } from './auth.js';

/* Eventos por dia por endereço. */
export const AB_TETO_DIA = 60;
/* Até quantos dias depois de pago um pedido ainda vira `compra`. */
const COMPRA_JANELA_MS = 7 * 86_400_000;

/** O pedido pago desta sessão que ainda não foi contado, reservado agora
 *  (a reserva é a contagem: só quem a grava conta). null se não há. */
async function compraDeVerdade(request, env) {
  const account = await requireAccount(request, env);
  if (!account) return null;
  const pedido = await env.DB.prepare(
    `SELECT o.id FROM orders o
      WHERE o.account_id = ? AND o.status = 'paid' AND o.paid_at >= ?
        AND NOT EXISTS (SELECT 1 FROM ab_compras c WHERE c.order_id = o.id)
      ORDER BY o.paid_at DESC LIMIT 1`
  ).bind(account.id, Date.now() - COMPRA_JANELA_MS).first();
  if (!pedido) return null;
  const r = await env.DB.prepare(
    'INSERT INTO ab_compras (order_id, em) VALUES (?, ?) ON CONFLICT(order_id) DO NOTHING'
  ).bind(pedido.id, Date.now()).run();
  return Number(r && r.meta && r.meta.changes) > 0 ? pedido.id : null;
}

export const EXPERIMENTOS = { 'hero-2026-09': ['a', 'b'] };
const EVENTOS = new Set(['visto', 'clique', 'checkout', 'compra']);

export async function registrar({ request, env }) {
  /* Um evento cabe em poucas dezenas de bytes. O teto de 1 KB impede que um
     anônimo faça o Worker ler e interpretar megabytes antes de recusar
     (auditoria de 28/09, SEC-005). */
  const b = await readJson(request, 1024);
  if (!b) return fail('bad-request');
  const versoes = EXPERIMENTOS[b?.exp];
  if (!versoes || !versoes.includes(b?.v) || !EVENTOS.has(b?.evento)) return fail('bad-request');

  /* Um freio contra quem quisesse inflar um lado: 30 por minuto por IP é
     muito mais do que um visitante de verdade gera. Estourado, a resposta é
     a mesma - não há o que o cliente fazer com um erro aqui. */
  const ip = (request.headers.get('CF-Connecting-IP') || '').trim() || 'desconhecido';
  const quem = (await hmacHex(String(env.SESSION_SECRET || 'ab'), `ab:${ip}`)).slice(0, 24);
  if (await throttled(env, `ab:${quem}`, 30)) return json({ ok: true });
  if (await throttled(env, `ab-dia:${quem}`, AB_TETO_DIA, 86_400_000)) return json({ ok: true });

  if (b.evento === 'compra') {
    try {
      if (!await compraDeVerdade(request, env)) return json({ ok: true });
    } catch (e) {
      /* Tabela ausente ou banco fora: compra sem prova não conta. */
      console.error('ab', e && e.stack || e);
      return json({ ok: true });
    }
  }

  const dia = new Date().toISOString().slice(0, 10);
  try {
    await env.DB.prepare(
      `INSERT INTO ab_contagens (exp, variante, evento, dia, n) VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(exp, variante, evento, dia) DO UPDATE SET n = n + 1`
    ).bind(b.exp, b.v, b.evento, dia).run();
  } catch (e) {
    /* Um contador fora do ar não pode virar erro na capa. */
    console.error('ab', e && e.stack || e);
  }
  return json({ ok: true });
}

/** As marcas de `compra` com mais de 60 dias (a janela de contar é de 7):
 *  chamado pela varredura, em alertas.js. */
export async function abComprasPurge(env, at = Date.now()) {
  try { await env.DB.prepare('DELETE FROM ab_compras WHERE em < ?').bind(at - 60 * 86_400_000).run(); }
  catch { /* tabela ausente */ }
}
