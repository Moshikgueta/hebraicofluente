import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { BuscaClient } from './BuscaClient';

export const metadata: Metadata = meta({
  rota: '/raizes/busca',
  title: 'Buscar - Raízes Sefarditas',
  description: 'Lugares, personagens, artefatos, termos e fontes de Raízes Sefarditas.'
});

export default function Pagina() {
  return <BuscaClient />;
}
