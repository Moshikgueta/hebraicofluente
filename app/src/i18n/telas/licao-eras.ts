import type { Traducao } from '..';

/* components/learn/Eras.tsx */
const pt = {
  titulo: 'Hoje e há dois mil anos',
  intro:
    'Mais de dois mil anos separam as duas linhas de cada par. A escrita quadrada que você está aprendendo foi adotada no tempo do Segundo Templo, e é nela que o texto antigo é copiado e lido desde então:',
  comPar: ' as letras abaixo são, uma a uma, as que você acabou de aprender.',
  semPar: ' as letras são, uma a uma, as que você está aprendendo agora.',
  aindaFechados: 'Ainda fechados',
  raizDe: (raiz: string) => `A raiz de ${raiz}`,
  letras: (n: number) => `${n} letras`,
  umPar: 'Um par abre quando você consegue ler as DUAS linhas. Meia comparação não compara nada.',
  hoje: 'Hoje, na rua',
  fila: 'na fila do supermercado',
  oQueDizem: 'O que dizem as duas?',
  acheAsLetras: 'Ache as três letras acesas antes de abrir.'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Today and two thousand years ago',
  intro:
    'More than two thousand years separate the two lines of each pair. The square script you are learning was adopted in the time of the Second Temple, and it is the script the ancient text has been copied and read in ever since:',
  comPar: ' the letters below are, one by one, the ones you just learned.',
  semPar: ' the letters are, one by one, the ones you are learning now.',
  aindaFechados: 'Still locked',
  raizDe: raiz => `The root of ${raiz}`,
  letras: n => `${n} letters`,
  umPar: 'A pair opens when you can read BOTH lines. Half a comparison compares nothing.',
  hoje: 'Today, on the street',
  fila: 'in the supermarket line',
  oQueDizem: 'What do the two say?',
  acheAsLetras: 'Find the three highlighted letters before you open it.'
};

const es: Traducao<typeof pt> = {
  titulo: 'Hoy y hace dos mil años',
  intro:
    'Más de dos mil años separan las dos líneas de cada par. La escritura cuadrada que estás aprendiendo se adoptó en la época del Segundo Templo, y es en ella que el texto antiguo se copia y se lee desde entonces:',
  comPar: ' las letras de abajo son, una por una, las que acabas de aprender.',
  semPar: ' las letras son, una por una, las que estás aprendiendo ahora.',
  aindaFechados: 'Todavía cerrados',
  raizDe: raiz => `La raíz de ${raiz}`,
  letras: n => `${n} letras`,
  umPar: 'Un par se abre cuando puedes leer las DOS líneas. Media comparación no compara nada.',
  hoje: 'Hoy, en la calle',
  fila: 'en la fila del supermercado',
  oQueDizem: '¿Qué dicen las dos?',
  acheAsLetras: 'Encuentra las tres letras resaltadas antes de abrir.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
