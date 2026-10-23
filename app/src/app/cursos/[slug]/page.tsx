import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { allProducts, getCourse, tipoDe } from '@/lib/catalog';
import { CourseClient } from './CourseClient';
import { LivroClient } from './LivroClient';
import { ProdutoClient } from './ProdutoClient';

/* Uma rota por curso do catálogo, geradas do próprio catálogo. Acrescentar um
   curso em data/courses.json cria a página dele - nenhum arquivo a escrever. */
export function generateStaticParams() {
  return allProducts().map(c => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const c = getCourse((await params).slug);
  if (!c) return { title: 'Curso não encontrado - Hebraico Fluente' };
  return meta({
    rota: `/cursos/${c.slug}`,
    title: `${c.titlePt} - Hebraico Fluente`,
    description: `${c.taglinePt} ${c.summaryPt}`.slice(0, 180)
  });
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c) notFound();
  /* O e-book e o pacote têm página própria: capítulos e formato, não módulos.
     O livro tem a página de venda completa (LivroClient, 23/10/2026), que só é
     gerada quando ele estiver à venda (`aVenda` em data/courses.json). */
  const tipo = tipoDe(c);
  if (tipo === 'curso') return <CourseClient slug={c.slug} />;
  return tipo === 'livro' ? <LivroClient slug={c.slug} /> : <ProdutoClient slug={c.slug} />;
}
