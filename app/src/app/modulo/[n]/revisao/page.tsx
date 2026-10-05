import { notFound } from 'next/navigation';
import { course, getModule } from '@/lib/content-publico';
import { TextoClient } from '../texto/TextoClient';

/* A leitura de revisão do módulo (05/10/2026): um texto curto só com as
   palavras que o aluno já acumulou nas lições. Mesma página do texto do
   módulo, debaixo de /modulo, que o portão tranca pelo prefixo. */
export function generateStaticParams() {
  return course.modules.map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function RevisaoPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) notFound();
  return <TextoClient module={mod} revisao />;
}
