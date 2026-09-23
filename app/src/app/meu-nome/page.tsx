import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { MeuNomeClient } from './MeuNomeClient';

export const metadata: Metadata = meta({
  rota: '/meu-nome',
  title: 'Meu nome em hebraico - Hebraico Fluente',
  description: 'Escreva o seu nome em hebraico, em letra impressa e à mão.'
});

export default function MeuNomePage() { return <MeuNomeClient />; }
