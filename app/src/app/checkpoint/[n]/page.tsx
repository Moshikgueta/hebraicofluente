import { notFound } from 'next/navigation';
import { course, getModule, lettersOfModule } from '@/lib/content';
import { CheckpointClient } from './CheckpointClient';

export function generateStaticParams() {
  return course.modules.filter(m => m.checkpoint).map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function CheckpointPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod?.checkpoint) notFound();
  return <CheckpointClient module={mod} letters={lettersOfModule(mod.n)} />;
}
