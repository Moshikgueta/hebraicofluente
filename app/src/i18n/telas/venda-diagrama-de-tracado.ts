import type { Traducao } from '..';

/* components/landing/DiagramaDeTracado.tsx */
const pt = {
  movimentos: (n: number) => `${n} ${n === 1 ? 'movimento' : 'movimentos'}`,
  alt: (letra: string, quantos: string) =>
    `Ordem dos traços da letra ${letra}: ${quantos}, com o ponto de partida marcado.`
} as const;

const en: Traducao<typeof pt> = {
  movimentos: (n: number) => `${n} ${n === 1 ? 'stroke' : 'strokes'}`,
  alt: (letra: string, quantos: string) =>
    `Stroke order for the letter ${letra}: ${quantos}, with the starting point marked.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
