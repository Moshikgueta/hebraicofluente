/* A régua do site público.
 *
 * Todas as faixas da página usam esta largura e este respiro. Um site cujas
 * seções escolhem cada uma o seu padding parece três sites empilhados - e é
 * assim que a maioria das páginas de venda parece. O `tone` existe para
 * alternar o fundo e separar as faixas sem desenhar uma linha entre elas.
 */

import type { ReactNode } from 'react';

export function Section({
  children, tone = 'paper', className = '', id, labelledBy
}: {
  children: ReactNode;
  tone?: 'paper' | 'surface' | 'wash';
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  const TONE = {
    paper: '',
    surface: 'bg-surface-2',
    wash: 'bg-[var(--accent-wash)]'
  } as const;
  return (
    <section id={id} aria-labelledby={labelledBy}
             className={`${TONE[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-12 sm:py-16">
        {children}
      </div>
    </section>
  );
}

/** Um título de faixa com subtítulo opcional. `id` para o aria-labelledby. */
export function SectionHead({
  id, eyebrowPt, titlePt, leadPt, center = false
}: {
  id: string; eyebrowPt?: string; titlePt: string; leadPt?: string; center?: boolean;
}) {
  return (
    <header className={`grid gap-3 mb-8 ${center ? 'text-center justify-items-center' : ''}`}>
      {eyebrowPt && (
        <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
          {eyebrowPt}
        </p>
      )}
      <h2 id={id} className="font-display text-[26px] sm:text-[32px] font-bold leading-[1.2] text-ink max-w-[22ch]">
        {titlePt}
      </h2>
      {leadPt && (
        <p className="font-ui text-[16px] leading-relaxed text-ink-body max-w-[58ch]">
          {leadPt}
        </p>
      )}
    </header>
  );
}
