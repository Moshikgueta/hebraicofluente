import type { Metadata } from 'next';
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
  return {
    title: `${c.titlePt} - Hebraico Fluente`,
    description: `${c.taglinePt} ${c.summaryPt}`.slice(0, 180)
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getCourse((await params).slug);
  if (!c) notFound();
  return <CourseClient slug={c.slug} />;
}
