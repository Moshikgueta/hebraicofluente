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

const es: Traducao<typeof pt> = {
  vocEstaEm: 'Estás en',
  inicio: 'Inicio'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
