'use client';

/* A casca de Raízes Sefarditas (22/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * Raízes é um produto individual, comprado à parte, no mesmo site e com a
 * mesma conta. Por isso as telas dele NÃO usam a casca do curso de hebraico
 * (AppShell): nada de "Meu curso", "Revisão", "Aula 0", XP ou barra do
 * polegar do alfabeto, e nada de gravar `lastRoute` do curso de hebraico.
 *
 * A barra é a da coleção editorial (Israel Além do Óbvio): o nome em
 * versalete, dois destinos, e o fio de progresso de leitura embaixo. O fio
 * anda por `transform` escrito direto no elemento, sem re-renderizar a página
 * a cada rolagem.
 *
 * `data-plataforma` continua aqui: é a marca que liga o tema escuro e o
 * contraste do menu de acessibilidade (styles/tokens.css).
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { DemoNotice } from '@/components/shell/DemoNotice';
import { SessaoCaiu } from '@/components/shell/SessaoCaiu';
import { useAccount } from '@/lib/account/store';

const LINKS = [
  { href: '/raizes', rotulo: 'Jornada' },
  { href: '/raizes/atlas', rotulo: 'Atlas' },
  { href: '/raizes/biblioteca', rotulo: 'Biblioteca' }
];

export function RaizesShell({ children }: { children: ReactNode }) {
  const pathname = (usePathname() ?? '').replace(/\/+$/, '') || '/';
  const account = useAccount();
  const fio = useRef<HTMLElement>(null);
  const ativo = (href: string) =>
    href === '/raizes' ? pathname === '/raizes' || pathname.startsWith('/raizes/modulo') : pathname.startsWith(href);

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const f = total > 0 ? Math.min(1, Math.max(0, h.scrollTop / total)) : 0;
      if (fio.current) fio.current.style.transform = `scaleX(${f})`;
    };
    const pedir = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
    medir();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); cancelAnimationFrame(quadro); };
  }, [pathname]);

  const inicial = (account.session?.account.name || account.session?.account.email || '?').slice(0, 1).toUpperCase();

  return (
    <div data-plataforma className="min-h-[100dvh] flex flex-col">
      <header className="rz-topo">
        <div className="mx-auto flex h-[54px] max-w-[var(--larg)] items-center gap-2 px-4">
          <Link href="/raizes" prefetch={false} className="rz-marca-da-casa flex-1 min-w-0"><span className="min-[480px]:hidden">Raízes</span><span className="hidden min-[480px]:inline">Raízes Sefarditas</span></Link>
          <nav aria-label="Raízes Sefarditas" className="flex items-center">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} prefetch={false} aria-current={ativo(l.href) ? 'page' : undefined}>{l.rotulo}</Link>
            ))}
          </nav>
          <Link href="/raizes/busca" prefetch={false} aria-label="Buscar" aria-current={ativo('/raizes/busca') ? 'page' : undefined}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--titulo)] hover:bg-[var(--pedra)]">
            <svg viewBox="0 0 20 20" aria-hidden className="h-[18px] w-[18px]"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </Link>
          {account.signedIn && (
            <Link href="/perfil" prefetch={false} aria-label="Sua conta"
              className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--linha)] font-ui text-[13px] font-semibold text-[var(--titulo)]">
              {inicial}
            </Link>
          )}
        </div>
        <div className="rz-progresso" aria-hidden><i ref={fio} style={{ transform: 'scaleX(0)' }} /></div>
      </header>
      <main id="hf-principal" className="mx-auto w-full max-w-[var(--larg)] flex-1 min-w-0 px-4 pb-20">
        <div className="pt-4 empty:hidden"><DemoNotice /><SessaoCaiu /></div>
        {children}
      </main>
      <footer className="border-t border-[var(--linha)]">
        <div className="mx-auto flex max-w-[var(--larg)] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-6">
          <span className="rz-rot">Raízes Sefarditas · Hebraico Fluente</span>
          <span className="flex flex-wrap gap-x-4 font-ui text-[13px] text-[var(--suave)]">
            <Link href="/suporte" prefetch={false} className="min-h-[44px] inline-flex items-center">Ajuda</Link>
            <Link href="/termos" prefetch={false} className="min-h-[44px] inline-flex items-center">Termos</Link>
            <Link href="/privacidade" prefetch={false} className="min-h-[44px] inline-flex items-center">Privacidade</Link>
            <Link href="/cursos" prefetch={false} className="min-h-[44px] inline-flex items-center">Outros cursos</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
