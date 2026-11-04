import type { Traducao } from '..';

/* components/landing/FaixaDaPromocao.tsx - a promoção do pré-lançamento,
   logo abaixo do hero (31/10/2026, pedido do dono). */
const pt = {
  rotulo: (data: string) => `Pré-lançamento · até ${data}`,
  noCartao: (parcelas: string) => `no cartão, ${parcelas}`,
  noPix: (pct: number) => `no PIX (${pct}% de desconto)`,
  ou: 'ou',
  depois: (data: string, cheio: string) => `Depois de ${data}, o curso passa a custar ${cheio}.`,
  aMenos: (valor: string) => `${valor} a menos`,
  aPartirDe: (data: string) => `A partir de ${data}`,
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
  aMenos: (valor: string) => `${valor} off`,
  aPartirDe: (data: string) => `From ${data}`,
  verPreco: 'See what the price includes',
  selo: (dias: number) => `${dias} days to cancel`,
  seloLinha: 'Full refund, no questions asked',
  dias: 'days'
};

// rever: o site em espanhol não tem pré-lançamento nem PIX (Paddle, etapa 5)
const es: Traducao<typeof pt> = {
  rotulo: (data: string) => `Preventa · hasta el ${data}`,
  noCartao: (parcelas: string) => `con tarjeta, ${parcelas}`,
  noPix: (pct: number) => `por PIX (${pct}% de descuento)`,
  ou: 'o',
  depois: (data: string, cheio: string) => `Después del ${data}, el curso pasará a costar ${cheio}.`,
  aMenos: (valor: string) => `${valor} menos`,
  aPartirDe: (data: string) => `A partir del ${data}`,
  verPreco: 'Ver lo que incluye el precio',
  selo: (dias: number) => `${dias} días para cancelar`,
  seloLinha: 'Te devolvemos el 100%, sin explicaciones',
  dias: 'días'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
