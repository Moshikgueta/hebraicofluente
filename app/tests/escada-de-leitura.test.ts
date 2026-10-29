/* Os marcos do Laboratório 2.0 (28/10/2026): só as primeiras vezes de cada
   nível e as dezenas sem ajuda, a partir da autoavaliação que já existia. */
import { describe, expect, it } from 'vitest';
import { lidasNoNivel, marcoAlcancado } from '@/components/aventura/EscadaDeLeitura';
import type { LearnerState } from '@/lib/state/types';

describe('a escada de leitura', () => {
  it('a primeira palavra de cada nível é um marco; a segunda, não', () => {
    expect(marcoAlcancado(0, 'guiada')).toMatch(/primeira/);
    expect(marcoAlcancado(0, 'menos-ajuda')).toMatch(/menos ajuda/);
    expect(marcoAlcancado(0, 'independente')).toMatch(/sem ajuda/);
    expect(marcoAlcancado(1, 'guiada')).toBeNull();
    expect(marcoAlcancado(1, 'independente')).toBeNull();
  });

  it('dez e cinquenta sem ajuda são marcos; com ajuda, não', () => {
    expect(marcoAlcancado(9, 'independente')).toMatch(/10 palavras/);
    expect(marcoAlcancado(49, 'independente')).toMatch(/50 palavras/);
    expect(marcoAlcancado(9, 'guiada')).toBeNull();
  });

  it('conta só o que o aluno marcou como lido, por nível', () => {
    const s = { leituraAutoavaliada: { 'laboratorio-guiada': { tentadas: 5, consegui: 3, ultima: '2026-10-28' } } } as unknown as LearnerState;
    expect(lidasNoNivel(s, 'guiada')).toBe(3);
    expect(lidasNoNivel(s, 'independente')).toBe(0);
  });
});
