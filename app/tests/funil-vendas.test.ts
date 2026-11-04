/* O funil do painel de vendas (03/11/2026): de quem pagou, quantos chegaram
 * a cada ponto do curso. Ver `funil` em app/admin/vendas/VendasClient.tsx. */
import { describe, expect, it } from 'vitest';
import { funil } from '@/app/admin/vendas/VendasClient';
import { course } from '@/lib/content-publico';

const mod = (n: number) => course.modules.find(m => m.n === n)!.letterIds;
const venda = (email: string, concluidas: string[], extra: Record<string, unknown> = {}) => ({
  orderId: email, curso: 'alfabetizacao', valorCentavos: 14700, metodo: 'pix', parcelas: 1, status: 'paid' as const,
  pagoEm: 1, parceria: null, nome: email, email, estudouEm: concluidas.length ? 5 : null, concluidas, ...extra
});

describe('o funil', () => {
  it('conta uma vez por pessoa, e cada etapa sobre o total', () => {
    const f = funil([
      venda('a@x', []),
      venda('b@x', [...mod(1)]),
      venda('b@x', []), // a mesma pessoa, renovou
      venda('c@x', [...mod(1), ...mod(2)], { exameFeito: true }),
      venda('d@x', [mod(1)[0]!])
    ]);
    expect(f.total).toBe(4);
    const n = Object.fromEntries(f.etapas.map(e => [e.rotulo, e.n]));
    expect(n['Começaram o curso']).toBe(3);
    expect(n['Fecharam o módulo 1']).toBe(2);
    expect(n['Fecharam o módulo 2']).toBe(1);
    expect(n['Fecharam o módulo 5']).toBe(0);
    expect(n['Fizeram o exame final']).toBe(1);
  });
});

import { ondeEsta } from '@/app/admin/vendas/VendasClient';

describe('em que módulo a pessoa está', () => {
  it('o módulo atual, os fechados e o que falta nos de letras feitas', () => {
    const concluidas = [...mod(1), ...mod(2), ...mod(3), ...mod(4)];
    const o = ondeEsta({
      concluidas, revisoes: ['cp1', 'cp2', 'cp3'],
      leituras: ['primeira-leitura-m1', 'primeira-leitura-m2', 'texto-2', 'primeira-leitura-m3', 'texto-3']
    });
    expect(o.atual).toMatchObject({ n: 5, feitas: 0 });
    expect(o.fechados).toEqual([1, 2, 3]);
    expect(o.abertos).toEqual([{ n: 4, faltam: ['a revisão', 'a Primeira Leitura', 'o texto principal'] }]);
  });
});

import { situacaoDoPedido } from '@/app/admin/vendas/VendasClient';

describe('a situação do pedido não pago', () => {
  it('"PIX vencido" só no PIX; no cartão, pagamento não concluído', () => {
    expect(situacaoDoPedido({ status: 'expired', metodo: 'pix' })).toBe('PIX vencido');
    expect(situacaoDoPedido({ status: 'expired', metodo: 'card' })).toBe('pagamento não concluído');
    expect(situacaoDoPedido({ status: 'failed', metodo: 'card' })).toBe('pagamento recusado');
  });
});
