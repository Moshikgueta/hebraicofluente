import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/academia-meu-nome-client';
import { MeuNomeClient } from './MeuNomeClient';

export const metadata: Metadata = meta({
  rota: '/meu-nome',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

export default function MeuNomePage() { return <MeuNomeClient />; }
