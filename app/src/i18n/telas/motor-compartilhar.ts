import type { Traducao } from '..';

/* lib/compartilhar.ts - a frase da imagem de conquista (em primeira pessoa),
   a legenda e o selo da imagem. */
const pt = {
  primeiraLetra: 'Aprendi a minha primeira letra em hebraico',
  primeiraPalavra: 'Li a minha primeira palavra em hebraico',
  semApoio: 'Li uma palavra em hebraico sem transliteração',
  tresDias: 'Três dias seguidos estudando hebraico',
  dezLetras: 'Já sei 10 letras do alfabeto hebraico',
  metade: 'Já sei metade do alfabeto hebraico',
  vinteEDuas: 'Aprendi as 22 letras do alfabeto hebraico',
  checkpointPerfeito: 'Fiz um checkpoint sem nenhum erro',
  lePalavras: (n: number): string => `Já consigo ler ${n} palavras em hebraico`,
  meuNome: 'Escrevi o meu nome em hebraico',
  leitor: 'Concluí o curso de alfabetização em hebraico',
  modulo: (n: number): string => `Concluí o módulo ${n} do curso de hebraico`,
  legenda: 'Aprendendo a ler hebraico com o @hebraicofluente · hebraicofluente.com.br',
  selo: 'C O N Q U I S T A'
} as const;

const en: Traducao<typeof pt> = {
  primeiraLetra: 'I learned my first letter in Hebrew',
  primeiraPalavra: 'I read my first word in Hebrew',
  semApoio: 'I read a word in Hebrew without transliteration',
  tresDias: 'Three days in a row studying Hebrew',
  dezLetras: 'I already know 10 letters of the Hebrew alphabet',
  metade: 'I already know half of the Hebrew alphabet',
  vinteEDuas: 'I learned all 22 letters of the Hebrew alphabet',
  checkpointPerfeito: 'I passed a checkpoint without a single mistake',
  lePalavras: (n: number): string => `I can already read ${n} words in Hebrew`,
  meuNome: 'I wrote my name in Hebrew',
  leitor: 'I finished the Hebrew reading course',
  modulo: (n: number): string => `I finished module ${n} of the Hebrew course`,
  // o endereço e o @ do site em inglês ainda não existem: rever com o domínio
  legenda: 'Learning to read Hebrew with @hebraicofluente · hebraicofluente.com.br',
  selo: 'A C H I E V E M E N T'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
