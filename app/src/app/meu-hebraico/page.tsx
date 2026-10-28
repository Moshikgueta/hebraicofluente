import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/painel-paginas';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = meta({
  rota: '/meu-hebraico',
  title: tx.meuHebraicoTitulo,
  description: tx.meuHebraicoDescricao
});

export default function MeuHebraicoPage() { return <DashboardClient />; }
