'use client';

import { useActionState } from 'react';
import { enterAction, type EnterState } from '../actions';
import { Button, Field, inputClass } from '@/components/ui';

export function EnterForm({ slug, initialCode }: { slug: string; initialCode: string }) {
  const [state, action, pending] = useActionState<EnterState, FormData>(enterAction, { error: null });
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <Field label="Código do convite" htmlFor="codigo" hint="Está no link ou na mensagem que a agência enviou. Ex.: K7QM-2XPA-9DTR" error={state.error}>
        <input
          id="codigo"
          name="codigo"
          defaultValue={initialCode}
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          required
          className={`${inputClass} tabular text-center font-mono text-[1.15rem] tracking-[0.2em]`}
          aria-invalid={Boolean(state.error)}
        />
      </Field>
      <Button type="submit" block size="lg" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar na caravana'}
      </Button>
    </form>
  );
}
