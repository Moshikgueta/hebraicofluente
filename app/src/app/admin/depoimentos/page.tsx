import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { DepoimentosClient } from './DepoimentosClient';

/* Os depoimentos dos alunos, para o dono ler e aprovar. Fora de busca como
   todo /admin; nada no HTML: a lista vem de /api/admin/depoimentos, que
   confere a conta. */
export const metadata: Metadata = meta({
  rota: '/admin/depoimentos',
  title: 'Depoimentos - Hebraico Fluente',
  description: 'Painel do dono do curso para ler e aprovar os depoimentos dos alunos.'
});

export default function DepoimentosPage() { return <DepoimentosClient />; }
