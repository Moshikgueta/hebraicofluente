import type { ReactNode } from 'react';

export function Card({
  children, className = '', as: As = 'div', tone = 'surface'
}: {
  children: ReactNode; className?: string; as?: 'div' | 'section' | 'article';
  tone?: 'surface' | 'wash' | 'ink' | 'navy' | 'mint' | 'ember' | 'amber' | 'sand';
}) {
  const TONE = {
    surface: 'bg-[var(--card)] border-line',
    wash:    'bg-[var(--teal-soft)] border-transparent',
    sand:    'bg-[var(--sand)] border-line',
    /* O bloco escuro. É o recurso central do design: navy sobre papel creme,
       para o cartão do curso em andamento, o painel da demonstração e o CTA
       final. `ink` é o nome antigo e aponta para o mesmo lugar - não há dois
       blocos escuros no sistema. */
    navy:    'bg-[var(--navy)] border-transparent',
    ink:     'bg-[var(--navy)] border-transparent',
    mint:    'bg-[var(--teal-soft)] border-[var(--edge-teal)]',
    ember:   'bg-[var(--gold-soft)] border-[var(--edge-gold)]',
    amber:   'bg-[var(--gold-soft)] border-[var(--edge-gold)]'
  } as const;
  return (
    <As className={`rounded-[var(--r-lg)] border ${TONE[tone]} ${className}`}>
      {children}
    </As>
  );
}

export function Badge({
  children, tone = 'neutral'
}: { children: ReactNode; tone?: 'neutral' | 'accent' | 'mint' | 'ember' | 'lite' }) {
  /* Texto sobre fundo tingido usa sempre a variante -ink, nunca a cor base:
     teal sobre teal-soft dá 2,4:1 e some. `lite` é a etiqueta dentro de um
     bloco navy, onde a regra se inverte. */
  const TONE = {
    neutral: 'bg-[var(--sand)] text-ink-muted',
    accent:  'bg-[var(--teal-soft)] text-[var(--teal-ink)]',
    mint:    'bg-[var(--teal-soft)] text-[var(--teal-ink)]',
    ember:   'bg-[var(--gold-soft)] text-[var(--gold-ink)]',
    lite:    'bg-white/10 text-[var(--teal-lite)]'
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]
      font-ui font-semibold uppercase tracking-[.07em] ${TONE[tone]}`}>
      {children}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}
