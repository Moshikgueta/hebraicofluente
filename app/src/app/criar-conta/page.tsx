import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { AuthForm } from '@/components/platform/AuthForm';
import { tx } from '@/i18n/telas/conta-auth-form';

export const metadata: Metadata = meta({
  rota: '/criar-conta',
  title: tx.metaCriarTitulo,
  description: tx.metaCriarDescricao
});

export default function CriarContaPage() {
  /* Sem Suspense: o AuthForm lê `?next=` depois de montar, e o HTML
     exportado já traz o formulário (auditoria de 01/10/2026, PERF-003). */
  return <AuthForm mode="signup" />;
}
