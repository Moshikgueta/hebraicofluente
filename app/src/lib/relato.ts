/* A foto de um exercício para o relato de erro ("Achei um erro").
   Os exercícios são sorteados: sem o que o aluno viu - enunciado, hebraico,
   alternativas, a certa e a escolhida -, o relato não aponta para nada.
   Ver components/learn/RelatarErro.tsx e worker/src/api/relatos.js. */

import { isChoice, type Exercise } from '@/lib/engine/types';

/** A foto do exercício, só com o que um humano precisa para julgar. */
export function fotoDoExercicio(ex: Exercise, escolhida: number | null, acertou: boolean) {
  const e = ex as Exercise & { he?: string; target?: string; letter?: string };
  const escolha = isChoice(ex) ? ex : null;
  return {
    exercicio: ex.id,
    tipo: ex.kind,
    letra: ex.letterId,
    enunciado: ex.promptPt,
    hebraico: e.he ?? e.target ?? e.letter ?? '',
    opcoes: escolha ? escolha.options : [],
    certa: escolha ? escolha.options[escolha.answer] ?? '' : '',
    escolhida: escolha && escolhida !== null ? escolha.options[escolhida] ?? '' : '',
    acertou
  };
}

