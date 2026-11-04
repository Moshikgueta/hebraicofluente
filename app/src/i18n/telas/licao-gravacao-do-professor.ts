import type { Traducao } from '..';

/* components/learn/GravacaoDoProfessor.tsx */
const pt = {
  ouvir: 'Ouvir'
} as const;

const en: Traducao<typeof pt> = {
  ouvir: 'Listen'
};

const es: Traducao<typeof pt> = {
  ouvir: 'Escuchar'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
