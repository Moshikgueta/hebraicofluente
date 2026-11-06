import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { GlossarioClient } from './GlossarioClient';

export const metadata: Metadata = meta({
  rota: '/raizes/glossario',
  title: 'Glossário - Raízes Sefarditas',
  description: 'Os termos da história sefardita, com fonte.'
});

export default function Pagina() {
  return <GlossarioClient />;
}
