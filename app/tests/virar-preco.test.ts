import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - script JS, sem tipos
import { virar, fimDoDia } from '../../tools/virar-preco.mjs';

/* A virada do pré-lançamento (decisão do dono em 01/10/2026: o preço sobe
   de verdade em 01/11). tools/virar-preco.mjs roda no workflow agendado. */

const LINHA = '      "price": { "brl": 147, "listBrl": 297, "installments": 12, "pixDiscountPct": 10, "preLancamentoAte": "2026-10-31" },';
const SEM_DATA = '      "price": { "brl": 297, "listBrl": 397, "installments": 12, "pixDiscountPct": 10 },';
const texto = `{\n${LINHA}\n${SEM_DATA}\n}`;

describe('tools/virar-preco.mjs', () => {
  it('o pré-lançamento termina no fim do dia 31/10 em Brasília', () => {
    expect(new Date(fimDoDia('2026-10-31')).toISOString()).toBe('2026-11-01T02:59:59.999Z');
  });

  it('antes do fim, não mexe em nada', () => {
    const r = virar(texto, Date.parse('2026-11-01T02:59:00Z'));
    expect(r.virados).toEqual([]);
    expect(r.texto).toBe(texto);
  });

  it('depois do fim, o preço vira o cheio e a data e a âncora saem', () => {
    const r = virar(texto, Date.parse('2026-11-01T03:05:00Z'));
    expect(r.virados).toEqual([{ de: 147, para: 297, fim: '2026-10-31' }]);
    expect(r.texto).toContain('"price": { "brl": 297, "listBrl": null, "installments": 12, "pixDiscountPct": 10 }');
    expect(r.texto).not.toContain('preLancamentoAte');
    /* Curso sem data não é tocado. */
    expect(r.texto).toContain(SEM_DATA);
  });

  it('rodar duas vezes não faz nada na segunda', () => {
    const uma = virar(texto, Date.parse('2026-11-01T03:05:00Z')).texto;
    const duas = virar(uma, Date.parse('2026-11-02T00:00:00Z'));
    expect(duas.virados).toEqual([]);
    expect(duas.texto).toBe(uma);
  });

  it('o data/courses.json de verdade vira e continua JSON válido', () => {
    const real = readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8');
    const r = virar(real, Date.parse('2099-01-01T00:00:00Z'));
    const c = JSON.parse(r.texto).courses.find((x: { slug: string }) => x.slug === 'alfabetizacao');
    if (/preLancamentoAte/.test(real)) {
      expect(c.price.brl).toBe(297);
      expect(c.price.listBrl).toBeNull();
    } else {
      expect(r.virados).toEqual([]);
    }
  });
});
