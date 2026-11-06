/* Imagem e palavra (28/10/2026, pedido do dono: "תמונה ומילה"). */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { buildLetterPractice, buildMiniTest } from '@/lib/engine/exercises';
import type { Exercise } from '@/lib/engine/types';

const letras = conteudoPago.letters;
const historia = (ordem: number) => letras.filter(l => l.order <= ordem);

function imagens(): Extract<Exercise, { kind: 'image-to-word' }>[] {
  const out: Exercise[] = [];
  for (const L of letras) {
    const h = historia(L.order);
    for (let s = 0; s < 6; s++) {
      out.push(...buildMiniTest(L, h, { audioAvailable: false, seed: `img-${s}` }));
      out.push(...buildLetterPractice(L, h, { audioAvailable: false, seed: `img-p-${s}` }));
    }
  }
  return out.filter((e): e is Extract<Exercise, { kind: 'image-to-word' }> => e.kind === 'image-to-word');
}

describe('imagem e palavra', () => {
  const ex = imagens();

  it('aparece nos exercícios das lições', () => {
    expect(ex.length).toBeGreaterThan(10);
  });

  it('a imagem é do vocabulário e a resposta é a palavra da imagem, que a letra ensina a ler', () => {
    for (const e of ex) {
      expect(e.image.startsWith('/media/vocabulario/'), e.id).toBe(true);
      const L = letras.find(l => l.id === e.letterId)!;
      const certa = e.options[e.answer]!;
      const w = L.wordsToRead.find(x => x.he === certa);
      expect(w, `${e.id}: ${certa}`).toBeTruthy();
      expect(w!.image).toBe(e.image);
      expect(e.imageAlt.length).toBeGreaterThan(5);
    }
  });

  it('nenhuma alternativa errada tem o mesmo sentido da certa', () => {
    const sentido = new Map(letras.flatMap(l => l.wordsToRead).map(w => [w.he, w.pt]));
    for (const e of ex) {
      const certa = e.options[e.answer]!;
      for (const o of e.options) if (o !== certa) expect(sentido.get(o), `${e.id}: ${o}`).not.toBe(e.pt);
    }
  });
});
