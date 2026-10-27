/* As etapas Praticar e Exercícios (a fixação de 20 itens) não repetem o
 * "qual destas é a letra" (27/10/2026, pedido do dono). Ver TETO_POR_TIPO em
 * buildLetterPractice e buildMiniTest. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { buildLetterPractice, buildMiniTest } from '@/lib/engine/exercises';
import { FIXACAO_ITENS } from '@/lib/state/rules';

const L = [...conteudoPago.letters].sort((a, b) => a.order - b.order);

describe('a fixação de cada letra é variada', () => {
  for (const audioAvailable of [false, true]) {
    it(`as 22 letras, ${audioAvailable ? 'com' : 'sem'} áudio`, () => {
      for (const letter of L) {
        const history = L.filter(l => l.order <= letter.order);
        for (const seed of [undefined, `mini-${letter.id}-2`, `mini-${letter.id}-3`]) {
          const m = buildMiniTest(letter, history, { audioAvailable, seed });
          const conta = (k: string) => m.filter(e => e.kind === k).length;
          const tag = `${letter.id} ${seed ?? ''}`;
          expect(m.length, tag).toBe(FIXACAO_ITENS);
          /* "Qual destas é a letra", "Entre estas parecidas" e o contraste do
             par são o mesmo gesto na tela: um só por bloco. */
          expect(conta('letter-recognition'), tag).toBe(1);
          expect(conta('odd-one-out'), tag).toBeLessThanOrEqual(1);
          expect(conta('print-vs-cursive'), tag).toBeLessThanOrEqual(2);
          for (const k of new Set(m.map(e => e.kind))) expect(conta(k), `${tag} ${k}`).toBeLessThanOrEqual(3);
          expect(new Set(m.map(e => e.kind)).size, tag).toBeGreaterThanOrEqual(10);
          for (let i = 1; i < m.length; i++) expect(m[i]!.kind, `${tag} #${i}`).not.toBe(m[i - 1]!.kind);
        }
      }
    });
  }
});

describe('a prática de cada letra é variada', () => {
  for (const audioAvailable of [false, true]) {
    it(`as 22 letras, ${audioAvailable ? 'com' : 'sem'} áudio`, () => {
      for (const letter of L) {
        const history = L.filter(l => l.order <= letter.order);
        for (const seed of [undefined, `pratica-${letter.id}-2`, `pratica-${letter.id}-3`]) {
          const m = buildLetterPractice(letter, history, { audioAvailable, seed });
          const conta = (k: string) => m.filter(e => e.kind === k).length;
          const tag = `${letter.id} ${seed ?? ''}`;
          expect(m.length, tag).toBe(letter.order >= 2 ? 16 : 14);
          expect(conta('letter-recognition'), tag).toBe(1);
          expect(conta('odd-one-out'), tag).toBeLessThanOrEqual(1);
          expect(conta('print-vs-cursive'), tag).toBeLessThanOrEqual(2);
          for (const k of new Set(m.map(e => e.kind))) expect(conta(k), `${tag} ${k}`).toBeLessThanOrEqual(3);
        }
      }
    });
  }
});
