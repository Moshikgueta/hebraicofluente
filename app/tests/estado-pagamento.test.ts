/* O que as telas de pagamento dizem, decidido sem navegador.
 * ─────────────────────────────────────────────────────────────────────────
 * Auditoria de 01/10/2026 (PAY-B-003, PAY-B-002, PAY-B-004, PAY-B-014). As
 * decisões das telas moram em funções puras ao lado delas, e é aqui que se
 * prova cada estado:
 *
 *   · a volta da Mercado Pago (`obrigado/fase.ts`): estornado diz
 *     "devolvido", recusado sai do "Confirmando..." na hora, sem pagamento
 *     nenhum não fala em análise nem em boleto, em análise só quando há
 *     pagamento esperando;
 *   · o checkout (`retomada.ts`): quando procurar o PIX já gerado;
 *   · o /perfil (`perfil/compras.ts`): o vencido com a data, o "Ver código
 *     PIX" só dentro do prazo;
 *   · a virada do pré-lançamento: depois de editar o catálogo, a tela e o
 *     servidor cobram o mesmo, e a data some junto com o preço cheio.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decidirFase, DESISTE_MS, ESPERA_MS, FINAL } from '@/app/checkout/[slug]/obrigado/fase';
import { deveRetomarPix } from '@/app/checkout/[slug]/retomada';
import { dataCurta, fraseDeVencido, pixAindaPagavel, vencidoDe } from '@/app/perfil/compras';
import type { Order } from '@/lib/account/types';
import { ancora, cents, fimDoPreLancamento, pixPrice, type CatalogCourse } from '@/lib/catalog';
import { estadoDoPreLancamento } from '@/lib/pre-lancamento';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { priceCents } from '../../worker/src/lib/catalog.js';

describe('a tela de retorno (PAY-B-003)', () => {
  const base = { passouMs: 1_000, metodo: 'card' as const };

  it('pago é pago, qualquer que seja a dica da URL', () => {
    expect(decidirFase({ ...base, status: 'paid', dica: 'rejected' })).toBe('pago');
  });

  it('estornado diz que foi devolvido, e não "nada foi cobrado"', () => {
    expect(decidirFase({ ...base, status: 'refunded' })).toBe('devolvido');
    expect(decidirFase({ ...base, status: 'refunded', dica: 'approved' })).toBe('devolvido');
  });

  it('recusado sai do "Confirmando" já na primeira resposta', () => {
    expect(decidirFase({ ...base, status: 'failed', ultimoPagamento: 'recusado' })).toBe('recusado');
    expect(decidirFase({ ...base, status: 'pending', ultimoPagamento: 'recusado' })).toBe('recusado');
    expect(FINAL.has('recusado')).toBe(true);
  });

  it('em análise só quando o servidor sabe de um pagamento esperando', () => {
    expect(decidirFase({ ...base, status: 'pending', ultimoPagamento: 'em-analise' })).toBe('em-analise');
    expect(decidirFase({ ...base, status: 'pending', ultimoPagamento: 'aguardando' })).toBe('em-analise');
    /* O expirado que estava em análise continua em análise (PAY-B-009). */
    expect(decidirFase({ ...base, status: 'expired', ultimoPagamento: 'em-analise' })).toBe('em-analise');
    expect(FINAL.has('em-analise'), 'em análise precisa continuar perguntando').toBe(false);
  });

  it('sem pagamento nenhum: espera um pouco, e depois diz que não há pagamento', () => {
    expect(decidirFase({ ...base, status: 'pending', ultimoPagamento: null })).toBe('conferindo');
    expect(decidirFase({ ...base, status: 'pending', passouMs: ESPERA_MS + 1 })).toBe('sem-pagamento');
    /* Saiu da Mercado Pago sem pagar: a volta traz `null`, e a tela diz na hora. */
    expect(decidirFase({ ...base, status: 'pending', dica: 'null' })).toBe('sem-pagamento');
  });

  it('a volta diz "aprovado": espera a confirmação pelo prazo inteiro', () => {
    expect(decidirFase({ ...base, status: 'pending', dica: 'approved', passouMs: ESPERA_MS + 1 })).toBe('conferindo');
    expect(decidirFase({ ...base, status: 'pending', dica: 'approved', passouMs: DESISTE_MS + 1 })).toBe('desconhecido');
  });

  it('expirado sem pagamento e falha sem recusa têm texto próprio', () => {
    expect(decidirFase({ ...base, status: 'expired' })).toBe('expirado');
    expect(decidirFase({ passouMs: 0, metodo: 'pix', status: 'failed' })).toBe('nao-concluido');
  });

  it('nenhum texto da tela fala em boleto', () => {
    const fonte = readFileSync(new URL('../src/app/checkout/[slug]/obrigado/ObrigadoClient.tsx', import.meta.url), 'utf8');
    expect(fonte.toLowerCase()).not.toContain('boleto');
    expect(fonte).toContain('Este pagamento foi devolvido.');
    expect(fonte).toContain('O cartão foi recusado.');
    expect(fonte).toContain('Seu pagamento está em análise pela operadora.');
  });
});

