import type { Traducao } from '..';

/* lib/content-publico.ts - a estimativa de tempo do curso, com a conta à
   vista. */
const pt = {
  umMes: 'cerca de um mês',
  meses: (n: number): string => `cerca de ${n} meses`,
  tresPorSemana: (n: number): string => (n === 1 ? 'cerca de um mês' : `uns ${n} meses`),
  tempo: 'Cada letra leva cerca de dez minutos, e são {letras}, mais {sons} lições de som e os checkpoints. Quem estuda uma por dia termina em {umPorDia}; quem estuda três por semana leva {tresPorSemana}.'
} as const;

const en: Traducao<typeof pt> = {
  umMes: 'about a month',
  meses: (n: number): string => `about ${n} months`,
  tresPorSemana: (n: number): string => (n === 1 ? 'about a month' : `around ${n} months`),
  tempo: 'Each letter takes about ten minutes, and there are {letras}, plus {sons} sound lessons and the checkpoints. If you study one a day, you finish in {umPorDia}; at three a week, it takes {tresPorSemana}.'
};

const es: Traducao<typeof pt> = {
  umMes: 'cerca de un mes',
  meses: (n: number): string => `cerca de ${n} meses`,
  tresPorSemana: (n: number): string => (n === 1 ? 'cerca de un mes' : `unos ${n} meses`),
  tempo: 'Cada letra lleva unos diez minutos, y son {letras}, más {sons} lecciones de sonido y los checkpoints. Si estudias una por día, terminas en {umPorDia}; con tres por semana, te lleva {tresPorSemana}.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
