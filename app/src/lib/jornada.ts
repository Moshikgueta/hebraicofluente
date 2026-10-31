/* Minha Jornada no Hebraico: o nome de cada etapa do caminho (12/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Um nome por MÓDULO que já existe, na ordem em que o curso ensina, e não
 * uma sequência nova. Cada nome diz a capacidade que o módulo constrói; o
 * que o aluno consegue fazer no fim dele é o `milestonePt` do próprio módulo
 * (data/modules.json), que já era revisado. */

import { tx } from '@/i18n/telas/motor-jornada';

export const ETAPA_AULA0 = tx.aula0;
export const ETAPA_FINAL = tx.final;

export const ETAPA_DO_MODULO: Readonly<Record<number, string>> = {
  1: tx.m1,
  2: tx.m2,
  3: tx.m3,
  4: tx.m4,
  5: tx.m5,
  6: tx.m6,
  7: tx.m7
};
