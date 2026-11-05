/* Ler cardápios (05/11/2026): lib/engine/cardapio.ts e data/cardapios.json. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { perguntasDoCardapio, precoEm, PERGUNTAS_DE_CADA_TIPO, type Cardapio } from '@/lib/engine/cardapio';
import { stripNikud } from '@/lib/hebrew';
import { conteudoPago } from '@/lib/content-servidor';

const DADOS = (JSON.parse(readFileSync(new URL('../../data/cardapios.json', import.meta.url), 'utf8')) as { cardapios: (Cardapio & { revisado: boolean })[] }).cardapios;
const heDe = (s: string) => [...s.matchAll(/\{\{(.+?)\}\}/g)].map(m => m[1]!);

describe('cardápios', () => {
  it('saem no conteúdo pago só os revisados, sem a marca', () => {
    expect(conteudoPago.cardapios.map(c => c.id)).toEqual(DADOS.filter(c => c.revisado).map(c => c.id));
    expect(conteudoPago.cardapios.every(c => !('revisado' in c))).toBe(true);
  });

  it('cada cardápio tem as duas perguntas de cada tipo, com a resposta certa', () => {
    for (const c of conteudoPago.cardapios) {
      const ps = perguntasDoCardapio(c);
      expect(ps.length, c.id).toBe(PERGUNTAS_DE_CADA_TIPO * 2);
      expect(new Set(ps.map(p => p.q)).size).toBe(ps.length);
      for (const p of ps) {
        if (p.t !== 'escolha') throw new Error('só escolha');
        expect(new Set(p.opcoes).size).toBe(p.opcoes.length);
        const [he] = heDe(p.q);
        if (he) {
          const it = c.itens.find(x => stripNikud(x.he) === he)!;
          expect(p.opcoes[p.certa]).toBe(it.pt);
        } else {
          const it = c.itens.find(x => p.q.includes(x.pt))!;
          expect(p.opcoes[p.certa]).toBe(precoEm(it.preco));
        }
      }
    }
  });

  it('o nome na pergunta vem sem nikud, como no cardápio', () => {
    for (const c of conteudoPago.cardapios) {
      for (const p of perguntasDoCardapio(c)) for (const he of heDe(p.q)) expect(he).toBe(stripNikud(he));
    }
  });
});
