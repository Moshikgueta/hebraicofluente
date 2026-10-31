import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { VendasClient } from './VendasClient';

/* Quem comprou: fora de busca como todo /admin; a lista vem de
   /api/admin/vendas, que confere a conta e o código. */
export const metadata: Metadata = meta({
  rota: '/admin/vendas',
  title: 'Vendas - Hebraico Fluente',
  description: 'Painel do dono do curso com as compras e o link de onde cada uma veio.'
});

export default function VendasPage() { return <VendasClient />; }
