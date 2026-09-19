import type { ReactNode } from 'react';

export function Card({
  children, className = '', as: As = 'div', tone = 'surface'
}: {
  children: ReactNode; className?: string; as?: 'div' | 'section' | 'article';
  tone?: 'surface' | 'wash' | 'ink' | 'mint' | 'ember' | 'amber';
}) {
  const TONE = {
    surface: 'bg-surface border-line',
    wash:    'bg-[var(--accent-wash)] border-transparent',
    /* O painel escuro. Existe para uma coisa só: pôr o hebraico em destaque
       de verdade, claro sobre escuro, do tamanho de um espécime tipográfico.
       É o contraste que faz uma página parecer desenhada em vez de montada -
       e aqui ele cai sobre o ativo mais bonito que o produto tem.
       `--ink` já inverte no modo escuro, então o painel continua sendo o
       oposto do papel nos dois temas, em vez de sumir num deles. */
    ink:     'bg-[var(--ink)] border-transparent',
    mint:    'bg-mint border-transparent',
    ember:   'bg-[var(--ember-wash)] border-transparent',
    amber:   'bg-[var(--amber-wash)] border-transparent'
  } as const;
  return (
    <As className={`rounded-[var(--r-lg)] border ${TONE[tone]} ${className}`}>
      {children}
    </As>
  );
}

export function Badge({
  children, tone = 'neutral'
}: { children: ReactNode; tone?: 'neutral' | 'accent' | 'mint' | 'ember' }) {
  const TONE = {
    neutral: 'bg-surface-2 text-ink-muted',
    accent:    'bg-[var(--accent-wash)] text-[var(--accent)]',
    mint:    'bg-mint text-[var(--mint-ink)]',
    ember:   'bg-[var(--ember-wash)] text-[var(--ember)]'
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
