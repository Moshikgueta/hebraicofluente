import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthForm } from '@/components/platform/AuthForm';

export const metadata: Metadata = {
  title: 'Entrar — Hebraico Fluente',
  description: 'Entre na sua conta e continue de onde parou.'
};

/* O Suspense é obrigatório, não decorativo: `useSearchParams` (que lê o
   ?next=) suspende durante a exportação estática, e sem esta fronteira o
   build inteiro falha em vez de pré-renderizar a casca. */
export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
