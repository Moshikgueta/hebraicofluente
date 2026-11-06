import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-hebraico-na-rua';
import { RuaClient } from './RuaClient';

/* O Hebraico na rua (28/10/2026): placas de verdade com palavras do curso.
   Atrás do portão (GATED em worker/src/gate.js e PAGAS em lib/seo.ts). */
export const metadata: Metadata = meta({
  rota: '/hebraico-na-rua',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function HebraicoNaRuaPage() {
  return <RuaClient />;
}
