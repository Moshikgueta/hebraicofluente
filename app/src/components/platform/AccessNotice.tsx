'use client';

/* O aviso de acesso perto do fim.
 * ─────────────────────────────────────────────────────────────────────────
 * Aparece nos últimos 30 dias, e só então. A regra: avisar cedo o bastante
 * para renovar sem susto e tarde o bastante para não virar paisagem. Um
 * banner permanente de "seu acesso vai acabar" é lido uma vez e ignorado
 * para sempre - inclusive no dia em que importa.
 *
 * Nos últimos 7 dias ele muda de tom, porque aí já é urgente de verdade.
 */

import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { daysLeft } from '@/lib/account/types';
import { FLAGSHIP, flagship } from '@/lib/catalog';
import { tx } from '@/i18n/telas/conta-plataforma-pecas';

const WARN_FROM = 30;
const URGENT_FROM = 7;

export function AccessNotice() {
  const account = useAccount();
  if (!account.ready) return null;

  const left = daysLeft(account.session, FLAGSHIP);
  if (left === null || left > WARN_FROM) return null;

  const urgent = left <= URGENT_FROM;
  return (
    <Card tone={urgent ? 'ember' : 'amber'}
          className="p-5 grid sm:grid-cols-[1fr_auto] items-center gap-4">
      <div className="grid gap-1">
        <p className="font-display text-[17px] font-bold text-ink">
          {left === 0
            ? tx.terminaHoje
            : tx.terminaEm(left)}
        </p>
        <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
          {tx.depoisDisso(flagship().titlePt)}
        </p>
      </div>
      <LinkButton href={`/checkout/${FLAGSHIP}`} className="justify-self-start sm:justify-self-end">
        {tx.renovarAcesso}
      </LinkButton>
    </Card>
  );
}
