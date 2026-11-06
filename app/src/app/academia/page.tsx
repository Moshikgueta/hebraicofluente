import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-academia-client';
import { AcademiaClient } from './AcademiaClient';

export const metadata: Metadata = meta({
  rota: '/academia',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function AcademiaPage() { return <AcademiaClient />; }
