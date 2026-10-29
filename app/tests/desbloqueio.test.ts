/* O lugar novo no mapa (28/10/2026): só anima quando o módulo atual passou
   do último visto NESTE aparelho. */
import { describe, expect, it } from 'vitest';
import { moduloParaAnunciar } from '@/lib/desbloqueio';

describe('o desbloqueio no mapa', () => {
  it('anima o módulo que passou do último visto', () => {
    expect(moduloParaAnunciar(3, 2)).toBe(3);
    expect(moduloParaAnunciar(4, 1)).toBe(4);
    expect(moduloParaAnunciar(1, 0), 'o módulo 1, depois da Aula 0').toBe(1);
  });
  it('não anima o mesmo módulo, nem para trás', () => {
    expect(moduloParaAnunciar(3, 3)).toBeNull();
    expect(moduloParaAnunciar(2, 5)).toBeNull();
  });
  it('sem lembrança no aparelho ou sem módulo atual, só anota', () => {
    expect(moduloParaAnunciar(4, null)).toBeNull();
    expect(moduloParaAnunciar(null, 2)).toBeNull();
  });
});
