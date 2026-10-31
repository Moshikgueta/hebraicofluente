import { notFound } from 'next/navigation';
import { course, getModule } from '@/lib/content-publico';
import { PraticaClient } from './PraticaClient';

/* A prática focada de cada módulo: nos 1 a 4 é a lição de prática (3, 7,
   10 e 13); desde 05/10/2026 aberta também no 5, no 6 e no 7. Mora debaixo
   de /modulo, que o portão tranca pelo prefixo, e o conteúdo vem de
   /api/content como o resto do curso. Ver lib/engine/pratica.ts. */
export function generateStaticParams() {
  return course.modules.map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function PraticaPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) notFound();
  return <PraticaClient module={mod} />;
}
