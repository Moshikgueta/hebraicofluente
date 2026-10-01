/* O que chega em contato@hebraicofluente.com.br (Cloudflare Email Routing →
 * "Send to a Worker"). Auditoria de 01/10/2026, LEGAL-109.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas coisas, nesta ordem:
 *
 *   1. ENCAMINHA a mensagem para a caixa que o dono lê (`CONTATO_DESTINO`,
 *      wrangler.toml [vars]; precisa ser um endereço de destino verificado
 *      no Email Routing). Isto vem primeiro e sem condição: uma falha aqui
 *      sobe como erro, e a Cloudflare devolve a mensagem ao remetente em vez
 *      de perdê-la calada.
 *
 *   2. CONFIRMA O RECEBIMENTO na hora, quando o assunto fala de desistência
 *      ou reembolso (Decreto 7.962/2013, art. 5º, §4º: confirmação imediata
 *      do arrependimento). A data e a hora vão no texto.
 *
 * Por que não o filtro do Gmail: a mensagem chega no Gmail encaminhada, e o
 * "Enviar modelo" do Gmail responde ao remetente do ENVELOPE, que no
 * encaminhamento vira um endereço técnico (`SRS0=...@hebraicofluente.com.br`)
 * que ninguém lê. O teste do dono em 01/10/2026 mostrou exatamente isso: a
 * resposta saiu e nunca chegou ao Yahoo. Aqui a resposta vai para o `From`
 * (ou `Reply-To`) da mensagem original, e sai pela Resend, de contato@.
 *
 * Nunca responde a: robôs (Auto-Submitted, Precedence bulk/list/junk,
 * List-Id, no-reply, mailer-daemon), mensagens do próprio domínio (laço),
 * e o mesmo remetente mais de uma vez por hora (laço com outro robô).
 */

import { dataHoraBR, sendMail } from './lib/mail.js';
import { log, throttled } from './lib/db.js';

const DOMINIO = 'hebraicofluente.com.br';

/** O assunto pede desistência ou reembolso? Sem acento e sem caixa. */
export function pedeDesistencia(assunto) {
  const s = String(assunto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return /reembols|desist|estorn|arrepend|cancel|devolu/.test(s);
}

/** O endereço dentro de `Nome <a@b.c>` ou um endereço solto. */
export function enderecoDe(cabecalho) {
  const s = String(cabecalho || '');
  const m = s.match(/<([^<>\s@]+@[^<>\s@]+)>/) || s.match(/([^\s<>"',;:]+@[^\s<>"',;:]+\.[^\s<>"',;:]+)/);
  return m ? m[1].toLowerCase() : '';
}

/** Mensagem automática, de lista ou de robô: não se responde. */
export function ehAutomatica(headers, remetente) {
  const h = n => String(headers.get(n) || '').toLowerCase();
  const auto = h('auto-submitted');
  if (auto && auto !== 'no') return true;
  if (/bulk|list|junk/.test(h('precedence'))) return true;
  if (h('list-id') || h('list-unsubscribe')) return true;
  if (/^(no-?reply|noreply|mailer-daemon|postmaster|bounce)/.test(remetente)) return true;
  return remetente.endsWith('@' + DOMINIO);
}

export function confirmacaoTexto(recebidaEm) {
  return [
    'Olá,',
    '',
    `Recebemos a sua mensagem em ${dataHoraBR(recebidaEm)}. Esta é uma confirmação automática, enviada no momento em que ela chegou, e serve de registro do recebimento.`,
    '',
    'Se você está pedindo para desistir da compra, vale a data em que você escreveu, não a da nossa resposta. Respondemos pessoalmente em até 2 dias úteis.',
    '',
    'Se preferir, dá para desistir pelo próprio site: entre na sua conta, abra Perfil e, em Compras, use "Desistir da compra". O pedido fica registrado na hora.',
    '',
    'Hebraico Fluente',
    `contato@${DOMINIO}`
  ].join('\n');
}

export async function receberEmail(message, env, agora = Date.now()) {
  const destino = String(env.CONTATO_DESTINO || '').trim();
  if (!destino) throw new Error('CONTATO_DESTINO não configurado');
  await message.forward(destino);

  const assunto = message.headers.get('subject') || '';
  if (!pedeDesistencia(assunto)) return;

  const para = enderecoDe(message.headers.get('reply-to')) || enderecoDe(message.headers.get('from'));
  if (!para || ehAutomatica(message.headers, para)) return;
  if (await throttled(env, `autoresposta:${para}`, 1, 3_600_000)) return;

  const r = await sendMail(env, { to: para, subject: 'Recebemos a sua mensagem', text: confirmacaoTexto(agora) });
  /* O registro do recebimento, também do nosso lado. Sem o endereço: a
     trilha guarda o fato, a caixa do dono guarda a mensagem. */
  await log(env, null, r.ok ? 'autoresposta-enviada' : 'autoresposta-falhou', r.ok ? '' : `${r.motivo} ${r.detalhe || ''}`);
}
