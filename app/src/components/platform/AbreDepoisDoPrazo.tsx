'use client';

/* O exame final, o certificado e as leituras bônus, depois do prazo de
 * desistência (decisão do dono, 03/11/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Enquanto a compra ainda pode ser desfeita pelo site, estas três coisas
 * esperam. As lições não: o curso continua aberto. O prazo vem do servidor
 * (`desistivelAte` em cada direito, worker/src/lib/db.js), e as leituras
 * bônus nem chegam ao aparelho antes dele (worker/src/api/content.js).
 * Presente e liberação à mão não têm prazo, então não esperam. */
import { useAccount } from '@/lib/account/store';
import { abreDepoisDoPrazo } from '@/lib/account/types';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { LOCALE_INTL } from '@/i18n';
import { tx } from '@/i18n/telas/abre-depois-do-prazo';

/** Quando abre, para este aluno; null se já está aberto (ou a conta ainda carrega). */
export function useAbreEm(): Date | null {
  const account = useAccount();
  return abreDepoisDoPrazo(account.session);
}

export function AbreDepoisDoPrazo({ o, em, comBotao = true }: {
  o: 'exame' | 'certificado' | 'bonus';
  em: Date;
  comBotao?: boolean;
}) {
  const data = em.toLocaleDateString(LOCALE_INTL, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return (
    <Card tone="sand" className="p-6 sm:p-8 grid gap-3">
      <h2 className="text-[22px] sm:text-[26px] font-bold leading-tight m-0">{tx[o](data)}</h2>
      <p className="text-[16px] leading-relaxed text-ink-body m-0 max-w-[52ch]">{tx.texto}</p>
      {comBotao && <LinkButton href="/meu-hebraico" className="justify-self-start">{tx.continuar}</LinkButton>}
    </Card>
  );
}
