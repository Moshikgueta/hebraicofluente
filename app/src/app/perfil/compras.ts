/* As decisões da parte de compras e acesso do /perfil, sem React, para
 * serem testadas sem navegador (tests/estado-pagamento.test.ts).
 */

import type { AcessoVencido, Order } from '@/lib/account/types';

/** dd/mm/aaaa no horário de Brasília - o fuso em que a pessoa conta os dias. */
export const dataCurta = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo'
  });

/** O vencimento de um curso que a conta teve e não tem mais, ou null. */
export function vencidoDe(vencidos: AcessoVencido[] | null | undefined, slug: string): string | null {
  return (vencidos ?? []).find(v => v.courseSlug === slug)?.expiredAt ?? null;
}

/** "Seu acesso terminou em dd/mm/aaaa." - a frase de quem pagou e venceu
 *  (auditoria de 01/10/2026, PAY-B-004). */
export const fraseDeVencido = (expiredAt: string): string =>
  `Seu acesso terminou em ${dataCurta(expiredAt)}.`;

/** O pedido mostra "Ver código PIX"? Só o PIX ainda aguardando e dentro do
 *  prazo: depois disso o código não deve ser pago (PAY-B-002). */
export function pixAindaPagavel(o: Order, agora: number = Date.now()): boolean {
  return o.status === 'pending' && o.method === 'pix' && !!o.pix?.code
    && new Date(o.pix.expiresAt).getTime() > agora;
}
