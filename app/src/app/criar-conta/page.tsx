import { Suspense } from 'react';
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
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
