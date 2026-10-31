import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NovaSenha } from '@/components/platform/NovaSenha';
import { tx } from '@/i18n/telas/conta-nova-senha';

export const metadata: Metadata = {
  title: tx.metaTitulo,
  description: tx.metaDescricao,
  /* Esta URL carrega um token na query. Ela não pode ser indexada, e não
     porque o buscador leria o token - ele não o tem - mas porque um resultado
     de busca para "nova senha hebraico fluente" leva a uma tela que só
     funciona vinda do e-mail, e a pessoa conclui que o site está quebrado. */
  robots: { index: false, follow: false }
};

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={null}>
      <NovaSenha />
    </Suspense>
  );
}
