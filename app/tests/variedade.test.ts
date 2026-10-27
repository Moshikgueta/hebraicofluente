/* Exercícios variados (27/10/2026, pedido do dono): nenhum tipo passa de
 * dois num teste de vinte, digitar é um só, e a abertura muda de lição
 * para lição. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { buildMiniTest } from '@/lib/engine/exercises';

const L = [...conteudoPago.letters].sort((a, b) => a.order - b.order);
const teste = (i: number, t = 0, audio = true) =>
  buildMiniTest(L[i]!, L.filter(l => l.order <= L[i]!.order), { seed: `mini-${L[i]!.id}-${t}`, audioAvailable: audio });

describe('a variedade dos exercícios da lição', () => {
  it('a partir da terceira letra, nenhum tipo aparece mais de duas vezes', () => {
    const fora: string[] = [];
    for (let i = 2; i < L.length; i++) for (const audio of [true, false]) for (const t of [0, 1, 2]) {
      const c = new Map<string, number>();
      for (const e of teste(i, t, audio)) c.set(e.kind, (c.get(e.kind) ?? 0) + 1);
      for (const [k, n] of c) if (n > (k === 'type-answer' ? 1 : 2)) fora.push(`${L[i]!.id} ${k} ${n}`);
    }
    expect(fora).toEqual([]);
  });

  it('as lições não abrem todas com o mesmo exercício', () => {
    const primeiros = new Set(L.map((_, i) => teste(i)[0]!.kind));
    expect(primeiros.size).toBeGreaterThanOrEqual(4);
  });
});
