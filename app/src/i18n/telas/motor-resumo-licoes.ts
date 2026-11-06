import type { Traducao } from '..';

/* lib/resumo-licoes.ts - "Este módulo tem 7 lições: 3 de letra nova, 4 de
   som.", contado das lições do módulo. */
const POR_EXTENSO_PT = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const POR_EXTENSO_EN = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const POR_EXTENSO_ES = ['ninguna', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];

const pt = {
  porExtenso: (n: number): string => POR_EXTENSO_PT[n] ?? String(n),
  letraNova: '{n} de letra nova',
  som: '{n} de som',
  leitura: '{n} de leitura',
  pratica: '{n} de prática, sem letra nova',
  lista: (inicio: string, ultimo: string): string => `${inicio} e ${ultimo}`,
  resumo: (n: string, total: number, lista: string): string =>
    `Este módulo tem ${n} ${total === 1 ? 'lição' : 'lições'}${lista ? `: ${lista}` : ''}.`
} as const;

const en: Traducao<typeof pt> = {
  porExtenso: (n: number): string => POR_EXTENSO_EN[n] ?? String(n),
  letraNova: '{n} with a new letter',
  som: '{n} on a sound',
  leitura: '{n} on reading',
  pratica: '{n} for practice, with no new letter',
  lista: (inicio: string, ultimo: string): string => `${inicio} and ${ultimo}`,
  resumo: (n: string, total: number, lista: string): string =>
    `This module has ${n} ${total === 1 ? 'lesson' : 'lessons'}${lista ? `: ${lista}` : ''}.`
};

const es: Traducao<typeof pt> = {
  porExtenso: (n: number): string => POR_EXTENSO_ES[n] ?? String(n),
  letraNova: '{n} de letra nueva',
  som: '{n} de sonido',
  leitura: '{n} de lectura',
  pratica: '{n} de práctica, sin letra nueva',
  lista: (inicio: string, ultimo: string): string => `${inicio} y ${ultimo}`,
  resumo: (n: string, total: number, lista: string): string =>
    `Este módulo tiene ${n} ${total === 1 ? 'lección' : 'lecciones'}${lista ? `: ${lista}` : ''}.`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
