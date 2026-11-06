import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-leitura-client';
import { LeituraClient } from './LeituraClient';

export const metadata: Metadata = meta({
  rota: '/leitura',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function LeituraPage() { return <LeituraClient />; }
