import type { Traducao } from '..';

/* components/portal/Migalhas.tsx - as migalhas do site público. */
const pt = {
  vocEstaEm: 'Você está em',
  inicio: 'Início'
} as const;

const en: Traducao<typeof pt> = {
  vocEstaEm: 'You are here',
  inicio: 'Home'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
