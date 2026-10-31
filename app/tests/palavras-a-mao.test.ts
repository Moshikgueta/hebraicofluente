/* Palavras à mão: o sorteio só oferece o que a mão do aluno já pode escrever.
 * À mão a palavra vai sem vogal, então o ו e o י que eram vogal viram LETRA
 * na tela. Uma palavra com letra ainda não ensinada ensinaria essa letra
 * pela porta dos fundos - a regra que o curso inteiro guarda. */

import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import {
  alfabetoDe, letrasDaGrafia, palavrasParaEscrever, RODADA_A_MAO, todasAsLetrasEnsinadas
} from '@/lib/engine/palavras';
import { rng } from '@/lib/engine/rng';

const letras = conteudoPago.letters;
const ate = (ordem: number) => letras.filter(l => l.order <= ordem);

describe('palavras à mão', () => {
  it('toda palavra sorteada tem todas as letras da grafia já ensinadas', () => {
    for (let ordem = 1; ordem <= letras.length; ordem++) {
      const aprendidas = ate(ordem);
      const alfabeto = alfabetoDe(aprendidas);
      for (let s = 0; s < 5; s++) {
        for (const w of palavrasParaEscrever(aprendidas, rng(`t-${ordem}-${s}`))) {
          expect(todasAsLetrasEnsinadas(w.he, alfabeto), `${w.he} com ${ordem} letras`).toBe(true);
        }
      }
    }
  });

  it('cabe num telefone: de duas a sete letras', () => {
    for (const w of palavrasParaEscrever(letras, rng('x'), 500)) {
      const n = letrasDaGrafia(w.he).length;
      expect(n, w.he).toBeGreaterThanOrEqual(2);
      expect(n, w.he).toBeLessThanOrEqual(7);
    }
  });

  it('uma rodada tem cinco palavras diferentes, e a mesma semente dá a mesma rodada', () => {
    const a = palavrasParaEscrever(letras, rng('dia-1')).map(w => w.he);
    const b = palavrasParaEscrever(letras, rng('dia-1')).map(w => w.he);
    expect(a).toHaveLength(RODADA_A_MAO);
    expect(new Set(a).size).toBe(a.length);
    expect(b).toEqual(a);
  });

  it('com o alfabeto inteiro há vocabulário de sobra para várias rodadas', () => {
    expect(palavrasParaEscrever(letras, rng('y'), 500).length).toBeGreaterThan(40);
  });

  it('com uma letra só não há palavra, e a tela explica em vez de quebrar', () => {
    expect(palavrasParaEscrever(ate(1), rng('z'))).toEqual([]);
  });
});
