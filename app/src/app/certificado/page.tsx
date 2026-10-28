import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/painel-paginas';
import { CertificadoClient } from './CertificadoClient';

export const metadata: Metadata = meta({
  rota: '/certificado',
  title: tx.certificadoTitulo,
  description: tx.certificadoDescricao
});

export default function CertificadoPage() { return <CertificadoClient />; }
