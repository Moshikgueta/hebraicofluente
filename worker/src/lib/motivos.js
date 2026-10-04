/* Os motivos de desistência (04/10/2026), escolhidos pela pessoa, sempre
 * OPCIONAIS: a desistência nunca depende de dizer o motivo (CDC, art. 49).
 * A mesma lista está em app/src/lib/motivos-desistencia.ts, e o teste
 * desistencia-motivo.test.ts confere as duas. */
export const MOTIVOS_DESISTENCIA = {
  esperava: 'O curso não era o que eu esperava',
  tempo: 'Não tenho tempo agora',
  dificil: 'Achei difícil',
  tecnico: 'Tive um problema técnico',
  engano: 'Comprei por engano',
  outro: 'Outro motivo'
};

/** O motivo válido, ou null: qualquer outra coisa é ignorada, nunca recusada. */
export const motivoValido = m =>
  typeof m === 'string' && Object.prototype.hasOwnProperty.call(MOTIVOS_DESISTENCIA, m) ? m : null;
