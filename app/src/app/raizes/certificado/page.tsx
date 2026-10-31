import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { CertificadoRaizesClient } from './CertificadoRaizesClient';

export const metadata: Metadata = meta({
  rota: '/raizes/certificado',
  title: 'Certificado - Raízes Sefarditas',
  description: 'O certificado de conclusão do percurso Raízes Sefarditas.'
});

export default function CertificadoRaizesPage() {
  return <CertificadoRaizesClient />;
}
