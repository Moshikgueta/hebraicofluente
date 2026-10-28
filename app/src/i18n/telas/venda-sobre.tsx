import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/sobre/page.tsx. A história do professor mora em venda-trajetoria.ts. */
const pt = {
  metaTitulo: 'Sobre o Moshik - Hebraico Fluente',
  metaDescricao:
    'Moshik Gueta, israelense, professor de hebraico e de idiomas: a trajetória no Brasil, em ' +
    'Israel e em Buenos Aires por trás do Hebraico Fluente.',
  trilha: 'Sobre',

  porqueEyebrow: 'Como o curso foi pensado',
  porqueTitulo: 'Três decisões que tornam o aprendizado mais leve.',
  porqueLead: 'Cada parte do curso foi organizada para evitar sobrecarga e deixar você avançar com confiança.',
  umaT: 'Uma letra de cada vez',
  umaB: 'Você conhece a letra, pratica com ela e só então avança. O que começa como um alfabeto completamente estranho vai ficando familiar aos poucos - e o que parecia impossível vira uma sequência de passos curtos.',
  apoioT: 'O apoio aparece e depois sai',
  apoioB: 'A transliteração ajuda no começo, e o objetivo nunca foi você depender dela. Ela diminui junto com o seu progresso, com exercícios feitos para cada etapa dessa retirada, até você ler direto do hebraico.',
  retornoT: 'Retorno na hora, em cada passo',
  retornoB: 'Você não precisa esperar por um professor para saber se acertou. Cada exercício corrige na hora, cada erro explica onde olhar, e o exame final diz antes de começar a nota que aprova e, no fim, quais partes pedem revisão.',

  origemEyebrow: 'O método',
  origemTitulo: 'Um método adaptado para brasileiros.',
  origemLead: 'Princípios consolidados de aprendizagem de idiomas, mais o que eu aprendi ensinando hebraico a quem fala português.',
  adaptacaoTitulo: 'O que é adaptação minha',
  adaptacaoTexto: 'Os exercícios, as explicações e a escrita cursiva foram pensados para as dificuldades de quem parte do português: as comparações com os nossos sons, os erros que só um brasileiro comete e tudo o que acontece na tela.',
  deOndeTitulo: 'De onde vem o método',
  deOndeTexto: (autor: string, obra: ReactNode, translit: string, adaptacoes: string): ReactNode => (
    <>O caminho que este curso segue parte do método do{' '}{autor}, autor de{' '}{obra}{' '}({translit}). O conteúdo do livro dele é a base do que a plataforma ensina. {adaptacoes}</>
  ),
  licoesImpressas: (n: number) =>
    `As ${n} lições, as palavras de cada letra e os exercícios vieram de material impresso e passaram para a plataforma pela mesma fonte: se uma palavra muda, muda nos dois.`,

  ctaTitulo: 'Tem uma dúvida antes de começar?',
  ctaLinha: (email: string) => `As mais comuns já estão respondidas. O que não estiver, escreva para ${email}.`,
  verDuvidas: 'Ver as dúvidas frequentes'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'About Moshik - Hebraico Fluente',
  metaDescricao:
    'Moshik Gueta, Israeli Hebrew and language teacher: the path through Brazil, ' +
    'Israel and Buenos Aires behind Hebraico Fluente.',
  trilha: 'About',

  porqueEyebrow: 'How the course was designed',
  porqueTitulo: 'Three choices that make learning lighter.',
  porqueLead: 'Every part of the course was organized to avoid overload and let you move forward with confidence.',
  umaT: 'One letter at a time',
  umaB: 'You get to know the letter, practice with it and only then move on. What starts as a completely foreign alphabet becomes familiar little by little - and what seemed impossible turns into a series of short steps.',
  apoioT: 'The support shows up and then leaves',
  apoioB: 'Transliteration helps at the start, and the goal was never for you to depend on it. It fades as you progress, with exercises made for each stage of that fading, until you read straight from the Hebrew.',
  retornoT: 'Feedback right away, at every step',
  retornoB: 'You do not have to wait for a teacher to know if you got it right. Every exercise corrects you right away, every mistake explains where to look, and the final exam tells you the passing score before you start and, at the end, which parts need review.',

  origemEyebrow: 'The method',
  origemTitulo: 'An adapted method.',
  origemLead: 'Established principles of language learning, plus what I learned teaching Hebrew to Portuguese speakers.',
  adaptacaoTitulo: 'What I adapted',
  // etapa 3: pronúncia, rever (a adaptação para quem fala inglês ainda está por fazer)
  adaptacaoTexto: 'The exercises, the explanations and the cursive writing were designed around the difficulties of people starting from another language: comparisons with sounds you already know, the mistakes beginners typically make and everything that happens on screen.',
  deOndeTitulo: 'Where the method comes from',
  deOndeTexto: (autor: string, obra: ReactNode, translit: string, adaptacoes: string): ReactNode => (
    <>The path this course follows builds on the method of{' '}{autor}, author of{' '}{obra}{' '}({translit}). The content of his book is the foundation of what the platform teaches. {adaptacoes}</>
  ),
  licoesImpressas: (n: number) =>
    `The ${n} lessons, the words for each letter and the exercises came from printed material and moved to the platform from the same source: if a word changes, it changes in both.`,

  ctaTitulo: 'Have a question before you start?',
  ctaLinha: (email: string) => `The most common ones are already answered. For anything else, write to ${email}.`,
  verDuvidas: 'See the frequently asked questions'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
