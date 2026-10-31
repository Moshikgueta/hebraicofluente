'use client';

/* O guia «O nikud da Bíblia» (27/09/2026). Conteúdo em data/bonus.json
 * (`guia`). Opcional por pedido do dono do curso: uma página à parte, sem
 * XP, sem nota e sem nada que dependa dela. Cada seção é uma regra de
 * leitura com exemplos tirados das leituras bônus, cada um com a gravação.
 */

import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { He } from '@/components/hebrew/He';
import { Prose } from '@/components/learn/Blocks';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { guiaNikud } from '@/lib/content';
import { tx } from '@/i18n/telas/academia-nikud-biblico-client';

export function NikudBiblicoClient() {
  useRegistroDeAudio();
  const guia = guiaNikud();
  if (!guia) {
    return <p className="text-[16px] text-ink-body m-0">{tx.indisponivel}</p>;
  }
  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Link href="/bonus"
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          {tx.voltarBonus}
        </Link>
        <Badge tone="accent">{tx.guiaOpcional}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">{guia.tituloPt}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">{guia.introPt}</p>
      </header>

      <nav aria-label={tx.nesteGuia}>
        <ol className="grid gap-1 list-decimal pl-6 m-0 font-ui text-[14.5px]">
          {guia.secoes.map(s => (
            <li key={s.id}><a href={`#${s.id}`} className="text-[var(--accent)] underline">{s.tituloPt}</a></li>
          ))}
        </ol>
      </nav>

      {guia.secoes.map((s, n) => (
        <Card key={s.id} as="section" className="p-5 grid gap-3 scroll-mt-20">
          <h2 id={s.id} className="font-display text-[20px] font-semibold m-0">{n + 1}. {s.tituloPt}</h2>
          <p className="text-[15.5px] leading-relaxed text-ink-body m-0"><Prose text={s.textoPt} /></p>
          <ul className="grid gap-2 list-none p-0 m-0">
            {s.exemplos.map(e => (
              <li key={e.he} className="grid gap-1 rounded-[var(--r-md)] bg-surface-2 p-3">
                <div className="flex items-center gap-2" dir="rtl">
                  <He size="lg" className="!text-[26px] sm:!text-[30px] !leading-[1.7] flex-1 text-right">{e.he}</He>
                  {hasAudio(e.audioId) && <AudioButton audioId={e.audioId!} ariaLabel={tx.ouvir(e.translit)} size="sm" />}
                </div>
                <p className="font-ui text-[14.5px] m-0">
                  <span className="font-semibold text-ink">{e.translit}</span>
                  <span className="text-ink-muted"> · {e.pt}</span>
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
