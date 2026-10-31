import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SairDaLista } from './SairDaLista';
import { tx } from '@/i18n/telas/conta-sair-da-lista';

export const metadata: Metadata = {
  title: tx.metaTitulo,
  description: tx.metaDescricao,
  /* Só funciona vinda do link do e-mail, como /nova-senha. */
  robots: { index: false, follow: false }
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SairDaLista />
    </Suspense>
  );
}
