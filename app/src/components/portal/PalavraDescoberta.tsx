'use client';

/* "Descubra uma palavra": a demonstração da capa (23/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Uma palavra só, e de verdade: שָׁלוֹם, com a transliteração e o sentido do
 * próprio curso (data/letters.json: "shalóm", "paz / olá / tchau") e a
 * gravação pública que a página do curso já usa (/amostra-audio/shalom.mp3).
 * Nenhum hebraico novo: as duas partes são recortes da palavra aprovada.
 *
 * Três gestos, cada um com uma função (make-interfaces-feel-better): ver o
 * sentido da leitura, separar as partes que se leem juntas, ouvir. O
 * significado vem por último, de propósito: a pessoa tenta ler antes de
 * saber o que leu, que é o que o curso faz em toda lição.
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { useTocador } from '@/components/landing/useTocador';
import { contarNoPortal } from '@/lib/funil-portal';

const PALAVRA = 'שָׁלוֹם';
/* Da direita para a esquerda, como se leem. */
const PARTES = [
  { he: 'שָׁ', som: 'sha' },
  { he: 'לוֹם', som: 'lóm' }
] as const;

export function PalavraDescoberta({ hrefCurso }: { hrefCurso: string }) {
  const { tocar, tocando } = useTocador();
  const [partes, setPartes] = useState(false);
  const [sentido, setSentido] = useState(false);

  return (
    <div className="grid gap-6 rounded-[20px] bg-[var(--navy)] text-white p-6 sm:p-10
                    shadow-[0_24px_60px_-30px_rgba(6,42,48,.55)]">
      <div className="grid gap-2 justify-items-center text-center">
        <p className="m-0 font-ui text-[13px] font-semibold uppercase tracking-[.12em] text-[var(--teal-lite)]">
          Leia da direita para a esquerda
        </p>
        {/* A seta aponta para a esquerda: é a direção da leitura. */}
        <span aria-hidden className="block w-24 h-px bg-white/30 relative
                                     after:absolute after:left-0 after:-top-[4px] after:w-2 after:h-2
                                     after:border-l after:border-b after:border-white/50 after:rotate-45" />
      </div>

      <div className="grid justify-items-center">
        <He size="display" tone="paper" className="leading-none">{PALAVRA}</He>
      </div>

      {/* As partes: aparecem no lugar, sem empurrar o resto (altura reservada). */}
      <div className="min-h-[92px] grid place-items-center" aria-live="polite">
        {partes ? (
          <ol dir="rtl" className="flex gap-3 list-none p-0 m-0">
            {PARTES.map(p => (
              <li key={p.he} className="grid justify-items-center gap-1 rounded-[12px] bg-white/[.08] px-4 py-2
                                        motion-safe:animate-[hf-rise_220ms_var(--ease)_both]">
                <He size="word" tone="paper">{p.he}</He>
                <span dir="ltr" className="font-ui text-[15px] font-semibold text-[var(--teal-lite)]">{p.som}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="m-0 font-ui text-[15px] text-white/80 max-w-[32ch] text-center">
            Tente ler antes de ouvir. Depois, veja as partes que se leem juntas.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button"
                onClick={() => { setPartes(true); contarNoPortal('palavra-revelar'); }}
                aria-pressed={partes}
                className="min-h-[48px] px-5 rounded-[var(--r-md)] font-ui text-[15px] font-medium
                           bg-white/10 text-white hover:bg-white/15 transition-[background-color,scale] duration-150 active:scale-[.97]
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          Ver as partes
        </button>
        <button type="button"
                onClick={() => { tocar('shalom'); contarNoPortal('palavra-ouvir'); }}
                className="min-h-[48px] px-5 rounded-[var(--r-md)] font-ui text-[15px] font-medium
                           bg-white text-[var(--navy)] hover:bg-[var(--teal-soft)] transition-[background-color,scale] duration-150 active:scale-[.97]
                           inline-flex items-center justify-center gap-2 min-w-[172px]
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <span aria-hidden className="inline-block w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-current" />
          {tocando === 'shalom' ? 'Tocando...' : 'Ouvir a palavra'}
        </button>
        <button type="button"
                onClick={() => setSentido(true)}
                aria-expanded={sentido}
                aria-controls="palavra-sentido"
                className="min-h-[48px] px-5 rounded-[var(--r-md)] font-ui text-[15px] font-medium
                           bg-white/10 text-white hover:bg-white/15 transition-[background-color,scale] duration-150 active:scale-[.97]
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          O que significa?
        </button>
      </div>

      <div id="palavra-sentido" hidden={!sentido}
           className="border-t border-white/15 pt-5 grid gap-2 text-center">
        <p className="m-0 font-display text-[24px] font-semibold">
          shalóm: paz, olá e tchau
        </p>
        <p className="m-0 font-ui text-[15px] leading-[1.6] text-white/80 max-w-[48ch] justify-self-center text-pretty">
          A mesma palavra cumprimenta, se despede e deseja paz. No curso, ela aparece quando você já
          conhece as quatro letras dela.
        </p>
        <a href={hrefCurso} onClick={() => contarNoPortal('cta-curso')}
           className="justify-self-center mt-2 inline-flex items-center gap-2 font-ui text-[16px] font-semibold
                      text-[var(--teal-lite)] underline underline-offset-[3px] decoration-[1.5px]">
          Aprender a ler as 22 letras
          <span aria-hidden>→</span>
        </a>
      </div>
    </div>
  );
}
