import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { CursosClient } from './CursosClient';

export const metadata: Metadata = meta({
  rota: '/cursos',
  title: 'Cursos de hebraico online para brasileiros - Hebraico Fluente',
  description:
    'Alfabetização em hebraico para brasileiros, do zero: disponível hoje. ' +
    'A1, A2 e B1 em produção, vendidos à parte na mesma conta.'
});

export default function CursosPage() { return <CursosClient />; }
