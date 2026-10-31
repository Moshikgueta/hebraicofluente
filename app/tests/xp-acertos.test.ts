/* XP por acerto praticando letras (pedido do dono em 01/10/2026), com teto
   diário para que repetir o exercício mais fácil não vire o jeito de comprar
   as leituras bônus. */

import { describe, expect, it } from 'vitest';
import { pagarAcerto, XP, XP_ACERTOS_POR_DIA } from '../src/lib/state/rules';
import { mergeStates } from '../src/lib/state/merge';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const DIA = '2026-10-01';
const vezes = (s: LearnerState, n: number, dia = DIA) => {
  for (let i = 0; i < n; i++) s = pagarAcerto(s, dia);
  return s;
};

describe('XP por acerto', () => {
  it('cada acerto paga XP.acerto, no total e no dia', () => {
    const s = pagarAcerto(EMPTY_STATE, DIA);
    expect(s.xp).toBe(XP.acerto);
    expect(s.days[DIA]!.xp).toBe(XP.acerto);
    expect(s.days[DIA]!.xpAcertos).toBe(XP.acerto);
  });

  it('para no teto do dia, e o dia seguinte começa de novo', () => {
    const s = vezes(EMPTY_STATE, 200);
    expect(s.xp).toBe(XP_ACERTOS_POR_DIA);
    const amanha = pagarAcerto(s, '2026-10-02');
    expect(amanha.xp).toBe(XP_ACERTOS_POR_DIA + XP.acerto);
  });

  it('o teto vale entre aparelhos: a fusão guarda o maior contador', () => {
    const a = vezes(EMPTY_STATE, 30);
    const b = vezes(EMPTY_STATE, 10);
    const m = mergeStates(a, b);
    expect(m.days[DIA]!.xpAcertos).toBe(60);
  });
});
