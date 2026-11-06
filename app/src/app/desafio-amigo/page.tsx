import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/desafio-amigo';
import { DesafioAmigoClient } from './DesafioAmigoClient';

/* O desafio com um amigo (28/10/2026): a página que o amigo abre, sem conta.
   Fora da busca e do sitemap (NAO_LISTADAS): cada link é de uma pessoa. As
   palavras chegam assinadas pelo servidor (worker/src/api/desafio.js). */
export const metadata: Metadata = meta({
  rota: '/desafio-amigo',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function DesafioAmigoPage() {
  return <DesafioAmigoClient />;
}
