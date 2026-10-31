import type { Traducao } from '..';

/* components/learn/OrdemPedagogica.tsx */
const pt = {
  titulo: 'Por que as letras não estão em ordem alfabética?',
  esperando: 'Talvez você estivesse esperando começar assim:',
  tradicional: 'A ordem tradicional',
  desteCurso: 'A ordem deste curso',
  foraDeOrdem: 'Você não está aprendendo as letras fora de ordem.',
  pensada: 'Está aprendendo numa ordem pensada para você começar a ler mais cedo.',
  compra: 'O que essa ordem compra?',
  peca:
    'Cada letra nova é uma peça que aumenta o que você consegue montar com as que já tem. É o mesmo princípio de um jogo de montar: a terceira peça vale mais do que a primeira, porque ela se combina com as duas anteriores.',
  passo1: 'Uma letra nova',
  passo1d: 'você aprende a forma, o som e como escrevê-la',
  passo2: 'Ela se combina com as anteriores',
  passo2d: 'e isso não é enfeite: é o que faz a letra render',
  passo3: 'Saem sílabas',
  passo3d: 'a consoante com cada sinal de vogal',
  passo4: 'Saem palavras',
  passo4d: 'feitas só com o que você já conhece',
  passo5: 'E a próxima letra rende mais ainda',
  passo5d: 'porque agora há mais peças na mesa',
  alfabetica: (a: string, b: string) =>
    `Em ordem alfabética isso não acontece tão cedo: ${a} e ${b} não formam palavra nenhuma sozinhas, e o aluno passa várias lições decorando desenhos antes de ler a primeira coisa.`,
  objetivo: 'E o objetivo não é decorar 22 símbolos',
  objetivoTexto:
    'É reconhecer as letras, ligar forma e som, escrever à mão, combinar, ler sílabas, formar palavras, reconhecer padrões e começar a ler texto de verdade. Decorar a sequência do alfabeto é uma das coisas mais fáceis dessa lista, e a menos útil sozinha.',
  verTradicional: 'Ver o alfabeto na ordem tradicional',
  importante:
    'Esta ordem continua importante, e você vai precisar dela: é a do dicionário, a da lista telefônica, a das referências, a que os israelenses recitam. Aqui ela está com o número da lição em que cada letra aparece neste curso.',
  licao: (n: number) => `lição ${n}`,
  aindaNaoViu: 'Ainda não viu como o alfabeto funciona?',
  comece: 'Comece pela aula 0'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Why aren\'t the letters in alphabetical order?',
  esperando: 'Maybe you were expecting to start like this:',
  tradicional: 'The traditional order',
  desteCurso: 'The order in this course',
  foraDeOrdem: 'You are not learning the letters out of order.',
  pensada: 'You are learning them in an order designed to get you reading sooner.',
  compra: 'What does this order buy you?',
  peca:
    'Each new letter is a piece that adds to what you can build with the ones you already have. It is the same idea as a building set: the third piece is worth more than the first, because it combines with the two before it.',
  passo1: 'A new letter',
  passo1d: 'you learn its shape, its sound and how to write it',
  passo2: 'It combines with the earlier ones',
  passo2d: 'and that is not decoration: it is what makes the letter pay off',
  passo3: 'Syllables appear',
  passo3d: 'the consonant with each vowel sign',
  passo4: 'Words appear',
  passo4d: 'made only from what you already know',
  passo5: 'And the next letter pays off even more',
  passo5d: 'because now there are more pieces on the table',
  alfabetica: (a, b) =>
    `In alphabetical order this does not happen so early: ${a} and ${b} do not form any word on their own, and the learner spends several lessons memorizing shapes before reading anything.`,
  objetivo: 'And the goal is not to memorize 22 symbols',
  objetivoTexto:
    'It is to recognize the letters, connect shape and sound, write by hand, combine, read syllables, form words, spot patterns and start reading real text. Memorizing the sequence of the alphabet is one of the easiest things on that list, and the least useful on its own.',
  verTradicional: 'See the alphabet in traditional order',
  importante:
    'This order still matters, and you will need it: it is the order of the dictionary, of phone books, of references, the one Israelis recite. Here it comes with the number of the lesson where each letter appears in this course.',
  licao: n => `lesson ${n}`,
  aindaNaoViu: 'Haven\'t seen how the alphabet works yet?',
  comece: 'Start with lesson 0'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
