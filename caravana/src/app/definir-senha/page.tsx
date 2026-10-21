import type { Metadata } from 'next';
import { Notice, Wordmark } from '@/components/ui';
import { SetPasswordForm } from '../entrar/LoginForm';

export const metadata: Metadata = { title: 'Definir senha', robots: { index: false }, referrer: 'no-referrer' };

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
      <Wordmark />
      <h1 className="mt-10 font-display text-display-m font-medium">Defina a sua senha</h1>
      <p className="mt-1 text-small text-stone-600">O link vale uma vez e vence em 3 dias.</p>
      <div className="mt-6">{token ? <SetPasswordForm token={token.slice(0, 100)} /> : <Notice tone="danger">Link incompleto. Abra o link exatamente como recebeu.</Notice>}</div>
    </main>
  );
}
