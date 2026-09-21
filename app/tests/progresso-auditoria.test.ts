/* A auditoria do progresso, virada em prova.
 * ─────────────────────────────────────────────────────────────────────────
 * Estes casos não nasceram de uma leitura do código: nasceram de uma
 * auditoria feita contra o Worker de verdade, com D1 local e dois alunos, em
 * 21/09/2026. Cada `it` aqui fixa uma resposta que aquele dia mediu, para que
 * ela não mude sem alguém decidir mudá-la.
 *
 * O que já é coberto em outro lugar não se repete aqui: a fusão entre
 * aparelhos está em merge.test.ts, a revisão e o conflito em
 * progresso-servidor.test.ts, o momento da gravação em gravador.test.ts, e a
 * régua de domínio em rules.test.ts.
 *
 * O que falta - e é o que este arquivo cobre - é a ARITMÉTICA que o aluno lê
 * na tela: a porcentagem do curso, o XP e a sequência de dias. São os números
 * em que um erro não derruba nada, não aparece em nenhum teste, e mina a
 * confiança de quem está estudando.
 */

import { describe, expect, it } from 'vitest';
import {
  applyPractice, awardXp, completeStage, courseProgress, displayStreak,
  EXTRA_STAGE_COUNT, STAGE_COUNT, XP
} from '@/lib/state/rules';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';

const DIA = '2026-09-21';

/** Uma letra com as cinco etapas feitas, sem passar pelas regras. */
const letraFeita = (id: string) => ({
  letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 1, quizAttempts: 1,
  perfectBonusPaid: true, completedAt: '2026-09-21T00:00:00.000Z'
});

const comLetras = (ids: string[]): LearnerState => ({
  ...EMPTY_STATE,
  lessons: Object.fromEntries(ids.map(id => [id, letraFeita(id)]))
});

/* ── a porcentagem ──────────────────────────────────────────────────────── */

describe('a porcentagem do curso', () => {
  it('começa em zero', () => {
    expect(courseProgress(EMPTY_STATE, 22)).toBe(0);
  });

  it('uma letra de 22 vale um vinte e dois avos', () => {
    expect(courseProgress(comLetras(['alef']), 22)).toBeCloseTo(1 / 22, 6);
  });

  it('metade das letras é metade do curso', () => {
    const onze = Array.from({ length: 11 }, (_, i) => 'l' + i);
    expect(courseProgress(comLetras(onze), 22)).toBeCloseTo(0.5, 6);
  });

  it('as 22 fecham em 100%, e não em 99 nem em 101', () => {
    const todas = Array.from({ length: 22 }, (_, i) => 'l' + i);
    expect(courseProgress(comLetras(todas), 22)).toBe(1);
  });

  it('NUNCA passa de 100%, nem com letras a mais do que o curso tem', () => {
    /* Um estado que veio de uma versão com mais letras, ou adulterado à mão,
       não pode produzir 120% na barra. */
    const demais = Array.from({ length: 40 }, (_, i) => 'l' + i);
    expect(courseProgress(comLetras(demais), 22)).toBe(1);
  });

  it('NUNCA passa de 100% com etapas repetidas dentro de uma letra', () => {
    /* `completeStage` não deixa repetir, mas a fusão e um estado adulterado
       deixam - e é a porcentagem que tem de aguentar. */
    const s: LearnerState = {
      ...EMPTY_STATE,
      lessons: { alef: { ...letraFeita('alef'), stagesDone: [1, 1, 1, 1, 1, 1, 1, 1] } }
    };
    expect(courseProgress(s, 22)).toBeCloseTo(1 / 22, 6);
  });

  it('nunca é negativa, e um curso sem letras não divide por zero', () => {
    expect(courseProgress(EMPTY_STATE, 0)).toBe(0);
    expect(courseProgress(comLetras(['alef']), 0)).toBe(0);
  });

  it('refazer a mesma letra não aumenta a porcentagem', () => {
    let s = comLetras(['alef']);
    const antes = courseProgress(s, 22);
    for (let etapa = 1; etapa <= 5; etapa++) s = completeStage(s, 'alef', etapa, DIA);
    expect(courseProgress(s, 22)).toBe(antes);
  });

  it('e os módulos 6 e 7 entram na conta com três etapas, não cinco', () => {
    const s: LearnerState = {
      ...EMPTY_STATE,
      lessons: { m6: { ...letraFeita('m6'), stagesDone: [1, 2, 3] } }
    };
    /* Uma parte de 23: 22 letras mais um módulo extra. */
    expect(courseProgress(s, 22, ['m6'])).toBeCloseTo(1 / 23, 6);
    expect(EXTRA_STAGE_COUNT).toBe(3);
    expect(STAGE_COUNT).toBe(5);
  });
});

