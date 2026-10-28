import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/game/AlphabetGrid.tsx */
const pt = {
  rotuloConcluida: 'Concluída',
  rotuloRevisar: 'Revisar',
  rotuloProgresso: 'Em progresso',
  rotuloAberta: 'Aberta',
  rotuloBloqueada: 'Bloqueada',
  listaAria: 'As 22 letras, na ordem do curso',
  licoesConcluidas: (n: ReactNode, total: number): ReactNode => <>{n}{' '}de {total} lições concluídas</>,
  legenda: (n: number, rotulo: string) => `${n} ${rotulo.toLowerCase()}`,
  etapas: (n: number, total: number) => `${n} de ${total} etapas`,
  concluidaRevisar: 'concluída, revisar hoje',
  motivoAula0: 'Conclua a Aula 0 para abrir a primeira letra.',
  motivoLicao: (anterior: string) => `Termine a lição de ${anterior} para abrir esta.`,
  motivoNota: (anterior: string, nota: number, meta: number) =>
    `Sua melhor nota em ${anterior} foi ${nota}%. `
    + `Refaça os exercícios e chegue a ${meta}% para abrir esta.`,
  ariaBloqueada: (ordem: number, nome: string, motivo: string) => `Letra ${ordem}, ${nome}: bloqueada. ${motivo}`,
  ariaLetra: (ordem: number, nome: string, dizer: string, atual: boolean) =>
    `Letra ${ordem}, ${nome}: ${dizer}${atual ? '. Você está aqui' : ''}`,
  modCurto: (n: number) => `Mód ${n}`
} as const;

const en: Traducao<typeof pt> = {
  rotuloConcluida: 'Completed',
  rotuloRevisar: 'Review',
  rotuloProgresso: 'In progress',
  rotuloAberta: 'Open',
  rotuloBloqueada: 'Locked',
  listaAria: 'The 22 letters, in course order',
  licoesConcluidas: (n, total) => <>{n}{' '}of {total} lessons completed</>,
  legenda: (n, rotulo) => `${n} ${rotulo.toLowerCase()}`,
  etapas: (n, total) => `${n} of ${total} steps`,
  concluidaRevisar: 'completed, review today',
  motivoAula0: 'Finish Lesson 0 to open the first letter.',
  motivoLicao: anterior => `Finish the ${anterior} lesson to open this one.`,
  motivoNota: (anterior, nota, meta) =>
    `Your best score on ${anterior} was ${nota}%. `
    + `Redo the exercises and reach ${meta}% to open this one.`,
  ariaBloqueada: (ordem, nome, motivo) => `Letter ${ordem}, ${nome}: locked. ${motivo}`,
  ariaLetra: (ordem, nome, dizer, atual) =>
    `Letter ${ordem}, ${nome}: ${dizer}${atual ? '. You are here' : ''}`,
  modCurto: n => `Mod ${n}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
