import { Suspense } from 'react';
import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { EsqueciSenha } from '@/components/platform/EsqueciSenha';

export const metadata: Metadata = meta({
  rota: '/esqueci-senha',
  title: 'Recuperar a senha - Hebraico Fluente',
  description:
    'Mandamos um link para você escolher uma senha nova.'
});

/* O Suspense é obrigatório, não decorativo: `useSearchParams` (que lê o
   ?email=) suspende durante a exportação estática, e sem esta fronteira o
   build inteiro falha em vez de pré-renderizar a casca. */
export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={null}>
      <EsqueciSenha />
    </Suspense>
  );
}
