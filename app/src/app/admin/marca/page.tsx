import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { MarcaClient } from './MarcaClient';

/* De qual conta saiu uma cópia do curso. Fora de busca como todo /admin
   (NAO_LISTADAS em lib/seo.ts e seo.mjs; o Worker manda `noindex`). Nada
   no HTML: a resposta vem de /api/admin/marca, que confere a conta. */
export const metadata: Metadata = meta({
  rota: '/admin/marca',
  title: 'Identificar uma cópia - Hebraico Fluente',
  description: 'Painel do dono do curso para saber de qual conta saiu uma cópia do conteúdo.'
});

export default function MarcaPage() { return <MarcaClient />; }
