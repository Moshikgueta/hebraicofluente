/* Preço da parceria (02/10/2026): quem chega por /sefarad paga
   `price.parceriaBrl` quando ele é menor que o preço do dia, inclusive depois
   de o pré-lançamento acabar. Ver worker/src/lib/catalog.js e lib/parceria.ts. */
import { describe, expect, it } from 'vitest';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { priceCents, parceriaValida } from '../../worker/src/lib/catalog.js';
import { comParceria, fimDaParceria, precoDaParceria, PARCERIAS } from '@/lib/parceria';
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

/* 23/10/2026 (decisão do dono): o catálogo não tem mais preço nem data de
   parceria. Os links (/sefarad, /bio, /stories, /dm) seguem valendo para
   registrar de onde veio a compra (orders.parceria), e cobram o preço do dia. */
describe('o catálogo real não tem preço de parceria', () => {
  it('quem vem por um link paga o preço do dia, e o pedido guarda o nome', () => {
    const texto = readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8');
    expect(texto).not.toMatch(/"parceriaBrl"|"parceriaAte"/);
    const curso = getCourse(FLAGSHIP)!;
    for (const nome of ['sefarad', 'bio', 'stories', 'dm']) {
      expect(parceriaValida(nome)).toBe(true);
      expect(priceCents(curso, 'card', nome)).toBe(priceCents(curso, 'card'));
      expect(precoDaParceria(curso, nome)).toBeNull();
    }
    expect(fimDaParceria(curso)).toBeNull();
  });
});

describe('a tela mostra o mesmo preço que o servidor cobra', () => {
  const curso = getCourse(FLAGSHIP)!;
  const virado: CatalogCourse = { ...curso, price: { ...curso.price, brl: 297, listBrl: null, preLancamentoAte: null, parceriaBrl: 147 } };
  it('só com parceria válida e preço menor', () => {
    expect(PARCERIAS.sefarad?.perfil).toBe('@adsefarditas');
    expect(precoDaParceria(virado, 'sefarad')).toBe(147);
    expect(precoDaParceria(virado, null)).toBeNull();
    expect(precoDaParceria(virado, 'outra')).toBeNull();
    expect(comParceria(virado, 'sefarad').price.brl).toBe(147);
    expect(comParceria(virado, null)).toBe(virado);
    /* Sem preço de parceria no catálogo (23/10/2026), a faixa do link não aparece. */
    expect(precoDaParceria(curso, 'sefarad')).toBeNull();
    expect(precoDaParceria(curso, null)).toBeNull();
  });
});

/* 04/10/2026: o preço dos links vale até `parceriaAte` (30/11, fim do dia em
   Brasília), e os links do Instagram são parcerias com o mesmo preço. */
describe('o preço dos links tem data para acabar', () => {
  const ate = { price: { ...depois.price, parceriaAte: '2026-11-30' } };
  const ultimoSegundo = Date.parse('2026-11-30T23:59:59-03:00');
  it('vale até o fim de 30/11 em Brasília, e não depois', () => {
    expect(priceCents(ate, 'card', 'sefarad', ultimoSegundo)).toBe(14700);
    expect(priceCents(ate, 'card', 'sefarad', ultimoSegundo + 1000)).toBe(29700);
  });
  it('os links do Instagram valem igual, e a tela segue a mesma data', () => {
    for (const nome of ['bio', 'stories', 'dm']) {
      expect(parceriaValida(nome)).toBe(true);
      expect(priceCents(ate, 'card', nome, ultimoSegundo)).toBe(14700);
    }
    const curso = getCourse(FLAGSHIP)!;
    const virado: CatalogCourse = { ...curso, price: { ...curso.price, brl: 297, listBrl: null, preLancamentoAte: null, parceriaBrl: 147, parceriaAte: '2026-11-30' } };
    expect(precoDaParceria(virado, 'bio', ultimoSegundo)).toBe(147);
    expect(precoDaParceria(virado, 'bio', ultimoSegundo + 1000)).toBeNull();
    expect(fimDaParceria(virado)).toBe('30/11');
  });
});
