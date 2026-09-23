/* Os modos de palavra da academia tiram as palavras do vocabulário que o
 * aluno ACUMULOU.
 * ─────────────────────────────────────────────────────────────────────────
 * O defeito: cada item escolhia a palavra pela posição dele na rodada, numa
 * lista sempre igual e na mesma ordem. "Digitar em hebraico" pedia אמא oito
 * vezes seguidas; "Palavras à mão" e "Construir" giravam em volta das
 * primeiras palavras do curso, qualquer que fosse o vocabulário do aluno, e a
 * rodada era a mesma o dia inteiro.
 */

import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { GYM_MODES, buildGym, type GymModeId } from '../src/lib/engine/gym';
import { alfabetoDe, letrasDaGrafia, palavrasAcumuladas, todasAsLetrasEnsinadas } from '../src/lib/engine/palavras';
import { violatesOrderRule, type Exercise } from '../src/lib/engine/exercises';
import { stripNikud } from '../src/lib/hebrew';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const letters = allLetters();
const MODOS: GymModeId[] = ['palavras-cursiva', 'construir', 'digitar'];
const modo = (id: GymModeId) => GYM_MODES.find(m => m.id === id)!;

/** A palavra que o item cobra, sem sinais. */
const palavraDo = (e: Exercise): string => {
  const x = e as Exercise & { escrita?: string; target?: string; accept?: string[] };
  return stripNikud(x.escrita ?? x.target ?? x.accept?.[0] ?? '');
};

const comRodadas = (id: GymModeId, runs: number): LearnerState => ({
  ...EMPTY_STATE,
  gym: { [id]: { runs, best: null, bestSeconds: null, previousSeconds: null, lastAt: null } }
} as unknown as LearnerState);

const rodada = (id: GymModeId, n: number, seed: string, state: LearnerState = EMPTY_STATE) =>
  buildGym(modo(id), state, letters.slice(0, n), { audioAvailable: false, day: '2026-09-23', seed }).exercises;

describe('os modos de palavra usam o vocabulário acumulado', () => {
  it('uma rodada não repete palavra enquanto houver palavra nova', () => {
    for (const id of MODOS) for (const n of [4, 6, 12, 22]) {
      const itens = rodada(id, n, `${id}-a`);
      const acumuladas = palavrasAcumuladas(letters.slice(0, n)).length;
      const distintas = new Set(itens.map(palavraDo)).size;
      expect(distintas, `${id} com ${n} letras`).toBe(Math.min(modo(id).count, acumuladas, itens.length));
      expect(distintas, `${id} com ${n} letras`).toBe(Math.min(modo(id).count, acumuladas));
    }
  });

  it('digitar nunca pede a mesma palavra duas vezes (pedia אמא oito vezes)', () => {
    for (const n of [3, 5, 8, 12, 22]) {
      const itens = rodada('digitar', n, 'd');
      expect(new Set(itens.map(palavraDo)).size).toBe(itens.length);
    }
  });

  it('com poucas palavras, a segunda volta troca o gesto e nunca repete em seguida', () => {
    const itens = rodada('palavras-cursiva', 3, 'c');
    for (let k = 1; k < itens.length; k++) {
      expect(palavraDo(itens[k]!)).not.toBe(palavraDo(itens[k - 1]!));
    }
    const porPalavra = new Map<string, Set<string>>();
    for (const e of itens) {
      const g = e.kind === 'cursive-word' ? (e as { modo: string }).modo : e.kind;
      porPalavra.set(palavraDo(e), (porPalavra.get(palavraDo(e)) ?? new Set()).add(g));
    }
    for (const [p, gestos] of porPalavra) {
      const vezes = itens.filter(e => palavraDo(e) === p).length;
      expect(gestos.size, p).toBe(vezes);
    }
  });

  it('em rodadas seguidas, o rodízio passa por TODO o vocabulário acumulado', () => {
    for (const id of MODOS) {
      const n = 22;
      const alvo = new Set(palavrasAcumuladas(letters.slice(0, n))
        .filter(w => id !== 'digitar' || letrasDaGrafia(w.he).length <= 6)
        .map(w => stripNikud(w.he)));
      const vistas = new Set<string>();
      let r = 0;
      for (; r < 60 && vistas.size < alvo.size; r++) {
        for (const e of rodada(id, n, `${id}-${r}`, comRodadas(id, r))) vistas.add(palavraDo(e));
      }
      expect(vistas.size, id).toBe(alvo.size);
      /* O rodízio cobre em poucas dezenas de rodadas o que o sorteio puro
         levaria centenas para garantir. */
      expect(r, id).toBeLessThanOrEqual(Math.ceil(alvo.size / (modo(id).count - 3)) + 2);
    }
  });

  it('duas sessões no mesmo dia dão rodadas diferentes; a mesma sessão, a mesma', () => {
    for (const id of MODOS) {
      const a = rodada(id, 12, `${id}-1000`).map(palavraDo).join(' ');
      const b = rodada(id, 12, `${id}-2000`).map(palavraDo).join(' ');
      expect(a).not.toBe(b);
      expect(rodada(id, 12, `${id}-1000`).map(palavraDo).join(' ')).toBe(a);
    }
  });

  it('nenhuma palavra usa letra que o aluno ainda não aprendeu', () => {
    for (const id of MODOS) for (const n of [3, 4, 7, 11, 16, 22]) {
      const alfabeto = alfabetoDe(letters.slice(0, n));
      for (let r = 0; r < 4; r++) {
        for (const e of rodada(id, n, `${id}-${r}`, comRodadas(id, r))) {
          expect(todasAsLetrasEnsinadas(palavraDo(e), alfabeto), `${id} ${n} ${palavraDo(e)}`).toBe(true);
          expect(violatesOrderRule(e, alfabeto), `${id} ${n} ${e.id}`).toEqual([]);
        }
      }
    }
  });
});
