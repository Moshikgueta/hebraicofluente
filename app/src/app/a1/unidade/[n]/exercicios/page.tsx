import { notFound } from 'next/navigation';
import { UNIDADES_A1 } from '@/lib/a1';
import { ExerciciosA1Client } from './ExerciciosA1Client';

export function generateStaticParams() {
  return UNIDADES_A1.map(n => ({ n: String(n) }));
}
export const dynamicParams = false;

export default async function ExerciciosA1Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  if (!UNIDADES_A1.includes(Number(n))) notFound();
  return <ExerciciosA1Client n={Number(n)} />;
}
