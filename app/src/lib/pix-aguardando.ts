'use client';

/* O PIX que a pessoa gerou e que ainda não virou acesso.
 * ─────────────────────────────────────────────────────────────────────────
 * No PIX direto a liberação é à mão (CLAUDE.md, "Operação sem terminal"): a
 * pessoa paga, fecha a página como o checkout manda, e volta mais tarde.
 * Até 20/10/2026 ela voltava para o preço e o botão de pagar - o portão manda
 * quem não tem o curso para a página dele - e o aviso "não pague de novo"
 * ficava embaixo do preço. O resultado provável era pagar duas vezes
 * (auditoria de UX, item 4).
 *
 * Aqui só se descobre o pedido; quem decide o texto é o componente. O
 * pedido conta se é PIX, deste curso, ainda `pending` e de no máximo
 * JANELA_DIAS atrás: depois disso, ou foi liberado, ou ninguém pagou.
 *
 * Nada aqui decide acesso. É só o que a tela diz antes do preço.
 */

import { useEffect, useState } from 'react';
import { api } from '@/lib/account/api';
import type { Order } from '@/lib/account/types';
import { confirmaSozinho } from '@/lib/empresa';

/** Até quantos dias depois de gerado um PIX pendente ainda merece o aviso,
 *  no PIX direto (liberação à mão, em dias úteis). */
export const JANELA_DIAS = 10;
/** Na Mercado Pago a confirmação chega em minutos (webhook, volta do
 *  comprador e a varredura de 5 em 5 min): um PIX pendente de mais de duas
 *  horas quase sempre não foi pago, e "entra sozinho em poucos minutos" seria
 *  falso. */
export const JANELA_AUTOMATICA_MS = 2 * 3_600_000;

/** O pedido PIX pendente mais recente deste curso, dentro da janela. */
export function pixAguardando(
  orders: readonly Order[], slug: string, agora = Date.now(), janelaMs = JANELA_DIAS * 86_400_000
): Order | null {
  const limite = agora - janelaMs;
  return orders
    .filter(o => o.courseSlug === slug && o.method === 'pix' && o.status === 'pending'
      && Date.parse(o.createdAt) >= limite)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0] ?? null;
}

/* Uma consulta dividida entre quem perguntar na mesma tela (a caixa de
   compra aparece duas vezes na página do curso), e refeita depois de 30 s:
   a navegação é de aplicativo, e um PIX gerado no checkout tem de aparecer
   quando a pessoa volta para a página do curso. */
let daPagina: { em: number; p: Promise<Order[]> } | null = null;

/** O PIX aguardando deste curso, para quem está conectado e ainda não o tem. */
export function usePixAguardando(slug: string, perguntar: boolean): Order | null {
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    if (!perguntar) return;
    let parar = false;
    if (!daPagina || Date.now() - daPagina.em > 30_000) {
      daPagina = { em: Date.now(), p: api().then(a => a.compras()).then(c => c.orders).catch(() => []) };
    }
    void daPagina.p.then(o => { if (!parar) setOrders(o); });
    return () => { parar = true; };
  }, [perguntar]);
  const janela = confirmaSozinho() ? JANELA_AUTOMATICA_MS : JANELA_DIAS * 86_400_000;
  return perguntar && orders ? pixAguardando(orders, slug, Date.now(), janela) : null;
}
