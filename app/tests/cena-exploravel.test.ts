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
const extras = conteudoPago.extras;
const ambos = [6, 7];

describe('as cenas exploráveis', () => {
  for (const [n, pontos] of Object.entries(PONTOS_DA_CENA)) {
    const modulo = Number(n);
    it(`módulo ${modulo}: toda palavra é do curso e aparece até o fim do módulo`, () => {
      const ate = letras.filter(l => l.module <= modulo);
      const ds = descobertasDaCena(modulo, letras, ate, extras, ambos.filter(n => n <= modulo));
      for (const p of pontos!) {
        if (p.fonte === 'sem-pontos') {
          expect(extras.unpointed.groups.flatMap(g => g.words).some(w => w.bare === p.he), p.he).toBe(true);
        } else if (p.fonte === 'gueresh') {
          expect(extras.gerech.letters.flatMap(l => l.words).some(w => w.he === p.he), p.he).toBe(true);
        } else {
          const w = vocab.find(x => clean(x.he) === clean(p.he));
          expect(w, p.he).toBeDefined();
          expect(w!.he, 'mesma grafia do curso').toBe(p.he);
          /* E já se lê no fim do PRÓPRIO módulo (6 e 7 não têm letra nova). */
          expect(w!.desde, `${p.he} é de antes do fim do módulo`).toBeLessThanOrEqual(Math.max(...ate.map(l => l.order)));
        }
        expect(ds.find(d => d.he === p.he)?.legivel, `${p.he} se lê no fim do módulo`).toBe(true);
      }
      expect(ds).toHaveLength(pontos!.length);
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

  it('as palavras sem pontos e as do guéresh esperam o próprio módulo', () => {
    const seis = descobertasDaCena(6, letras, letras, extras, []);
    expect(seis.every(d => !d.legivel && d.faltaModulo === 6)).toBe(true);
    expect(descobertasDaCena(6, letras, letras, extras, [6]).every(d => d.legivel && d.palavra.comPontos)).toBe(true);
    const pij = descobertasDaCena(7, letras, letras, extras, [6]).find(d => d.fonte === 'gueresh')!;
    expect(pij.faltaModulo).toBe(7);
    expect(pij.palavra.translit).toBeNull();
  });

  it('todo módulo tem cena', () => {
    for (const m of [1, 2, 3, 4, 5, 6, 7]) expect(descobertasDaCena(m, letras, letras, extras, ambos).length, `módulo ${m}`).toBeGreaterThanOrEqual(3);
  });
});
