import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - script JS, sem tipos
import { virar } from '../../tools/virar-preco.mjs';

/* A virada do pré-lançamento para o preço oficial (decisão do dono em
   23/10/2026: SÓ À MÃO, sem data). tools/virar-preco.mjs roda no workflow
   manual virar-preco.yml, que exige escrever "virar". */

const CATALOGO = `{
  "courses": [
    {
      "slug": "alfabetizacao",
      "price": { "brl": 147, "listBrl": 197, "installments": 12, "pixDiscountPct": 10 },
      "accessMonths": 12
    },
    {
      "slug": "hebraico-a1",
      "status": "soon",
      "price": { "brl": 297, "listBrl": 397, "installments": 12, "pixDiscountPct": 10 }
    },
    {
      "slug": "alfabetizacao-e-israel",
      "price": { "brl": 297, "listBrl": 397, "installments": 12, "pixDiscountPct": 10 }
    }
  ]
}`;

describe('tools/virar-preco.mjs', () => {
  it('vira os vendáveis: o preço vira o oficial e o oficial sai', () => {
    const r = virar(CATALOGO);
    expect(r.virados).toEqual([
      { slug: 'alfabetizacao', de: 147, para: 197 },
      { slug: 'alfabetizacao-e-israel', de: 297, para: 397 }
    ]);
    expect(r.texto).toContain('"price": { "brl": 197, "listBrl": null, "installments": 12, "pixDiscountPct": 10 }');
  });

  it('curso que ainda não abriu (status soon) não é tocado', () => {
    const r = virar(CATALOGO);
    expect(r.texto).toContain('"price": { "brl": 297, "listBrl": 397, "installments": 12, "pixDiscountPct": 10 }');
    expect(JSON.parse(r.texto).courses[1].price.brl).toBe(297);
  });

  it('com `so`, só os produtos listados', () => {
    const r = virar(CATALOGO, { so: ['alfabetizacao-e-israel'] });
    expect(r.virados.map((v: { slug: string }) => v.slug)).toEqual(['alfabetizacao-e-israel']);
    expect(JSON.parse(r.texto).courses[0].price.brl).toBe(147);
  });

  it('rodar duas vezes não faz nada na segunda', () => {
    const uma = virar(CATALOGO).texto;
    const duas = virar(uma);
    expect(duas.virados).toEqual([]);
    expect(duas.texto).toBe(uma);
  });

  it('o data/courses.json de verdade vira e continua JSON válido, com os preços oficiais do dono', () => {
    const real = readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8');
    const r = virar(real);
    const preco = (slug: string) => JSON.parse(r.texto).courses.find((x: { slug: string }) => x.slug === slug).price;
    expect(preco('alfabetizacao')).toMatchObject({ brl: 197, listBrl: null });
    expect(preco('israel-alem-do-roteiro')).toMatchObject({ brl: 297, listBrl: null });
    expect(preco('alfabetizacao-e-israel')).toMatchObject({ brl: 397, listBrl: null });
  });

  it('nada vira sozinho: a Action não tem agendamento e exige a palavra "virar"', () => {
    const yml = readFileSync(new URL('../../.github/workflows/virar-preco.yml', import.meta.url), 'utf8');
    const semComentarios = yml.replace(/^\s*#.*$/gm, '');
    expect(semComentarios).not.toMatch(/schedule:|cron:/);
    expect(semComentarios).toMatch(/workflow_dispatch:/);
    expect(semComentarios).toMatch(/"\$CONFIRMAR" != "virar"/);
    /* O catálogo não tem mais data de fim de pré-lançamento nem de parceria. */
    const real = readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8');
    expect(real).not.toMatch(/"preLancamentoAte"|"parceriaAte"/);
  });
});
