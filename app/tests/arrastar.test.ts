/* Montar a palavra arrastando (28/10/2026): a peça entra onde foi solta,
   contando da direita, e uma peça já posta muda de lugar sem se duplicar. */
import { describe, expect, it } from 'vitest';
import { posicaoDeSoltar, soltarNaPalavra, tirarDaPalavra, type Caixa } from '@/lib/arrastar';

/* Três peças numa linha, a primeira à direita (como o hebraico se lê). */
const linha: Caixa[] = [
  { left: 200, right: 250, top: 0, bottom: 50 },
  { left: 140, right: 190, top: 0, bottom: 50 },
  { left: 80, right: 130, top: 0, bottom: 50 }
];

describe('onde a peça cai', () => {
  it('à direita de tudo é a primeira; à esquerda de tudo, a última', () => {
    expect(posicaoDeSoltar(linha, 300, 25)).toBe(0);
    expect(posicaoDeSoltar(linha, 20, 25)).toBe(3);
  });
  it('entre duas peças, entre elas', () => {
    expect(posicaoDeSoltar(linha, 195, 25)).toBe(1);
    expect(posicaoDeSoltar(linha, 135, 25)).toBe(2);
  });
  it('a segunda linha vem depois da primeira inteira', () => {
    const duas = [...linha, { left: 200, right: 250, top: 60, bottom: 110 }];
    expect(posicaoDeSoltar(duas, 20, 85)).toBe(4);
    expect(posicaoDeSoltar(duas, 300, 85)).toBe(3);
  });
  it('sem peças, a primeira', () => {
    expect(posicaoDeSoltar([], 10, 10)).toBe(0);
  });
});

describe('o que a soltura faz', () => {
  it('peça nova entra na posição', () => {
    expect(soltarNaPalavra([4, 2], 7, 1)).toEqual([4, 7, 2]);
    expect(soltarNaPalavra([], 3, 0)).toEqual([3]);
    expect(soltarNaPalavra([4, 2], 7, 9)).toEqual([4, 2, 7]);
  });
  it('peça já posta muda de lugar e não se duplica', () => {
    expect(soltarNaPalavra([1, 2, 3], 1, 3)).toEqual([2, 3, 1]);
    expect(soltarNaPalavra([1, 2, 3], 3, 0)).toEqual([3, 1, 2]);
    expect(soltarNaPalavra([1, 2, 3], 2, 2)).toEqual([1, 2, 3]);
  });
  it('arrastar para fora tira', () => {
    expect(tirarDaPalavra([1, 2, 3], 2)).toEqual([1, 3]);
  });
});
