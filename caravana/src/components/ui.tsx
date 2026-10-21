// Biblioteca base de componentes. Tudo que repete entre telas mora aqui, com
// as variantes nomeadas: nenhuma tela inventa o proprio botao.

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// ─── Hebraico ───────────────────────────────────────────────────────────────
// A unica porta de entrada para texto em hebraico: lang, dir e isolamento
// bidirecional sempre juntos, e a fonte que posiciona o nikud corretamente.
export function He({ children, display = false, className }: { children: ReactNode; display?: boolean; className?: string }) {
  return (
    <span lang="he" dir="rtl" className={cx(display ? 'he-display' : 'he', className)}>
      {children}
    </span>
  );
}

// ─── Botoes ─────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet';
type Size = 'md' | 'lg' | 'sm';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:brightness-110 active:brightness-95 shadow-[0_1px_0_rgb(0_0_0/0.08)]',
  secondary: 'bg-paper-raised text-ink ring-1 ring-inset ring-stone-300 hover:bg-white hover:ring-stone-500',
  ghost: 'text-brand-text hover:bg-brand-tint',
  quiet: 'bg-sand text-ink hover:bg-sand-deep',
  danger: 'bg-paper-raised text-danger ring-1 ring-inset ring-danger/40 hover:bg-danger-soft',
};
const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-small gap-1.5',
  md: 'h-11 px-5 text-[0.95rem] gap-2',
  lg: 'h-13 px-6 text-base gap-2.5',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', block = false) {
  return cx(
    'inline-flex select-none items-center justify-center rounded-full font-semibold tracking-[0.005em] transition',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANT[variant],
    SIZE[size],
    block && 'w-full',
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  ...rest
}: ComponentProps<'button'> & { variant?: Variant; size?: Size; block?: boolean }) {
  return <button type="button" className={cx(buttonClass(variant, size, block), className)} {...rest} />;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; block?: boolean }) {
  return <Link className={cx(buttonClass(variant, size, block), className)} {...rest} />;
}

// ─── Superficies ────────────────────────────────────────────────────────────

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('rounded-md bg-paper-raised ring-1 ring-stone-200 shadow-card', className)} {...rest} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-micro font-semibold uppercase tracking-[0.14em] text-stone-600', className)}>{children}</p>;
}

export function SectionTitle({ eyebrow, title, action, className }: { eyebrow?: ReactNode; title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <Eyebrow className="mb-1">{eyebrow}</Eyebrow>}
        <h2 className="font-display text-display-m font-medium tracking-[-0.01em] text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'ochre';
const TONE: Record<Tone, string> = {
  neutral: 'bg-stone-100 text-stone-700',
  brand: 'bg-brand-tint text-brand-text',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  ochre: 'bg-ochre-soft text-[#7a5016]',
};

export function Tag({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-semibold tracking-wide', TONE[tone], className)}>
      {children}
    </span>
  );
}

export function Notice({ tone = 'neutral', title, children, className }: { tone?: Tone; title?: ReactNode; children: ReactNode; className?: string }) {
  const border: Record<Tone, string> = {
    neutral: 'border-stone-300',
    brand: 'border-brand',
    success: 'border-success',
    warning: 'border-warning',
    danger: 'border-danger',
    ochre: 'border-ochre',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : undefined} className={cx('rounded-sm border-l-[3px] bg-paper-raised px-4 py-3 text-small text-ink-soft ring-1 ring-stone-200', border[tone], className)}>
      {title && <p className="mb-0.5 font-semibold text-ink">{title}</p>}
      {children}
    </div>
  );
}

export function EmptyState({ title, children, action, art }: { title: string; children?: ReactNode; action?: ReactNode; art?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-stone-300 px-6 py-10 text-center">
      {art && <div className="mb-4 text-stone-500">{art}</div>}
      <p className="font-display text-title font-medium text-ink">{title}</p>
      {children && <div className="mt-1.5 max-w-sm text-small text-stone-600">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Progress({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={className}>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-md bg-paper-raised p-4 ring-1 ring-stone-200', className)}>
      <p className="text-small text-stone-600">{label}</p>
      <p className="tabular mt-1 font-display text-display-m font-medium text-ink">{value}</p>
      {hint && <p className="mt-1 text-micro text-stone-600">{hint}</p>}
    </div>
  );
}

// ─── Formularios ────────────────────────────────────────────────────────────

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-small font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-micro text-stone-600">{hint}</p>}
      {error && (
        <p className="text-micro font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'block w-full rounded-sm bg-paper-raised px-3.5 py-2.5 text-[1rem] text-ink ring-1 ring-inset ring-stone-300 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-stone-100 disabled:text-stone-600';

// Marca da plataforma: um arco de pedra com o sol nascendo.
export function PlatformMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#1f4a6b" />
      <path d="M8 25V15a8 8 0 0 1 16 0v10" fill="none" stroke="#f1e1c4" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="18" r="3.2" fill="#d9a04f" />
      <path d="M6 25h20" stroke="#f1e1c4" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <PlatformMark />
      <span className="font-display text-[1.15rem] font-medium tracking-[-0.01em] text-ink">
        Minha Caravana <span className="italic text-sea">Digital</span>
      </span>
    </span>
  );
}
