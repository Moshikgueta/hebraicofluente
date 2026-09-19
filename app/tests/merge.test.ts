/* A fusão de dois aparelhos.
 * ─────────────────────────────────────────────────────────────────────────
 * O que estes testes protegem é uma frase: NINGUÉM PERDE TRABALHO. O celular
 * no ônibus e o notebook em casa divergem todo dia, e a fusão é o único
 * lugar do sistema onde um erro apaga esforço de alguém em silêncio - sem
 * mensagem, sem log, sem jeito de desfazer.
 *
 * As duas propriedades gerais no fim (comutativa e idempotente) valem mais
 * que os casos particulares: elas são o que permite ao adaptador repetir a
 * fusão depois de um 409 sem pensar duas vezes.
 */

import { describe, expect, it } from 'vitest';
import { mergeStates, sameProgress, sameState } from '../src/lib/state/merge';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const licao = (id: string, etapas: number[], best: number | null = null) => ({
  letterId: id, stagesDone: etapas, quizBest: best, quizAttempts: 1,
  perfectBonusPaid: false, completedAt: etapas.length >= 5 ? '2026-03-01T10:00:00.000Z' : null
});

const base = (p: Partial<LearnerState> = {}): LearnerState => ({ ...EMPTY_STATE, ...p });

describe('fundir o progresso de dois aparelhos', () => {
  it('mantém a letra que só um dos dois fez', () => {
    const celular = base({ lessons: { mem: licao('mem', [1, 2, 3, 4, 5]) } });
    const note = base({ lessons: { tav: licao('tav', [1, 2, 3, 4, 5]) } });
    const f = mergeStates(celular, note);
    expect(Object.keys(f.lessons).sort()).toEqual(['mem', 'tav']);
  });

  it('une as etapas quando a mesma letra andou nos dois', () => {
    const a = base({ lessons: { mem: licao('mem', [1, 2, 3]) } });
    const b = base({ lessons: { mem: licao('mem', [1, 4, 5]) } });
    expect(mergeStates(a, b).lessons.mem!.stagesDone).toEqual([1, 2, 3, 4, 5]);
  });

  it('fica com a melhor nota, nunca com a última', () => {
    const a = base({ lessons: { mem: licao('mem', [1], 0.4) } });
    const b = base({ lessons: { mem: licao('mem', [1], 0.9) } });
    expect(mergeStates(a, b).lessons.mem!.quizBest).toBe(0.9);
    expect(mergeStates(b, a).lessons.mem!.quizBest).toBe(0.9);
  });

  it('guarda a data em que a letra fechou pela primeira vez', () => {
    const a = base({ lessons: { mem: { ...licao('mem', [1, 2, 3, 4, 5]), completedAt: '2026-03-05T00:00:00.000Z' } } });
    const b = base({ lessons: { mem: { ...licao('mem', [1, 2, 3, 4, 5]), completedAt: '2026-02-20T00:00:00.000Z' } } });
    expect(mergeStates(a, b).lessons.mem!.completedAt).toBe('2026-02-20T00:00:00.000Z');
  });

  it('não paga o bônus de acerto perfeito duas vezes', () => {
    const a = base({ lessons: { mem: { ...licao('mem', [5]), perfectBonusPaid: true } } });
    const b = base({ lessons: { mem: { ...licao('mem', [5]), perfectBonusPaid: false } } });
    expect(mergeStates(a, b).lessons.mem!.perfectBonusPaid).toBe(true);
  });

  it('soma XP pelo máximo, nunca pela adição', () => {
    /* O mesmo dia sincronizado duas vezes não pode virar o dobro de XP. */
    const a = base({ xp: 300 });
    const b = base({ xp: 220 });
    expect(mergeStates(a, b).xp).toBe(300);
    expect(mergeStates(a, a).xp).toBe(300);
  });

  it('conta cada dia pelo máximo, e não pela soma', () => {
    const a = base({ days: { '2026-03-01': { answered: 12, units: 30, xp: 60, goalMet: true } } });
    const b = base({ days: { '2026-03-01': { answered: 8, units: 20, xp: 40, goalMet: false } } });
    const d = mergeStates(a, b).days['2026-03-01']!;
    expect(d).toEqual({ answered: 12, units: 30, xp: 60, goalMet: true });
  });

  it('a fila de revisão segue o aparelho que viu o item por último', () => {
    /* A caixa de Leitner é posição numa fila, não pontuação: quem errou
       ontem derruba o item, mesmo que o outro aparelho tenha acertado antes. */
    const antes = base({ srs: { mem: {
      itemId: 'mem', letterId: 'mem', box: 3, misses: 1, hits: 5,
      dueOn: '2026-03-10', lastSeen: '2026-03-01'
    } } });
    const depois = base({ srs: { mem: {
      itemId: 'mem', letterId: 'mem', box: 0, misses: 2, hits: 5,
      dueOn: '2026-03-06', lastSeen: '2026-03-05'
    } } });
    const f = mergeStates(antes, depois).srs.mem!;
    expect(f.box).toBe(0);
    expect(f.dueOn).toBe('2026-03-06');
    expect(f.misses).toBe(2);
    expect(f.lastSeen).toBe('2026-03-05');
  });

  it('junta as conquistas e guarda a data mais antiga de cada uma', () => {
    const a = base({ achievements: [{ id: 'x', unlockedAt: '2026-03-05T00:00:00.000Z' }] });
    const b = base({ achievements: [
      { id: 'x', unlockedAt: '2026-02-01T00:00:00.000Z' },
      { id: 'y', unlockedAt: '2026-03-09T00:00:00.000Z' }
    ] });
    const f = mergeStates(a, b);
    expect(f.achievements).toHaveLength(2);
    expect(f.achievements.find(z => z.id === 'x')!.unlockedAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('a sequência corrente é a do dia mais recente, e o recorde é o maior', () => {
    const velho = base({ streak: { current: 9, longest: 9, lastDay: '2026-02-01' } });
    const novo = base({ streak: { current: 2, longest: 3, lastDay: '2026-03-10' } });
    const f = mergeStates(velho, novo).streak;
    expect(f.current).toBe(2);
    expect(f.longest).toBe(9);
    expect(f.lastDay).toBe('2026-03-10');
  });

  it('o "primeiro" de cada coisa é sempre o mais antigo', () => {
    const a = base({ firsts: { 'palavra-sem-translit': '2026-03-08T00:00:00.000Z' } });
    const b = base({ firsts: { 'palavra-sem-translit': '2026-02-11T00:00:00.000Z' } });
    expect(mergeStates(a, b).firsts['palavra-sem-translit']).toBe('2026-02-11T00:00:00.000Z');
  });

  it('o melhor tempo da academia é o MENOR dos dois', () => {
    const a = base({ gym: { relampago: {
      runs: 3, best: 0.8, bestSeconds: 52, lastSeconds: 52, previousSeconds: 60, lastOn: '2026-03-02'
    } } });
    const b = base({ gym: { relampago: {
      runs: 5, best: 0.9, bestSeconds: 41, lastSeconds: 44, previousSeconds: 41, lastOn: '2026-03-07'
    } } });
    const g = mergeStates(a, b).gym.relampago!;
    expect(g.bestSeconds).toBe(41);
    expect(g.best).toBe(0.9);
    expect(g.runs).toBe(5);
    expect(g.lastSeconds).toBe(44);      /* a narrativa vem do lado recente */
  });

  it('o exame guarda a melhor nota e a primeira conclusão', () => {
    const a = base({ finalChallenge: {
      best: 0.62, completedAt: '2026-03-01T00:00:00.000Z', passedAt: null, attempts: 1,
      parts: { leitura: { correct: 4, total: 8 } }
    } });
    const b = base({ finalChallenge: {
      best: 0.88, completedAt: '2026-03-09T00:00:00.000Z',
      passedAt: '2026-03-09T00:00:00.000Z', attempts: 2,
      parts: { leitura: { correct: 7, total: 8 } }
    } });
    const f = mergeStates(a, b).finalChallenge;
    expect(f.best).toBe(0.88);
    expect(f.completedAt).toBe('2026-03-01T00:00:00.000Z');
    expect(f.passedAt).toBe('2026-03-09T00:00:00.000Z');
    /* O relatório é de UMA prova: vem inteiro da tentativa mais recente. */
    expect(f.parts!.leitura).toEqual({ correct: 7, total: 8 });
  });

  it('o lado local desempata a última rota', () => {
    const aqui = base({ lastRoute: '/licao/tav' });
    const la = base({ lastRoute: '/mapa' });
    expect(mergeStates(aqui, la).lastRoute).toBe('/licao/tav');
  });

  it('o onboarding não depende do lado, e sim de quem respondeu primeiro', () => {
    /* Se dependesse do lado, dois aparelhos com blocos diferentes ficariam
       trocando o seu pelo do outro para sempre - uma escrita no servidor a
       cada abertura do site, sem nada ter mudado. */
    const resp = (quando: string) => ({
      reason: 'familia' as const, goalMinutes: 10 as const,
      startingPoint: 'zero' as const, name: 'M', completedAt: quando
    });
    const a = base({ onboarding: resp('2026-03-08T00:00:00.000Z') });
    const b = base({ onboarding: resp('2026-02-02T00:00:00.000Z') });
    expect(mergeStates(a, b).onboarding!.completedAt).toBe('2026-02-02T00:00:00.000Z');
    expect(mergeStates(b, a).onboarding!.completedAt).toBe('2026-02-02T00:00:00.000Z');
  });

  it('a rota sozinha não conta como progresso novo', () => {
    /* É o que impede uma escrita no banco a cada clique de navegação. */
    const a = base({ xp: 100, lastRoute: '/mapa' });
    const b = base({ xp: 100, lastRoute: '/licao/mem' });
    expect(sameState(a, b)).toBe(false);
    expect(sameProgress(a, b)).toBe(true);
    /* Mas uma letra a mais conta, com rota igual ou diferente. */
    expect(sameProgress(a, base({ xp: 100, lastRoute: '/mapa', lessons: { mem: licao('mem', [1]) } })))
      .toBe(false);
  });

  it('fundir com um estado vazio não muda nada', () => {
    const cheio = base({
      xp: 420,
      lessons: { mem: licao('mem', [1, 2, 3, 4, 5], 1) },
      achievements: [{ id: 'x', unlockedAt: '2026-03-01T00:00:00.000Z' }],
      streak: { current: 4, longest: 7, lastDay: '2026-03-10' }
    });
    expect(sameState(mergeStates(cheio, EMPTY_STATE), cheio)).toBe(true);
    expect(sameState(mergeStates(EMPTY_STATE, cheio), cheio)).toBe(true);
  });
});

/* ── as duas propriedades que fazem o 409 ser seguro ─────────────────────── */

const CELULAR = {
  ...EMPTY_STATE,
  xp: 180,
  lessons: { mem: licao('mem', [1, 2, 3]), tav: licao('tav', [1, 2, 3, 4, 5], 0.8) },
  days: { '2026-03-09': { answered: 14, units: 24, xp: 70, goalMet: true } },
  streak: { current: 3, longest: 3, lastDay: '2026-03-09' },
  achievements: [{ id: 'primeira-letra', unlockedAt: '2026-03-07T00:00:00.000Z' }],
  srs: { tav: {
    itemId: 'tav', letterId: 'tav', box: 1 as const, misses: 2, hits: 1,
    dueOn: '2026-03-11', lastSeen: '2026-03-09'
  } },
  firsts: { 'palavra-sem-translit': '2026-03-08T00:00:00.000Z' }
} satisfies LearnerState;

const NOTEBOOK = {
  ...EMPTY_STATE,
  xp: 240,
  lessons: { mem: licao('mem', [4, 5], 0.6), alef: licao('alef', [1, 2]) },
  days: { '2026-03-10': { answered: 9, units: 30, xp: 90, goalMet: true } },
  streak: { current: 1, longest: 5, lastDay: '2026-03-10' },
  achievements: [{ id: 'cinco-letras', unlockedAt: '2026-03-10T00:00:00.000Z' }],
  srs: { tav: {
    itemId: 'tav', letterId: 'tav', box: 2 as const, misses: 2, hits: 3,
    dueOn: '2026-03-14', lastSeen: '2026-03-10'
  } },
  firsts: { 'letra-de-memoria': '2026-03-10T00:00:00.000Z' }
} satisfies LearnerState;

describe('as propriedades que tornam repetir a fusão seguro', () => {
  it('é comutativa nos campos que não dependem do aparelho', () => {
    const ab = mergeStates(CELULAR, NOTEBOOK);
    const ba = mergeStates(NOTEBOOK, CELULAR);
    /* `lastRoute` e `onboarding` são os dois desempates locais e por isso
       ficam de fora da comparação - tudo o mais tem de bater. */
    expect(sameState({ ...ab, lastRoute: null, onboarding: null },
                     { ...ba, lastRoute: null, onboarding: null })).toBe(true);
  });

  it('é idempotente: fundir de novo não muda mais nada', () => {
    const uma = mergeStates(CELULAR, NOTEBOOK);
    const duas = mergeStates(uma, NOTEBOOK);
    const tres = mergeStates(duas, CELULAR);
    expect(sameState(uma, duas)).toBe(true);
    expect(sameState(uma, tres)).toBe(true);
  });

  it('nunca perde uma letra que existia em algum dos lados', () => {
    const f = mergeStates(CELULAR, NOTEBOOK);
    for (const id of [...Object.keys(CELULAR.lessons), ...Object.keys(NOTEBOOK.lessons)]) {
      expect(f.lessons[id], id).toBeDefined();
    }
    /* E a letra que andou nos dois soma as etapas em vez de escolher uma. */
    expect(f.lessons.mem!.stagesDone).toEqual([1, 2, 3, 4, 5]);
  });

  it('a ordem das chaves não faz dois estados iguais parecerem diferentes', () => {
    const embaralhado = JSON.parse(JSON.stringify(
      Object.fromEntries(Object.entries(CELULAR).reverse())
    )) as LearnerState;
    expect(sameState(CELULAR, embaralhado)).toBe(true);
  });
});
