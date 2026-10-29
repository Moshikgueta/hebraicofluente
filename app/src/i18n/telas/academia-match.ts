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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
