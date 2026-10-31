import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { BibliotecaClient } from './BibliotecaClient';
import { tx } from '@/i18n/telas/conta-biblioteca';

export const metadata: Metadata = meta({
  rota: '/minha-biblioteca',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function MinhaBibliotecaPage() { return <BibliotecaClient />; }
