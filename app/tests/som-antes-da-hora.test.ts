/* O som sem o ponto não aparece antes da lição dele (auditoria de 28/09,
 * PED-025). Vet, Chaf e Fe são ensinados na lição de som logo DEPOIS da
 * letra; a lição da letra não pode trazer frase ou cena com esse som. */

import { describe, expect, it } from 'vitest';
import { allLetters, scenesForOrder, semOSomDe, sentencesUpTo, sonsSemPonto } from '../src/lib/content';
import { buildLetterPractice, buildMiniTest } from '@/lib/engine/exercises';

const letras = allLetters();
const L = (id: string) => letras.find(l => l.id === id)!;
const historia = (id: string) => letras.filter(l => l.order <= L(id).order);

describe('o som sem o ponto espera a própria lição', () => {
  it('reconhece Vet, Chaf e Fe pelo daguesh que falta', () => {
    expect([...sonsSemPonto('בֹּקֶר טוֹב')]).toEqual(['bet']);   // טוֹב termina em Vet
    expect([...sonsSemPonto('תֵּל אָבִיב')]).toEqual(['bet']);
    expect([...sonsSemPonto('מָה שְׁלוֹמְךָ')]).toEqual(['kaf']);
    expect([...sonsSemPonto('קָפֶה')]).toEqual(['pe']);
    expect([...sonsSemPonto('שַׁבָּת')]).toEqual([]);
  });

  for (const id of ['bet', 'kaf', 'pe']) {
    it(`a lição do ${id} não usa o som sem ponto dele`, () => {
      const textos = Array.from({ length: 12 }, (_, k) => [
        ...buildLetterPractice(L(id), historia(id), { audioAvailable: false, seed: `p-${id}-${k}` }),
        ...buildMiniTest(L(id), historia(id), { audioAvailable: false, seed: `m-${id}-${k}` })
      ]).flat().map(e => JSON.stringify(e)).join('\n');
      for (const s of sentencesUpTo(L(id).order).filter(s => !semOSomDe(id)(s))) {
        expect(textos.includes(s.he), `${s.he} apareceu na lição do ${id}`).toBe(false);
      }
      for (const c of scenesForOrder(L(id).order).filter(semOSomDe(id))) {
        expect(sonsSemPonto(c.he).has(id)).toBe(false);
      }
    });
  }

  it('as frases com o som continuam no acervo para depois', () => {
    const tudo = sentencesUpTo(Number.MAX_SAFE_INTEGER).map(s => s.he);
    expect(tudo).toContain('שָׁלוֹם, מָה שְׁלוֹמְךָ');
    expect(tudo).toContain('אֲנִי רוֹצֶה קָפֶה');
  });
});
