import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConfirmarEmail } from '@/components/platform/ConfirmarEmail';
import { tx } from '@/i18n/telas/conta-confirmar-email';

export const metadata: Metadata = {
  title: tx.metaTitulo,
  description: tx.metaDescricao,
  /* Como /nova-senha: a URL carrega um token e só funciona vinda do e-mail.
     Um resultado de busca para ela levaria a uma tela sem sentido. */
  robots: { index: false, follow: false }
};

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmarEmail />
    </Suspense>
  );
}
