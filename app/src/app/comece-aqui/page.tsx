import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { ComeceAquiClient } from './ComeceAquiClient';

/* "Comece aqui" (24/10/2026, decisão do dono): o destino do link da bio do
   Instagram (hebraicofluente.com.br/bio, worker.js). Fora da busca e do
   sitemap (NAO_LISTADAS em lib/seo.ts): é uma porta de quem já chegou. */
export const metadata: Metadata = meta({
  rota: '/comece-aqui',
  title: 'Comece aqui - Hebraico Fluente',
  description:
    'Ler hebraico do zero ou conhecer Israel por dentro: escolha por onde começar, com um teste ' +
    'grátis e uma prévia sem cadastro.'
});

export default function ComeceAquiPage() {
  return <ComeceAquiClient />;
}
