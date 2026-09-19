import type { Metadata } from 'next';
import { PerfilClient } from './PerfilClient';

export const metadata: Metadata = {
  title: 'Sua conta - Hebraico Fluente',
  description: 'Seus dados, seus cursos, seu progresso e suas compras.'
};

export default function PerfilPage() { return <PerfilClient />; }
