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
 * curso por um real, e isso não é hipótese - é o primeiro teste de qualquer
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

/* Parcerias (02/10/2026): quem chega pelo link de uma parceria paga
   `price.parceriaBrl` quando ele é MENOR que o preço do dia. A primeira é a
   associação sefardita (@adsefarditas, link /sefarad): R$ 147 também depois
   do fim do pré-lançamento. O nome vem do pedido, mas só vale se estiver
   nesta lista; o VALOR continua saindo só do catálogo.

   04/10/2026, decisão do dono: o preço dos links vale até `price.parceriaAte`
   (30/11/2026, fim do dia em Brasília), para o "por tempo limitado" dos posts
   ser verdade. E os links do Instagram (/bio, /stories, /dm) entram como
   parcerias também: mesmo preço, e o pedido guarda de qual link veio. */
export const PARCERIAS = new Set(['sefarad', 'bio', 'stories', 'dm']);
export const parceriaValida = nome => typeof nome === 'string' && PARCERIAS.has(nome);

/** O preço da parceria ainda vale em `agora`? Sem data, vale sempre. */
export const parceriaVigente = (price, agora = Date.now()) =>
  !price.parceriaAte || agora <= Date.parse(`${price.parceriaAte}T23:59:59.999-03:00`);

/** O preço base em reais: o do dia, ou o da parceria se for menor e ainda valer. */
export const precoBase = (course, parceria, agora = Date.now()) => {
  const p = course.price;
  return parceriaValida(parceria) && Number(p.parceriaBrl) > 0 && p.parceriaBrl < p.brl && parceriaVigente(p, agora)
    ? p.parceriaBrl : p.brl;
};

/** Centavos, arredondados uma vez só e a partir do preço do catálogo. */
export const priceCents = (course, method, parceria = null, agora = Date.now()) => {
  const p = course.price;
  const base = precoBase(course, parceria, agora);
  const brl = method === 'pix' && p.pixDiscountPct > 0
    ? base * (1 - p.pixDiscountPct / 100)
    : base;
  return Math.round(brl * 100);
};

/** Quantas parcelas o catálogo permite. Um pedido de 24x num curso de 12x
 *  vira 12: o limite é nosso, não do comprador. */
export const clampInstallments = (course, n) =>
  Math.min(Math.max(1, Math.floor(Number(n) || 1)), course.price.installments || 1);
