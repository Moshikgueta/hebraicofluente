import type { Traducao } from '..';

/* O que vale para o site inteiro: a marca e o cartão do site. */
const pt = {
  marca: 'Hebraico Fluente',
  titulo: 'Hebraico Fluente - a plataforma de hebraico para brasileiros',
  descricao:
    'Hebraico para brasileiros, começando pelo alfabeto: aulas interativas, correção na ' +
    'hora e progresso que continua de onde você parou.'
} as const;

const en: Traducao<typeof pt> = {
  /* O nome da marca em inglês ainda é decisão do dono, junto com o domínio. */
  marca: 'Hebraico Fluente',
  titulo: 'Hebraico Fluente - learn to read Hebrew from zero',
  descricao:
    'Learn to read and write Hebrew, starting with the alphabet: interactive lessons, ' +
    'instant feedback and progress that picks up where you left off.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
