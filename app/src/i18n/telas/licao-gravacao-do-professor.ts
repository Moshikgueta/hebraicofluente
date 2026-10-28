import type { Traducao } from '..';

/* components/learn/GravacaoDoProfessor.tsx */
const pt = {
  ouvir: 'Ouvir'
} as const;

const en: Traducao<typeof pt> = {
  ouvir: 'Listen'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
