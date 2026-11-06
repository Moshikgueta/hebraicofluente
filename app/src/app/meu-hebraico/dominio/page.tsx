import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/painel-paginas';
import { DominioClient } from './DominioClient';

export const metadata: Metadata = meta({
  rota: '/meu-hebraico/dominio',
  title: tx.dominioTitulo,
  description: tx.dominioDescricao
});

export default function DominioPage() { return <DominioClient />; }
