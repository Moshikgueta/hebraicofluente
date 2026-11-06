import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { RaizesHomeClient } from './RaizesHomeClient';

/* Raízes Sefarditas (21/10/2026): a casa do percurso. Rota paga de OUTRO
   produto (worker/src/gate.js, `cursoDaRota`); o conteúdo chega por
   /api/content/raizes dentro do CourseGate. */
export const metadata: Metadata = meta({
  rota: '/raizes',
  title: 'Raízes Sefarditas - Hebraico Fluente',
  description: 'Uma viagem interativa pela história, memória e herança dos judeus de Portugal e Espanha.'
});

export default function RaizesPage() {
  return <RaizesHomeClient />;
}
