import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { FamiliaClient } from './FamiliaClient';

export const metadata: Metadata = meta({
  rota: '/raizes/familia',
  title: 'Minha história - Raízes Sefarditas',
  description: 'A árvore da família, com o tipo de evidência de cada dado, guardada só no seu aparelho.'
});

export default function FamiliaPage() {
  return <FamiliaClient />;
}
