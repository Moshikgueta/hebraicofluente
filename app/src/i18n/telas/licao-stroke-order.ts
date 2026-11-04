import type { Traducao } from '..';

/* components/learn/StrokeOrder.tsx */
const pt = {
  rotulo: (letra: string, n: number) =>
    `Ordem dos traços da letra ${letra}: ${n} ${n === 1 ? 'movimento' : 'movimentos'}`,
  mostrando: 'Mostrando…',
  verDeNovo: 'Ver de novo',
  movimentos: (n: number) => (n === 1 ? 'um movimento só' : `${n} movimentos, nesta ordem`)
} as const;

const en: Traducao<typeof pt> = {
  rotulo: (letra, n) => `Stroke order for the letter ${letra}: ${n} ${n === 1 ? 'stroke' : 'strokes'}`,
  mostrando: 'Showing…',
  verDeNovo: 'Show again',
  movimentos: n => (n === 1 ? 'just one stroke' : `${n} strokes, in this order`)
};

const es: Traducao<typeof pt> = {
  rotulo: (letra, n) => `Orden de los trazos de la letra ${letra}: ${n} ${n === 1 ? 'movimiento' : 'movimientos'}`,
  mostrando: 'Mostrando…',
  verDeNovo: 'Ver de nuevo',
  movimentos: n => (n === 1 ? 'un solo movimiento' : `${n} movimientos, en este orden`)
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
