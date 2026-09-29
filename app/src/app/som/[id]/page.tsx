import { notFound } from 'next/navigation';
import { course } from '@/lib/content-publico';
import { conteudoPago } from '@/lib/content-servidor';
import { SomLessonClient } from './SomLessonClient';
import { ContrasteClient } from './ContrasteClient';
import { CONTRASTE } from '@/lib/sons';

/* As lições de som - Sin, Vet, Chaf, Fe, Tch, Dj, J - e a lição 20, a do
   contraste dos três pares. Rota própria, e não
   /licao/[id]: não são letras, não têm traçado para escrever, e as 22 letras
   continuam sendo as 22. Ver lib/sons.ts. */
export function generateStaticParams() {
  return course.modules.flatMap(m => m.lessons.filter(l => l.som).map(l => ({ id: l.som! })));
}

export const dynamicParams = false;

export default async function SomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  /* A lição 20: os três pares do módulo 5 juntos, com os dados das três
     lições de som (ver ContrasteClient). */
  if (id === CONTRASTE) {
    const ls = course.modules.flatMap(m => m.lessons.map(l => ({ m, l }))).find(x => x.l.som === CONTRASTE)!;
    const { extras } = conteudoPago;
    return <ContrasteClient sons={extras.sons.filter(s => s.tipo === 'daguesh' && s.modulo === ls.m.n)}
                            dagesh={extras.dagesh} modulo={ls.m.n} licao={ls.l.n} />;
  }
  const som = conteudoPago.extras.sons.find(s => s.id === id);
  if (!som) notFound();
  return <SomLessonClient som={som} />;
}
