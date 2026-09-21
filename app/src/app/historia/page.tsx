import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { HistoriaClient } from './HistoriaClient';

export const metadata: Metadata = meta({
  rota: '/historia',
  title: 'Viagem pela história do hebraico - Hebraico Fluente',
  description:
    'De onde vem o alfabeto, de onde vieram os pontinhos, e como uma língua voltou a ser falada.'
});

export default function HistoriaPage() { return <HistoriaClient />; }
