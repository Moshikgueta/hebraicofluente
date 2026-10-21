import { redirect } from 'next/navigation';

export default async function CaravanIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/painel/caravanas/${id}/geral`);
}
