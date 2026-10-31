import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { CursosClient } from './CursosClient';
import { tx } from '@/i18n/telas/venda-cursos';

export const metadata: Metadata = meta({
  rota: '/cursos',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function CursosPage() { return <CursosClient />; }
