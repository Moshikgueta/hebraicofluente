import type { Traducao } from '..';

/* lib/engine/palavras.ts - montar a palavra, a palavra em cursiva, digitar
   em hebraico e a rampa sem pontos. */
const pt = {
  monteCursiva: 'Monte em cursiva a palavra “{leitura}”.',
  monteLetras: 'Monte a palavra “{leitura}”, letra por letra.',
  primeiraADireita: 'A primeira letra fica à DIREITA.',
  comecaCom: 'Começa com {letra}.',
  monteExplicaCursiva: 'À mão, sem os sinais de vogal: é assim que se escreve de verdade.',
  monteExplicaPlaca: 'Sem os sinais de vogal, é assim que a palavra aparece numa placa.',
  cursivaExplica: '{he} - {leitura} - {sentido}. À mão ela se escreve sem os sinais de vogal, e é assim que você vai encontrá-la num bilhete.',
  cursivaLetra: 'Na palavra escrita à mão, que letra é esta, a destacada?',
  cursivaLetraOutra: 'Essa é outra letra. Compare o traço destacado com ela.',
  cursivaSentido: 'Esta palavra está escrita à mão. O que ela quer dizer?',
  paraCursiva: 'Qual destas é a mesma palavra, escrita à mão?',
  qualPalavra: 'Qual destas palavras está escrita à mão aqui?',
  digite: 'Digite em hebraico: “{leitura}” ({sentido}).',
  digiteDica: 'A primeira letra que você digita aparece à direita.',
  semPontos: 'Sem os pontinhos, como aparece na rua. O que quer dizer?',
  comOsPontos: 'Com os pontos: {he}',
  leSe: 'Lê-se "{leitura}".'
} as const;

const en: Traducao<typeof pt> = {
  monteCursiva: 'Build the word “{leitura}” in cursive.',
  monteLetras: 'Build the word “{leitura}”, letter by letter.',
  primeiraADireita: 'The first letter goes on the RIGHT.',
  comecaCom: 'It starts with {letra}.',
  monteExplicaCursiva: 'By hand, without the vowel signs: this is how it is really written.',
  monteExplicaPlaca: 'Without the vowel signs, this is how the word appears on a sign.',
  cursivaExplica: '{he} - {leitura} - {sentido}. By hand it is written without the vowel signs, and that is how you will find it in a note.',
  cursivaLetra: 'In the handwritten word, which letter is this, the highlighted one?',
  cursivaLetraOutra: 'That is another letter. Compare the highlighted stroke with it.',
  cursivaSentido: 'This word is handwritten. What does it mean?',
  paraCursiva: 'Which of these is the same word, handwritten?',
  qualPalavra: 'Which of these words is the one handwritten here?',
  digite: 'Type in Hebrew: “{leitura}” ({sentido}).',
  digiteDica: 'The first letter you type appears on the right.',
  semPontos: 'Without the little dots, the way it appears on the street. What does it mean?',
  comOsPontos: 'With the dots: {he}',
  leSe: 'It is read "{leitura}".'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
