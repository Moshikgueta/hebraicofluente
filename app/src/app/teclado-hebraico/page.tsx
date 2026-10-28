import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-teclado-client';
import { TecladoClient } from './TecladoClient';

export const metadata: Metadata = meta({
  rota: '/teclado-hebraico',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function TecladoPage() { return <TecladoClient />; }
