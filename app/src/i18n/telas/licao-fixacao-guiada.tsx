import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/FixacaoGuiada.tsx */
const NUMERO = ['Zero', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco'];
const NUMERO_EN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'];
const NUMERO_ES = ['Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'];

const pt = {
  ouvir: 'Ouça e repita',
  observar: 'Observe e reconheça',
  som: 'Letra e som',
  memoria: 'Memória visual',
  revisao: 'Revisão rápida',
  irParaExercicios: 'Ir para os exercícios',
  cabecalho: 'Fixação: aprender e lembrar, sem nota',
  intro: (n: number, nome: string) =>
    `${NUMERO[n] ?? n} passos curtos com ${nome}. Aqui não existe erro que conte: se escolher errado, aparece uma dica e você tenta de novo. Os exercícios com nota vêm depois.`,
  passos: 'Passos da fixação',
  passoDe: (k: number, total: number, nome: string) => `Passo ${k} de ${total}: ${nome}`,
  voltar: 'Voltar',
  continuar: 'Continuar',
  ouvirIntro: (nome: string) =>
    `Ouça a letra e cada palavra, e repita em voz alta. Em cada palavra, a letra ${nome} está destacada.`,
  ouvirItem: (nome: string) => `Ouvir ${nome}`,
  impressa: 'impressa',
  cursiva: 'cursiva (à mão)',
  noFim: 'no fim da palavra',
  noFimCursiva: 'no fim, cursiva (à mão)',
  formas: 'A mesma letra, nas formas em que você vai encontrá-la. Olhe com calma.',
  repare: 'Repare: ',
  queSom: 'Que som esta letra faz?',
  escolhaOSom: 'Escolha o som',
  issoSom: (nome: string, som: string) => `Isso: ${nome} faz o som ${som}.`,
  aindaNao: (dica: ReactNode): ReactNode => <>Ainda não. Dica: {dica} Tente de novo.</>,
  olhe: 'Olhe bem para a letra. Em três segundos ela some, e você vai procurá-la.',
  jaMemorizei: 'Já memorizei',
  qualEra: 'Qual era a letra?',
  escolhaALetra: 'Escolha a letra',
  issoEra: (nome: string) => `Isso, era ${nome}.`,
  essaNao: 'Essa não. Quer ver a letra de novo?',
  verDeNovo: 'Ver de novo',
  revisaoIntro: 'A letra nova ao lado de letras que você já conhece. Ouça cada uma e compare.',
  nova: ' · nova'
} as const;

const en: Traducao<typeof pt> = {
  ouvir: 'Listen and repeat',
  observar: 'Look and recognize',
  som: 'Letter and sound',
  memoria: 'Visual memory',
  revisao: 'Quick review',
  irParaExercicios: 'Go to the exercises',
  cabecalho: 'Reinforce: learn and remember, no score',
  intro: (n, nome) =>
    `${NUMERO_EN[n] ?? n} short steps with ${nome}. No mistake counts here: if you pick the wrong one, a hint appears and you try again. The scored exercises come later.`,
  passos: 'Reinforce steps',
  passoDe: (k, total, nome) => `Step ${k} of ${total}: ${nome}`,
  voltar: 'Back',
  continuar: 'Continue',
  ouvirIntro: nome =>
    `Listen to the letter and each word, and repeat them aloud. In each word, the letter ${nome} is highlighted.`,
  ouvirItem: nome => `Listen to ${nome}`,
  impressa: 'print',
  cursiva: 'cursive (by hand)',
  noFim: 'at the end of a word',
  noFimCursiva: 'at the end, cursive (by hand)',
  formas: 'The same letter, in the forms you will come across. Take a good look.',
  repare: 'Notice: ',
  queSom: 'What sound does this letter make?',
  escolhaOSom: 'Choose the sound',
  issoSom: (nome, som) => `That's it: ${nome} makes the sound ${som}.`,
  aindaNao: dica => <>Not yet. Hint: {dica} Try again.</>,
  olhe: 'Take a good look at the letter. In three seconds it disappears, and you will look for it.',
  jaMemorizei: 'I\'ve got it',
  qualEra: 'Which letter was it?',
  escolhaALetra: 'Choose the letter',
  issoEra: nome => `That's it, it was ${nome}.`,
  essaNao: 'Not that one. Want to see the letter again?',
  verDeNovo: 'See it again',
  revisaoIntro: 'The new letter next to letters you already know. Listen to each one and compare.',
  nova: ' · new'
};

const es: Traducao<typeof pt> = {
  ouvir: 'Escucha y repite',
  observar: 'Observa y reconoce',
  som: 'Letra y sonido',
  memoria: 'Memoria visual',
  revisao: 'Repaso rápido',
  irParaExercicios: 'Ir a los ejercicios',
  cabecalho: 'Fijación: aprender y recordar, sin nota',
  intro: (n, nome) =>
    `${NUMERO_ES[n] ?? n} pasos cortos con ${nome}. Aquí no hay error que cuente: si eliges mal, aparece una pista y lo intentas de nuevo. Los ejercicios con nota vienen después.`,
  passos: 'Pasos de la fijación',
  passoDe: (k, total, nome) => `Paso ${k} de ${total}: ${nome}`,
  voltar: 'Volver',
  continuar: 'Continuar',
  ouvirIntro: nome =>
    `Escucha la letra y cada palabra, y repite en voz alta. En cada palabra, la letra ${nome} está resaltada.`,
  ouvirItem: nome => `Escuchar ${nome}`,
  impressa: 'impresa',
  cursiva: 'cursiva (a mano)',
  noFim: 'al final de la palabra',
  noFimCursiva: 'al final, cursiva (a mano)',
  formas: 'La misma letra, en las formas en que la vas a encontrar. Mírala con calma.',
  repare: 'Fíjate: ',
  queSom: '¿Qué sonido hace esta letra?',
  escolhaOSom: 'Elige el sonido',
  issoSom: (nome, som) => `Eso es: ${nome} hace el sonido ${som}.`,
  aindaNao: dica => <>Todavía no. Pista: {dica} Intenta de nuevo.</>,
  olhe: 'Mira bien la letra. En tres segundos desaparece, y la vas a buscar.',
  jaMemorizei: 'Ya la memoricé',
  qualEra: '¿Cuál era la letra?',
  escolhaALetra: 'Elige la letra',
  issoEra: nome => `Eso es, era ${nome}.`,
  essaNao: 'Esa no. ¿Quieres ver la letra de nuevo?',
  verDeNovo: 'Ver de nuevo',
  revisaoIntro: 'La letra nueva al lado de letras que ya conoces. Escucha cada una y compara.',
  nova: ' · nueva'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
