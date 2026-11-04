import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/Blocks.tsx */
const pt = {
  paraLer: 'Para ler',
  paraEscrever: 'Para escrever à mão',
  sai: 'Sai',
  certo: 'Certo',
  ouvirNome: (nome: string) => `Ouvir ${nome}`,
  leiaCadaSilaba: 'Leia cada sílaba em voz alta três vezes. É a repetição falada que fixa o som.',
  ouvir: 'Ouvir',
  mostrarSignificado: 'Mostrar significado',
  jaConhece: 'Você já conhece estas palavras',
  importou: (he: ReactNode): ReactNode =>
    <>O hebraico moderno importou centenas de palavras. Você já sabe o que elas querem dizer - só nunca as viu escritas assim. Ache o {he} dentro de cada uma.</>,
  ouvirEmHebraico: (pt: string) => `Ouvir ${pt} em hebraico`,
  acento: 'O acento e as vogais são os do hebraico, não os do português. Ouça antes de ler.',
  naoTente: 'Não tente ler a palavra inteira ainda - ela usa letras que você ainda não aprendeu.',
  mundoReal: 'Hebraico no mundo real',
  conferir: 'Você consegue ler? Conferir',
  mostrarResposta: 'Você consegue ler? Mostrar resposta',
  noFim: 'no fim da palavra',
  ipa: 'Transcrição fonética (IPA)',
  ouvirLetra: 'Ouvir a letra'
} as const;

const en: Traducao<typeof pt> = {
  paraLer: 'To read',
  paraEscrever: 'To write by hand',
  // etapa 3: pronúncia, rever
  sai: 'What comes out',
  certo: 'Correct',
  ouvirNome: nome => `Listen to ${nome}`,
  leiaCadaSilaba: 'Read each syllable aloud three times. Saying it out loud is what makes the sound stick.',
  ouvir: 'Listen',
  mostrarSignificado: 'Show meaning',
  jaConhece: 'You already know these words',
  importou: he =>
    <>Modern Hebrew has borrowed hundreds of words. You already know what they mean - you have just never seen them written this way. Find the {he} inside each one.</>,
  ouvirEmHebraico: pt => `Listen to ${pt} in Hebrew`,
  // etapa 3: pronúncia, rever
  acento: 'The stress and the vowels are Hebrew ones, not English ones. Listen before you read.',
  naoTente: 'Do not try to read the whole word yet - it uses letters you have not learned yet.',
  mundoReal: 'Hebrew in the real world',
  conferir: 'Can you read it? Check',
  mostrarResposta: 'Can you read it? Show answer',
  noFim: 'at the end of a word',
  ipa: 'Phonetic transcription (IPA)',
  ouvirLetra: 'Listen to the letter'
};

const es: Traducao<typeof pt> = {
  paraLer: 'Para leer',
  paraEscrever: 'Para escribir a mano',
  // etapa 3: pronúncia, rever
  sai: 'Lo que suena',
  certo: 'Correcto',
  ouvirNome: nome => `Escuchar ${nome}`,
  leiaCadaSilaba: 'Lee cada sílaba en voz alta tres veces. Es la repetición en voz alta la que fija el sonido.',
  ouvir: 'Escuchar',
  mostrarSignificado: 'Mostrar el significado',
  jaConhece: 'Ya conoces estas palabras',
  importou: he =>
    <>El hebreo moderno tomó prestadas cientos de palabras. Ya sabes lo que quieren decir - solo que nunca las viste escritas así. Encuentra la {he} dentro de cada una.</>,
  ouvirEmHebraico: pt => `Escuchar ${pt} en hebreo`,
  // etapa 3: pronúncia, rever
  acento: 'El acento y las vocales son los del hebreo, no los del español. Escucha antes de leer.',
  naoTente: 'No intentes leer la palabra entera todavía - usa letras que aún no aprendiste.',
  mundoReal: 'Hebreo en el mundo real',
  conferir: '¿Puedes leerla? Comprobar',
  mostrarResposta: '¿Puedes leerla? Mostrar la respuesta',
  noFim: 'al final de la palabra',
  ipa: 'Transcripción fonética (IPA)',
  ouvirLetra: 'Escuchar la letra'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
