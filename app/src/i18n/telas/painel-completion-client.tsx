import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/concluido/CompletionClient.tsx - o fim do curso, ou onde o aluno está. */
const pt = {
  cursoConcluido: 'Curso concluído',
  ondeEsta: 'Onde você está',
  consegueLer: 'Agora você consegue ler hebraico.',
  estaLendo: 'Você está lendo hebraico.',
  seuCaminho: 'O seu caminho no alfabeto',
  semanasAtras: 'Há algumas semanas isto era um conjunto de símbolos.',
  /* Seguida, na tela, da regra da conclusão (lib/state/rules.ts). */
  faltam: (n: number) => `Faltam ${n} ${n === 1 ? 'lição' : 'lições'} para concluir o alfabeto.`,
  licoesConcluidas: 'lições concluídas',
  abaixoDoDominio: (n: number) => n === 1
    ? '1 lição concluída ainda está abaixo do domínio: refazer os exercícios dela já conta.'
    : `${n} lições concluídas ainda estão abaixo do domínio: refazer os exercícios delas já conta.`,
  refazerDe: 'Refazer os exercícios de {nome}',
  irParaLetra: 'Ir para a letra {nome}',
  localeDosNumeros: 'pt-BR',
  xpAcumulado: 'XP acumulado',
  maiorSequencia: 'Maior sequência',
  dias: '{n} dias',
  conquistas: 'Conquistas',
  conquistasDe: '{n} de {total}',
  desbloqueou: 'O que você desbloqueou?',
  sabeFazer: 'O que você sabe fazer agora?',
  sabe1: 'Reconhecer as 22 letras, impressas e em cursiva',
  sabe2: 'Reconhecer as cinco formas finais de relance',
  sabe3: 'Ler palavras vocalizadas com os sinais que o curso ensinou',
  sabe4: (sfr: ReactNode, bait: ReactNode, shalom: ReactNode) => <>Ler sem nikud, do jeito que aparece na rua - {sfr}, {bait}, {shalom}</>,
  sabe5: 'Escrever as letras à mão, na direção certa',
  sabe6: 'Pronunciar os sons que o português não tem, sem trocá-los',
  continuaAberto: 'O curso de alfabetização continua aberto, sem prazo. Nada aqui é bloqueado.',
  continuarRevisando: 'Continuar revisando'
} as const;

const en: Traducao<typeof pt> = {
  cursoConcluido: 'Course complete',
  ondeEsta: 'Where you are',
  consegueLer: 'Now you can read Hebrew.',
  estaLendo: 'You are reading Hebrew.',
  seuCaminho: 'Your path through the alphabet',
  semanasAtras: 'A few weeks ago this was a set of symbols.',
  faltam: (n: number) => `${n} ${n === 1 ? 'lesson' : 'lessons'} to go to complete the alphabet.`,
  licoesConcluidas: 'lessons completed',
  abaixoDoDominio: (n: number) => n === 1
    ? '1 completed lesson is still below mastery: redoing its exercises already counts.'
    : `${n} completed lessons are still below mastery: redoing their exercises already counts.`,
  refazerDe: 'Redo the exercises for {nome}',
  irParaLetra: 'Go to the letter {nome}',
  localeDosNumeros: 'en-US',
  xpAcumulado: 'XP earned',
  maiorSequencia: 'Longest streak',
  dias: '{n} days',
  conquistas: 'Achievements',
  conquistasDe: '{n} of {total}',
  desbloqueou: 'What did you unlock?',
  sabeFazer: 'What can you do now?',
  sabe1: 'Recognize the 22 letters, in print and in cursive',
  sabe2: 'Recognize the five final forms at a glance',
  sabe3: 'Read vowel-marked words with the signs the course taught',
  sabe4: (sfr: ReactNode, bait: ReactNode, shalom: ReactNode) => <>Read without nikud, the way it appears on the street - {sfr}, {bait}, {shalom}</>,
  sabe5: 'Write the letters by hand, in the right direction',
  // etapa 3: pronúncia, rever
  sabe6: 'Pronounce the sounds English does not have, without mixing them up',
  continuaAberto: 'The alphabet course stays open, with no deadline. Nothing here is locked.',
  continuarRevisando: 'Keep reviewing'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
