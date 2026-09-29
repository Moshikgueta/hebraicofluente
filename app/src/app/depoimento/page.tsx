import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { DepoimentoClient } from './DepoimentoClient';

/* O depoimento do aluno. Atrás do portão, como o curso: só quem tem o curso
   liberado escreve (ver worker/src/api/depoimentos.js). */
export const metadata: Metadata = meta({
  rota: '/depoimento',
  title: 'Seu depoimento - Hebraico Fluente',
  description: 'Conte como está sendo aprender a ler hebraico com o curso.'
});

export default function DepoimentoPage() { return <DepoimentoClient />; }
