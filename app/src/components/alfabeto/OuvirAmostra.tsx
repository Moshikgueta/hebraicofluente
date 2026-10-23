'use client';

/* Um botão "Ouvir" para uma gravação pública (/amostra-audio/), nas páginas
   do alfabeto. Usa o mesmo tocador da capa (useTocador). */

import { useTocador } from '@/components/landing/useTocador';
import type { NomeAmostra } from '@/lib/amostra-audio';

export function OuvirAmostra({ nome, rotulo }: { nome: NomeAmostra; rotulo: string }) {
  const { tocar, tocando } = useTocador();
  return (
    <button
      type="button" onClick={() => tocar(nome)}
      className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[12px] border border-line bg-[var(--card)]
                 font-ui text-[15px] font-semibold text-ink hover:border-[var(--accent)]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
    >
      <span aria-hidden>{tocando === nome ? '◼' : '▶'}</span>
      {rotulo}
    </button>
  );
}
