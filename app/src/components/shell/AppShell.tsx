'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useProgress } from '@/lib/state/store';
import { XPIndicator } from '@/components/game/Game';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { He } from '@/components/hebrew/He';

const NAV = [
  { href: '/', label: 'Hoje', icon: '◉' },
  { href: '/mapa', label: 'Mapa', icon: '◎' },
  { href: '/revisao', label: 'Revisão', icon: '↻' },
  { href: '/conquistas', label: 'Conquistas', icon: '◆' }
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready, persistent, remember, pending, clearPending } = useProgress();
  const pathname = usePathname();

  useEffect(() => { if (pathname) remember(pathname); }, [pathname, remember]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[color:var(--line-soft)]
                         bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-[880px] px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          {/* Even the logo mark goes through <He>. An exception here is how a
              contract stops being a contract. The 44px target is the tap area,
              not the text. */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 min-h-[44px] -ml-1 pl-1 pr-2 rounded-md">
            <span className="text-[var(--teal-band)]"><He size="inline">א</He></span>
            <span className="font-display text-[15px] font-bold text-ink truncate">Hebraico Fluente</span>
          </Link>
          {ready && <XPIndicator xp={state.xp} />}
        </div>
      </header>

      {!persistent && (
        <div className="mx-auto w-full max-w-[880px] px-4 sm:px-6 pt-4">
          <Card tone="amber" className="p-4">
            <p className="font-ui text-[13px] leading-relaxed text-ink-body">
              O navegador está bloqueando o armazenamento local (janela anônima ou
              cookies desativados). Você pode estudar normalmente, mas o progresso
              não vai ser guardado ao fechar a aba.
            </p>
          </Card>
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-[880px] px-4 sm:px-6 py-6 sm:py-10 pb-[92px] sm:pb-10">
        {children}
      </main>

      {/* Bottom bar on phones, where the thumb is; a quiet row on desktop. */}
      <nav
        aria-label="Navegação principal"
        className="fixed sm:static bottom-0 inset-x-0 z-30 border-t border-[color:var(--line-soft)]
                   bg-[color-mix(in_srgb,var(--paper)_94%,transparent)] backdrop-blur-md
                   pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto w-full max-w-[880px] px-2 sm:px-6 flex items-stretch justify-around sm:justify-start sm:gap-2">
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="flex-1 sm:flex-none">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`h-[60px] px-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2
                    font-ui text-[11px] sm:text-[13px] transition-colors
                    ${active ? 'text-[var(--teal-band)] font-semibold' : 'text-ink-muted hover:text-ink-body'}`}
                >
                  <span aria-hidden className="text-[15px] leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {pending.length > 0 && (
        <AchievementToast ids={pending.map(p => p.id)} onClose={clearPending} />
      )}
    </div>
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
