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
  gerechLetra: '{he}, with the geresh, is {som} - {como}. Without the sign, {parHe} is {parSom}.',
  gerechDesenho: '{som} is {he}, with the mark. {parHe}, without it, is {parSom}.',
  gerechPalavra: '{he} - "{leitura}", {sentido}. The {letra} makes the sound {som}.',
  gerechQual: '{he} has {letra}, with the mark. The others have {parHe} without the sign, which sounds {parSom}.',
  gerechOuvir: 'It was {he}: {som}.'
};

const es: Traducao<typeof pt> = {
  aula0: 'Clase 0',
  silabaLeitura: '¿Cómo se lee esta sílaba?',
  seLeAssim: '¿Cuál de estas se lee así?',
  palavraLeitura: '¿Cómo se lee esta palabra?',
  ouvirSilaba: 'Escucha. ¿Cuál fue la sílaba?',
  leiaPalavra: 'Léela en voz alta. ¿Qué palabra es esta?',
  qualSom: '¿Qué sonido tiene esta letra?',
  ouvirLetra: 'Escucha. ¿Qué letra se dijo?',
  palavraComSom: '¿Cuál de estas palabras tiene el sonido {som}?',
  contrasteSilaba: '{he}, {rotulo}, es "{leitura}". {parHe}, {parRotulo}, sería "{parLeitura}".',
  contrasteDesenho: '"{leitura}" es {he}, {rotulo}. {parHe}, {parRotulo}, es "{parLeitura}".',
  contrastePalavra: '{he} - "{leitura}", {sentido}. La letra está {rotulo}: suena {som}.',
  foiRotulo: 'Fue {he}, "{leitura}" - {rotulo}.',
  suaveSilaba: '{he} es "{leitura}": {letra} {rotulo} suena {som}, y la vocal decide el resto.',
  suaveDesenho: '"{leitura}" es {he}.',
  suavePalavra: '{he} - "{leitura}", {sentido}. La {letra} suena {som}.',
  palavraSentido: '{he} - "{leitura}", {sentido}.',
  foi: 'Fue {he}, "{leitura}".',
  gerechLetra: '{he}, con el guéresh, es {som} - {como}. Sin el signo, {parHe} es {parSom}.',
  gerechDesenho: '{som} es {he}, con la rayita. {parHe}, sin ella, es {parSom}.',
  gerechPalavra: '{he} - "{leitura}", {sentido}. La {letra} hace el sonido {som}.',
  gerechQual: '{he} tiene {letra}, con la rayita. Las otras tienen {parHe} sin el signo, que suena {parSom}.',
  gerechOuvir: 'Fue {he}: {som}.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
