import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { PerfilClient } from './PerfilClient';

export const metadata: Metadata = meta({
  rota: '/perfil',
  title: 'Sua conta - Hebraico Fluente',
  description:
    'Seus dados, seus cursos, seu progresso e suas compras.'
});

export default function PerfilPage() { return <PerfilClient />; }
