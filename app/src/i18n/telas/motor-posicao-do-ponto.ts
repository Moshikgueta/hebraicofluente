import type { Traducao } from '..';

/* lib/engine/posicao-do-ponto.ts - onde o ponto (daguesh) aparece, e o
   exercício da palavra com o ponto não impresso. */
const pt = {
  comeco: 'no começo da palavra',
  depoisDeConsoante: 'depois de consoante que fecha a sílaba (shva no meio da palavra)',
  depoisDeVogal: 'depois de vogal',
  pergunta: 'O ponto não foi impresso. Como se lê?',
  levaOPonto: 'leva o ponto',
  semOPonto: 'fica sem o ponto',
  explica: 'A letra {letra} está {posicao}: {decisao}, e soa {som}. {he} - "{leitura}", {sentido}.'
} as const;

const en: Traducao<typeof pt> = {
  comeco: 'at the beginning of the word',
  depoisDeConsoante: 'after a consonant that closes the syllable (shva in the middle of the word)',
  depoisDeVogal: 'after a vowel',
  pergunta: 'The dot was not printed. How is it read?',
  levaOPonto: 'it takes the dot',
  semOPonto: 'it goes without the dot',
  explica: 'The letter {letra} is {posicao}: {decisao}, and sounds {som}. {he} - "{leitura}", {sentido}.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
