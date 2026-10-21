/* Os estornos que dependem do dono (30/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Quando o site não consegue devolver sozinho (PIX direto, liberação à mão,
 * ou oito tentativas recusadas pela Mercado Pago), o estorno fica "manual" ou
 * "erro" e o dono devolve o dinheiro por fora. Até aqui não havia como dizer
 * ao site que a devolução foi feita: o acesso continuava aberto e o lembrete
 * diário não parava.
 *
 *   GET  /api/admin/estornos         os abertos (os mesmos do lembrete)
 *   POST /api/admin/estornos/feito   {orderId} - "já devolvi o dinheiro"
 *
 * Marcar como feito usa a mesma rotina do estorno automático (refundOrder):
 * o pedido vira `refunded`, os meses dele saem do acesso, e fica na trilha.
 * Só vale para estorno "manual" ou "erro": um automático em andamento é a
 * Mercado Pago quem confirma, e marcar à mão por cima seria dizer que o
 * dinheiro voltou antes de ela dizer.
 */

import { fail, json, readJson } from '../lib/http.js';
import { estornoAtualizar, estornosAbertos, getOrder, log, refundOrder } from '../lib/db.js';
import { exigirAdmin } from '../lib/admin.js';
import { getCourse, itensDoPedido } from '../lib/catalog.js';
import { avisarEstorno } from './pay.js';

export async function listar({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const abertos = await estornosAbertos(env);
  return json({
    estornos: abertos.map(e => ({
      orderId: e.order_id, estado: e.estado, erro: e.erro || '', tentativas: e.tentativas,
      criadoEm: e.criado_em, valorCentavos: e.amount_cents, metodo: e.method, email: e.email || null
    }))
  });
}

export async function feito({ request, env }) {
  const { account, erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const b = await readJson(request);
  const orderId = String(b && b.orderId || '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(orderId)) return fail('bad-request');

  const est = await env.DB.prepare('SELECT estado FROM estornos WHERE order_id = ?').bind(orderId).first();
  if (!est) return fail('not-found', 404);
  if (est.estado === 'concluido') return json({ ok: true, jaEstava: true });
  if (est.estado !== 'manual' && est.estado !== 'erro') return fail('automatico', 409);

  const order = await getOrder(env, orderId);
  if (!order) return fail('not-found', 404);
  if (order.status === 'paid') {
    const course = getCourse(order.course_slug);
    const itens = course ? itensDoPedido(course) : [{ courseSlug: order.course_slug, months: 12 }];
    const r = await refundOrder(env, {
      accountId: order.account_id,
      courseSlug: itens[0].courseSlug,
      orderId: order.id,
      months: itens[0].months,
      itens,
      why: 'devolução feita pelo dono'
    });
    /* O aluno fica sabendo que o dinheiro voltou e o acesso fechou
       (auditoria de 01/10/2026, PAY-B-006). Uma vez: só quem virou o
       pedido para `refunded` avisa. */
    if (r.refunded) await avisarEstorno(env, order, { restaAte: r.until });
  }
  await estornoAtualizar(env, orderId, { estado: 'concluido' });
  await log(env, account.id, 'estorno-manual-feito', orderId);
  return json({ ok: true });
}
