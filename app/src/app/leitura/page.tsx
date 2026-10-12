import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { LeituraClient } from './LeituraClient';

export const metadata: Metadata = meta({
  rota: '/leitura',
  title: 'Laboratório de Leitura - Hebraico Fluente',
  description: 'Ler palavras em hebraico com as letras que você já aprendeu, com mais ou menos ajuda.'
});

export default function LeituraPage() { return <LeituraClient />; }
