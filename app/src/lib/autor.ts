/* Quem faz o Hebraico Fluente, em quatro linhas (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Só o que /sobre afirma (components/landing/Trajetoria.tsx). Nenhum número
 * de alunos, nenhum "anos de experiência" contado: a regra do dono é nunca
 * inventar fato sobre ele. A capa e a página de venda do livro leem daqui. */
import { tx } from '@/i18n/telas/motor-autor';

export const FATOS_DO_AUTOR = [
  tx.israelense,
  tx.brasil,
  tx.gerente,
  tx.formacao
] as const;
