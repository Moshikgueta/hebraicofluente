import { notFound } from 'next/navigation';
import { course } from '@/lib/content-publico';
import { conteudoPago } from '@/lib/content-servidor';
import { SomLessonClient } from './SomLessonClient';

/* As lições de som - Vet, Chaf, Fe, Tch, Dj, J. Rota própria, e não
   /licao/[id]: não são letras, não têm traçado para escrever, e as 22 letras
   continuam sendo as 22. Ver lib/sons.ts. */
export function generateStaticParams() {
  return course.modules.flatMap(m => m.lessons.filter(l => l.som).map(l => ({ id: l.som! })));
}

export const dynamicParams = false;

export default async function SomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const som = conteudoPago.extras.sons.find(s => s.id === id);
  if (!som) notFound();
  return <SomLessonClient som={som} />;
}
