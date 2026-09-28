import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SairDaLista } from './SairDaLista';

export const metadata: Metadata = {
  title: 'Sair da lista - Hebraico Fluente',
  description: 'Pare de receber o aviso do próximo curso.',
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
