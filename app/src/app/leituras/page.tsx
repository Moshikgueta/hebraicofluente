import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-leituras-client';
import { LeiturasClient } from './LeiturasClient';

export const metadata: Metadata = meta({
  rota: '/leituras',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function LeiturasPage() { return <LeiturasClient />; }
