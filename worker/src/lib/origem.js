/* De onde veio quem compra (23/10/2026, plano de marketing, semana 1).
 * ─────────────────────────────────────────────────────────────────────────
 * O navegador decide a ORIGEM da primeira página da visita (UTM, link de
 * campanha ou o site que mandou a pessoa) e a guarda no aparelho
 * (app/src/lib/origem.ts). Ela vem para cá em dois momentos:
 *
 *   POST /api/portal {evento, fonte}   a visita à página de venda e a
 *                                      abertura do checkout, somadas por dia
 *                                      em `f|<evento>|<fonte>`
 *   POST /api/pay/create {origem}      grava `orders.origem` e
 *                                      `orders.campanha` (migração 0003)
 *
 * A fonte é de uma LISTA FECHADA, porque vira chave de contador: um nome
 * livre deixaria qualquer um criar linhas novas no banco a cada pedido (a
 * cota do D1 é superfície de ataque, ver CLAUDE.md). A campanha (utm_campaign)
 * é livre, mas curta e só com letras, números, ponto, hífen e sublinhado, e
 * só vai para o pedido, que já tem freio próprio.
 *
 * A mesma lista mora em app/src/lib/origem.ts; tests/origem.test.ts confere.
 */

export const FONTES = [
  'direto', 'bio', 'stories', 'dm', 'sefarad', 'instagram', 'previa',
  'busca', 'ia', 'email', 'parceiro', 'anuncio', 'outro'
];

export const fonteValida = f => typeof f === 'string' && FONTES.includes(f);

const CAMPANHA = /^[a-z0-9][a-z0-9._-]{0,39}$/;

/** A campanha, se tiver o formato aceito; senão null. */
export const campanhaValida = c => (typeof c === 'string' && CAMPANHA.test(c) ? c : null);

/** `{fonte, campanha}` a partir do corpo do pedido; o que não vale vira null. */
export function origemDoCorpo(o) {
  if (!o || typeof o !== 'object') return { fonte: null, campanha: null };
  const fonte = fonteValida(o.fonte) ? o.fonte : null;
  return { fonte, campanha: fonte ? campanhaValida(o.campanha) : null };
}
