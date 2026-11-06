import type { Traducao } from '..';

/* lib/diario.ts - as entradas do Diário de descobertas. */
const pt = {
  aula0: 'Concluiu a Aula 0: entendeu como o hebraico funciona.',
  letra: 'Aprendeu a letra {nome}.',
  checkpoint: 'Passou no checkpoint do módulo {n}.',
  leitura: 'Fez a Primeira Leitura do módulo {n}.',
  texto: 'Leu o mini-texto do módulo {n}.',
  missao: 'Cumpriu a missão do módulo {n}.',
  conquista: 'Conquista: {titulo}.'
} as const;

const en: Traducao<typeof pt> = {
  aula0: 'Finished Lesson 0: understood how Hebrew works.',
  letra: 'Learned the letter {nome}.',
  checkpoint: 'Passed the module {n} checkpoint.',
  leitura: 'Did the First Reading of module {n}.',
  texto: 'Read the short text of module {n}.',
  missao: 'Completed the module {n} mission.',
  conquista: 'Achievement: {titulo}.'
};

const es: Traducao<typeof pt> = {
  aula0: 'Terminó la Clase 0: entendió cómo funciona el hebreo.',
  letra: 'Aprendió la letra {nome}.',
  checkpoint: 'Aprobó el checkpoint del módulo {n}.',
  leitura: 'Hizo la Primera Lectura del módulo {n}.',
  texto: 'Leyó el minitexto del módulo {n}.',
  missao: 'Cumplió la misión del módulo {n}.',
  conquista: 'Logro: {titulo}.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
