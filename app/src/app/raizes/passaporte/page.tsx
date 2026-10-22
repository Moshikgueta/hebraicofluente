import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { PassaporteClient } from './PassaporteClient';

export const metadata: Metadata = meta({
  rota: '/raizes/passaporte',
  title: 'Passaporte - Raízes Sefarditas',
  description: 'O que você explorou e estudou em Raízes Sefarditas.'
});

export default function Pagina() {
  return <PassaporteClient />;
}
