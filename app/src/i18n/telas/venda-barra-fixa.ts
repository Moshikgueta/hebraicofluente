import type { Traducao } from '..';

/* components/landing/BarraFixa.tsx */
const pt = {
  parcelas: (parcelas: string) => `ou ${parcelas} no cartão`,
  desistir: (dias: number) => `${dias} dias para desistir`,
  pix: (preco: string, ate: string | null) => `ou ${preco} no PIX${ate ? ` · até ${ate}` : ''}`
} as const;

const en: Traducao<typeof pt> = {
  // etapa 5: o site em inglês cobra pelo Paddle
  parcelas: () => 'one-time payment',
  // etapa 5/6: Brasil, rever (direito de arrependimento do CDC)
  desistir: (dias: number) => `${dias} days to cancel`,
  pix: (preco: string, ate: string | null) => `or ${preco} by PIX${ate ? ` · until ${ate}` : ''}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
