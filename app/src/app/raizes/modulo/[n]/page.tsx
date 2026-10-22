import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { meta } from '@/lib/seo';
import { MODULOS_COM_CONTEUDO } from '@/lib/raizes';
import { ModuloRaizesClient } from './ModuloRaizesClient';

export function generateStaticParams() {
  return MODULOS_COM_CONTEUDO.map(n => ({ n: String(n) }));
}
export const dynamicParams = false;

export const metadata: Metadata = meta({
  rota: '/raizes/modulo',
  title: 'Raízes Sefarditas - Hebraico Fluente',
  description: 'Um módulo de Raízes Sefarditas.'
});

export default async function ModuloRaizesPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  if (!MODULOS_COM_CONTEUDO.includes(Number(n))) notFound();
  return <ModuloRaizesClient n={Number(n)} />;
}
