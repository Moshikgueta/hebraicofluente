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
  adaptacoes: 'The order in which the letters are introduced comes from his method. The exercises, the explanations and the cursive writing are mine.'
};

const es: Traducao<typeof pt> = {
  linha: (autor: string) => `Método inspirado en la obra del ${autor}.`,
  // tradução fiel ao inglês; o dono decide se o site em espanhol fala do aluno brasileiro
  adaptacoes: 'El orden en que se presentan las letras viene de su método. Los ejercicios, las explicaciones y la escritura cursiva son míos.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
