import { notFound } from 'next/navigation';
import { CHECKPOINTS_A1 } from '@/lib/a1';
import { CheckpointA1Client } from './CheckpointA1Client';

export function generateStaticParams() {
  return CHECKPOINTS_A1.map(n => ({ n: String(n) }));
}
export const dynamicParams = false;

export default async function CheckpointA1Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  if (!CHECKPOINTS_A1.includes(Number(n))) notFound();
  return <CheckpointA1Client n={Number(n)} />;
}
