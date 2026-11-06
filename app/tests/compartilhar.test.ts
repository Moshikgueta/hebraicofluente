/* Compartilhar conquista (lib/compartilhar.ts, 05/10/2026).
 *
 *   · toda frase é de uma conquista que existe (ou de um módulo do curso);
 *   · todo módulo com checkpoint tem frase;
 *   · nenhuma frase promete o que o marco não mede.
 */
import { describe, expect, it } from 'vitest';
import { FRASES, conquistaDoModulo, podeCompartilhar } from '@/lib/compartilhar';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { course } from '@/lib/content-publico';

describe('as frases das conquistas', () => {
  it('cada frase é de uma conquista real ou de um módulo', () => {
    const ids = new Set(ACHIEVEMENTS.map(a => a.id));
    for (const id of Object.keys(FRASES)) {
      expect(ids.has(id) || /^modulo-[1-5]$/.test(id), id).toBe(true);
    }
  });

  it('todo checkpoint aprovado tem o que compartilhar', () => {
    for (const m of course.modules.filter(m => m.checkpoint)) {
      expect(podeCompartilhar(conquistaDoModulo(m.n)), `módulo ${m.n}`).toBe(true);
    }
  });

  it('as frases das palavras batem com o número da conquista', () => {
    for (const n of [10, 25, 50, 100]) expect(FRASES[`le-${n}`]).toContain(`${n} palavras`);
    expect(FRASES['vinte-e-duas']).toContain('22 letras');
  });
});
