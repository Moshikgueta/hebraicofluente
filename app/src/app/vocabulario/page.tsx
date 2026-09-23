import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { VocabularioClient } from './VocabularioClient';

export const metadata: Metadata = meta({
  rota: '/vocabulario',
  title: 'Meu vocabulário - Hebraico Fluente',
  description: 'As palavras em hebraico que você já consegue ler com as letras que aprendeu.'
});

export default function VocabularioPage() { return <VocabularioClient />; }
