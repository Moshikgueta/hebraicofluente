/* "Foto e palavra" na Academia (28/10/2026, pedido do dono): só palavras com
   foto que o aluno já lê, alternativas sem o mesmo sentido, e rodízio. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { availableModes, buildGym, fotosDisponiveis, getMode } from '@/lib/engine/gym';
import { alfabetoDe, consegueLer } from '@/lib/engine/palavras';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';

const letras = [...conteudoPago.letters].sort((a, b) => a.order - b.order);
const estado = (runs = 0): LearnerState => ({ ...EMPTY_STATE, gym: runs ? { fotos: { runs } } as unknown as LearnerState['gym'] : {} });
const modo = getMode('fotos')!;

describe('Foto e palavra', () => {
  it('fecha enquanto não há três palavras com foto', () => {
    const ate = (n: number) => letras.slice(0, n);
    const ver = (n: number) => availableModes(estado(), ate(n), false, '2026-10-28').find(m => m.mode.id === 'fotos')!;
    expect(ver(3).ready).toBe(false);
    expect(fotosDisponiveis(ate(6)).length).toBeGreaterThanOrEqual(3);
    expect(ver(6).ready).toBe(true);
  });

  for (const n of [6, 12, 22]) {
    it(`com ${n} letras: toda pergunta tem foto, se lê e não tem duas respostas certas`, () => {
      const ate = letras.slice(0, n);
      const alfabeto = alfabetoDe(ate);
      const { exercises } = buildGym(modo, estado(), ate, { audioAvailable: false, day: '2026-10-28', seed: 's' });
      expect(exercises.length).toBe(Math.min(modo.count, fotosDisponiveis(ate).length));
      for (const ex of exercises) {
        if (ex.kind !== 'image-to-word') throw new Error(ex.kind);
        expect(ex.image).toBeTruthy();
        expect(ex.audioId ?? null).toBeNull();
        for (const o of ex.options!) expect(consegueLer(o, alfabeto), o).toBe(true);
      }
      expect(new Set(exercises.map(e => e.id)).size).toBe(exercises.length);
    });
  }

  it('a rodada seguinte traz outras fotos', () => {
    const ate = letras;
    const a = buildGym(modo, estado(0), ate, { audioAvailable: false, day: 'd', seed: 'x' }).exercises.map(e => e.id);
    const b = buildGym(modo, estado(1), ate, { audioAvailable: false, day: 'd', seed: 'x' }).exercises.map(e => e.id);
    expect(a.filter(id => b.includes(id)).length).toBeLessThan(a.length);
  });
});
