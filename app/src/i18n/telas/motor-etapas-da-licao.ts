import type { Traducao } from '..';

/* lib/etapas-da-licao.ts - as abas da lição (os mesmos nomes de `STAGES` em
   LessonClient) e o que o aluno faz em cada uma. */
const NUMEROS_PT = ['Zero', 'Uma', 'Duas', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete'];
const NUMEROS_EN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];

const pt = {
  conhecer: 'Conhecer',
  conhecerAudio: 'A forma, o nome e o som da letra, com o áudio do professor e a explicação em português.',
  conhecerSemAudio: 'A forma, o nome e o som da letra, com a explicação em português.',
  palavras: 'Palavras',
  palavrasDesc: 'Palavras reais para ler, montadas só com letras que você já aprendeu.',
  escrever: 'Escrever',
  escreverDesc: 'A letra em cursiva, traçada com o dedo na ordem certa dos traços.',
  fixacao: 'Fixação',
  fixacaoDesc: 'Ouvir, observar e lembrar a letra, com apoio a cada passo e sem nota.',
  exercicios: 'Exercícios',
  exerciciosDesc: 'Exercícios variados com nota, corrigidos na hora. O que você errar volta depois, na revisão.',
  numero: (n: number): string => NUMEROS_PT[n] ?? String(n)
} as const;

const en: Traducao<typeof pt> = {
  conhecer: 'Meet',
  conhecerAudio: 'The shape, name and sound of the letter, with the teacher\'s audio and an explanation in English.',
  conhecerSemAudio: 'The shape, name and sound of the letter, with an explanation in English.',
  palavras: 'Words',
  palavrasDesc: 'Real words to read, built only from letters you have already learned.',
  escrever: 'Write',
  escreverDesc: 'The letter in cursive, traced with your finger in the right stroke order.',
  fixacao: 'Reinforce',
  fixacaoDesc: 'Listen, look and remember the letter, with support at every step and no score.',
  exercicios: 'Exercises',
  exerciciosDesc: 'Varied, scored exercises, corrected on the spot. Whatever you get wrong comes back later, in review.',
  numero: (n: number): string => NUMEROS_EN[n] ?? String(n)
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
