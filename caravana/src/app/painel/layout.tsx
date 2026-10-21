import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DemoBanner, PanelShell } from '@/components/panel/PanelShell';
import { requireAgency } from '@/lib/auth/next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: { default: 'Painel', template: '%s · Painel' }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const staff = await requireAgency('viewer');
  return (
    <PanelShell
      title={staff.agencyName}
      subtitle="Painel da agência"
      user={staff.isDemo ? 'Visitante da demonstração' : staff.email}
      banner={staff.agencyIsDemo ? <DemoBanner /> : undefined}
      items={[
        { href: '/painel', label: 'Visão geral', icon: 'grid', exact: true },
        { href: '/painel/caravanas', label: 'Caravanas', icon: 'route' },
        { href: '/painel/marca', label: 'Identidade da agência', icon: 'layers' },
        { href: '/painel/biblioteca', label: 'Biblioteca cultural', icon: 'book' },
      ]}
    >
      {children}
    </PanelShell>
  );
}
