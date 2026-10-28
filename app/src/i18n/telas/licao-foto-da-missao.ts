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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
