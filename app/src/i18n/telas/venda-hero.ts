import type { Traducao } from '..';

/* components/landing/Hero.tsx */
const pt = {
  desejoIsrael: 'para viajar a Israel',
  desejoBiblia: 'para ler as letras da Bíblia',
  desejoAlfabeto: 'para finalmente entender o alfabeto',
  rubricaCurta: 'Do zero · alfabetização em hebraico',
  rubricaLonga: 'Alfabetização em hebraico · para iniciantes absolutos',
  tituloA: 'Ler e escrever hebraico,',
  tituloB: 'do zero.',
  paraQuem: 'Para quem é',
  mesmoQue: 'Mesmo que hoje você não reconheça uma única letra.',
  umaLetraPorVez: 'Uma letra por vez, com som, escrita e correção na hora, até ler suas primeiras palavras sozinho.',
  teste: 'Fazer um teste grátis',
  licao: (n: number) => `Lição ${n}`,
  laminaSemLicao: 'Uma letra por vez',
  /* Transliteração: fica igual até a etapa 3. */
  shin: 'Shin',
  som: 'Som',
  somSh: 'sh',
  comoXicara: 'como o X de «xícara»',
  aMao: 'À mão',
  ponto: 'O ponto em cima, à direita, é o que faz o som SH. Do lado esquerdo, a mesma letra vira Sin, com som de S.'
} as const;

const en: Traducao<typeof pt> = {
  desejoIsrael: 'to travel to Israel',
  desejoBiblia: 'to read the letters of the Bible',
  desejoAlfabeto: 'to finally understand the alphabet',
  rubricaCurta: 'From zero · learn to read Hebrew',
  rubricaLonga: 'Learn to read Hebrew · for absolute beginners',
  tituloA: 'Read and write Hebrew,',
  tituloB: 'from zero.',
  paraQuem: 'Who it is for',
  mesmoQue: 'Even if today you cannot recognize a single letter.',
  umaLetraPorVez: 'One letter at a time, with sound, writing and instant feedback, until you read your first words on your own.',
  teste: 'Take a free test',
  licao: (n: number) => `Lesson ${n}`,
  laminaSemLicao: 'One letter at a time',
  shin: 'Shin',
  som: 'Sound',
  somSh: 'sh',
  // etapa 3: pronúncia, rever
  comoXicara: 'like the sh in «ship»',
  aMao: 'By hand',
  ponto: 'The dot on top, on the right, is what makes the SH sound. On the left side, the same letter becomes Sin, with an S sound.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
