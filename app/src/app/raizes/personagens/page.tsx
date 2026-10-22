import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { PersonagensClient } from './PersonagensClient';

export const metadata: Metadata = meta({
  rota: '/raizes/personagens',
  title: 'Personagens - Raízes Sefarditas',
  description: 'Pessoas reais da história sefardita, com fonte em cada frase.'
});

export default function Pagina() {
  return <PersonagensClient />;
}
