'use client';

import { useActionState } from 'react';
import { CopyButton } from '@/components/panel/CopyButton';
import { SelectField, TextField } from '@/components/panel/forms';
import { Button, Notice } from '@/components/ui';
import { ROLE_LABEL } from '@/lib/labels';
import { createAgencyUserAction, type UserLinkState } from '../../actions';

export function AgencyUserForm({ agencyId }: { agencyId: string }) {
  const [state, action, pending] = useActionState<UserLinkState, FormData>(createAgencyUserAction, { error: null, link: null, email: null });
  return (
    <div>
      {state.link && (
        <div className="mb-5 rounded-md bg-success-soft p-4 text-small ring-1 ring-success/30" role="status">
          <p className="font-semibold text-success">Link para {state.email} definir a senha (vale uma vez, por 3 dias)</p>
          <p className="mt-1 break-all text-ink">{state.link}</p>
          <p className="mt-1 text-micro text-ink-soft">Envie por um canal seguro. Ele não fica guardado em lugar nenhum; se perder, gere outro.</p>
          <div className="mt-2">
            <CopyButton text={state.link} label="Copiar link" />
          </div>
        </div>
      )}
      {state.error && (
        <Notice tone="danger" className="mb-5">
          {state.error}
        </Notice>
      )}
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="agencyId" value={agencyId} />
        <TextField label="Nome" name="name" required maxLength={120} id="u-name" />
        <TextField label="E-mail" name="email" type="email" required maxLength={200} id="u-email" />
        <SelectField label="Papel" name="role" defaultValue="admin" id="u-role">
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </SelectField>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            {pending ? 'Gerando…' : 'Gerar link de acesso'}
          </Button>
        </div>
      </form>
    </div>
  );
}
