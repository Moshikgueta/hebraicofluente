import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { EstatisticasClient } from './EstatisticasClient';

/* Onde os alunos erram e onde param. Fora de busca como todo /admin; os
   números vêm de /api/admin/estatisticas, que confere a conta. */
export const metadata: Metadata = meta({
  rota: '/admin/estatisticas',
  title: 'Estatísticas - Hebraico Fluente',
  description: 'Painel do dono do curso: onde os alunos erram e em que lição param.'
});

export default function EstatisticasPage() { return <EstatisticasClient />; }
