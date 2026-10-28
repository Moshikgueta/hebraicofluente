/* As cenas exploráveis (28/10/2026): todo ponto cita uma palavra do curso, do
   próprio módulo, e só aparece como leitura quando as letras dela já foram
   começadas. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { clean } from '@/lib/hebrew';
import { vocabularioDoCurso } from '@/lib/engine/palavras';
import { PONTOS_DA_CENA, descobertasDaCena } from '@/lib/cena-exploravel';

const letras = conteudoPago.letters;
const vocab = vocabularioDoCurso(letras);

describe('as cenas exploráveis', () => {
  for (const [n, pontos] of Object.entries(PONTOS_DA_CENA)) {
    const modulo = Number(n);
    it(`módulo ${modulo}: toda palavra é do curso e aparece até o fim do módulo`, () => {
      const ate = letras.filter(l => l.module <= modulo);
      for (const p of pontos!) {
        const w = vocab.find(x => clean(x.he) === clean(p.he));
        expect(w, p.he).toBeDefined();
        expect(w!.he, 'mesma grafia do curso').toBe(p.he);
        const ds = descobertasDaCena(modulo, letras, ate);
        expect(ds.find(d => d.he === p.he)?.legivel, `${p.he} se lê no fim do módulo`).toBe(true);
      }
      expect(descobertasDaCena(modulo, letras, ate)).toHaveLength(pontos!.length);
    });

    it(`módulo ${modulo}: os pontos não se cobrem e ficam dentro do desenho`, () => {
      for (const p of pontos!) {
        expect(p.x).toBeGreaterThan(0); expect(p.x).toBeLessThan(320);
        expect(p.y).toBeGreaterThan(0); expect(p.y).toBeLessThan(120);
      }
      for (let i = 0; i < pontos!.length; i++) for (let j = i + 1; j < pontos!.length; j++) {
        const a = pontos![i]!, b = pontos![j]!;
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${a.he} e ${b.he}`).toBeGreaterThanOrEqual(40);
      }
    });
  }

  it('sem as letras, a palavra não vira leitura e diz qual letra falta', () => {
    const mem = letras.filter(l => l.id === 'alef' || l.id === 'mem');
    const ds = descobertasDaCena(1, letras, mem);
    const yam = ds.find(d => d.he === 'יָם')!;
    expect(yam.legivel).toBe(false);
    expect(yam.falta?.id).toBe('yod');
  });

  it('módulo sem cena não tem pontos', () => {
    expect(descobertasDaCena(7, letras, letras)).toEqual([]);
  });
});
