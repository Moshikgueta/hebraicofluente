'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

/* O hover do design é uma cor declarada (navy → navy-2) mais um levantar de
   1-2px, e não um `brightness`: clarear um navy escuro dá um cinza azulado
   que não é cor nenhuma do sistema. */
const VARIANT: Record<Variant, string> = {
  primary:   'bg-[var(--navy)] text-white hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0 shadow-[var(--sh)]',
  secondary: 'bg-[var(--card)] text-ink border border-line hover:border-[#C9C3B4] hover:-translate-y-[2px] active:translate-y-0',
  ghost:     'bg-transparent text-ink-body hover:bg-surface-2',
  quiet:     'bg-surface-2 text-ink-body hover:bg-surface'
};
const SIZE: Record<Size, string> = {
  /* 44px minimum on every interactive control: this course is used on a phone
     with one thumb, often on a bus. */
  sm: 'min-h-[40px] px-4 text-sm',
  md: 'min-h-[48px] px-5 text-[15px]',
  lg: 'min-h-[56px] px-7 text-base'
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--r-md)] font-ui font-medium ' +
  'transition-[filter,background-color,transform] duration-[var(--dur)] ease-[var(--ease)] ' +
  'disabled:opacity-45 disabled:cursor-not-allowed select-none';

export function Button({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button',
  className = '', full = false, ...rest
}: {
  children: ReactNode; onClick?: () => void; variant?: Variant; size?: Size;
  disabled?: boolean; type?: 'button' | 'submit'; className?: string; full?: boolean;
  'aria-label'?: string;
}) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${VARIANT[variant]} ${SIZE[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children, href, variant = 'primary', size = 'md', className = '', full = false
}: {
  children: ReactNode; href: string; variant?: Variant; size?: Size;
  className?: string; full?: boolean;
}) {
  return (
    <Link href={href} className={`${base} ${VARIANT[variant]} ${SIZE[size]} ${full ? 'w-full' : ''} ${className}`}>
      {children}
    </Link>
  );
}
