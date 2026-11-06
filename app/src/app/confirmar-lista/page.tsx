import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConfirmarLista } from './ConfirmarLista';
import { tx } from '@/i18n/telas/conta-confirmar-lista';

export const metadata: Metadata = {
  title: tx.metaTitulo,
  description: tx.metaDescricao,
  /* Só funciona vinda do link do e-mail, como /sair-da-lista. */
  robots: { index: false, follow: false }
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ConfirmarLista />
    </Suspense>
  );
}
