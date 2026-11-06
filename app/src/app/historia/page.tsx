import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/painel-paginas';
import { HistoriaClient } from './HistoriaClient';

export const metadata: Metadata = meta({
  rota: '/historia',
  title: tx.historiaTitulo,
  description: tx.historiaDescricao
});

export default function HistoriaPage() { return <HistoriaClient />; }
