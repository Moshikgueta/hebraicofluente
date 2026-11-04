import type { Traducao } from '..';

/* components/game/Match.tsx */
const pt = {
  instrucao: 'Toque num cartão e depois no que combina com ele.',
  cronometro: 'Cronômetro',
  parCorreto: 'Par correto.',
  naoCombinam: 'Esses dois não combinam.'
} as const;

const en: Traducao<typeof pt> = {
  instrucao: 'Tap a card and then the one that goes with it.',
  cronometro: 'Timer',
  parCorreto: 'Correct pair.',
  naoCombinam: 'Those two do not match.'
};

const es: Traducao<typeof pt> = {
  instrucao: 'Toca una tarjeta y después la que combina con ella.',
  cronometro: 'Cronómetro',
  parCorreto: 'Par correcto.',
  naoCombinam: 'Esos dos no combinan.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
