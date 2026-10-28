import type { Traducao } from '..';

/* app/historia/HistoriaClient.tsx - a viagem pela história do hebraico. */
const pt = {
  bonus: 'Bônus',
  titulo: 'Viagem pela história do hebraico',
  intro: 'Nada aqui é necessário para ler. É o contrário: são as coisas que ficam interessantes depois que você já consegue. As cartas abrem sozinhas conforme você domina letras - {n} até agora.'
} as const;

const en: Traducao<typeof pt> = {
  bonus: 'Bonus',
  titulo: 'A journey through the history of Hebrew',
  intro: 'Nothing here is needed to read. It is the other way around: these are the things that get interesting once you already can. The cards open on their own as you master letters - {n} so far.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
