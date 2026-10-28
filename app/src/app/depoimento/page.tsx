import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { tx } from '@/i18n/telas/painel-paginas';
import { DepoimentoClient } from './DepoimentoClient';

/* O depoimento do aluno. Atrás do portão, como o curso: só quem tem o curso
   liberado escreve (ver worker/src/api/depoimentos.js). */
export const metadata: Metadata = meta({
  rota: '/depoimento',
  title: tx.depoimentoTitulo,
  description: tx.depoimentoDescricao
});

export default function DepoimentoPage() { return <DepoimentoClient />; }
