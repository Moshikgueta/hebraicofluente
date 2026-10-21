import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PanelShell } from '@/components/panel/PanelShell';
import { requirePlatform } from '@/lib/auth/next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: { default: 'Plataforma', template: '%s · Plataforma' }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const staff = await requirePlatform();
  return (
    <PanelShell
      title="Minha Caravana Digital"
      subtitle="Superadministração"
      user={staff.email}
      items={[
        { href: '/admin', label: 'Indicadores', icon: 'grid', exact: true },
        { href: '/admin/agencias', label: 'Agências e contratos', icon: 'users' },
        { href: '/admin/biblioteca', label: 'Biblioteca cultural', icon: 'book' },
        { href: '/admin/hebraico', label: 'Hebraico', icon: 'compass' },
        { href: '/admin/atividades', label: 'Atividades', icon: 'route' },
        { href: '/admin/planos', label: 'Planos', icon: 'layers' },
        { href: '/admin/auditoria', label: 'Auditoria', icon: 'shield' },
      ]}
    >
      {children}
    </PanelShell>
  );
}
