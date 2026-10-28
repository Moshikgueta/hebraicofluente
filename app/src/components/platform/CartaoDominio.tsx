'use client';

/* "Meu domínio das letras" (11/10/2026): o que o aluno SABE, por habilidade,
 * ao lado do que ele concluiu. Some até haver um exercício feito. Morava no
 * painel; desde 28/10/2026 (painel mais curto) mora no Progresso. Os textos
 * continuam no dicionário do painel, onde já estavam traduzidos. */

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { useProgress } from '@/lib/state/store';
import { allLetters, getLetter } from '@/lib/content';
import { resumoDoDominio } from '@/lib/dominio';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-dashboard-client';

export function CartaoDominio() {
  const p = useProgress();
  const dominio = useMemo(() => resumoDoDominio(p.state, allLetters().map(l => l.id)), [p.state]);
  if (!(dominio.contagem.dominada + dominio.contagem.quase > 0 || dominio.paraPraticar.length > 0)) return null;
  return (
    <Card className="p-5 grid gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div className="grid gap-1 min-w-0">
        <p className="font-display text-[17px] font-semibold text-ink m-0">{tx.dominioTitulo}</p>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body m-0">
          {fmt(tx.dominioResumo, { dominadas: dominio.contagem.dominada, quase: dominio.contagem.quase })}
          {dominio.paraPraticar.length > 0 &&
            fmt(tx.paraReforcar, { letras: dominio.paraPraticar.map(d => getLetter(d.letterId)?.namePt).join(', ') })}
        </p>
      </div>
      <LinkButton href="/meu-hebraico/dominio" variant="secondary" className="shrink-0">{tx.verDominio}</LinkButton>
    </Card>
  );
}
