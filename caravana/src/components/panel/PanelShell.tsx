// Moldura do painel: barra lateral em telas largas, cabecalho com menu no celular.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/entrar/actions';
import { IconBook, IconGrid, IconLayers, IconLogout, IconRoute, IconShield, IconUsers, IconCompass } from '../icons';
import { PlatformMark, Tag } from '../ui';
import { PanelNavLinks } from './PanelNavLinks';

export type PanelNavItem = { href: string; label: string; icon: 'grid' | 'route' | 'layers' | 'book' | 'users' | 'shield' | 'compass'; exact?: boolean };

const ICONS = { grid: IconGrid, route: IconRoute, layers: IconLayers, book: IconBook, users: IconUsers, shield: IconShield, compass: IconCompass };

export function PanelShell({
  title,
  subtitle,
  items,
  user,
  banner,
  children,
}: {
  title: string;
  subtitle: string;
  items: PanelNavItem[];
  user: string;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const links = items.map((i) => ({ ...i, iconNode: (() => { const I = ICONS[i.icon]; return <I size={20} />; })() }));
  return (
    <div className="min-h-dvh bg-[#f6f2ea] lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-stone-200 bg-paper lg:flex lg:min-h-dvh lg:flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <PlatformMark size={30} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-small font-semibold text-ink">{title}</p>
            <p className="truncate text-micro text-stone-600">{subtitle}</p>
          </div>
        </div>
        <nav aria-label="Painel" className="flex-1 px-3">
          <PanelNavLinks items={links} />
        </nav>
        <div className="border-t border-stone-200 px-5 py-4 text-small">
          <p className="truncate text-stone-600">{user}</p>
          <form action={logoutAction}>
            <button type="submit" className="mt-2 inline-flex items-center gap-1.5 font-semibold text-ink-soft hover:text-ink">
              <IconLogout size={18} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-paper/95 backdrop-blur lg:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <PlatformMark size={28} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-small font-semibold">{title}</p>
              <p className="truncate text-micro text-stone-600">{subtitle}</p>
            </div>
            <details className="group relative">
              <summary className="list-none rounded-full px-3 py-1.5 text-small font-semibold ring-1 ring-stone-300 [&::-webkit-details-marker]:hidden">Menu</summary>
              <div className="absolute right-0 top-11 w-64 rounded-md bg-paper-raised p-2 shadow-float ring-1 ring-stone-200">
                <PanelNavLinks items={links} />
                <form action={logoutAction} className="border-t border-stone-200 p-2">
                  <button type="submit" className="inline-flex items-center gap-1.5 text-small font-semibold text-ink-soft">
                    <IconLogout size={18} /> Sair
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>
        {banner}
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="border-b border-ochre/30 bg-ochre-soft/60 px-4 py-2.5 text-small text-[#6b4510] sm:px-6 lg:px-10">
      <Tag tone="ochre" className="mr-2">
        Demonstração
      </Tag>
      Painel somente leitura da fictícia Agência Exemplo. Os números vêm de viajantes fictícios; nada que você fizer aqui é salvo.
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-micro font-semibold uppercase tracking-[0.14em] text-stone-600">{eyebrow}</div>}
        <h1 className="font-display text-display-m font-medium tracking-[-0.01em] sm:text-display-l">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-small text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-small font-semibold text-stone-600 hover:text-ink">
      ← {children}
    </Link>
  );
}
