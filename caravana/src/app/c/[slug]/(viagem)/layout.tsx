import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { IconInfo } from '@/components/icons';
import { BottomNav, TopTabs, type NavItem } from '@/components/traveler/TripNav';
import { Tag } from '@/components/ui';
import { brandTheme } from '@/lib/theme';
import { getTrip } from '@/lib/trip';

export const dynamic = 'force-dynamic';

export default async function TripLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot, base } = await getTrip(slug);
  const f = snapshot.caravan.features;
  const items: NavItem[] = [
    { href: base, label: 'Início', icon: 'home', exact: true },
    { href: `${base}/roteiro`, label: 'Roteiro', icon: 'route' },
    { href: `${base}/descubra`, label: 'Descubra', icon: 'compass' },
  ];
  if (f.hebrew) items.push({ href: `${base}/hebraico`, label: 'Hebraico', icon: 'letter' });
  if (f.passport) items.push({ href: `${base}/passaporte`, label: 'Passaporte', icon: 'passport' });
  if (items.length < 5) items.push({ href: `${base}/informacoes`, label: 'Informações', icon: 'info' });

  return (
    <div style={brandTheme(snapshot.agency.primaryColor, snapshot.agency.secondaryColor) as CSSProperties} className="min-h-dvh pb-24 lg:pb-12">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-paper-raised focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href={base} className="flex min-w-0 items-center gap-2.5" aria-label={`${snapshot.agency.displayName}: início`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-brand font-display text-[0.95rem] font-semibold text-brand-ink" aria-hidden>
              {snapshot.agency.logoText}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-small font-semibold text-ink">{snapshot.agency.displayName}</span>
              <span className="block truncate text-micro text-stone-600">{snapshot.caravan.name}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {snapshot.agency.isDemo && <Tag tone="ochre">Demonstração</Tag>}
            <TopTabs items={items} />
            <Link href={`${base}/informacoes`} className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-stone-100" aria-label="Informações úteis">
              <IconInfo />
            </Link>
          </div>
        </div>
      </header>
      <main id="conteudo">{children}</main>
      <BottomNav items={items} />
    </div>
  );
}
