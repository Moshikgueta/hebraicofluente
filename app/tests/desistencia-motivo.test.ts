/* A lista de motivos de desistência é a mesma no app e no Worker. */
import { describe, expect, it } from 'vitest';
import { MOTIVOS_DESISTENCIA as NO_APP } from '@/lib/motivos-desistencia';
import { MOTIVOS_PT } from '@/lib/painel-estatisticas';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { MOTIVOS_DESISTENCIA as NO_WORKER, motivoValido } from '../../worker/src/lib/motivos.js';

describe('os motivos de desistência', () => {
  it('são os mesmos nos dois lados, e no painel', () => {
    expect(NO_WORKER).toEqual(NO_APP);
    expect(MOTIVOS_PT).toEqual(NO_APP);
  });
  it('fora da lista vira null, nunca erro', () => {
    expect(motivoValido('tempo')).toBe('tempo');
    expect(motivoValido('toString')).toBeNull();
    expect(motivoValido({})).toBeNull();
    expect(motivoValido(undefined)).toBeNull();
  });
});
