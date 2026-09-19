'use client';

/* The shell, in two shapes.
 * ─────────────────────────────────────────────────────────────────────────
 * Below 1024px the course is a single column with a bottom bar under the
 * thumb - the phone is where most of the studying happens, and that layout is
 * not a compromise.
 *
 * At 1024px and up it becomes a desk: a persistent sidebar carrying navigation
 * AND standing progress, and a content area wide enough to put things side by
 * side. That is the real argument for a desktop version - not more pixels for
 * the same column, but more of the course visible at once. On a phone the
 * question is "what now?"; at a desk it is "where am I in this?", and the
 * sidebar answers that without a click.
 *
 * What does NOT change with width: the reading measure. Prose stays near 65
 * characters and the Hebrew stays large. A 1100px line of Portuguese is harder
 * to read than a 600px one, and the Hebrew is the subject at every size.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useProgress } from '@/lib/state/store';
import { XPIndicator } from '@/components/game/Game';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { Logo } from '@/components/shell/Logo';
import { He } from '@/components/hebrew/He';
import { allCourses, isPlayable } from '@/lib/catalog';
import {
  IconeHoje, IconeMapa, IconeRevisao, IconePraticar, IconeConquistas, IconePerfil
} from '@/components/shell/NavIcons';
import { useAccount } from '@/lib/account/store';
import { DemoNotice } from '@/components/shell/DemoNotice';

/* "Hoje" é /meu-hebraico e não mais "/": desde que existe site público, a
   raiz é a página de vendas, e o painel do aluno tem endereço próprio. */
const NAV = [
  { href: '/meu-hebraico', label: 'Hoje', icon: IconeHoje },
  { href: '/mapa', label: 'Meu curso', icon: IconeMapa },
  { href: '/revisao', label: 'Revisão', icon: IconeRevisao },
  /* The gym is a destination, not a feature buried in a screen: a learner who
     has finished the alphabet has nowhere else to go, and one who wants to
     drill only the vowels should not have to find the door. */
  { href: '/academia', label: 'Praticar', icon: IconePraticar },
  { href: '/conquistas', label: 'Progresso', icon: IconeConquistas },
  /* Perfil mora na sidebar no desktop; no telefone ele já está no topo, e
     por isso a barra de baixo mostra só os cinco primeiros. */
  { href: '/perfil', label: 'Perfil', icon: IconePerfil }
] as const;

/**
 * Is this nav item the page we are on?
 *
 * The export uses directory-style URLs (`trailingSlash: true`), so the browser
 * reports `/mapa/` while the link says `/mapa` - and a plain equality check
 * therefore matched nothing but the home page. Every screen except the
 * dashboard was rendering with no item marked current, in the sidebar and in
 * the bottom bar, and with no `aria-current` for a screen reader either.
 */
export function isActive(pathname: string | null, href: string): boolean {
  const here = (pathname ?? '/').replace(/\/+$/, '') || '/';
  const target = href.replace(/\/+$/, '') || '/';
  return here === target;
}

