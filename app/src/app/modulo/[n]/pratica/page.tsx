import { notFound } from 'next/navigation';
import { course, getModule } from '@/lib/content-publico';
import { PraticaClient } from './PraticaClient';

/* A lição de prática de cada módulo (3, 7, 10, 13, 23 e 27). Mora debaixo
   de /modulo, que o portão tranca pelo prefixo, e o conteúdo vem de
   /api/content como o resto do curso. Ver lib/engine/pratica.ts. */
export function generateStaticParams() {
  return course.modules.filter(m => m.lessons.some(l => l.kind === 'practice')).map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function PraticaPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod || !mod.lessons.some(l => l.kind === 'practice')) notFound();
  return <PraticaClient module={mod} />;
}
