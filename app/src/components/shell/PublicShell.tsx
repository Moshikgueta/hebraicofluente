'use client';

/* O site público.
 * ─────────────────────────────────────────────────────────────────────────
 * A mesma casa do curso, não uma casa ao lado dele. Mesmas fontes, mesmas
 * cores, mesmo <He> para o hebraico, mesma régua de leitura. Um visitante que
 * compra não deve ter a sensação de ter mudado de produto ao entrar - é
 * exatamente essa sensação que faz o aluno duvidar se a compra funcionou.
 *
 * O cabeçalho tem duas formas. No desktop, os links à esquerda e as duas
 * ações à direita: "Entrar" (quem já é aluno) e "Começar agora" (quem não é).
 * No celular, um menu que abre por cima - e a ação principal fica FORA dele,
 * visível sempre, porque esconder o botão de comprar atrás de um hambúrguer é
 * a forma mais cara de economizar espaço.
 *
 * Quando a sessão existe, as duas ações viram uma: "Meu Hebraico". Um aluno
 * logado que vê "Criar conta" no topo do site acha que foi deslogado.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Logo } from '@/components/shell/Logo';
import { LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { DemoNotice } from '@/components/shell/DemoNotice';

const LINKS = [
  { href: '/metodo', label: 'Método' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/sobre', label: 'Sobre o Moshik' },
  { href: '/faq', label: 'Dúvidas' }
] as const;

const norm = (s: string | null) => (s ?? '/').replace(/\/+$/, '') || '/';

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const account = useAccount();

  /* Fecha o menu ao mudar de rota. Sem isto, tocar num link abre a página
     nova com o menu ainda por cima dela. */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* Trava o scroll do fundo enquanto o menu está aberto, e só então - o
     curso tem uma regra dura de nunca desabilitar o scroll globalmente. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[color:var(--line-soft)]
                         bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 h-[64px] flex items-center gap-4">
          <Link href="/" className="flex items-center min-h-[44px] -ml-1 pl-1 pr-2 rounded-md shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Navegação do site" className="hidden md:flex items-center gap-1 ml-4">
            {LINKS.map(l => {
              const active = norm(pathname) === norm(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center min-h-[44px] px-3 rounded-[var(--r-md)]
                    font-ui text-[14px] transition-colors
                    ${active ? 'text-[var(--accent)] font-semibold bg-[var(--accent-wash)]'
                             : 'text-ink-body hover:bg-surface-2'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {account.ready && account.signedIn ? (
              <LinkButton href="/meu-hebraico" size="sm">Meu Hebraico</LinkButton>
            ) : (
              <>
                <LinkButton href="/entrar" variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Entrar
                </LinkButton>
                <LinkButton href="/cursos/alfabetizacao" size="sm">Começar agora</LinkButton>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-controls="menu-site"
              className="md:hidden min-w-[44px] min-h-[44px] grid place-items-center rounded-[var(--r-md)]
                         text-ink-body hover:bg-surface-2"
            >
              <span aria-hidden className="text-[18px] leading-none">{open ? '✕' : '☰'}</span>
              <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="menu-site"
            aria-label="Navegação do site"
            className="md:hidden border-t border-[color:var(--line-soft)] bg-[var(--paper)]"
          >
            <ul className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-2 grid">
              {[...LINKS, ...(account.signedIn ? [] : [{ href: '/entrar', label: 'Entrar' } as const])]
                .map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center min-h-[52px] font-ui text-[16px] text-ink-body
                                 border-b border-[color:var(--line-soft)] last:border-0"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}
      </header>

      <DemoNotice />

      <main id="conteudo-publico" className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-[color:var(--line-soft)] bg-surface-2">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-10 grid gap-8
                      sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2 content-start">
          <Logo size={28} />
          <p className="font-ui text-[13px] leading-relaxed text-ink-muted max-w-[32ch]">
            Hebraico para brasileiros, do alfabeto à conversa. Feito para adulto
            que estuda sozinho, no celular, sem professor do lado.
          </p>
        </div>

        <FooterCol title="Cursos" links={[
          { href: '/cursos/alfabetizacao', label: 'Alfabetização' },
          { href: '/cursos/hebraico-a1', label: 'Hebraico A1' },
          { href: '/cursos/hebraico-a2', label: 'Hebraico A2' },
          { href: '/cursos/hebraico-b1', label: 'Hebraico B1' }
        ]} />

        <FooterCol title="A plataforma" links={[
          { href: '/metodo', label: 'O método' },
          { href: '/sobre', label: 'Sobre o Moshik' },
          { href: '/faq', label: 'Dúvidas' },
          { href: '/entrar', label: 'Entrar' }
        ]} />

        <div className="grid gap-2 content-start">
          <p className="font-ui text-[11px] uppercase tracking-[.08em] text-ink-muted">Contato</p>
          <a href="mailto:contato@hebraicofluente.com.br"
             className="inline-flex items-center min-h-[36px] font-ui text-[13.5px]
                        text-ink-body hover:text-[var(--accent)]">
            contato@hebraicofluente.com.br
          </a>
          <p className="font-ui text-[12px] leading-relaxed text-ink-muted mt-2">
            Pagamento por PIX ou cartão, em até 12x. Acesso liberado na hora.
          </p>
        </div>
      </div>

      <div className="border-t border-[color:var(--line-soft)]">
        <p className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-5
                      font-ui text-[12px] text-ink-muted">
          © {new Date().getFullYear()} Hebraico Fluente. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: {
  title: string; links: readonly { href: string; label: string }[];
}) {
  return (
    <div className="grid gap-1 content-start">
      <p className="font-ui text-[11px] uppercase tracking-[.08em] text-ink-muted mb-1">{title}</p>
      {links.map(l => (
        <Link key={l.href} href={l.href}
              className="inline-flex items-center min-h-[36px] font-ui text-[13.5px]
                         text-ink-body hover:text-[var(--accent)]">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
