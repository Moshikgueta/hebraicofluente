import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Notice, Wordmark } from '@/components/ui';
import { getStaff } from '@/lib/auth/next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await getStaff();
  if (staff) redirect(staff.agencyId ? '/painel' : staff.isPlatformAdmin ? '/admin' : '/');
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
      <Link href="/" className="self-start">
        <Wordmark />
      </Link>
      <h1 className="mt-10 font-display text-display-m font-medium">Painel da agência</h1>
      <p className="mt-1 text-small text-stone-600">Para equipes de agências e da plataforma. Viajantes entram pelo link do convite.</p>
      <div className="mt-6 space-y-4">
        {q.saiu && <Notice tone="success">Você saiu.</Notice>}
        {q.senha && <Notice tone="success">Senha definida. Entre com ela agora.</Notice>}
        {q.erro === 'sem-agencia' && <Notice tone="warning">Sua conta não está ligada a nenhuma agência ativa.</Notice>}
        <LoginForm />
      </div>
      <p className="mt-8 text-small text-stone-600">
        Quer conhecer antes?{' '}
        <Link href="/demo" className="font-semibold text-sea underline-offset-2 hover:underline">
          Veja a demonstração
        </Link>
        .
      </p>
    </main>
  );
}
