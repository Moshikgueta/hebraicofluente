/* A rampa para o hebraico sem pontos: os checkpoints 3, 4 e 5 terminam com
   três palavras conhecidas, sem nikud, fora da nota. */

import { describe, expect, it } from 'vitest';
import { course } from '@/lib/content-publico';
import { conteudoPago } from '@/lib/content-servidor';
import {
  alfabetoDe, buildSemPontos, MODULOS_COM_RAMPA, todasAsLetrasEnsinadas
} from '@/lib/engine/palavras';
import { rng } from '@/lib/engine/rng';
import { stripNikud } from '@/lib/hebrew';

const L = conteudoPago.letters;

describe('a rampa sem pontos', () => {
  for (const n of MODULOS_COM_RAMPA) {
    const upTo = course.modules.find(m => m.n === n)!.checkpoint!.upTo;
    const history = L.filter(l => l.order <= upTo);

    it(`módulo ${n}: três palavras sem nikud, só com letras já ensinadas`, () => {
      for (let s = 0; s < 10; s++) {
        const ex = buildSemPontos(history, rng(`t-${n}-${s}`));
        expect(ex).toHaveLength(3);
        for (const e of ex) {
          if (e.kind !== 'word-meaning') throw new Error(e.kind);
          expect(e.he, e.id).toBe(stripNikud(e.he));
          expect(todasAsLetrasEnsinadas(e.he, alfabetoDe(history)), e.id).toBe(true);
          expect(e.answer, e.id).toBeGreaterThanOrEqual(0);
          expect(new Set(e.options).size, e.id).toBe(e.options.length);
          expect(e.options.length, e.id).toBeGreaterThanOrEqual(3);
          expect(e.id.startsWith('sempontos-')).toBe(true);
        }
      }
    });
  }

  it('nunca pergunta uma grafia que, sem pontos, vale duas palavras', () => {
    const history = L.filter(l => l.order <= 22);
    const vistas = buildSemPontos(history, rng('x'), 500).map(e => ('he' in e ? e.he : ''));
    expect(vistas).not.toContain('שם');
  });

  it('só os checkpoints 3, 4 e 5 têm a rampa', () => {
    expect([...MODULOS_COM_RAMPA]).toEqual([3, 4, 5]);
  });
});
