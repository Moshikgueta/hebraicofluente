'use client';

/* O aviso de quem já gerou um PIX e ainda não tem o acesso.
 * ─────────────────────────────────────────────────────────────────────────
 * Aparece ANTES de qualquer preço (página do curso) e antes da escolha de
 * pagamento (checkout). Ver lib/pix-aguardando.ts para o porquê.
 *
 * O texto serve aos dois casos sem adivinhar qual é: quem pagou lê "não
 * pague de novo" e o prazo real; quem não pagou tem o caminho para pagar
 * logo abaixo. O sistema não sabe qual dos dois a pessoa é, e não finge
 * saber.
 */

import Link from 'next/link';
import type { Order } from '@/lib/account/types';
import { confirmaSozinho, empresa } from '@/lib/empresa';

const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
});
const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', {
  hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
});

export function AvisoPixAguardando({ order, email, linkPagar }: {
  order: Order;
  /** A conta conectada: o acesso aparece nela. */
  email?: string | null;
  /** Para onde vai "Ainda não paguei". Ausente no checkout, onde o pagamento já está logo abaixo. */
  linkPagar?: string;
}) {
  const automatico = confirmaSozinho();
  const codigoVale = !!order.pix && Date.parse(order.pix.expiresAt) > Date.now();
  return (
    <div role="status"
         className="grid gap-2.5 rounded-[var(--r-md)] border border-[var(--edge-teal)] bg-[var(--teal-soft)] p-5">
      <p className="font-display text-[18px] font-semibold leading-snug text-ink m-0">
        Você gerou um PIX em {dataHora(order.createdAt)}.
      </p>
      {automatico ? (
        <p className="font-ui text-[14.5px] leading-relaxed text-[var(--teal-body)] m-0">
          <strong>Se já pagou, não pague de novo:</strong> o acesso entra sozinho assim que
          o banco confirma, em geral em poucos minutos. Recarregue esta página daqui a pouco.
          {codigoVale && order.pix && <> O mesmo código ainda vale até as {hora(order.pix.expiresAt)}.</>}
        </p>
      ) : (
        <p className="font-ui text-[14.5px] leading-relaxed text-[var(--teal-body)] m-0">
          <strong>Se já pagou, não pague de novo:</strong> conferimos o pagamento e liberamos
          o acesso à mão, em até {empresa.atendimento.prazoRespostaUteis} dias úteis
          {email ? <>, nesta mesma conta (<span className="break-all">{email}</span>)</> : null}.
          Passou do prazo? Escreva para{' '}
          <a href={`mailto:${empresa.contato.emailSuporte}`} className="underline break-all">
            {empresa.contato.emailSuporte}
          </a>{' '}
          com o número do pedido: <code className="font-mono">{order.id}</code>.
        </p>
      )}
      {linkPagar && (
        <Link href={linkPagar}
              className="justify-self-start inline-flex items-center min-h-[44px] font-ui text-[14.5px]
                         font-semibold text-[var(--teal-ink)] underline underline-offset-2">
          {automatico && codigoVale ? 'Abrir o mesmo código PIX' : 'Ainda não paguei: ir para o pagamento'}
        </Link>
      )}
    </div>
  );
}
