/* O preço do curso principal, lido do mesmo arquivo que o Worker cobra.
 * Os testes de cobrança conferem que o valor sai do catálogo; eles não podem
 * fixar R$ 147, porque o preço muda sozinho no fim do pré-lançamento
 * (tools/virar-preco.mjs) e a publicação daquele dia roda estes testes. */
import { readFileSync } from 'node:fs';

const catalogo = JSON.parse(readFileSync(new URL('../../../data/courses.json', import.meta.url), 'utf8')) as {
  courses: { slug: string; price: { brl: number; pixDiscountPct: number } }[];
};
const p = catalogo.courses.find(c => c.slug === 'alfabetizacao')!.price;

/** Preço cheio em reais (cartão). */
export const PRECO = p.brl;
/** Centavos no cartão. */
export const CARTAO_CENTAVOS = Math.round(p.brl * 100);
/** Centavos no PIX, com o desconto do catálogo. */
export const PIX_CENTAVOS = Math.round(p.brl * (1 - p.pixDiscountPct / 100) * 100);
/** O valor do PIX como aparece no BR Code ("132.30"). */
export const PIX_TEXTO = (PIX_CENTAVOS / 100).toFixed(2);
