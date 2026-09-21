import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { CertificadoClient } from './CertificadoClient';

export const metadata: Metadata = meta({
  rota: '/certificado',
  title: 'Certificado - Hebraico Fluente',
  description:
    'O certificado de conclusão do curso de alfabetização em hebraico.'
});

export default function CertificadoPage() { return <CertificadoClient />; }
