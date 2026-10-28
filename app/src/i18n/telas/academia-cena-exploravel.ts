import type { Traducao } from '..';

/* components/aventura/CenaExploravel.tsx - a cena explorável do módulo. */
const pt = {
  explore: (lugar: string) => `Explore ${lugar}`,
  instrucao: 'Toque nos pontos do desenho: cada um é uma palavra do curso.',
  visto: ', visto',
  comPontos: 'Com os pontos:',
  ouvir: 'Ouvir',
  ouvirAria: (palavra: string) => `Ouvir ${palavra}`,
  faltaModulo: (n: number | string) => `A palavra em hebraico aparece aqui quando você começar o módulo ${n}.`,
  faltaLetra: (letra: string) => `A palavra em hebraico aparece aqui quando você começar a letra ${letra}.`,
  letraQueFalta: 'que falta',
  nenhum: 'Nenhum ponto aberto ainda.',
  todas: (n: number) => `Você encontrou as ${n} palavras do lugar.`,
  contagem: (vistos: number, total: number) => `${vistos} de ${total} encontradas`
} as const;

const en: Traducao<typeof pt> = {
  explore: (lugar: string) => `Explore ${lugar}`,
  instrucao: 'Tap the dots in the drawing: each one is a word from the course.',
  visto: ', seen',
  comPontos: 'With the dots:',
  ouvir: 'Listen',
  ouvirAria: (palavra: string) => `Listen to ${palavra}`,
  faltaModulo: (n: number | string) => `The Hebrew word shows up here when you start module ${n}.`,
  faltaLetra: (letra: string) => `The Hebrew word shows up here when you start the letter ${letra}.`,
  letraQueFalta: 'you still need',
  nenhum: 'No dots opened yet.',
  todas: (n: number) => `You found all ${n} words in this place.`,
  contagem: (vistos: number, total: number) => `${vistos} of ${total} found`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
