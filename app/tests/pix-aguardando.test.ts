/* O aviso de PIX gerado e ainda sem acesso (auditoria de UX de 20/10/2026,
   item 4): quem pagou no PIX direto e volta ao site não pode ver o preço e o
   botão de pagar de novo. A regra que decide QUAL pedido merece o aviso. */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { JANELA_AUTOMATICA_MS, JANELA_DIAS, pixAguardando } from '@/lib/pix-aguardando';
import type { Order } from '@/lib/account/types';

const agora = Date.parse('2026-10-20T12:00:00Z');
const pedido = (o: Partial<Order>): Order => ({
  id: 'p1', courseSlug: 'alfabetizacao', amountCents: 13230, method: 'pix', status: 'pending',
  createdAt: '2026-10-19T12:00:00Z', ...o
});

describe('qual PIX merece o aviso', () => {
  it('o pendente deste curso, dentro da janela, e o mais recente', () => {
    const r = pixAguardando([
      pedido({ id: 'velho', createdAt: '2026-10-18T12:00:00Z' }),
      pedido({ id: 'novo', createdAt: '2026-10-20T10:00:00Z' })
    ], 'alfabetizacao', agora);
    expect(r?.id).toBe('novo');
  });

  it('não: pago, cartão, outro curso ou fora da janela', () => {
    const fora = new Date(agora - (JANELA_DIAS + 1) * 86_400_000).toISOString();
    expect(pixAguardando([
      pedido({ status: 'paid' }),
      pedido({ method: 'card' }),
      pedido({ courseSlug: 'hebraico-a1' }),
      pedido({ createdAt: fora })
    ], 'alfabetizacao', agora)).toBeNull();
  });

  it('na Mercado Pago, só o PIX das últimas duas horas', () => {
    const tres = new Date(agora - 3 * 3_600_000).toISOString();
    const uma = new Date(agora - 3_600_000).toISOString();
    expect(pixAguardando([pedido({ createdAt: tres })], 'alfabetizacao', agora, JANELA_AUTOMATICA_MS)).toBeNull();
    expect(pixAguardando([pedido({ createdAt: uma })], 'alfabetizacao', agora, JANELA_AUTOMATICA_MS)).not.toBeNull();
  });

  it('a página do curso e o checkout mostram o aviso', () => {
    const curso = readFileSync(new URL('../src/app/cursos/[slug]/CourseClient.tsx', import.meta.url), 'utf8');
    const checkout = readFileSync(new URL('../src/app/checkout/[slug]/CheckoutClient.tsx', import.meta.url), 'utf8');
    expect(curso).toContain('<AvisoPixAguardando');
    expect(checkout).toContain('<AvisoPixAguardando');
  });
});

describe('o cadastro dentro do checkout volta para o checkout', () => {
  it('o formulário embutido recebe o retorno (item 1 da auditoria de UX)', () => {
    const checkout = readFileSync(new URL('../src/app/checkout/[slug]/CheckoutClient.tsx', import.meta.url), 'utf8');
    expect(checkout).toMatch(/<AuthForm mode="signup"[^>]*voltarPara=\{`\/checkout\/\$\{slug\}`\}/);
  });
});
