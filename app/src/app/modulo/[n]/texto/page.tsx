import { notFound } from 'next/navigation';
import { course, getModule } from '@/lib/content-publico';
import { TextoClient } from './TextoClient';

/* O mini-texto do módulo. Como a missão, mora debaixo de /modulo, que o
   portão tranca pelo prefixo, e o conteúdo vem de /api/content. A página
   existe para todo módulo; a que não tem texto aprovado diz isso. */
export function generateStaticParams() {
  return course.modules.map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function TextoPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) notFound();
  return <TextoClient module={mod} />;
}
