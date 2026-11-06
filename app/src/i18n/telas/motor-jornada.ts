import type { Traducao } from '..';

/* lib/jornada.ts - o nome de cada etapa de Minha Jornada no Hebraico. */
const pt = {
  aula0: 'Primeiros passos',
  final: 'Meu desafio final',
  m1: 'Reconhecendo as letras',
  m2: 'Descobrindo os sons',
  m3: 'Lendo minhas primeiras palavras',
  m4: 'Separando as letras parecidas',
  m5: 'Completando o alfabeto',
  m6: 'Lendo com mais autonomia',
  m7: 'Os sons do hebraico moderno'
} as const;

const en: Traducao<typeof pt> = {
  aula0: 'First steps',
  final: 'My final challenge',
  m1: 'Recognizing the letters',
  m2: 'Discovering the sounds',
  m3: 'Reading my first words',
  m4: 'Telling look-alike letters apart',
  m5: 'Completing the alphabet',
  m6: 'Reading more independently',
  m7: 'The sounds of modern Hebrew'
};

const es: Traducao<typeof pt> = {
  aula0: 'Primeros pasos',
  final: 'Mi desafío final',
  m1: 'Reconociendo las letras',
  m2: 'Descubriendo los sonidos',
  m3: 'Leyendo mis primeras palabras',
  m4: 'Separando las letras parecidas',
  m5: 'Completando el alfabeto',
  m6: 'Leyendo con más autonomía',
  m7: 'Los sonidos del hebreo moderno'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
