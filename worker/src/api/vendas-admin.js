/* Quem comprou (02/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Até aqui, saber quem pagou pedia o painel da Mercado Pago ou uma consulta
 * no D1. Este é o mesmo dado, no site, com o segundo fator do administrador:
 *
 *   GET /api/admin/vendas   as últimas 200 compras pagas ou estornadas
 *
 * Só leitura. Cada linha diz também se o pedido veio de um link de campanha
 * (`orders.parceria`, migração 0002); pedidos de antes dela vêm sem a marca.
 * Pedidos pendentes, vencidos e recusados ficam de fora: não houve dinheiro.
 */

import { json } from '../lib/http.js';
import { exigirAdmin } from '../lib/admin.js';

const LIMITE = 200;

export async function listar({ request, env }) {
  const { erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  const { results } = await env.DB.prepare(
    `SELECT o.id, o.course_slug, o.amount_cents, o.method, o.installments, o.status,
            o.created_at, o.paid_at, o.parceria, a.name, a.email
       FROM orders o LEFT JOIN accounts a ON a.id = o.account_id
      WHERE o.status IN ('paid', 'refunded')
      ORDER BY COALESCE(o.paid_at, o.created_at) DESC
      LIMIT ?`
  ).bind(LIMITE).all();
  return json({
    vendas: (results || []).map(v => ({
      orderId: v.id, curso: v.course_slug, valorCentavos: v.amount_cents, metodo: v.method,
      parcelas: v.installments, status: v.status, pagoEm: v.paid_at || v.created_at,
      parceria: v.parceria || null, nome: v.name || '', email: v.email || null
    }))
  });
}
