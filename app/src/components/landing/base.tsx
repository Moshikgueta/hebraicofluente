'use client';

/* As peças que todas as seções da landing usam.
 * ─────────────────────────────────────────────────────────────────────────
 * O design é uma página só, de catorze seções, e quase todas repetem a mesma
 * estrutura: um container de 1200px, um H2 grande com letter-spacing
 * negativo, um parágrafo de apoio, e uma grade que revela os cartões conforme
 * entram na tela. Em vez de repetir isso catorze vezes, mora aqui.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** O container da landing: 1200px, 28px de respiro lateral. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-7 ${className}`}>{children}</div>
  );
}

/**
 * Revelação por scroll.
 *
 * O estado inicial é uma CLASSE (`.reveal`, em globals.css) e não um estilo
 * calculado em JS: assim o HTML exportado já sai com o conteúdo escrito, e a
 * única coisa que o observador faz é acrescentar `.vis`. Com reduced-motion,
 * ou sem JavaScript, o CSS mostra tudo - um elemento invisível para sempre
 * porque um observador não rodou é o defeito clássico desse padrão.
 *
 * `unobserve` no primeiro disparo: a revelação acontece uma vez, e um
 * observador vivo por cartão numa página de catorze seções é trabalho à toa.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduz || !('IntersectionObserver' in window)) { setVisivel(true); return; }
    const io = new IntersectionObserver(entradas => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        setVisivel(true);
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, cls: visivel ? 'reveal vis' : 'reveal' };
}

/** Um bloco que aparece quando entra na tela, com atraso opcional em cascata. */
export function Reveal({
  children, delay = 0, className = '', as: As = 'div'
}: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'section' }) {
  const { ref, cls } = useReveal<HTMLDivElement>();
  return (
    <As ref={ref as never} className={`${cls} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </As>
  );
}

/** O H2 de seção: 30-44px, entrelinha curta, letter-spacing negativo. */
export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-display font-semibold text-[clamp(30px,3.7vw,44px)] leading-[1.08]
                    tracking-[-0.03em] text-balance ${className}`}>
      {children}
    </h2>
  );
}

/** O parágrafo de apoio embaixo de um H2. */
export function Lead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-ui text-[17px] sm:text-[18px] leading-[1.6] text-ink-muted max-w-[52ch] ${className}`}>
      {children}
    </p>
  );
}

/** O check teal de 15px. É o único ícone que aparece em quase toda seção. */
export function Check({ size = 15, color = 'var(--teal)', className = '' }: {
  size?: number; color?: string; className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M3.2 8.3 6.2 11.3 12.8 4.7" stroke={color} strokeWidth="1.9"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Uma lista de itens com check, em uma ou duas colunas. */
export function CheckList({
  items, columns = 1, color, textClass = 'text-ink-body'
}: {
  items: readonly ReactNode[];
  columns?: 1 | 2;
  color?: string;
  textClass?: string;
}) {
  return (
    <ul className={`grid gap-3 list-none p-0 m-0 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((t, i) => (
        <li key={i} className={`flex gap-2.5 items-start font-ui text-[15px] leading-[1.5] ${textClass}`}>
          <span className="mt-[4px]"><Check color={color} /></span>
          <span className="min-w-0">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** O chevron dos acordeões: gira 180 graus quando abre. */
export function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block text-ink-muted text-[15px] leading-none shrink-0
                 transition-transform duration-[280ms] ease-[var(--ease)]"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      ⌄
    </span>
  );
}
