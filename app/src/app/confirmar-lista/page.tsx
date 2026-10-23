import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConfirmarLista } from './ConfirmarLista';

export const metadata: Metadata = {
  title: 'Confirmar inscrição - Hebraico Fluente',
  description: 'Confirme que quer receber os e-mails que pediu.',
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
