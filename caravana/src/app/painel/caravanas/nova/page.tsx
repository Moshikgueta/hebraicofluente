import { Flash } from '@/components/panel/Flash';
import { GeneralForm } from '@/components/panel/GeneralForm';
import { BackLink, PageHeader } from '@/components/panel/PanelShell';
import { requireAgency } from '@/lib/auth/next';
import { roleAtLeast } from '@/lib/auth/sessions';
import { createCaravanAction } from '../actions';

export const metadata = { title: 'Nova caravana' };

export default async function NewCaravan({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requireAgency('viewer');
  return (
    <div>
      <BackLink href="/painel/caravanas">Caravanas</BackLink>
      <div className="mt-3">
        <PageHeader eyebrow="Etapa 1 de 8" title="Nova caravana" description="Comece pelo básico. Plano e vagas vêm do contrato da agência; o roteiro, o conteúdo e os convites vêm nas próximas etapas." />
      </div>
      <div className="mt-8">
        <Flash ok={q.ok} erro={q.erro} />
        <GeneralForm action={createCaravanAction} disabled={!roleAtLeast(staff.role, 'editor')} submitLabel="Criar e seguir para o roteiro" />
      </div>
    </div>
  );
}
