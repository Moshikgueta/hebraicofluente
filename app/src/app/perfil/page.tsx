import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { PerfilClient } from './PerfilClient';
import { tx } from '@/i18n/telas/conta-perfil';

export const metadata: Metadata = meta({
  rota: '/perfil',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function PerfilPage() { return <PerfilClient />; }
