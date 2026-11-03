/* A revisão entre módulos (03/11/2026, decisão do dono).
 *
 *   · a primeira lição dos módulos 2 a 5 só abre com o checkpoint do
 *     módulo anterior aprovado;
 *   · esse checkpoint só abre no dia seguinte ao último dia em que uma lição
 *     do módulo foi concluída;
 *   · nada do que o aluno já tem fecha.
 */
import { describe, expect, it } from 'vitest';
import {
  STAGE_COUNT, letraAtual, letraLiberada, porQueTrancada, revisaoAbreEm
} from '@/lib/state/rules';
import { ordemDeEnsino, portasDosModulos } from '@/lib/sons';
import { course } from '@/lib/content-publico';
import type { LearnerState, LessonProgress } from '@/lib/state/types';

const ORDEM = ordemDeEnsino(
  course.letters.map(l => ({ id: l.id, order: l.order, lesson: course.modules.flatMap(m => m.lessons).find(x => x.letters?.includes(l.id))!.n })),
  course.modules
);
const PORTAS = portasDosModulos(ORDEM, course.modules);

const AGORA = new Date(2026, 10, 3, 15, 0); // 03/11, 15h local
const ONTEM = new Date(2026, 10, 2, 20, 0).toISOString();
const HOJE = new Date(2026, 10, 3, 9, 0).toISOString();

const feita = (id: string, quando: string): LessonProgress => ({
  letterId: id, stagesDone: Array.from({ length: STAGE_COUNT }, (_, i) => i + 1),
  quizBest: 1, quizAttempts: 1, perfectBonusPaid: false, completedAt: quando
});
const MOD1 = ['alef', 'mem', 'tav', 'nun', 'he', 'yod'];
const estado = (quando: string, extra: Partial<LearnerState> = {}): LearnerState => ({
  lessons: Object.fromEntries(MOD1.map(id => [id, feita(id, quando)])),
  checkpoints: {}, firsts: {}, ...extra
} as unknown as LearnerState);
const aprovado = { cp1: { id: 'cp1', best: 0.9, attempts: 1, passedAt: HOJE } };

describe('as portas', () => {
  it('ficam na entrada dos módulos 2 a 5, cada uma com o checkpoint do anterior', () => {
    expect([...PORTAS.entries()].map(([id, p]) => [id, p.modulo, p.checkpoint])).toEqual([
      ['gimel', 1, 'cp1'], ['vav', 2, 'cp2'], ['samekh', 3, 'cp3'], ['bet', 4, 'cp4']
    ]);
    expect(PORTAS.get('gimel')!.licoes).toEqual(MOD1);
    /* o módulo 2 termina numa lição de som, e ela conta como lição dele */
    expect(PORTAS.get('vav')!.licoes).toContain('som-sin');
  });

  it('o primeiro item de cada módulo é mesmo uma letra que existe', () => {
    const ids = new Set(course.letters.map(l => l.id));
    for (const id of PORTAS.keys()) expect(ids.has(id), id).toBe(true);
  });
});

describe('a revisão abre no dia seguinte', () => {
  const porta = () => PORTAS.get('gimel')!;
  it('estudou hoje: abre amanhã à meia-noite', () => {
    const abre = revisaoAbreEm(estado(HOJE), porta(), AGORA);
    expect(abre).toEqual(new Date(2026, 10, 4, 0, 0, 0, 0));
  });
  it('terminou ontem: já abre', () => {
    expect(revisaoAbreEm(estado(ONTEM), porta(), AGORA)).toBeNull();
  });
  it('uma lição do módulo concluída hoje basta para esperar', () => {
    const s = estado(ONTEM);
    s.lessons.yod = feita('yod', HOJE);
    expect(revisaoAbreEm(s, porta(), AGORA)).not.toBeNull();
  });
  it('checkpoint já aprovado nunca volta a fechar', () => {
    expect(revisaoAbreEm(estado(HOJE, { checkpoints: aprovado } as never), porta(), AGORA)).toBeNull();
  });
});

describe('a primeira letra do módulo seguinte', () => {
  it('fecha sem a revisão, e diz por quê', () => {
    expect(letraLiberada(estado(ONTEM), ORDEM, 'gimel', PORTAS)).toBe(false);
    expect(porQueTrancada(estado(HOJE), ORDEM, 'gimel', PORTAS, AGORA)).toEqual({
      anterior: 'yod', falta: 'revisao', nota: null, modulo: 1, abreEm: new Date(2026, 10, 4).toISOString()
    });
    expect(porQueTrancada(estado(ONTEM), ORDEM, 'gimel', PORTAS, AGORA)?.abreEm).toBeNull();
  });

  it('abre com o checkpoint aprovado', () => {
    expect(letraLiberada(estado(HOJE, { checkpoints: aprovado } as never), ORDEM, 'gimel', PORTAS)).toBe(true);
  });

  it('quem já entrou no módulo seguinte segue com ele aberto', () => {
    const s = estado(HOJE);
    s.lessons.gimel = { ...feita('gimel', HOJE), stagesDone: [1], completedAt: null, quizBest: null };
    expect(letraLiberada(s, ORDEM, 'gimel', PORTAS)).toBe(true);
  });

  it('a letra atual para no fim do módulo, e as do meio do módulo não têm porta', () => {
    expect(letraAtual(estado(HOJE), ORDEM, PORTAS)).toBe('yod');
    expect(PORTAS.has('mem')).toBe(false);
  });

  it('sem as portas, a regra antiga continua igual', () => {
    expect(letraLiberada(estado(HOJE), ORDEM, 'gimel')).toBe(true);
  });
});
