import type { Traducao } from '..';

/* lib/sons.ts - os exercícios das lições de som (Sin, Vet, Chaf, Fe, os sons
   do guéresh e o contraste da lição 20). */
const pt = {
  aula0: 'Aula 0',
  silabaLeitura: 'Como se lê esta sílaba?',
  seLeAssim: 'Qual destas se lê assim?',
  palavraLeitura: 'Como se lê esta palavra?',
  ouvirSilaba: 'Ouça. Qual foi a sílaba?',
  leiaPalavra: 'Leia em voz alta. Que palavra é esta?',
  qualSom: 'Que som esta letra tem?',
  ouvirLetra: 'Ouça. Qual letra foi dita?',
  palavraComSom: 'Qual destas palavras tem o som {som}?',
  contrasteSilaba: '{he}, {rotulo}, é "{leitura}". {parHe}, {parRotulo}, seria "{parLeitura}".',
  contrasteDesenho: '"{leitura}" é {he}, {rotulo}. {parHe}, {parRotulo}, é "{parLeitura}".',
  contrastePalavra: '{he} - "{leitura}", {sentido}. A letra está {rotulo}: soa {som}.',
  foiRotulo: 'Foi {he}, "{leitura}" - {rotulo}.',
  suaveSilaba: '{he} é "{leitura}": {letra} {rotulo} soa {som}, e a vogal decide o resto.',
  suaveDesenho: '"{leitura}" é {he}.',
  suavePalavra: '{he} - "{leitura}", {sentido}. O {letra} soa {som}.',
  palavraSentido: '{he} - "{leitura}", {sentido}.',
  foi: 'Foi {he}, "{leitura}".',
  gerechLetra: '{he}, com o guéresh, é {som} - {como}. Sem o sinal, {parHe} é {parSom}.',
  gerechDesenho: '{som} é {he}, com o traço. {parHe}, sem ele, é {parSom}.',
  gerechPalavra: '{he} - "{leitura}", {sentido}. O {letra} faz o som {som}.',
  gerechQual: '{he} tem {letra}, com o traço. As outras têm {parHe} sem o sinal, que soa {parSom}.',
  gerechOuvir: 'Foi {he}: {som}.'
} as const;

const en: Traducao<typeof pt> = {
  aula0: 'Lesson 0',
  silabaLeitura: 'How is this syllable read?',
  seLeAssim: 'Which of these is read like this?',
  palavraLeitura: 'How is this word read?',
  ouvirSilaba: 'Listen. Which syllable was it?',
  leiaPalavra: 'Read it out loud. Which word is this?',
  qualSom: 'What sound does this letter have?',
  ouvirLetra: 'Listen. Which letter was said?',
  palavraComSom: 'Which of these words has the sound {som}?',
  contrasteSilaba: '{he}, {rotulo}, is "{leitura}". {parHe}, {parRotulo}, would be "{parLeitura}".',
  contrasteDesenho: '"{leitura}" is {he}, {rotulo}. {parHe}, {parRotulo}, is "{parLeitura}".',
  contrastePalavra: '{he} - "{leitura}", {sentido}. The letter is {rotulo}: it sounds {som}.',
  foiRotulo: 'It was {he}, "{leitura}" - {rotulo}.',
  suaveSilaba: '{he} is "{leitura}": {letra} {rotulo} sounds {som}, and the vowel decides the rest.',
  suaveDesenho: '"{leitura}" is {he}.',
  suavePalavra: '{he} - "{leitura}", {sentido}. The {letra} sounds {som}.',
  palavraSentido: '{he} - "{leitura}", {sentido}.',
  foi: 'It was {he}, "{leitura}".',
  gerechLetra: '{he}, with the guéresh, is {som} - {como}. Without the sign, {parHe} is {parSom}.',
  gerechDesenho: '{som} is {he}, with the mark. {parHe}, without it, is {parSom}.',
  gerechPalavra: '{he} - "{leitura}", {sentido}. The {letra} makes the sound {som}.',
  gerechQual: '{he} has {letra}, with the mark. The others have {parHe} without the sign, which sounds {parSom}.',
  gerechOuvir: 'It was {he}: {som}.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
