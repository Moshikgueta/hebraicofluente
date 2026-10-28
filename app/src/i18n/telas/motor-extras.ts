import type { Traducao } from '..';

/* lib/engine/extras.ts - os exercícios dos módulos 6 (sem os pontos) e 7
   (o guéresh). */
const pt = {
  dagueshPergunta: 'Sem os pontos, como num jornal: nesta palavra («{sentido}»), que som tem a letra {nome}?',
  dagueshExplicaForte: 'Com daguesh: no começo da palavra ou depois de consoante que fecha a sílaba.',
  dagueshExplicaSuave: 'Sem daguesh: quase sempre entre vogais, e no fim da palavra.',
  palavraExplica: '{he} - {leitura} - {sentido}. ',
  finalPergunta: 'Qual destas é a forma final de {nome}?',
  finalExplica: '{base} vira {final} no fim da palavra - como em {palavra} ({leitura}), "{sentido}".',
  semNikudPergunta: 'Sem nikud, como num jornal. O que está escrito?',
  semNikudExplica: '{nua} é {pontuada} - {leitura} - "{sentido}".',
  gerechPergunta: 'Que som esta letra tem?',
  gerechExplica: '{he} é {som} - {como}. Sem o guéresh, {base} é {baseSom}.',
  semSinalPergunta: 'E sem o sinal - que som ela tem?',
  semSinalExplica: 'Sem o guéresh, {base} é {baseSom}. Com ele, {he} é {som}.',
  palavraPergunta: 'Leia em voz alta. Que palavra é esta?',
  palavraGerechExplica: '{he} - "{sentido}". O {letra} faz o som {som}.'
} as const;

const en: Traducao<typeof pt> = {
  dagueshPergunta: 'Without the dots, as in a newspaper: in this word («{sentido}»), what sound does the letter {nome} have?',
  dagueshExplicaForte: 'With daguesh: at the beginning of the word or after a consonant that closes the syllable.',
  dagueshExplicaSuave: 'Without daguesh: almost always between vowels, and at the end of the word.',
  palavraExplica: '{he} - {leitura} - {sentido}. ',
  finalPergunta: 'Which of these is the final form of {nome}?',
  finalExplica: '{base} turns into {final} at the end of a word - as in {palavra} ({leitura}), "{sentido}".',
  semNikudPergunta: 'Without nikud, as in a newspaper. What does it say?',
  semNikudExplica: '{nua} is {pontuada} - {leitura} - "{sentido}".',
  gerechPergunta: 'What sound does this letter have?',
  gerechExplica: '{he} is {som} - {como}. Without the guéresh, {base} is {baseSom}.',
  semSinalPergunta: 'And without the sign - what sound does it have?',
  semSinalExplica: 'Without the guéresh, {base} is {baseSom}. With it, {he} is {som}.',
  palavraPergunta: 'Read it out loud. Which word is this?',
  palavraGerechExplica: '{he} - "{sentido}". The {letra} makes the sound {som}.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
