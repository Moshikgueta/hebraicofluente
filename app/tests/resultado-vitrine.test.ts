/* "O que você passa a ler" (30/10/2026): as placas da vitrine são fotos aprovadas do
   Hebraico na rua, com o crédito, e a palavra destacada está na placa. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const placas = JSON.parse(readFileSync(new URL('../../data/hebraico-na-rua.json', import.meta.url), 'utf8')).placas as
  { id: string; aprovada: boolean; palavra: string; naPlaca: string[]; autor: string; licenca: string; pagina: string }[];
const exp = readFileSync(new URL('../../tools/export-content.mjs', import.meta.url), 'utf8');
const ids = JSON.parse(exp.match(/const VITRINE_RUA = (\[[^\]]*\]);/)![1]!.replace(/'/g, '"')) as string[];

describe('as placas da vitrine', () => {
  it('são três, aprovadas, com crédito e a palavra na placa', () => {
    expect(ids).toHaveLength(3);
    for (const id of ids) {
      const p = placas.find(x => x.id === id);
      expect(p, id).toBeTruthy();
      expect(p!.aprovada, id).toBe(true);
      expect(p!.naPlaca, id).toContain(p!.palavra);
      expect(p!.autor && p!.licenca && p!.pagina, id).toBeTruthy();
    }
  });
  it('a seção mostra o crédito junto da foto e só no site em português', () => {
    const s = readFileSync(new URL('../src/components/landing/Resultado.tsx', import.meta.url), 'utf8');
    expect(s).toContain('p.licencaUrl');
    expect(s).toContain('p.pagina');
    expect(s).toMatch(/NEXT_PUBLIC_LOCALE === 'en'\) return null/);
  });
});
