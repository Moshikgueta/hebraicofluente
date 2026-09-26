/* Refazer um exercício traz perguntas novas (26/09/2026).
 *
 * Pedido do dono do curso: "na segunda vez que o usuário faz um exercício da
 * mesma categoria, questões diferentes, e que não repita as mesmas". O que se
 * prova aqui:
 *
 *   · enquanto a rodada não é concluída, ela não muda (a tela pode recalcular);
 *   · concluída, a próxima evita o que já apareceu - nas telas de verdade;
 *   · quando o conteúdo acaba, repete primeiro o que apareceu há mais tempo;
 *   · a "impressão" de uma pergunta ignora o id e a ordem das alternativas.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { allLetters } from '../src/lib/content';
import { buildCheckpoint, buildMiniTest, buildReview } from '@/lib/engine/exercises';
import { escolherRodada, impressao, melhorRodada, registrarRodada } from '@/lib/rodadas';
import type { Exercise } from '@/lib/engine/types';

const mem = new Map<string, string>();
beforeEach(() => {
  mem.clear();
  (globalThis as { window?: unknown }).window = {
    localStorage: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); } }
  };
});

const L = allLetters();
const repetidas = (a: Exercise[], b: Exercise[]) => {
  const vistas = new Set(a.map(impressao));
  return b.map(impressao).filter(x => vistas.has(x)).length;
};

describe('a impressão de uma pergunta', () => {
  const base = {
    id: 'x', kind: 'word-meaning', letterId: 'mem', skill: 'ler', promptPt: 'O que quer dizer?',
    he: 'מַיִם', options: ['água', 'mar', 'mãe'], answer: 0, explainPt: ''
  } as unknown as Exercise;

  it('não muda com o id nem com a ordem das alternativas', () => {
    const outra = { ...base, id: 'y', options: ['mãe', 'água', 'mar'], answer: 1 } as unknown as Exercise;
    expect(impressao(outra)).toBe(impressao(base));
  });

  it('muda quando a palavra na tela ou a resposta muda', () => {
    expect(impressao({ ...base, he: 'יָם', options: ['mar', 'água'], answer: 0 } as unknown as Exercise))
      .not.toBe(impressao(base));
  });
});

describe('a rodada', () => {
  const cp = (s: string) => buildCheckpoint(L.filter(x => x.module === 2), L.filter(x => x.module <= 2),
    { audioAvailable: false, count: 12, seed: s });

  it('sem nada concluído, é sempre a mesma: a tela pode recalcular sem trocar as perguntas', () => {
    const a = escolherRodada('checkpoint-2', cp).itens;
    const b = escolherRodada('checkpoint-2', cp).itens;
    expect(b.map(e => e.id)).toEqual(a.map(e => e.id));
  });

  it('concluída, a seguinte do checkpoint não repete nenhuma pergunta', () => {
    const r1 = escolherRodada('checkpoint-2', cp).itens;
    registrarRodada('checkpoint-2', r1);
    const r2 = escolherRodada('checkpoint-2', cp).itens;
    expect(r2).toHaveLength(r1.length);
    expect(repetidas(r1, r2)).toBe(0);
  });

  it('a revisão e o mini-teste também trocam a maior parte', () => {
    const rev = (s: string) => buildReview(['bet', 'kaf'], L, { audioAvailable: false, count: 5, seed: s });
    const r1 = escolherRodada('revisao', rev).itens;
    registrarRodada('revisao', r1);
    expect(repetidas(r1, escolherRodada('revisao', rev).itens)).toBeLessThanOrEqual(1);

    const bet = L.find(x => x.id === 'bet')!;
    const mini = (s: string) => buildMiniTest(bet, L.filter(x => x.order <= bet.order), { audioAvailable: false, seed: s });
    const m1 = escolherRodada('licao-fixacao-bet', mini).itens;
    registrarRodada('licao-fixacao-bet', m1);
    expect(repetidas(m1, escolherRodada('licao-fixacao-bet', mini).itens)).toBeLessThanOrEqual(3);
  });

  it('os ids continuam únicos na rodada montada de vários sorteios', () => {
    const r1 = escolherRodada('checkpoint-2', cp).itens;
    registrarRodada('checkpoint-2', r1);
    const r2 = escolherRodada('checkpoint-2', cp).itens;
    expect(new Set(r2.map(e => e.id)).size).toBe(r2.length);
  });
});

describe('quando o conteúdo acaba', () => {
  /* Um gerador de brinquedo: 3 lugares, e cada lugar só tem duas perguntas
     possíveis (A/B, C/D, E/F), sorteadas pela semente. */
  const gerar = (seed: string) => {
    let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
    return [['A', 'B'], ['C', 'D'], ['E', 'F']].map((par, i) => par[(h >> i) & 1]!);
  };
  const imp = (x: string) => x;

  it('troca tudo o que dá, e repete primeiro o que apareceu há mais tempo', () => {
    const r1 = melhorRodada(gerar, 't', 0, [], imp).itens;
    const r2 = melhorRodada(gerar, 't', 1, r1, imp).itens;
    expect(r2.filter(x => r1.includes(x))).toEqual([]);          // a 2ª é toda nova
    const vistas = [...r2, ...r1];                                   // r2 é a mais recente
    const r3 = melhorRodada(gerar, 't', 2, vistas, imp).itens;
    expect(r3).toEqual(r1);                                          // repete a mais antiga
  });
});

describe('sem armazenamento', () => {
  it('funciona igual, só sem memória', () => {
    delete (globalThis as { window?: unknown }).window;
    const g = (s: string) => [s];
    expect(escolherRodada('x', g, imp => imp).itens).toEqual(['x-r0-0']);
    expect(() => registrarRodada('x', ['a'], i => i)).not.toThrow();
  });
});
