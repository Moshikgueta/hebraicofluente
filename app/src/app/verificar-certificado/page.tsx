import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/painel-paginas';
import { VerificarClient } from './VerificarClient';

export const metadata: Metadata = meta({
  rota: '/verificar-certificado',
  title: tx.verificarTitulo,
  description: tx.verificarDescricao
});

/* A conferência pública de um certificado: o código, e o servidor responde
   com o nome, o curso e a data, se o certificado existe e está público. */
export default function VerificarCertificadoPage() {
  return <VerificarClient />;
}
