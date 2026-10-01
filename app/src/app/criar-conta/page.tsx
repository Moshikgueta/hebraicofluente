import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { AuthForm } from '@/components/platform/AuthForm';

export const metadata: Metadata = meta({
  rota: '/criar-conta',
  title: 'Criar conta - Hebraico Fluente',
  description:
    'Crie sua conta no Hebraico Fluente.'
});

export default function CriarContaPage() {
  /* Sem Suspense: o AuthForm lê `?next=` depois de montar, e o HTML
     exportado já traz o formulário (auditoria de 01/10/2026, PERF-003). */
  return <AuthForm mode="signup" />;
}
