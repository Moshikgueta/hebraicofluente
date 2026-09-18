import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthForm } from '@/components/platform/AuthForm';

export const metadata: Metadata = {
  title: 'Criar conta — Hebraico Fluente',
  description: 'Crie sua conta no Hebraico Fluente.'
};

export default function CriarContaPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
