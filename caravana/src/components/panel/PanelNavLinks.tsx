'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cx } from '../ui';

export function PanelNavLinks({ items }: { items: { href: string; label: string; exact?: boolean; iconNode: ReactNode }[] }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {items.map((i) => {
        const active = i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`);
        return (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={active ? 'page' : undefined}
              className={cx('flex items-center gap-2.5 rounded-sm px-3 py-2 text-small font-semibold transition', active ? 'bg-sand text-ink' : 'text-ink-soft hover:bg-stone-100')}
            >
              <span className={active ? 'text-sea' : 'text-stone-500'}>{i.iconNode}</span>
              {i.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
