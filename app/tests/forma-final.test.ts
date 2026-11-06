/* ם é Mem: a forma final nunca é a "errada" numa pergunta sobre a letra (27/09/2026).
 *
 * Uma aluna mandou o print: "Uma destas não é Mem. Qual?", cinco מ e um ם,
 * e o curso deu ם como a intrusa. Ela respondeu "essas letras todas são Mem"
 * - e estava certa. O `confusableWith` de cinco letras trazia a própria forma
 * final, e o alfabeto aprendido também a traz. Aqui se varre o que o aluno
 * vê em 40 rodadas de cada tela: numa pergunta sobre a letra, nenhuma opção
 * errada pode ser a mesma letra na outra forma.
 *
 * A pergunta da forma final (`final-form`) fica de fora de propósito: nela a
 * base É a opção errada, e o exercício existe para isso.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, course } from '../src/lib/content';
import { buildCheckpoint, buildLetterPractice, buildMiniTest, buildReview } from '@/lib/engine/exercises';
import type { Exercise } from '@/lib/engine/types';

const L = allLetters();
const SOBRE_A_LETRA = new Set(['letter-recognition', 'print-vs-cursive', 'odd-one-out']);

function erradasQueSaoAMesma(exs: Exercise[]): string[] {
  const out: string[] = [];
  for (const ex of exs) {
    if (!SOBRE_A_LETRA.has(ex.kind)) continue;
    const e = ex as Exercise & { options?: string[]; answer?: number };
    const dona = L.find(x => x.id === ex.letterId);
    if (!dona?.finalForm || !e.options || typeof e.answer !== 'number') continue;
    const certa = e.options[e.answer]!;
    const mesma = new Set([dona.letter, dona.finalForm]);
    if (ex.kind === 'odd-one-out') {
      /* A intrusa é a resposta: ela não pode ser a própria letra. */
      if (mesma.has(certa)) out.push(`${ex.id}: intrusa ${certa} [${e.options.join(' ')}]`);
    } else {
      for (const o of e.options) {
        if (o !== certa && mesma.has(o)) out.push(`${ex.id}: ${o} errada ao lado de ${certa} [${e.options.join(' ')}]`);
      }
    }
  }
  return out;
}

describe('a forma final é a mesma letra', () => {
  it('nos dados, nenhuma letra se declara parecida com a própria forma final', () => {
    expect(L.filter(l => l.finalForm && l.confusableWith.includes(l.finalForm)).map(l => l.id)).toEqual([]);
  });

  it('em 40 rodadas de prática, fixação, checkpoint e revisão', () => {
    const culpados: string[] = [];
    for (const letra of L) {
      const hist = L.filter(x => x.order <= letra.order);
      for (let r = 0; r < 40; r++) {
        const s = `ff${r}`;
        culpados.push(...erradasQueSaoAMesma(buildLetterPractice(letra, hist, { audioAvailable: true, seed: s })));
        culpados.push(...erradasQueSaoAMesma(buildMiniTest(letra, hist, { audioAvailable: true, seed: s })));
      }
    }
    for (const mod of course.modules) {
      if (!mod.letterIds.length || mod.upTo == null) continue;
      const own = L.filter(x => x.module === mod.n);
      const history = L.filter(x => x.order <= mod.upTo!);
      for (let r = 0; r < 40; r++) {
        culpados.push(...erradasQueSaoAMesma(buildCheckpoint(own, history, { audioAvailable: true, count: 12, seed: `c${r}` })));
        culpados.push(...erradasQueSaoAMesma(buildReview(own.map(x => x.id), history, { audioAvailable: true, count: 8, seed: `v${r}` })));
      }
    }
    expect(culpados.slice(0, 10)).toEqual([]);
    /* Milhares de blocos: uns 4,5 s, colado no prazo padrão de 5 s (o mesmo
       caso do teste de 40 rodadas em order-rule.test.ts). */
  }, 20_000);
});
