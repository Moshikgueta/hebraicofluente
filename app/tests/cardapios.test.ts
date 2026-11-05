/* Ler cardápios (05/11/2026): lib/engine/cardapio.ts, data/cardapios.json e
 * os desenhos do quadro (components/learn/DesenhosDoCafe.tsx). */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CLIENTES_POR_RODADA, OPCOES_DE_PRECO, clientesDaRodada, opcoesDePreco, type Cardapio } from '@/lib/engine/cardapio';
import { rng } from '@/lib/engine/rng';
import { temDesenho } from '@/components/learn/DesenhosDoCafe';
import { conteudoPago } from '@/lib/content-servidor';

const DADOS = (JSON.parse(readFileSync(new URL('../../data/cardapios.json', import.meta.url), 'utf8')) as { cardapios: (Cardapio & { revisado: boolean })[] }).cardapios;

describe('cardápios', () => {
  it('saem no conteúdo pago só os revisados, sem a marca', () => {
    expect(conteudoPago.cardapios.map(c => c.id)).toEqual(DADOS.filter(c => c.revisado).map(c => c.id));
    expect(conteudoPago.cardapios.every(c => !('revisado' in c))).toBe(true);
  });

  it('todo item tem desenho, e nenhum nome se repete no mesmo quadro', () => {
    for (const c of conteudoPago.cardapios) {
      for (const it of c.itens) expect(temDesenho(it.desenho), `${c.id}: ${it.desenho}`).toBe(true);
      expect(new Set(c.itens.map(x => x.he)).size, c.id).toBe(c.itens.length);
    }
  });

  it('cada rodada do pedido tem clientes distintos', () => {
    for (const c of conteudoPago.cardapios) {
      for (let s = 0; s < 20; s++) {
        const cl = clientesDaRodada(c, rng(`${c.id}-${s}`));
        expect(cl.length).toBe(Math.min(CLIENTES_POR_RODADA, c.itens.length));
        expect(new Set(cl).size).toBe(cl.length);
      }
    }
  });

  it('as opções de preço trazem o certo, sem repetir', () => {
    for (const c of conteudoPago.cardapios) {
      c.itens.forEach((it, i) => {
        const ops = opcoesDePreco(c, i, rng(`${c.id}-${i}`));
        expect(ops).toContain(it.preco);
        expect(ops.length).toBe(OPCOES_DE_PRECO);
        expect(new Set(ops).size).toBe(ops.length);
      });
    }
  });
});
