import type { Traducao } from '..';

/* components/learn/Compreensao.tsx */
const pt = {
  verdadeiro: 'Verdadeiro',
  falso: 'Falso',
  isso: 'Isso. ',
  certaEmVerde: 'A resposta certa é a marcada em verde. ',
  placar: (certas: number, total: number) => `${certas} de ${total}`
} as const;

const en: Traducao<typeof pt> = {
  verdadeiro: 'True',
  falso: 'False',
  isso: 'That\'s right. ',
  certaEmVerde: 'The correct answer is the one marked in green. ',
  placar: (certas, total) => `${certas} of ${total}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
