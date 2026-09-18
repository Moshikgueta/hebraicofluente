import { notFound } from 'next/navigation';
import { course, getModule, lettersOfModule } from '@/lib/content';
import { ModuleClient } from './ModuleClient';

export function generateStaticParams() {
  return course.modules.map(m => ({ n: String(m.n) }));
}
export const dynamicParams = false;

export default async function ModulePage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) notFound();
  return <ModuleClient module={mod} letters={lettersOfModule(mod.n)} />;
}
