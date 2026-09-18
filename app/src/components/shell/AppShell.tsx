'use client';

/* The shell, in two shapes.
 * ─────────────────────────────────────────────────────────────────────────
 * Below 1024px the course is a single column with a bottom bar under the
 * thumb — the phone is where most of the studying happens, and that layout is
 * not a compromise.
 *
 * At 1024px and up it becomes a desk: a persistent sidebar carrying navigation
 * AND standing progress, and a content area wide enough to put things side by
 * side. That is the real argument for a desktop version — not more pixels for
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
import { XPIndicator, ProgressBar } from '@/components/game/Game';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { He } from '@/components/hebrew/He';
import { course } from '@/lib/content';
import { useAccount } from '@/lib/account/store';
import { DemoNotice } from '@/components/shell/DemoNotice';

/* "Hoje" é /meu-hebraico e não mais "/": desde que existe site público, a
   raiz é a página de vendas, e o painel do aluno tem endereço próprio. */
const NAV = [
  { href: '/meu-hebraico', label: 'Hoje', icon: '◉', desc: 'O que fazer agora' },
  { href: '/mapa', label: 'Mapa', icon: '◎', desc: 'O caminho inteiro' },
  { href: '/revisao', label: 'Revisão', icon: '↻', desc: 'O que deu trabalho' },
  /* The gym is a destination, not a feature buried in a screen: a learner who
     has finished the alphabet has nowhere else to go, and one who wants to
     drill only the vowels should not have to find the door. */
  { href: '/academia', label: 'Praticar', icon: '◈', desc: 'Treinar o que quiser' },
  { href: '/conquistas', label: 'Conquistas', icon: '◆', desc: 'Seus números' }
] as const;

/**
 * Is this nav item the page we are on?
 *
 * The export uses directory-style URLs (`trailingSlash: true`), so the browser
 * reports `/mapa/` while the link says `/mapa` — and a plain equality check
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

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[color:var(--line-soft)]
                         bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          {/* Even the logo mark goes through <He>. An exception here is how a
              contract stops being a contract. The 44px target is the tap area,
              not the text. */}
          <Link href="/meu-hebraico" className="flex items-center gap-2.5 min-w-0 min-h-[44px] -ml-1 pl-1 pr-2 rounded-md">
            <span className="text-[var(--teal-band)]"><He size="inline">א</He></span>
            <span className="font-display text-[15px] font-bold text-ink truncate">Hebraico Fluente</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            {p.ready && (
              <>
                <span className="hidden lg:inline font-ui text-[13px] text-ink-muted tabular-nums">
                  {p.mastered} / {course.totalLetters} letras
                </span>
                <XPIndicator xp={p.state.xp} />
              </>
            )}
            <ProfileLink />
          </div>
        </div>
      </header>

      <DemoNotice />

      {!p.persistent && (
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pt-4">
          <Card tone="amber" className="p-4">
            <p className="font-ui text-[13px] leading-relaxed text-ink-body">
              O navegador está bloqueando o armazenamento local (janela anônima ou
              cookies desativados). Você pode estudar normalmente, mas o progresso
              não vai ser guardado ao fechar a aba.
            </p>
          </Card>
        </div>
      )}

      <div className="flex-1 w-full mx-auto max-w-[1180px] px-4 sm:px-6 lg:flex lg:gap-10">
        <Sidebar pathname={pathname} />
        <main className="flex-1 min-w-0 py-6 sm:py-10 pb-[92px] lg:pb-14">
          {children}
        </main>
      </div>

      <BottomBar pathname={pathname} />

      {p.pending.length > 0 && (
        <AchievementToast ids={p.pending.map(a => a.id)} onClose={p.clearPending} />
      )}
    </div>
  );
}

/* ── the desk ───────────────────────────────────────────────────────────
   Sticky, so progress stays in view while the content scrolls. That is the
   point: at a desk you can see where you are without leaving the page. */
function Sidebar({ pathname }: { pathname: string | null }) {
  const p = useProgress();

  return (
    <aside className="hidden lg:block w-[250px] shrink-0 py-10">
      <div className="sticky top-[84px] grid gap-6">
        <nav aria-label="Navegação principal">
          <ul className="grid gap-1">
            {NAV.map(item => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-start gap-3 rounded-[var(--r-md)] px-3 py-2.5 transition-colors
                      ${active
                        ? 'bg-[var(--teal-wash)] text-[var(--teal-band)]'
                        : 'text-ink-body hover:bg-surface-2'}`}
                  >
                    <span aria-hidden className="text-[15px] leading-[1.45]">{item.icon}</span>
                    <span className="grid gap-0.5 min-w-0">
                      <span className={`font-ui text-[14px] ${active ? 'font-semibold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                      <span className="font-ui text-[11.5px] leading-snug text-ink-muted">
                        {item.desc}
                      </span>
                    </span>
                    {item.href === '/revisao' && p.dueCount > 0 && (
                      <span className="ml-auto mt-[3px] min-w-[20px] h-[20px] px-1.5 rounded-full
                                       bg-[var(--ember-wash)] text-[var(--ember)]
                                       font-ui text-[11px] font-bold grid place-items-center tabular-nums">
                        {p.dueCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {p.ready && p.state.onboarding && (
          <Card className="p-4 grid gap-4">
            <ProgressBar
              value={p.progress}
              label="Curso"
              sublabel={`${Math.round(p.progress * 100)}%`}
            />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
              {([
                ['Letras', `${p.mastered}/${course.totalLetters}`],
                ['Sequência', p.streak === 0 ? '—' : `${p.streak} d`],
                ['XP', p.state.xp.toLocaleString('pt-BR')],
                ['Conquistas', `${p.state.achievements.length}/${ACHIEVEMENTS.length}`]
              ] as const).map(([k, v]) => (
                <div key={k} className="grid gap-0.5">
                  <dt className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
                  <dd className="font-display text-[16px] font-bold text-ink tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        <p className="font-ui text-[11.5px] leading-relaxed text-ink-muted px-1">
          Nos exercícios, <Key>1</Key>–<Key>4</Key> respondem e <Key>Enter</Key> avança.
        </p>
      </div>
    </aside>
  );
}

/* A porta do perfil, no topo, em todas as larguras.
 *
 * Uma inicial num círculo, e não um ícone genérico: é o único lugar da
 * plataforma que confirma, de relance, EM QUAL CONTA a pessoa está. Numa
 * casa com login isso não é enfeite — é a resposta para "será que comprei com
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
            className="w-[30px] h-[30px] rounded-full bg-[var(--teal-wash)]
                       text-[var(--teal-band)] font-ui text-[13px] font-bold
                       grid place-items-center">
        {initial}
      </span>
      <span className="sr-only">Sua conta</span>
    </Link>
  );
}

export function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block min-w-[18px] px-1.5 py-[1px] rounded-[5px] text-center
                    border border-line bg-surface font-ui text-[11px] text-ink-body">
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
        {NAV.map(item => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative h-[60px] flex flex-col items-center justify-center gap-1
                  font-ui text-[10.5px] leading-none text-center px-0.5 transition-colors
                  ${active ? 'text-[var(--teal-band)] font-semibold' : 'text-ink-muted'}`}
              >
                <span aria-hidden className="text-[15px] leading-none">{item.icon}</span>
                {item.label}
                {item.href === '/revisao' && p.dueCount > 0 && (
                  <span aria-hidden
                        className="absolute top-2 right-[24%] w-[7px] h-[7px] rounded-full bg-[var(--ember)]" />
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
       top of the answer feedback and the Continuar button — the two things the
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
