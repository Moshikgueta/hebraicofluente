import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { BibliotecaClient } from './BibliotecaClient';

export const metadata: Metadata = meta({
  rota: '/raizes/biblioteca',
  title: 'Biblioteca - Raízes Sefarditas',
  description: 'As fontes, a matriz de verificação e o método de Raízes Sefarditas.'
});

export default function BibliotecaPage() {
  return <BibliotecaClient />;
}
