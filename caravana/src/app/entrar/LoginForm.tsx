'use client';

import { useActionState } from 'react';
import { Button, Field, inputClass, Notice } from '@/components/ui';
import { loginAction, setPasswordAction, type FormState } from './actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, { error: null });
  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <Field label="E-mail" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Senha" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <Button type="submit" block size="lg" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(setPasswordAction, { error: null });
  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <input type="hidden" name="token" value={token} />
      <Field label="Nova senha" htmlFor="password" hint="Pelo menos 10 caracteres. Uma frase curta é mais fácil de lembrar e mais difícil de adivinhar.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </Field>
      <Field label="Repita a senha" htmlFor="confirm">
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </Field>
      <Button type="submit" block size="lg" disabled={pending}>
        {pending ? 'Salvando…' : 'Definir senha'}
      </Button>
    </form>
  );
}