export function AppShell({ children }: { children: ReactNode }) {
  const p = useProgress();
  const pathname = usePathname();
  const { remember } = p;

  useEffect(() => { if (pathname) remember(pathname); }, [pathname, remember]);

  const avisos = (
    <>
      <DemoNotice />
      {!p.persistent && (
        <Card tone="ember" className="p-4 mb-4">
          <p className="font-ui text-[13px] leading-relaxed text-[var(--gold-body)]">
            O navegador está bloqueando o armazenamento local (janela anônima ou
            cookies desativados). Você pode estudar normalmente, mas o progresso
            não vai ser guardado ao fechar a aba.
          </p>
        </Card>
      )}
    </>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* No telefone o topo carrega a marca e a conta; a navegação fica
          embaixo, sob o polegar. Num desktop o cabeçalho some inteiro: a
          sidebar navy já carrega marca, navegação e perfil, e uma segunda
          barra em cima seria a mesma informação duas vezes. */}
      <header className="lg:hidden sticky top-0 z-30 border-b border-[color:var(--line-soft)]
                         bg-[color-mix(in_srgb,var(--cream)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          <Link href="/meu-hebraico" className="flex items-center min-w-0 min-h-[44px] -ml-1 pl-1 pr-2 rounded-md">
            <Logo size={30} />
          </Link>
          <div className="flex items-center gap-4">
            {p.ready && <XPIndicator xp={p.state.xp} />}
            <ProfileLink />
          </div>
        </div>
      </header>

      <div className="flex-1 w-full mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-7 lg:py-8">
        {/* O quadro do design: sidebar e conteúdo dentro de um cartão só, com
            canto de 24px e a sombra padrão. Abaixo de lg ele se desfaz - num
            telefone, uma moldura de cartão em volta da tela inteira é só
            perda de largura. */}
        <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:rounded-[24px]
                        lg:bg-[var(--card)] lg:border lg:border-line lg:shadow-[var(--sh)]
                        lg:overflow-hidden">
          <Sidebar pathname={pathname} />
          <main className="min-w-0 py-6 sm:py-8 lg:px-9 lg:py-[34px] pb-[92px] lg:pb-10">
            {avisos}
            {children}
          </main>
        </div>
      </div>

      <BottomBar pathname={pathname} />

      {p.pending.length > 0 && (
        <AchievementToast ids={p.pending.map(a => a.id)} onClose={p.clearPending} />
      )}
    </div>
  );
}

/* ── a mesa: a coluna navy ──────────────────────────────────────────────
   248px, fundo navy, do topo ao pé do quadro. O item ativo é um retângulo
   de branco a 12% com o ícone em teal claro - e não uma cor de texto só,
   que num fundo escuro quase não se vê.

   No rodapé, o que vem depois: um aluno que não sabe que existe um A1 não
   compra um A1. */
function Sidebar({ pathname }: { pathname: string | null }) {
  const p = useProgress();
  const proximo = allCourses().find(c => !isPlayable(c));

  return (
    <aside className="hidden lg:flex flex-col gap-[26px] bg-[var(--navy)] px-[18px] py-[26px]">
      <Link href="/meu-hebraico" className="flex items-center gap-2.5 px-2 rounded-md">
        <span aria-hidden className="w-8 h-8 rounded-[9px] bg-white/[.12] grid place-items-center shrink-0">
          <span style={{ fontSize: 16, marginTop: -2, lineHeight: 1 }}>
            <He size="inline" tone="lite" className="leading-none">ע</He>
          </span>
        </span>
        <span className="font-display font-semibold text-[16px] tracking-[-0.02em] text-white">
          Hebraico Fluente
        </span>
      </Link>

      <nav aria-label="Navegação principal">
        <ul className="grid gap-[3px]">
          {NAV.map(item => {
            const active = isActive(pathname, item.href);
            const Icone = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-[11px] rounded-[11px] px-3 py-2.5
                    font-ui text-[15px] transition-colors
                    ${active
                      ? 'bg-white/[.12] text-white font-semibold'
                      : 'text-white/[.66] font-medium hover:bg-white/[.06]'}`}
                >
                  <Icone className={active ? 'text-[var(--teal-lite)]' : 'text-white/[.55]'} />
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/revisao' && p.dueCount > 0 && (
                    <span className="rounded-full bg-[var(--gold)] px-[7px] py-[2px]
                                     font-ui text-[11.5px] font-bold text-white tabular-nums">
                      {p.dueCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-1" />

      {proximo && (
        <div className="rounded-[14px] bg-white/[.07] p-4">
          <p className="font-ui text-[13px] text-white/60 mb-1.5">Próximo nível</p>
          <p className="font-ui text-[15px] font-semibold text-white mb-1">{proximo.titlePt}</p>
          <p className="font-ui text-[13px] leading-[1.45] text-white/[.55]">
            Liberado quando você concluir a Alfabetização.
          </p>
        </div>
      )}

      <p className="font-ui text-[11.5px] leading-relaxed text-white/[.45] px-1">
        Nos exercícios, <Key dark>1</Key>-<Key dark>4</Key> respondem e <Key dark>Enter</Key> avança.
      </p>
    </aside>
  );
}

/* A porta do perfil, no topo, em todas as larguras.
 *
 * Uma inicial num círculo, e não um ícone genérico: é o único lugar da
 * plataforma que confirma, de relance, EM QUAL CONTA a pessoa está. Numa
 * casa com login isso não é enfeite - é a resposta para "será que comprei com
 * outro e-mail?", que é a dúvida que gera metade dos pedidos de suporte. */
function ProfileLink() {
  const account = useAccount();
  if (!account.ready || !account.signedIn) return null;
  const name = account.session!.account.name.trim();
  const initial = (name || account.session!.account.email)[0]!.toUpperCase();

  return (
    <Link
      href="/perfil"
      className="min-w-[44px] min-h-[44px] grid place-items-center rounded-full
                 hover:bg-surface-2 transition-colors"
      title={name || account.session!.account.email}
    >
      <span aria-hidden
            className="w-[30px] h-[30px] rounded-full bg-[var(--accent-wash)]
                       text-[var(--accent)] font-ui text-[13px] font-bold
                       grid place-items-center">
        {initial}
      </span>
      <span className="sr-only">Sua conta</span>
    </Link>
  );
}

export function Key({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <kbd className={`inline-block min-w-[18px] px-1.5 py-[1px] rounded-[5px] text-center font-ui text-[11px]
      ${dark ? 'border border-white/20 bg-white/10 text-white/70'
             : 'border border-line bg-[var(--card)] text-ink-body'}`}>
      {children}
    </kbd>
  );
}

/* ── the thumb ──────────────────────────────────────────────────────────── */
function BottomBar({ pathname }: { pathname: string | null }) {
  const p = useProgress();
  return (
    <nav
      aria-label="Navegação principal"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[color:var(--line-soft)]
                 bg-[color-mix(in_srgb,var(--paper)_94%,transparent)] backdrop-blur-md
                 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto w-full max-w-[680px] px-1 flex items-stretch justify-around">
        {NAV.slice(0, 5).map(item => {
          const active = isActive(pathname, item.href);
          const Icone = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative h-[60px] flex flex-col items-center justify-center gap-1.5
                  font-ui text-[10.5px] leading-none text-center px-0.5 transition-colors
                  ${active ? 'text-[var(--navy)] font-semibold' : 'text-ink-muted'}`}
              >
                <Icone size={19} />
                {item.label}
                {item.href === '/revisao' && p.dueCount > 0 && (
                  <span aria-hidden
                        className="absolute top-2 right-[24%] w-[7px] h-[7px] rounded-full bg-[var(--gold)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AchievementToast({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const first = ACHIEVEMENTS.find(a => a.id === ids[0]);
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);
  if (!first) return null;

  return (
    /* Under the header, not above the bottom bar. Anchored low it landed on
       top of the answer feedback and the Continuar button - the two things the
       learner is looking at when an achievement fires. */
    <div
      role="status"
      className="fixed top-[68px] left-1/2 -translate-x-1/2 z-40 w-[min(420px,calc(100vw-32px))]
                 animate-rise"
    >
      <Card tone="mint" className="p-4 shadow-[var(--shadow-2)] flex items-center gap-4">
        <span aria-hidden className="text-[var(--mint-ink)] text-[22px] leading-none">◆</span>
        <div className="min-w-0 flex-1">
          <p className="font-ui text-[11px] uppercase tracking-[.1em] text-[var(--mint-ink)]">
            Conquista desbloqueada
          </p>
          <p className="font-display text-[16px] font-semibold text-ink truncate">{first.titlePt}</p>
          {ids.length > 1 && (
            <p className="font-ui text-[12px] text-ink-muted">e mais {ids.length - 1}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">✕</Button>
      </Card>
    </div>
  );
}
