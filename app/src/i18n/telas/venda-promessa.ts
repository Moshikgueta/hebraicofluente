import type { Traducao } from '..';

/* components/landing/Promessa.tsx */
const pt = {
  aprendeLetras: (n: number) => `as ${n} letras`,
  aprendeSons: 'os sons',
  aprendeNikud: 'o nikud, os sinais de vogal',
  aprendeCursiva: 'a escrita cursiva',
  aprendePalavras: 'palavras reais, passo a passo',
  nadaTabela: 'Nada de decorar uma tabela inteira no primeiro dia.',
  nadaTransliteracao: 'Nada de depender eternamente de transliteração.',
  titulo: 'O que você aprende no Hebraico Fluente',
  exercicios: 'Com exercícios interativos e correção imediata em cada etapa, em português, feito para brasileiros.',
  numeros: (letras: number, licoes: number, meses: number) =>
    `${letras} letras em ${licoes} lições · progresso salvo na sua conta · acesso por ${meses} meses`,
  base: 'Você aprende a entender o alfabeto de verdade e constrói a base para ler hebraico em Israel, estudar o idioma e se aproximar dos textos na língua original.'
} as const;

const en: Traducao<typeof pt> = {
  aprendeLetras: (n: number) => `the ${n} letters`,
  aprendeSons: 'the sounds',
  aprendeNikud: 'nikud, the vowel signs',
  aprendeCursiva: 'cursive handwriting',
  aprendePalavras: 'real words, step by step',
  nadaTabela: 'No memorizing a whole chart on day one.',
  nadaTransliteracao: 'No depending on transliteration forever.',
  titulo: 'What you learn at Hebraico Fluente',
  exercicios: 'With interactive exercises and instant feedback at every step, in English, made for English speakers.',
  numeros: (letras: number, licoes: number, meses: number) =>
    `${letras} letters in ${licoes} lessons · progress saved to your account · ${meses} months of access`,
  base: 'You learn to truly understand the alphabet and build the foundation to read Hebrew in Israel, study the language and get closer to the texts in the original language.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
