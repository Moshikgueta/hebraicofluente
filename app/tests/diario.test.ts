/* O Diário de descobertas (28/10/2026): só lê o progresso; nenhuma entrada
   sem data, e a mais recente primeiro. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { course } from '@/lib/content-publico';
import { entradasDoDiario, lugaresVisitados, porDia } from '@/lib/diario';
import type { LearnerState } from '@/lib/state/types';

const letras = conteudoPago.letters;
const vazio = { lessons: {}, checkpoints: {}, firsts: {}, achievements: [] } as unknown as LearnerState;

describe('o diário', () => {
  it('sem progresso, sem entradas', () => {
    expect(entradasDoDiario(vazio, letras, course.modules)).toEqual([]);
  });

  it('monta a linha do tempo do que tem data, a mais recente primeiro', () => {
    const s = {
      ...vazio,
      firsts: { 'aula-0-concluida': '2026-10-01T10:00:00Z', 'missao-1': '2026-10-05T10:00:00Z', 'texto-3': 'lixo' },
      lessons: {
        alef: { letterId: 'alef', stagesDone: [1, 2, 3, 4, 5], completedAt: '2026-10-02T10:00:00Z' },
        mem: { letterId: 'mem', stagesDone: [1], completedAt: null }
      },
      achievements: [{ id: 'primeira-letra', unlockedAt: '2026-10-02T11:00:00Z' }]
    } as unknown as LearnerState;
    const e = entradasDoDiario(s, letras, course.modules);
    expect(e.map(x => x.id)).toEqual(['mi-1', 'cq-primeira-letra', 'letra-alef', 'aula0']);
    expect(e.find(x => x.id === 'letra-alef')?.letra).toBe('א');
    expect(porDia(e).map(d => d.dia)).toEqual(['2026-10-05', '2026-10-02', '2026-10-01']);
  });

  it('lugar visitado é o módulo com lição começada', () => {
    const s = { ...vazio, lessons: { mem: { stagesDone: [1] }, mod6: { stagesDone: [1] } } } as unknown as LearnerState;
    expect([...lugaresVisitados(s, letras, course.modules)].sort()).toEqual([1, 6]);
  });
});
