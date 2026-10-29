import type { Traducao } from '..';

/* app/blog - a lista de artigos e a página de cada um. */
const pt = {
  blog: 'Blog',
  metaTitulo: 'Blog do Hebraico Fluente: aprender a ler hebraico',
  metaDescricao: 'Artigos para quem quer ler hebraico: o alfabeto, as vogais, a direção da leitura e palavras para a viagem a Israel.',
  titulo: 'Aprender a ler hebraico',
  lead: 'Artigos curtos para quem está começando: o alfabeto, as vogais, a direção da leitura e as primeiras palavras.',
  vazio: 'Os primeiros artigos estão chegando.',
  ler: 'Ler o artigo',
  emResumo: 'Em resumo',
  atualizado: (data: string) => `Atualizado em ${data}`,
  testeTitulo: 'Experimente a primeira letra, de graça',
  testeLinha: 'Uma aula aberta, sem cadastro: o Álef, o som, a escrita e a primeira palavra.',
  testeBotao: 'Fazer o teste grátis',
  ctaTitulo: 'Aprenda a ler hebraico, uma letra por vez.',
  ctaLinha: 'Com áudio, escrita à mão e correção na hora, no celular ou no computador.',
  maisArtigos: 'Mais artigos'
} as const;

// rever: o blog é em português; a build em inglês sai sem artigos
const en: Traducao<typeof pt> = {
  blog: 'Blog',
  metaTitulo: 'Hebraico Fluente blog: learn to read Hebrew',
  metaDescricao: 'Articles for anyone who wants to read Hebrew: the alphabet, the vowels, the reading direction and words for a trip to Israel.',
  titulo: 'Learn to read Hebrew',
  lead: 'Short articles for beginners: the alphabet, the vowels, the reading direction and the first words.',
  vazio: 'The first articles are on their way.',
  ler: 'Read the article',
  emResumo: 'In short',
  atualizado: (data: string) => `Updated on ${data}`,
  testeTitulo: 'Try the first letter, for free',
  testeLinha: 'An open lesson, no sign-up: Alef, its sound, how to write it and the first word.',
  testeBotao: 'Take the free test',
  ctaTitulo: 'Learn to read Hebrew, one letter at a time.',
  ctaLinha: 'With audio, handwriting and instant feedback, on your phone or computer.',
  maisArtigos: 'More articles'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
