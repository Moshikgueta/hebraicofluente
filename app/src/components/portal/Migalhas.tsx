/* As migalhas do site público (23/10/2026): "Início › Jornada › Página".
 * Mostram onde a pessoa está e devolvem ao portal e à jornada. Usadas nas
 * páginas de jornada (Jornada.tsx) e no cabeçalho das páginas antigas
 * (PageHead), para /metodo, /biblia e /faq ficarem dentro de "Aprender
 * hebraico" sem mudar de endereço. */

import Link from 'next/link';
import { tx } from '@/i18n/telas/conta-migalhas';

export type Trilha = { nome: string; href?: string }[];

/** "Início › Jornada › Produto": onde a pessoa está, e a volta ao portal. */
export function Migalhas({ trilha }: { trilha: Trilha }) {
  return (
    <nav aria-label={tx.vocEstaEm} className="font-ui text-[14px] text-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 list-none p-0 m-0">
        <li><Link href="/" className="inline-flex items-center min-h-[40px] underline underline-offset-[3px] hover:text-ink">{tx.inicio}</Link></li>
        {trilha.map((t, i) => (
          <li key={t.nome} className="flex items-center gap-2">
            <span aria-hidden>›</span>
            {t.href && i < trilha.length - 1
              ? <Link href={t.href} className="inline-flex items-center min-h-[40px] underline underline-offset-[3px] hover:text-ink">{t.nome}</Link>
              : <span aria-current="page" className="text-ink-body">{t.nome}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}


/** As migalhas sozinhas, no alto de uma página que não usa PageHead. */
export function TrilhaNoTopo({ trilha }: { trilha: Trilha }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-6">
      <Migalhas trilha={trilha} />
    </div>
  );
}
