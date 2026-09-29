/* No máximo três aparelhos por conta (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A conta é pessoal (Termos, artigo 4), e o jeito mais comum de dividir um
 * curso é dividir o login. Cada entrada (cadastro, login, senha redefinida)
 * cria um aparelho: um id aleatório que vai no cookie (`ap`) e uma linha em
 * `aparelhos`. Ficam os três mais recentes; a quarta entrada apaga a linha
 * da mais antiga, e aquele aparelho volta para a tela de login no próximo
 * clique. Celular, computador e tablet cabem; um grupo inteiro, não.
 *
 * Nada do aparelho em si é guardado - nem modelo, nem navegador, nem IP.
 *
 * Quem divide o login e fica se derrubando deixa um rastro: muitas entradas
 * no mesmo dia. Passando de SEIS em 24 horas, a trilha ganha uma linha
 * 'aparelhos-rodizio' (uma por conta por dia) e o dono recebe o aviso da
 * varredura (alertas.js). Nada é bloqueado por isso: os Termos dizem que a
 * suspensão só vem depois de aviso e resposta, e é o dono quem decide.
 *
 * Um cookie sem `ap` é de antes desta mudança: vale até vencer, e o /api/me
 * (que o app chama a cada página) o troca por um com aparelho.
 */

import { newId } from './crypto.js';
import { throttled, log } from './db.js';

export const LIMITE_APARELHOS = 3;
const ENTRADAS_POR_DIA = 6;
const DIA = 86_400_000;

/** Cria o aparelho desta entrada e desconecta os que passaram do limite.
 *  `null` se o banco falhar: a pessoa entra mesmo assim, com um cookie sem
 *  aparelho (que vale como os de antes). */
export async function novoAparelho(env, accountId) {
  const ap = newId('ap');
  try {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO aparelhos (account_id, aparelho, criado_em) VALUES (?, ?, ?)')
        .bind(accountId, ap, Date.now()),
      env.DB.prepare(
        `DELETE FROM aparelhos WHERE account_id = ?1 AND aparelho NOT IN (
           SELECT aparelho FROM aparelhos WHERE account_id = ?1
            ORDER BY criado_em DESC, rowid DESC LIMIT ?2)`
      ).bind(accountId, LIMITE_APARELHOS)
    ]);
  } catch (e) {
    console.error('aparelhos', e && e.stack || e);
    return null;
  }
  if (await throttled(env, `aparelhos:${accountId}`, ENTRADAS_POR_DIA, DIA)
      && !await throttled(env, `aparelhos-aviso:${accountId}`, 1, DIA)) {
    await log(env, accountId, 'aparelhos-rodizio', `mais de ${ENTRADAS_POR_DIA} entradas em 24 h`);
  }
  return ap;
}

/** O aparelho do cookie ainda está entre os conectados? Cookie de antes da
 *  mudança (sem `ap`) vale. */
export async function aparelhoValido(env, sess) {
  if (!sess || !sess.ap) return true;
  try {
    const row = await env.DB.prepare(
      'SELECT 1 AS ok FROM aparelhos WHERE account_id = ? AND aparelho = ?'
    ).bind(sess.uid, String(sess.ap)).first();
    return !!row;
  } catch (e) {
    /* Tabela ausente ou consulta que caiu: o limite de aparelhos é uma
       defesa contra divisão de conta, e não pode virar "ninguém entra". */
    console.error('aparelhos', e && e.stack || e);
    return true;
  }
}

/** Sair: o logout derruba TODAS as sessões da conta (sobe a
 *  session_version), então todas as vagas ficam livres. */
export async function esquecerAparelhos(env, accountId) {
  try {
    await env.DB.prepare('DELETE FROM aparelhos WHERE account_id = ?').bind(accountId).run();
  } catch { /* as sessões já morrem pela session_version */ }
}
