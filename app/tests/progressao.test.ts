/* A trava de progressão: uma letra por vez, e nunca tirar o que já foi dado.
 *
 * Os casos aqui não são sobre a tela: são sobre a regra que o mapa desenha e
 * que a rota faz valer. Uma trava que engana em qualquer um deles é pior do
 * que trava nenhuma - ou prende quem já passou, ou deixa entrar quem não
 * consegue ler a tela que vai encontrar.
 */

import { describe, expect, it } from 'vitest';
import {
  LIBERA_MARK, STAGE_COUNT, letraAtual, letraLiberada, liberaSeguinte, porQueTrancada
} from '@/lib/state/rules';
import type { LearnerState, LessonProgress } from '@/lib/state/types';

const ORDEM = ['alef', 'mem', 'tav', 'nun', 'he', 'yod'];

const licao = (id: string, etapas: number, nota: number | null): LessonProgress => ({
  letterId: id,
  stagesDone: Array.from({ length: etapas }, (_, i) => i + 1),
  quizBest: nota,
  quizAttempts: nota === null ? 0 : 1,
  perfectBonusPaid: false,
  completedAt: etapas >= STAGE_COUNT ? '2026-01-01T00:00:00.000Z' : null
});

const estado = (licoes: Record<string, LessonProgress>): LearnerState =>
  ({ lessons: licoes } as unknown as LearnerState);

describe('a porta abre no lugar certo', () => {
  it('a primeira letra está sempre aberta, inclusive para quem nunca entrou', () => {
    expect(letraLiberada(estado({}), ORDEM, 'alef')).toBe(true);
  });

  it('a segunda continua fechada enquanto a primeira não fecha', () => {
    expect(letraLiberada(estado({}), ORDEM, 'mem')).toBe(false);
    /* Cinco etapas e nota abaixo do critério: não abre. Clicar em
       "continuar" cinco vezes não é aprender. */
    expect(letraLiberada(estado({ alef: licao('alef', 5, 0.6) }), ORDEM, 'mem')).toBe(false);
    /* Nota boa e etapas pela metade: também não. */
    expect(letraLiberada(estado({ alef: licao('alef', 3, 1) }), ORDEM, 'mem')).toBe(false);
  });

  it('abre quando a anterior é dominada', () => {
    const s = estado({ alef: licao('alef', 5, LIBERA_MARK) });
    expect(liberaSeguinte(s, 'alef')).toBe(true);
    expect(letraLiberada(s, ORDEM, 'mem')).toBe(true);
    /* E só a seguinte: a terceira continua fechada. */
    expect(letraLiberada(s, ORDEM, 'tav')).toBe(false);
  });

  it('a nota exatamente no critério conta', () => {
    /* A fronteira, escrita: um aluno que tira exatamente a nota mínima não
       pode ficar preso por um `>` no lugar de um `>=`. */
    expect(liberaSeguinte(estado({ alef: licao('alef', 5, LIBERA_MARK) }), 'alef')).toBe(true);
    expect(liberaSeguinte(estado({ alef: licao('alef', 5, LIBERA_MARK - 0.01) }), 'alef')).toBe(false);
  });
});

describe('nunca tira o que já foi dado', () => {
  it('quem já tem progresso numa letra continua entrando nela', () => {
    /* O caso do aluno que estava estudando quando a trava entrou: ele abriu
       a lição 5 sem nota nenhuma na 4. A trava não pode fechar a porta por
       onde ele já passou. */
    const s = estado({ he: licao('he', 2, null) });
    expect(letraLiberada(s, ORDEM, 'he')).toBe(true);
  });

  it('e tudo o que vem ANTES dela também', () => {
    const s = estado({ he: licao('he', 1, null) });
    for (const id of ['alef', 'mem', 'tav', 'nun']) {
      expect(letraLiberada(s, ORDEM, id), id).toBe(true);
    }
    /* Mas não o que vem depois. */
    expect(letraLiberada(s, ORDEM, 'yod')).toBe(false);
  });

  it('subir o critério não fecha porta por onde alguém passou', () => {
    /* Simula a régua ficando mais dura: a nota antiga (0.75) deixou de
       liberar, mas o aluno já tinha entrado na seguinte. */
    const s = estado({ alef: licao('alef', 5, 0.75), mem: licao('mem', 1, null) });
    expect(liberaSeguinte(s, 'alef')).toBe(false);
    expect(letraLiberada(s, ORDEM, 'mem')).toBe(true);
  });
});

describe('a porta trancada diz o que falta', () => {
  it('quando a lição anterior nem foi terminada', () => {
    const q = porQueTrancada(estado({ alef: licao('alef', 2, null) }), ORDEM, 'mem');
    expect(q).toEqual({ anterior: 'alef', falta: 'licao', nota: null });
  });

  it('quando faltou nota', () => {
    const q = porQueTrancada(estado({ alef: licao('alef', 5, 0.5) }), ORDEM, 'mem');
    expect(q).toEqual({ anterior: 'alef', falta: 'nota', nota: 0.5 });
  });

  it('e não diz nada quando está aberta', () => {
    expect(porQueTrancada(estado({}), ORDEM, 'alef')).toBeNull();
  });
});

describe('para onde mandar quem bateu numa porta trancada', () => {
  it('a última aberta', () => {
    expect(letraAtual(estado({}), ORDEM)).toBe('alef');
    expect(letraAtual(estado({ alef: licao('alef', 5, 1) }), ORDEM)).toBe('mem');
    expect(letraAtual(estado({
      alef: licao('alef', 5, 1), mem: licao('mem', 5, 1), tav: licao('tav', 2, null)
    }), ORDEM)).toBe('tav');
  });
});
