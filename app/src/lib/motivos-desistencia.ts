/* Os motivos de desistência, opcionais (04/10/2026). A mesma lista está em
   worker/src/lib/motivos.js; o teste desistencia-motivo.test.ts confere. */
import { tx } from '@/i18n/telas/motor-motivos-desistencia';

export const MOTIVOS_DESISTENCIA = {
  esperava: tx.esperava,
  tempo: tx.tempo,
  dificil: tx.dificil,
  tecnico: tx.tecnico,
  engano: tx.engano,
  outro: tx.outro
} as const;
export type MotivoDesistencia = keyof typeof MOTIVOS_DESISTENCIA;
