import { notFound } from 'next/navigation';
import { course, getModule } from '@/lib/content-publico';
import { MissaoClient } from './MissaoClient';

/* Uma missão por módulo. A rota mora debaixo de /modulo, que o portão já
   tranca pelo prefixo (worker/src/gate.js), e o conteúdo dela vem de
   /api/content como o resto do curso - aqui só o número do módulo. */
export function generateStaticParams() {
  return course.modules.map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function MissaoPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) notFound();
  return <MissaoClient module={mod} />;
}
