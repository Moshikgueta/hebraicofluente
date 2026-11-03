/* Os dois gestos novos (03/11/2026, pedido do dono): a caça à letra dentro
 * da lição e a sílaba montada de ouvido. */
import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { buildMiniTest } from '../src/lib/engine/exercises';
import { exBuildSyllableOuvido, exLetterHunt } from '../src/lib/engine/generators';
import { rng } from '../src/lib/engine/rng';
import { contextFor } from '../src/lib/engine/exercises';
import { temClipe } from '../src/lib/audio-registro';

const letters = allLetters();
const hist = (order: number) => letters.filter(x => x.order <= order);

describe('a caça à letra', () => {
  it('doze células, a letra três ou quatro vezes, e pelo menos duas outras formas', () => {
    for (const L of letters) {
      const ex = exLetterHunt(L, contextFor(L, hist(L.order)), rng(`t-${L.id}`), 0);
      if (!ex) continue;
      if (ex.kind !== 'letter-hunt') throw new Error('tipo errado');
      expect(ex.grade, L.id).toHaveLength(12);
      const certas = ex.grade.filter(g => g === L.letter).length;
      expect(certas, L.id).toBeGreaterThanOrEqual(3);
      expect(certas, L.id).toBeLessThanOrEqual(4);
      expect(new Set(ex.grade.filter(g => g !== L.letter)).size, L.id).toBeGreaterThanOrEqual(2);
      /* nenhuma letra antes da hora */
      const ensinadas = new Set(hist(L.order).map(x => x.letter));
      for (const g of ex.grade) expect(ensinadas.has(g), `${L.id}: ${g}`).toBe(true);
    }
  });

  it('aparece nas fixações, no máximo uma vez por fixação', () => {
    let com = 0;
    for (const L of letters) {
      for (const s of ['a', 'b', 'c']) {
        const itens = buildMiniTest(L, hist(L.order), { seed: `t-${L.id}-${s}` });
        const n = itens.filter(e => e.kind === 'letter-hunt').length;
        expect(n, L.id).toBeLessThanOrEqual(1);
        if (n) com++;
      }
    }
    expect(com).toBeGreaterThan(5);
  });
});

describe('a sílaba de ouvido', () => {
  it('só sai com a gravação da sílaba, e o enunciado não entrega a leitura', () => {
    let com = 0;
    for (const L of letters) {
      for (let i = 0; i < 6; i++) {
        const ex = exBuildSyllableOuvido(L, contextFor(L, hist(L.order)), rng(`o-${L.id}-${i}`), i);
        if (!ex) continue;
        if (ex.kind !== 'build-syllable') throw new Error('tipo errado');
        com++;
        expect(ex.ouvir).toBe(true);
        expect(temClipe(ex.audioId), ex.id).toBe(true);
        expect(ex.promptPt, ex.id).toBe('Ouça a sílaba e escolha o sinal que faz esse som.');
      }
    }
    expect(com).toBeGreaterThan(0);
  });
});
