/* O resumo da semana (28/10/2026): conta só o que o progresso guarda, nos
   sete dias terminando hoje, e a Yael comenta conforme o que houve. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';
import { falaDaSemana, resumoDaSemana, seteDias } from '@/lib/resumo-da-semana';

const letras = conteudoPago.letters;
const feita = (quando: string) => ({ stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1, perfectBonusPaid: true, completedAt: quando });
const dia = (units: number) => ({ answered: 0, units, xp: 0, goalMet: false });

describe('o resumo da semana', () => {
  it('sete dias, terminando hoje', () => {
    const d = seteDias('2026-10-28');
    expect(d).toHaveLength(7);
    expect(d[0]!.chave).toBe('2026-10-22');
    expect(d[6]!.chave).toBe('2026-10-28');
  });

  it('conta dias, minutos, letras e palavras novas só da semana', () => {
    const [a, b] = [letras[0]!, letras[1]!];
    const st: LearnerState = {
      ...EMPTY_STATE,
      lessons: { [a.id]: feita('2026-10-01T10:00:00Z'), [b.id]: feita('2026-10-27T10:00:00Z') } as LearnerState['lessons'],
      days: { '2026-10-27': dia(30), '2026-10-28': dia(15), '2026-10-01': dia(99) }
    };
    const r = resumoDaSemana(st, '2026-10-28', letras);
    expect(r.diasEstudados).toBe(2);
    expect(r.minutos).toBe(15);
    expect(r.letras.map(l => l.id)).toEqual([b.id]);
    expect(r.palavrasNovas).toBeGreaterThan(0);
  });

  it('a Yael: quieta sem estudo, ritmo com cinco dias, palavras com letra nova', () => {
    const vazio = resumoDaSemana(EMPTY_STATE, '2026-10-28', letras);
    expect(falaDaSemana(vazio).fala).toBe('quieta');
    const cinco = { ...vazio, diasEstudados: 5 };
    expect(falaDaSemana(cinco)).toEqual({ fala: 'ritmo', humor: 'comemora' });
    expect(falaDaSemana({ ...vazio, diasEstudados: 2, palavrasNovas: 3 }).fala).toBe('palavras');
    expect(falaDaSemana({ ...vazio, diasEstudados: 2 }).fala).toBe('continua');
  });
});
