import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { meta } from '@/lib/seo';
import { LUGARES_COM_PAGINA } from '@/lib/raizes';
import { LugarClient } from './LugarClient';

export function generateStaticParams() {
  return LUGARES_COM_PAGINA.map(id => ({ id }));
}
export const dynamicParams = false;

export const metadata: Metadata = meta({
  rota: '/raizes/lugar',
  title: 'Um lugar - Raízes Sefarditas',
  description: 'A história de um lugar no Atlas de Raízes Sefarditas.'
});

export default async function LugarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!LUGARES_COM_PAGINA.includes(id)) notFound();
  return <LugarClient id={id} />;
}
