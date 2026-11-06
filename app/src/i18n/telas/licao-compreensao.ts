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

const es: Traducao<typeof pt> = {
  verdadeiro: 'Verdadero',
  falso: 'Falso',
  isso: 'Eso es. ',
  certaEmVerde: 'La respuesta correcta es la marcada en verde. ',
  placar: (certas, total) => `${certas} de ${total}`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
