import type { Traducao } from '..';

/* lib/credito.ts - o crédito ao método de origem. A frase da ordem das
   letras só pode morar aqui e em lib/credito.ts (promessas.mjs confere). */
const pt = {
  /* O nome do autor entra como parâmetro: ele mora só em lib/credito.ts
     (check-legal.mjs confere). */
  linha: (autor: string) => `Método inspirado na obra do ${autor}.`,
  adaptacoes: 'A ordem em que as letras entram vem do método dele. A adaptação para o aluno brasileiro é minha: os exercícios, as explicações pensadas para quem fala português e a escrita cursiva.'
} as const;

const en: Traducao<typeof pt> = {
  linha: (autor: string) => `Method inspired by the work of ${autor}.`,
  // tradução fiel; o dono decide se o site em inglês fala do aluno brasileiro
  adaptacoes: 'The order in which the letters are introduced comes from his method. The adaptation for Brazilian learners is mine: the exercises, the explanations written for Portuguese speakers, and the cursive writing.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
