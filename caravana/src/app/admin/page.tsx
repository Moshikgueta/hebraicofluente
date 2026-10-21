import { PageHeader } from '@/components/panel/PanelShell';
import { Stat } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { withScope } from '@/lib/db/tenant';
import { platformMetrics } from '@/lib/domain/platform';

export const metadata = { title: 'Indicadores' };

const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AdminHome() {
  const staff = await requirePlatform();
  const m = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => platformMetrics(tx));
  return (
    <div className="space-y-8">
      <PageHeader title="Indicadores" description="Agências reais apenas: a agência de demonstração fica fora de todas as contas." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Agências ativas" value={m.agencies} hint={`${m.suspended} suspensas`} />
        <Stat label="Caravanas publicadas" value={m.published} hint={`${m.drafts} em rascunho`} />
        <Stat label="Vagas contratadas" value={m.seats} hint="Soma das caravanas não arquivadas" />
        <Stat label="Viajantes que entraram" value={m.travelers} />
        <Stat label="Valor de referência contratado" value={brl(m.referenceCents)} hint="Estimativa pela tabela de preços; não é faturamento." className="col-span-2" />
      </div>
    </div>
  );
}
