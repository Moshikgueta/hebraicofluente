/* Minha Jornada no Hebraico: o nome de cada etapa do caminho (12/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Um nome por MÓDULO que já existe, na ordem em que o curso ensina, e não
 * uma sequência nova. Cada nome diz a capacidade que o módulo constrói; o
 * que o aluno consegue fazer no fim dele é o `milestonePt` do próprio módulo
 * (data/modules.json), que já era revisado. */

export const ETAPA_AULA0 = 'Primeiros passos';
export const ETAPA_FINAL = 'Meu desafio final';

export const ETAPA_DO_MODULO: Readonly<Record<number, string>> = {
  1: 'Reconhecendo as letras',
  2: 'Descobrindo os sons',
  3: 'Lendo minhas primeiras palavras',
  4: 'Separando as letras parecidas',
  5: 'Completando o alfabeto',
  6: 'Lendo com mais autonomia',
  7: 'Os sons do hebraico moderno'
};
