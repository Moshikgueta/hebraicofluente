/* O preço que a vitrine mostra em destaque, num lugar só.
 * ─────────────────────────────────────────────────────────────────────────
 * O número grande da caixa de preço da capa (`Preco`, Fecho.tsx), o botão do
 * hero ("Começar o curso · R$ …", auditoria de 01/10, CONV-009) e o `price`
 * do JSON-LD do curso (lib/jsonld.ts) são o MESMO número: o do PIX quando a
 * loja só cobra por PIX, senão o preço do catálogo. Três telas copiando a
 * regra viram três preços no dia em que a regra mudar.
 */

import { flagship, pixPrice } from '@/lib/catalog';
import { soPix } from '@/lib/empresa';

export function precoDeVitrine(): number {
  const c = flagship();
  return soPix() ? pixPrice(c.price) : c.price.brl;
}
