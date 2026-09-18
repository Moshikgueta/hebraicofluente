import { notFound } from 'next/navigation';
import { allLetters, getLetter } from '@/lib/content';
import { LessonClient } from './LessonClient';

/* Every lesson is prerendered: the content is known at build time and the only
   dynamic thing on the page is the learner's own state, which is client-side. */
export function generateStaticParams() {
  return allLetters().map(l => ({ letterId: l.id }));
}

export const dynamicParams = false;

export default async function LessonPage({ params }: { params: Promise<{ letterId: string }> }) {
  const { letterId } = await params;
  const letter = getLetter(letterId);
  if (!letter) notFound();
  return <LessonClient letter={letter} />;
}
