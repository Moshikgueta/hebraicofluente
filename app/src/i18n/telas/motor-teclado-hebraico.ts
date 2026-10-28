import type { Traducao } from '..';

/* lib/teclado-hebraico.ts - o nome lido de cada tecla do teclado da tela.
   Os nomes das letras e dos sinais são transliteração (etapa 3) e ficam no
   código; aqui só o que é português. */
const pt = {
  final: (nome: string): string => `${nome} final`,
  daguesh: 'daguesh (ponto dentro)',
  pontoShin: 'ponto do Shin',
  pontoSin: 'ponto do Sin'
} as const;

const en: Traducao<typeof pt> = {
  final: (nome: string): string => `final ${nome}`,
  daguesh: 'daguesh (dot inside)',
  pontoShin: 'Shin dot',
  pontoSin: 'Sin dot'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
