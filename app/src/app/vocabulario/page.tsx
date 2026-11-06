import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-vocabulario-client';
import { VocabularioClient } from './VocabularioClient';

export const metadata: Metadata = meta({
  rota: '/vocabulario',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function VocabularioPage() { return <VocabularioClient />; }
