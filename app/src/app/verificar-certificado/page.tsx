import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { VerificarClient } from './VerificarClient';

export const metadata: Metadata = meta({
  rota: '/verificar-certificado',
  title: 'Conferir um certificado - Hebraico Fluente',
  description: 'Confira se um certificado do curso Hebraico A1 foi emitido pelo Hebraico Fluente.'
});

/* A conferência pública de um certificado: o código, e o servidor responde
   com o nome, o curso e a data, se o certificado existe e está público. */
export default function VerificarCertificadoPage() {
  return <VerificarClient />;
}
