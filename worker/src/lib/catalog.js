/* O catálogo, do lado do servidor.
 * ─────────────────────────────────────────────────────────────────────────
 * Lê O MESMO data/courses.json que o app. Isso importa por um motivo só, e é
 * o motivo pelo qual este arquivo existe em vez de as constantes ficarem no
 * wrangler.toml:
 *
 *   O PREÇO COBRADO SAI DAQUI, NUNCA DO CORPO DA REQUISIÇÃO.
 *
 * O checkout manda o curso e a forma de pagamento. Quanto custa é decidido
 * aqui. Uma API que aceita `{ amount: 1 }` do cliente é uma API que vende o
 * curso por um real, e isso não é hipótese — é o primeiro teste de qualquer
 * um que abra as ferramentas de desenvolvedor.
 *
 * O mesmo vale para `accessMonths` e para `status`: nada que a compra decida
 * vem de fora.
 */

import catalog from '../../../data/courses.json';

const BY_SLUG = new Map(catalog.courses.map(c => [c.slug, c]));

export const getCourse = slug => BY_SLUG.get(String(slug || '')) || null;

/** Dá para comprar este curso agora? Só o que está publicado e tem conteúdo. */
export const isSellable = c => !!c && c.status === 'available' && c.engine !== null;

/** Centavos, arredondados uma vez só e a partir do preço do catálogo. */
export const priceCents = (course, method) => {
  const p = course.price;
  const brl = method === 'pix' && p.pixDiscountPct > 0
    ? p.brl * (1 - p.pixDiscountPct / 100)
    : p.brl;
  return Math.round(brl * 100);
};

/** Quantas parcelas o catálogo permite. Um pedido de 24x num curso de 12x
 *  vira 12: o limite é nosso, não do comprador. */
export const clampInstallments = (course, n) =>
  Math.min(Math.max(1, Math.floor(Number(n) || 1)), course.price.installments || 1);
