import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { ColecaoClient } from './ColecaoClient';

export const metadata: Metadata = meta({
  rota: '/raizes/colecao',
  title: 'Minha coleção - Raízes Sefarditas',
  description: 'O que você guardou em Raízes Sefarditas.'
});

export default function Pagina() {
  return <ColecaoClient />;
}
