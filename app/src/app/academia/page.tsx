import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { AcademiaClient } from './AcademiaClient';

export const metadata: Metadata = meta({
  rota: '/academia',
  title: 'Academia de Leitura - Hebraico Fluente',
  description:
    'Praticar letras, vogais, sílabas, palavras e escrita com o que você já aprendeu.'
});

export default function AcademiaPage() { return <AcademiaClient />; }
