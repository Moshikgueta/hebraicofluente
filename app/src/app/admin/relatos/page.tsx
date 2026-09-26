import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { RelatosClient } from './RelatosClient';

/* Os relatos de erro dos alunos ("Achei um erro"). Como o painel de gravação:
   fora de busca, sem dado no HTML - tudo vem de /api/admin/relatos, que
   confere a conta de administrador. */
export const metadata: Metadata = meta({
  rota: '/admin/relatos',
  title: 'Relatos de erro - Hebraico Fluente',
  description: 'Painel do dono do curso com os erros apontados pelos alunos.'
});

export default function RelatosPage() { return <RelatosClient />; }
