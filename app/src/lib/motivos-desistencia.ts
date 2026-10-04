/* Os motivos de desistência, opcionais (04/10/2026). A mesma lista está em
   worker/src/lib/motivos.js; o teste desistencia-motivo.test.ts confere. */
export const MOTIVOS_DESISTENCIA = {
  esperava: 'O curso não era o que eu esperava',
  tempo: 'Não tenho tempo agora',
  dificil: 'Achei difícil',
  tecnico: 'Tive um problema técnico',
  engano: 'Comprei por engano',
  outro: 'Outro motivo'
} as const;
export type MotivoDesistencia = keyof typeof MOTIVOS_DESISTENCIA;
