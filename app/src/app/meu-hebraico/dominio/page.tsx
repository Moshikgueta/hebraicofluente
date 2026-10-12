import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { DominioClient } from './DominioClient';

export const metadata: Metadata = meta({
  rota: '/meu-hebraico/dominio',
  title: 'Meu domínio das letras - Hebraico Fluente',
  description: 'As letras que você já domina, as que estão quase e o que vale praticar agora.'
});

export default function DominioPage() { return <DominioClient />; }
