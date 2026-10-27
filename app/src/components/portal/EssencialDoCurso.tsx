'use client';

/* Os três itens do cartão do curso na capa (lib/inclui.ts). Peça de
   navegador só por causa do item do som: `audioAvailable` lê o registro de
   gravações, que só existe no aparelho. O resto do cartão sai pronto do
   servidor. */

import { oEssencialDoCurso } from '@/lib/inclui';

export function EssencialDoCurso() {
  return (
    <ul className="grid gap-2 list-none p-0 m-0">
      {oEssencialDoCurso().map(i => (
        <li key={i} className="flex items-start gap-3 font-ui text-[15.5px] leading-[1.5] text-ink-body">
          <span aria-hidden className="mt-[3px] grid place-items-center w-[18px] h-[18px] rounded-full bg-[var(--teal-soft)] text-[var(--teal-ink)] text-[11px] font-bold shrink-0">✓</span>
          {i}
        </li>
      ))}
    </ul>
  );
}
