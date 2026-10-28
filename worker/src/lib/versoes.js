/* A versão das políticas que vale agora (auditoria de 01/10/2026, LEGAL-104).
 * ─────────────────────────────────────────────────────────────────────────
 * `data/politicas-versoes/atual.json` é GERADO pelo build (app/versoes.mjs) a
 * partir do texto publicado de /termos/, /reembolso/ e /privacidade/. Cada
 * versão tem uma cópia fixa em /<documento>/v/<versao>/, que nunca muda.
 *
 * O Worker usa a versão em dois lugares: no aceite do cadastro
 * (`aceites.versao`) e no pedido (`orders.termos_versao`), e o recibo linka a
 * cópia fixa em vez da página de hoje.
 */

import atual from '../../../data/politicas-versoes/atual.json';
import atualEn from '../../../data/politicas-versoes-en/atual.json';

/** A versão em vigor de um documento ('termos', 'reembolso', 'privacidade'), ou ''.
 *  O Worker em inglês (LOCALE = "en") lê as versões das políticas em inglês,
 *  guardadas à parte em data/politicas-versoes-en (PLANO-INGLES.md, etapa 6). */
export const versaoAtual = (doc, env) => {
  const lista = env && env.LOCALE === 'en' ? atualEn : atual;
  return String((lista && lista[doc]) || '');
};

/** O endereço fixo de uma versão; sem versão, a página de hoje. */
export const linkDaVersao = (site, doc, versao) =>
  versao ? `${site}/${doc}/v/${versao}/` : `${site}/${doc}/`;

/**
 * Grava no pedido a versão dos Termos que vale agora.
 *
 * Falha aberta: um banco sem a coluna (migração 0001 ainda não aplicada) não
 * pode impedir uma compra. O erro vai para o log, e o recibo cai na versão
 * atual.
 */
export async function gravarTermosDoPedido(env, orderId) {
  const v = versaoAtual('termos', env);
  if (!v) return;
  try {
    await env.DB.prepare('UPDATE orders SET termos_versao = ? WHERE id = ?').bind(v, orderId).run();
  } catch (e) {
    console.error('termos_versao', e && e.message || e);
  }
}
