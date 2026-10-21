import { Flash } from '@/components/panel/Flash';
import { GeneralForm } from '@/components/panel/GeneralForm';
import { Notice } from '@/components/ui';
import { getPanelCaravan } from '@/lib/panel-data';
import { updateGeneralAction } from '../../actions';

export default async function GeneralStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canEdit } = await getPanelCaravan(id);
  return (
    <div>
      <Flash ok={q.ok} erro={q.erro} />
      {car.status === 'published' && (
        <Notice tone="warning" className="mb-6 max-w-2xl" title="Esta caravana está publicada">
          Alterar as datas muda o calendário de todos os dias do roteiro. O viajante só vê a mudança quando você publicar de novo, e a tela de publicação mostra o que mudou antes.
        </Notice>
      )}
      <GeneralForm action={updateGeneralAction} caravanId={car.id} values={car} disabled={!canEdit} submitLabel="Salvar informações" />
    </div>
  );
}