/* ── o XP ───────────────────────────────────────────────────────────────── */

describe('o XP não conta duas vezes', () => {
  it('a mesma etapa clicada duas vezes paga uma vez só', () => {
    const uma = completeStage(EMPTY_STATE, 'alef', 1, DIA);
    const duas = completeStage(uma, 'alef', 1, DIA);
    expect(duas.xp).toBe(uma.xp);
    expect(duas).toBe(uma);            /* devolve o MESMO objeto: nada mudou */
  });

  it('e o bônus de lição fecha uma vez, mesmo refazendo as cinco etapas', () => {
    let s = EMPTY_STATE;
    for (let e = 1; e <= 5; e++) s = completeStage(s, 'alef', e, DIA);
    const fechada = s.xp;
    for (let e = 1; e <= 5; e++) s = completeStage(s, 'alef', e, DIA);
    expect(s.xp).toBe(fechada);
  });

  it('cada etapa nova paga, e a lição inteira paga o bônus uma vez', () => {
    let s = EMPTY_STATE;
    for (let e = 1; e <= 5; e++) s = completeStage(s, 'alef', e, DIA);
    /* Cinco etapas mais o bônus de lição - e o que a meta do dia pagou. */
    expect(s.xp).toBeGreaterThanOrEqual(XP.stage * 5 + XP.lesson);
  });
});

/* ── a sequência de dias ────────────────────────────────────────────────── */

describe('a sequência de dias', () => {
  const metaDoDia = (s: LearnerState, dia: string) =>
    applyPractice(s, dia, { answered: 1, units: 999 });

  it('estudar duas vezes no mesmo dia não conta dois dias', () => {
    let s = metaDoDia(EMPTY_STATE, '2026-09-21');
    const depoisDeUma = s.streak.current;
    s = metaDoDia(s, '2026-09-21');
    expect(s.streak.current).toBe(depoisDeUma);
    expect(s.streak.current).toBe(1);
  });

  it('dois dias seguidos somam', () => {
    let s = metaDoDia(EMPTY_STATE, '2026-09-21');
    s = metaDoDia(s, '2026-09-22');
    expect(s.streak.current).toBe(2);
    expect(s.streak.longest).toBe(2);
  });

  it('um dia pulado quebra a sequência e recomeça em 1', () => {
    let s = metaDoDia(EMPTY_STATE, '2026-09-21');
    s = metaDoDia(s, '2026-09-22');
    s = metaDoDia(s, '2026-09-25');
    expect(s.streak.current).toBe(1);
    expect(s.streak.longest).toBe(2);   /* o recorde não se perde */
  });

  it('a sequência MOSTRADA zera sozinha quando o dia passa, sem precisar gravar', () => {
    /* O número na tela não pode continuar dizendo "7 dias" para quem sumiu
       há uma semana só porque ninguém abriu o app para atualizá-lo. */
    const s: LearnerState = {
      ...EMPTY_STATE,
      streak: { current: 7, longest: 9, lastDay: '2026-09-21' }
    };
    expect(displayStreak(s, '2026-09-21')).toBe(7);
    expect(displayStreak(s, '2026-09-22')).toBe(7);   /* ainda dá para salvar */
    expect(displayStreak(s, '2026-09-23')).toBe(0);   /* passou */
    expect(displayStreak(s, '2026-10-30')).toBe(0);
  });

  it('e o recorde guardado nunca é menor que a sequência corrente', () => {
    let s = EMPTY_STATE;
    for (let d = 21; d <= 28; d++) s = metaDoDia(s, `2026-09-${d}`);
    expect(s.streak.longest).toBeGreaterThanOrEqual(s.streak.current);
    expect(s.streak.current).toBe(8);
  });
});

/* ── o que o XP avulso faz ──────────────────────────────────────────────── */

describe('o XP avulso', () => {
  it('soma no total e no dia, e os dois andam juntos', () => {
    const s = awardXp(EMPTY_STATE, DIA, 40);
    expect(s.xp).toBe(40);
    expect(s.days[DIA]!.xp).toBe(40);
  });

  it('nunca fica negativo por conta própria', () => {
    const s = awardXp(awardXp(EMPTY_STATE, DIA, 40), DIA, 10);
    expect(s.xp).toBe(50);
    expect(s.xp).toBeGreaterThan(0);
  });
});
