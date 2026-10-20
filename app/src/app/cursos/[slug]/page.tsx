import type { Metadata } from 'next';
import { meta, resumo } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { allCourses, getCourse } from '@/lib/catalog';
import { CourseClient } from './CourseClient';

/* Uma rota por curso do catálogo, geradas do próprio catálogo. Acrescentar um
   curso em data/courses.json cria a página dele - nenhum arquivo a escrever. */
export function generateStaticParams() {
  return allCourses().map(c => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const c = getCourse((await params).slug);
  if (!c) return { title: 'Curso não encontrado - Hebraico Fluente' };
  return meta({
    rota: `/cursos/${c.slug}`,
    title: `${c.titlePt}: curso online - Hebraico Fluente`,
    /* Frases inteiras até ~155 caracteres. O `.slice(0, 180)` de antes
       cortava no meio da palavra ("na ordem em que elas re"). */
    description: resumo([c.taglinePt, c.summaryPt])
  });
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c) notFound();
  return <CourseClient slug={c.slug} />;
}
