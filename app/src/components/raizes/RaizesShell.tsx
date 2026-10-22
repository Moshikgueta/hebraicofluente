'use client';

/* A casca de Raízes Sefarditas (22/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Raízes é um produto individual, comprado à parte, no mesmo site e com a
 * mesma conta. Por isso as telas dele NÃO usam a casca do curso de hebraico
 * (AppShell): nada de "Meu curso", "Revisão", "Aula 0", XP ou barra do
 * polegar do alfabeto, e nada de gravar `lastRoute` do curso de hebraico.
 * Do resto da plataforma ficam só a conta (login, cookie, aparelhos), o
 * portão (CourseGate, com o direito raizes-sefarditas) e os avisos gerais.
 *
 * `data-plataforma` continua aqui: é a marca que liga o tema escuro e o
 * contraste do menu de acessibilidade (styles/tokens.css).
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { DemoNotice } from '@/components/shell/DemoNotice';
import { SessaoCaiu } from '@/components/shell/SessaoCaiu';
import { useAccount } from '@/lib/account/store';

const LINKS = [
  { href: '/raizes', rotulo: 'Jornada' },
  { href: '/raizes/biblioteca', rotulo: 'Biblioteca' }
];

export function RaizesShell({ children }: { children: ReactNode }) {
  const pathname = (usePathname() ?? '').replace(/\/+$/, '') || '/';
  const account = useAccount();
  const ativo = (href: string) =>
    href === '/raizes' ? pathname === '/raizes' || pathname.startsWith('/raizes/modulo') : pathname.startsWith(href);

  return (
    <div data-plataforma className="min-h-[100dvh] flex flex-col bg-[var(--cream)]">
      <header className="sticky top-0 z-30 border-b border-line bg-[var(--cream)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/raizes" prefetch={false} className="grid leading-tight">
            <span className="font-display text-[18px] font-bold text-ink">Raízes Sefarditas</span>
            <span className="font-ui text-[11px] uppercase tracking-[.1em] text-ink-muted">por Hebraico Fluente</span>
          </Link>
          <nav aria-label="Raízes Sefarditas" className="flex items-center gap-1">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} prefetch={false} aria-current={ativo(l.href) ? 'page' : undefined}
                className={`rounded-full px-3 py-2 min-h-[40px] inline-flex items-center font-ui text-[13.5px] font-semibold
                  ${ativo(l.href) ? 'bg-[var(--rz-pedra)] text-ink' : 'text-ink-body hover:bg-[var(--sand)]'}`}>
                {l.rotulo}
              </Link>
            ))}
            {account.signedIn && (
              <Link href="/perfil" prefetch={false} aria-label="Sua conta"
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sand)] font-ui text-[14px] font-semibold text-ink">
                {(account.session?.account.name || account.session?.account.email || '?').slice(0, 1).toUpperCase()}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main id="hf-principal" className="mx-auto w-full max-w-[1080px] flex-1 min-w-0 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <DemoNotice />
        <SessaoCaiu />
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1080px] flex-wrap gap-x-5 gap-y-2 px-4 py-6 font-ui text-[13px] text-ink-muted sm:px-6">
          <Link href="/suporte" prefetch={false} className="hover:underline">Precisa de ajuda?</Link>
          <Link href="/termos" prefetch={false} className="hover:underline">Termos</Link>
          <Link href="/privacidade" prefetch={false} className="hover:underline">Privacidade</Link>
          <Link href="/cursos" prefetch={false} className="hover:underline">Outros cursos</Link>
        </div>
      </footer>
    </div>
  );
}
