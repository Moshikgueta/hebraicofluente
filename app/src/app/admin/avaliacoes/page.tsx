import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { AvaliacoesClient } from './AvaliacoesClient';

/* "Como foi esta lição?": fora de busca como todo /admin; o resumo vem de
   /api/admin/avaliacoes, que confere a conta e o código. */
export const metadata: Metadata = meta({
  rota: '/admin/avaliacoes',
  title: 'Avaliações das lições - Hebraico Fluente',
  description: 'Painel do dono do curso com o que os alunos acharam de cada lição.'
});

export default function AvaliacoesPage() { return <AvaliacoesClient />; }
