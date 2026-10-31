import type { Traducao } from '..';

/* components/landing/FaixaDaPromocao.tsx - a promoção do pré-lançamento,
   logo abaixo do hero (31/10/2026, pedido do dono). */
const pt = {
  rotulo: (data: string) => `Pré-lançamento · até ${data}`,
  noCartao: (parcelas: string) => `no cartão, ${parcelas}`,
  noPix: (pct: number) => `no PIX (${pct}% de desconto)`,
  ou: 'ou',
  depois: (data: string, cheio: string) => `Depois de ${data}, o curso passa a custar ${cheio}.`,
  verPreco: 'Ver o que o preço inclui',
  selo: (dias: number) => `${dias} dias para desistir`,
  seloLinha: '100% de volta, sem justificar',
  dias: 'dias'
} as const;

// rever: o site em inglês não tem pré-lançamento nem PIX (Paddle, etapa 5)
const en: Traducao<typeof pt> = {
  rotulo: (data: string) => `Pre-launch · until ${data}`,
  noCartao: (parcelas: string) => `by card, ${parcelas}`,
  noPix: (pct: number) => `by PIX (${pct}% off)`,
  ou: 'or',
  depois: (data: string, cheio: string) => `After ${data}, the course will cost ${cheio}.`,
  verPreco: 'See what the price includes',
  selo: (dias: number) => `${dias} days to cancel`,
  seloLinha: 'Full refund, no questions asked',
  dias: 'days'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
