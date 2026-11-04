import type { Traducao } from '..';

/* components/landing/BarraFixa.tsx */
const pt = {
  parcelas: (parcelas: string) => `ou ${parcelas} no cartão`,
  desistir: (dias: number) => `${dias} dias para desistir`,
  aMenos: (valor: string) => `${valor} a menos`,
  pix: (preco: string, ate: string | null) => `ou ${preco} no PIX${ate ? ` · até ${ate}` : ''}`
} as const;

const en: Traducao<typeof pt> = {
  // etapa 5: o site em inglês cobra pelo Paddle
  parcelas: () => 'one-time payment',
  // etapa 5/6: Brasil, rever (direito de arrependimento do CDC)
  desistir: (dias: number) => `${dias} days to cancel`,
  aMenos: (valor: string) => `${valor} off`,
  pix: (preco: string, ate: string | null) => `or ${preco} by PIX${ate ? ` · until ${ate}` : ''}`
};

const es: Traducao<typeof pt> = {
  // etapa 5: el sitio de fuera cobra por Paddle
  parcelas: () => 'pago único',
  // etapa 5/6: Brasil, rever (direito de arrependimento do CDC)
  desistir: (dias: number) => `${dias} días para cancelar`,
  aMenos: (valor: string) => `${valor} menos`,
  pix: (preco: string, ate: string | null) => `o ${preco} por PIX${ate ? ` · hasta el ${ate}` : ''}`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
