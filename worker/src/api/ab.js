/* O que sobrou do teste A/B da capa (28/09 a 01/10/2026, encerrado).
 * ─────────────────────────────────────────────────────────────────────────
 * O teste acabou em 01/10/2026: a capa ficou com a versão A e a rota
 * POST /api/ab, o contador do app e o relatório do Actions saíram. As
 * tabelas ficam (`ab_contagens` só tem totais por dia, sem dado pessoal).
 * `ab_compras` guarda ids de pedido por até 60 dias; esta limpeza continua
 * rodando na varredura (alertas.js) até a tabela esvaziar.
 */

/** As marcas de `compra` com mais de 60 dias: chamado pela varredura. */
export async function abComprasPurge(env, at = Date.now()) {
  try { await env.DB.prepare('DELETE FROM ab_compras WHERE em < ?').bind(at - 60 * 86_400_000).run(); }
  catch { /* tabela ausente */ }
}
