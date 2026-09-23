import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { TecladoClient } from './TecladoClient';

export const metadata: Metadata = meta({
  rota: '/teclado-hebraico',
  title: 'Teclado hebraico - Hebraico Fluente',
  description: 'Como adicionar o teclado hebraico no iPhone, no Android, no Windows e no Mac.'
});

export default function TecladoPage() { return <TecladoClient />; }
