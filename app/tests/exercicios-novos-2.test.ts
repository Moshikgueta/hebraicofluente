/* A letra trocada e o ouvir-e-conferir (04/11/2026, pedido do dono). */
import { describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { buildLessonQuiz, buildMiniTest, contextFor } from '../src/lib/engine/exercises';
import { exFixLetter, exListenSame } from '../src/lib/engine/generators';
import { rng } from '../src/lib/engine/rng';
import { clusters, isReadableWith } from '../src/lib/hebrew';
import { temClipe } from '../src/lib/audio-registro';

const letters = allLetters();
const hist = (order: number) => letters.filter(x => x.order <= order);

describe('a letra trocada', () => {
  it('troca uma letra só, por uma já ensinada, nunca a última, e a resposta é ela', () => {
    let feitos = 0;
    for (const L of letters) {
      for (let i = 0; i < 4; i++) {
        const ex = exFixLetter(L, contextFor(L, hist(L.order)), rng(`t-${L.id}-${i}`), i);
        if (!ex) continue;
        if (ex.kind !== 'fix-letter') throw new Error('tipo');
        feitos++;
        const certa = clusters(ex.certa);
        expect(ex.options).toHaveLength(certa.length);
        const diferentes = ex.options.map((o, k) => (o !== certa[k] ? k : -1)).filter(k => k >= 0);
        expect(diferentes, ex.id).toEqual([ex.answer]);
        expect(ex.answer, ex.id).toBeLessThan(certa.length - 1);
        expect(new Set(ex.options).size, ex.id).toBe(ex.options.length);
        const alfabeto = hist(L.order).map(x => x.letter);
        expect(isReadableWith(ex.he, alfabeto), `${ex.id}: ${ex.he}`).toBe(true);
        /* nada de daguesh nem ponto de shin/sin na letra trocada */
        expect(ex.options[ex.answer]!, ex.id).not.toMatch(/[ּׁׂ]/);
      }
    }
    expect(feitos).toBeGreaterThan(20);
  });

  it('aparece nas fixações, no máximo uma vez', () => {
    let com = 0;
    for (const L of letters) for (const s of ['a', 'b']) {
      const n = buildMiniTest(L, hist(L.order), { seed: `f-${L.id}-${s}` }).filter(e => e.kind === 'fix-letter').length;
      expect(n, L.id).toBeLessThanOrEqual(1);
      if (n) com++;
    }
    expect(com).toBeGreaterThan(3);
  });
});

describe('ouvir e conferir', () => {
  it('só com gravação, e a resposta bate com a gravação escolhida', () => {
    let feitos = 0;
    for (const L of letters) for (let i = 0; i < 6; i++) {
      const ex = exListenSame(L, contextFor(L, hist(L.order)), rng(`o-${L.id}-${i}`), i);
      if (!ex) continue;
      if (ex.kind !== 'listen-same') throw new Error('tipo');
      feitos++;
      expect(temClipe(ex.audioId), ex.id).toBe(true);
      const escrita = L.syllables.find(s => s.he === ex.he)!;
      expect(ex.igual, ex.id).toBe(escrita.audioId === ex.audioId);
    }
    expect(feitos).toBeGreaterThan(0);
  });

  it('nunca vale nota: fica fora da fixação, mesmo com áudio', () => {
    for (const L of letters) {
      const itens = buildMiniTest(L, hist(L.order), { seed: `m-${L.id}`, audioAvailable: true });
      expect(itens.some(e => e.kind === 'listen-same'), L.id).toBe(false);
    }
  });

  it('entra na prática', () => {
    const algum = letters.some(L => buildLessonQuiz(L, hist(L.order), { audioAvailable: true, count: 20, seed: `p-${L.id}` })
      .some(e => e.kind === 'listen-same'));
    expect(algum).toBe(true);
  });
});
