import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { AuthForm } from '@/components/platform/AuthForm';

export const metadata: Metadata = meta({
  rota: '/entrar',
  title: 'Entrar - Hebraico Fluente',
  description:
    'Entre na sua conta e continue de onde parou.'
});

export default function EntrarPage() {
  /* Sem Suspense: o AuthForm lê `?next=` depois de montar, e o HTML
     exportado já traz o formulário (auditoria de 01/10/2026, PERF-003). */
  return <AuthForm mode="signin" />;
}
