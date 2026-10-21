import { Button } from '../ui';
import { TextArea, TextField } from './forms';

type Values = { name: string; description: string | null; startDate: string; endDate: string; organizerName: string | null };

export function GeneralForm({
  action,
  values,
  caravanId,
  disabled,
  submitLabel,
}: {
  action: (form: FormData) => Promise<void>;
  values?: Values;
  caravanId?: string;
  disabled: boolean;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl">
      {caravanId && <input type="hidden" name="caravanId" value={caravanId} />}
      <fieldset disabled={disabled} className="space-y-5">
        <TextField label="Nome da caravana" name="name" defaultValue={values?.name} required maxLength={120} placeholder="Caravana Terra Santa, maio de 2027" id="f-name" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Data de início" name="startDate" type="date" defaultValue={values?.startDate} required id="f-start" />
          <TextField label="Data de fim" name="endDate" type="date" defaultValue={values?.endDate} required id="f-end" hint="Até 60 dias. O roteiro aceita um dia para cada dia da viagem." />
        </div>
        <TextField label="Organizador" name="organizerName" defaultValue={values?.organizerName ?? ''} maxLength={120} placeholder="Ex.: Equipe da agência, nome do líder do grupo" id="f-org" hint="Aparece como assinatura da mensagem de boas-vindas." />
        <TextArea label="Descrição" name="description" defaultValue={values?.description ?? ''} maxLength={600} rows={3} hint="Uma ou duas frases sobre a viagem." />
        <Button type="submit">{submitLabel}</Button>
      </fieldset>
    </form>
  );
}
