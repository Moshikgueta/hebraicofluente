/* Preço da parceria (02/10/2026): quem chega por /sefarad paga
   `price.parceriaBrl` quando ele é menor que o preço do dia, inclusive depois
   de o pré-lançamento acabar. Ver worker/src/lib/catalog.js e lib/parceria.ts. */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { priceCents, parceriaValida } from '../../worker/src/lib/catalog.js';
// @ts-expect-error - script JS, sem tipos
import { virar } from '../../tools/virar-preco.mjs';
import { comParceria, precoDaParceria, PARCERIAS } from '@/lib/parceria';
import { getCourse, FLAGSHIP, type CatalogCourse } from '@/lib/catalog';
import { readFileSync } from 'node:fs';

const depois = { price: { brl: 297, listBrl: null, installments: 12, pixDiscountPct: 10, parceriaBrl: 147 } };
const antes = { price: { brl: 147, listBrl: 297, installments: 12, pixDiscountPct: 10, parceriaBrl: 147 } };

describe('o servidor cobra o preço da parceria', () => {
  it('depois da virada, quem vem da parceria paga R$ 147', () => {
    expect(priceCents(depois, 'card', 'sefarad')).toBe(14700);
    expect(priceCents(depois, 'pix', 'sefarad')).toBe(13230);
    expect(priceCents(depois, 'card')).toBe(29700);
  });
  it('nome fora da lista não muda nada', () => {
    expect(parceriaValida('outra')).toBe(false);
    expect(parceriaValida({})).toBe(false);
    expect(priceCents(depois, 'card', 'outra')).toBe(29700);
  });
  it('a parceria nunca encarece: se o preço do dia for menor, vale ele', () => {
    expect(priceCents({ price: { ...depois.price, brl: 100 } }, 'card', 'sefarad')).toBe(10000);
    expect(priceCents(antes, 'card', 'sefarad')).toBe(14700);
  });
});

describe('a virada de 01/11 mantém o preço da parceria', () => {
  it('o catálogo real tem o preço da parceria, e ele sobrevive à virada', () => {
    const texto = readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8');
    const r = virar(texto, Date.parse('2026-11-01T03:05:00Z'));
    const cursos = JSON.parse(r.texto).courses ?? JSON.parse(r.texto);
    const alf = (Array.isArray(cursos) ? cursos : Object.values(cursos)).find((c: { slug: string }) => c.slug === 'alfabetizacao');
    expect(alf.price).toMatchObject({ brl: 297, listBrl: null, parceriaBrl: 147 });
  });
});

describe('a tela mostra o mesmo preço que o servidor cobra', () => {
  const curso = getCourse(FLAGSHIP)!;
  const virado: CatalogCourse = { ...curso, price: { ...curso.price, brl: 297, listBrl: null, preLancamentoAte: null } };
  it('só com parceria válida e preço menor', () => {
    expect(PARCERIAS.sefarad?.perfil).toBe('@adsesefarsitas');
    expect(precoDaParceria(virado, 'sefarad')).toBe(147);
    expect(precoDaParceria(virado, null)).toBeNull();
    expect(precoDaParceria(virado, 'outra')).toBeNull();
    expect(comParceria(virado, 'sefarad').price.brl).toBe(147);
    expect(comParceria(virado, null)).toBe(virado);
    /* Hoje (pré-lançamento) os dois são iguais: nada muda na tela. */
    expect(precoDaParceria(curso, 'sefarad')).toBeNull();
  });
});
