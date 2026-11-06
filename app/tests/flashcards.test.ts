/* Flashcards (28/10/2026): só o que já foi ensinado entra no baralho. */

import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { cartasDoBaralho } from '@/components/learn/Flashcards';
import { alfabetoDe, consegueLer } from '@/lib/engine/palavras';

const letras = conteudoPago.letters;
const ate = (ordem: number) => letras.filter(l => l.order <= ordem);

describe('flashcards', () => {
  it('o baralho de letras tem uma carta por letra começada, com nome e som', () => {
    const cartas = cartasDoBaralho('letras', ate(6), letras);
    expect(cartas).toHaveLength(6);
    for (const c of cartas) {
      expect(c.titulo.length).toBeGreaterThan(0);
      expect(c.detalhe.length).toBeGreaterThan(0);
    }
  });

  it('o baralho de palavras só tem palavras do curso que as letras do aluno leem', () => {
    for (let ordem = 1; ordem <= letras.length; ordem++) {
      const alfabeto = alfabetoDe(ate(ordem));
      for (const c of cartasDoBaralho('palavras', ate(ordem), letras)) {
        expect(consegueLer(c.frente, alfabeto), `${c.frente} com ${ordem} letras`).toBe(true);
        expect(c.detalhe.length, c.frente).toBeGreaterThan(0);
      }
    }
  });

  it('com uma letra só ainda não há palavra; no fim do alfabeto o baralho é grande', () => {
    expect(cartasDoBaralho('palavras', ate(1), letras)).toHaveLength(0);
    expect(cartasDoBaralho('palavras', letras, letras).length).toBeGreaterThan(100);
  });
});
