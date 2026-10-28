/* O desafio do dia (28/10/2026): cinco perguntas rápidas, das letras já
   começadas, o mesmo o dia inteiro. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { DESAFIO_ID, DESAFIO_PERGUNTAS, desafioDoDia, desafioFeitoHoje } from '@/lib/engine/desafio';
import type { LearnerState } from '@/lib/state/types';

const letras = conteudoPago.letters;
const ate = (n: number) => letras.filter(l => l.order <= n);

describe('o desafio do dia', () => {
  it('sem letra começada, não há desafio', () => {
    expect(desafioDoDia([], [], '2026-10-28', false)).toEqual([]);
  });

  it('cinco perguntas, só de letras já começadas', () => {
    for (const n of [1, 2, 6, 12, 22]) {
      const d = desafioDoDia(ate(n), [], '2026-10-28', false);
      expect(d.length, `${n} letras`).toBe(DESAFIO_PERGUNTAS);
      const ids = new Set(ate(n).map(l => l.id));
      for (const e of d) expect(ids.has(e.letterId), e.id).toBe(true);
    }
  });

  it('o mesmo o dia inteiro, outro no dia seguinte', () => {
    const a = desafioDoDia(ate(12), [], '2026-10-28', false).map(e => e.id);
    expect(desafioDoDia(ate(12), [], '2026-10-28', false).map(e => e.id)).toEqual(a);
    expect(desafioDoDia(ate(12), [], '2026-10-29', false).map(e => e.id)).not.toEqual(a);
  });

  it('a letra que custa entra primeiro', () => {
    const d = desafioDoDia(ate(12), ['gimel'], '2026-10-28', false);
    expect(d[0]!.letterId).toBe('gimel');
  });

  it('"feito hoje" lê o registro do treino', () => {
    const s = { gym: { [DESAFIO_ID]: { lastOn: '2026-10-28' } } } as unknown as LearnerState;
    expect(desafioFeitoHoje(s, '2026-10-28')).toBe(true);
    expect(desafioFeitoHoje(s, '2026-10-29')).toBe(false);
  });
});