describe('o checkout reabre o PIX (PAY-B-002)', () => {
  const ok = { pronto: true, logado: true, dono: false, temPedido: false, jaProcurou: false };
  it('procura uma vez, com a conta pronta e sem pedido na tela', () => {
    expect(deveRetomarPix(ok)).toBe(true);
    expect(deveRetomarPix({ ...ok, pronto: false })).toBe(false);
    expect(deveRetomarPix({ ...ok, logado: false })).toBe(false);
    expect(deveRetomarPix({ ...ok, dono: true })).toBe(false);
    expect(deveRetomarPix({ ...ok, temPedido: true })).toBe(false);
    /* Depois de "Gerar outro código", não reabre o descartado. */
    expect(deveRetomarPix({ ...ok, jaProcurou: true })).toBe(false);
  });
});

describe('o /perfil (PAY-B-002, PAY-B-004)', () => {
  const pix = (expira: number, status: Order['status'] = 'pending'): Order => ({
    id: 'HF1', courseSlug: 'alfabetizacao', amountCents: 13230, method: 'pix', status,
    createdAt: new Date().toISOString(),
    pix: { code: '000201', qrPngBase64: null, expiresAt: new Date(expira).toISOString() }
  });

  it('"Ver código PIX" só no PIX aguardando e dentro do prazo', () => {
    const agora = Date.now();
    expect(pixAindaPagavel(pix(agora + 60_000), agora)).toBe(true);
    expect(pixAindaPagavel(pix(agora - 1), agora)).toBe(false);
    expect(pixAindaPagavel(pix(agora + 60_000, 'paid'), agora)).toBe(false);
    expect(pixAindaPagavel({ ...pix(agora + 60_000), method: 'card' }, agora)).toBe(false);
  });

  it('o vencido aparece com a data, no fuso de Brasília', () => {
    /* 01/10/2026 às 01h00 em UTC ainda é 30/09 em Brasília. */
    const iso = '2026-10-01T01:00:00.000Z';
    expect(dataCurta(iso)).toBe('30/09/2026');
    expect(fraseDeVencido(iso)).toBe('Seu acesso terminou em 30/09/2026.');
    expect(vencidoDe([{ courseSlug: 'alfabetizacao', expiredAt: iso }], 'alfabetizacao')).toBe(iso);
    expect(vencidoDe([], 'alfabetizacao')).toBeNull();
    expect(vencidoDe(null, 'alfabetizacao')).toBeNull();
  });
});

describe('a virada do pré-lançamento (PAY-B-001, PAY-B-014)', () => {
  const antes = { brl: 147, listBrl: 297, installments: 12, pixDiscountPct: 10, preLancamentoAte: '2026-10-31' };
  /* O que o dono edita em data/courses.json no dia da virada. */
  const depois = { ...antes, brl: 297, listBrl: null };
  const curso = (price: typeof antes | typeof depois) => ({ price }) as unknown as CatalogCourse;

  it('antes: o anúncio tem data e preço cheio, e o build avisa perto do fim', () => {
    expect(ancora(antes)).toBe(297);
    expect(fimDoPreLancamento(antes)).toBe('31/10/2026');
    expect(estadoDoPreLancamento(antes, '2026-10-25')).toBe('avisa');
  });

  it('esquecer de virar é falha no dia seguinte', () => {
    expect(estadoDoPreLancamento(antes, '2026-11-01')).toBe('vencido');
  });

  it('depois de virar: sem data, sem preço cheio, e o build passa', () => {
    expect(ancora(depois)).toBeNull();
    expect(fimDoPreLancamento(depois)).toBeNull();
    expect(estadoDoPreLancamento(depois, '2026-11-01')).toBe('ok');
  });

  it('a tela e o servidor cobram o mesmo, antes e depois', () => {
    for (const p of [antes, depois]) {
      expect(priceCents(curso(p), 'pix')).toBe(cents(pixPrice(p)));
      expect(priceCents(curso(p), 'card')).toBe(cents(p.brl));
    }
    expect(priceCents(curso(depois), 'pix')).toBe(26730);
  });
});
