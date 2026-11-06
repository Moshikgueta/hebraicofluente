import type { Traducao } from '..';

/* components/learn/FotoDaMissao.tsx */
const pt = {
  dominioPublico: 'Domínio público',
  origem: 'Wikimedia Commons',
  ampliar: (o: string) => `Ampliar: ${o}`,
  fechar: 'Fechar',
  emIsrael: 'Em Israel, de verdade'
} as const;

const en: Traducao<typeof pt> = {
  dominioPublico: 'Public domain',
  origem: 'Wikimedia Commons',
  ampliar: (o: string) => `Enlarge: ${o}`,
  fechar: 'Close',
  emIsrael: 'In Israel, for real'
};

const es: Traducao<typeof pt> = {
  dominioPublico: 'Dominio público',
  origem: 'Wikimedia Commons',
  ampliar: (o: string) => `Ampliar: ${o}`,
  fechar: 'Cerrar',
  emIsrael: 'En Israel, de verdad'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
