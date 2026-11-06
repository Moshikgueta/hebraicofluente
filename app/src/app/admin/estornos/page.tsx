import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { EstornosClient } from './EstornosClient';

/* Os estornos que dependem do dono: fora de busca como todo /admin; a lista
   vem de /api/admin/estornos, que confere a conta e o código. */
export const metadata: Metadata = meta({
  rota: '/admin/estornos',
  title: 'Estornos - Hebraico Fluente',
  description: 'Painel do dono do curso para marcar as devoluções feitas por fora.'
});

export default function EstornosPage() { return <EstornosClient />; }
