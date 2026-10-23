import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { BibliotecaClient } from './BibliotecaClient';

export const metadata: Metadata = meta({
  rota: '/minha-biblioteca',
  title: 'Minha Biblioteca - Hebraico Fluente',
  description: 'Os cursos e as experiências da sua conta, num lugar só.'
});

export default function MinhaBibliotecaPage() { return <BibliotecaClient />; }
