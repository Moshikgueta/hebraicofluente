import Link from 'next/link';
import { PageHeader } from '@/components/panel/PanelShell';
import { Flash } from '@/components/panel/Flash';
import { EmptyState, LinkButton, Tag } from '@/components/ui';
import { requireAgency } from '@/lib/auth/next';
import { roleAtLeast } from '@/lib/auth/sessions';
import { formatRange } from '@/lib/dates';
import { withScope } from '@/lib/db/tenant';
import { listCaravans } from '@/lib/domain/agency';
import { STATUS } from '@/lib/labels';

export const metadata = { title: 'Caravanas' };

export default async function CaravansPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requireAgency('viewer');
  const list = await withScope({ kind: 'agency', agencyId: staff.agencyId, userId: staff.userId }, (tx) => listCaravans(tx));
  const canEdit = roleAtLeast(staff.role, 'editor');
  return (
    <div>
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title="Caravanas" description="Cada caravana tem o próprio roteiro, a própria identidade visual e os próprios convites." actions={canEdit ? <LinkButton href="/painel/caravanas/nova">Nova caravana</LinkButton> : undefined} />
      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Nenhuma caravana ainda" action={canEdit ? <LinkButton href="/painel/caravanas/nova">Criar a primeira</LinkButton> : undefined}>
            Comece pelas informações gerais; o roteiro e o conteúdo vêm depois, em etapas.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md bg-paper-raised ring-1 ring-stone-200">
          <table className="w-full min-w-[40rem] text-left text-small">
            <thead className="border-b border-stone-200 text-micro uppercase tracking-[0.1em] text-stone-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Caravana</th>
                <th className="px-4 py-3 font-semibold">Datas</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
                <th className="px-4 py-3 text-right font-semibold">Convites</th>
                <th className="px-4 py-3 text-right font-semibold">Entraram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-stone-100/50">
                  <td className="px-4 py-3">
                    <Link href={`/painel/caravanas/${c.id}`} className="font-semibold text-ink hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatRange(c.startDate, c.endDate)}</td>
                  <td className="px-4 py-3">
                    <Tag tone={STATUS[c.status]?.tone}>{STATUS[c.status]?.label}</Tag>
                  </td>
                  <td className="tabular px-4 py-3 text-right">
                    {c.invites}/{c.seatLimit}
                  </td>
                  <td className="tabular px-4 py-3 text-right">{c.activeTravelers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
