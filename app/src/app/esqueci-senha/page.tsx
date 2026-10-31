import { Suspense } from 'react';
import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { EsqueciSenha } from '@/components/platform/EsqueciSenha';
import { tx } from '@/i18n/telas/conta-esqueci-senha';

export const metadata: Metadata = meta({
  rota: '/esqueci-senha',
  title: tx.metaTitulo,
  description: tx.metaDescricao
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
