'use client';

// Navegacao do viajante: barra inferior no celular (alcance do polegar) e
// abas no topo a partir de telas largas. O item ativo vem do endereco.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconCompass, IconHome, IconInfo, IconLetter, IconPassport, IconRoute } from '../icons';
import { cx } from '../ui';

const ICONS = { home: IconHome, route: IconRoute, compass: IconCompass, letter: IconLetter, passport: IconPassport, info: IconInfo };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean };

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação da viagem" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-paper-raised/95 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = isActive(pathname, item);
          const Icon = ICONS[item.icon];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex min-h-[3.6rem] flex-col items-center justify-center gap-0.5 pt-2 text-[0.7rem] font-semibold tracking-wide',
                  active ? 'text-brand-text' : 'text-stone-600',
                )}
              >
                {active && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-brand" aria-hidden />}
                <Icon size={23} strokeWidth={active ? 1.9 : 1.6} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopTabs({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação da viagem" className="hidden lg:block">
      <ul className="flex gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cx('rounded-full px-3.5 py-2 text-small font-semibold transition', active ? 'bg-brand-tint text-brand-text' : 'text-ink-soft hover:bg-stone-100')}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
