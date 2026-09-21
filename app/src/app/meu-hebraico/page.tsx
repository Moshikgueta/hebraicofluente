import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = meta({
  rota: '/meu-hebraico',
  title: 'Meu Hebraico - Hebraico Fluente',
  description:
    'Seus cursos, seu progresso e a aula de hoje.'
});

export default function MeuHebraicoPage() { return <DashboardClient />; }
