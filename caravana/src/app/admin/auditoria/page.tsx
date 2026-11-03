import { PageHeader } from '@/components/panel/PanelShell';
import { requirePlatform } from '@/lib/auth/next';
import { withScope } from '@/lib/db/tenant';
import { recentAudit } from '@/lib/domain/platform';
import { ACTION_LABEL } from '@/lib/labels';

export const metadata = { title: 'Auditoria' };

export default async function AdminAudit() {
  const staff = await requirePlatform();
  const rows = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => recentAudit(tx));
  return (
    <div className="space-y-6">
      <PageHeader title="Auditoria" description="Ações administrativas relevantes, de todas as agências. A trilha só cresce: o banco recusa alteração e exclusão." />
      <div className="overflow-x-auto rounded-md bg-paper-raised ring-1 ring-stone-200">
        <table className="w-full min-w-[42rem] text-left text-small">
          <thead className="border-b border-stone-200 text-micro uppercase tracking-[0.1em] text-stone-600">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Agência</th>
              <th className="px-4 py-3">Quem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rows.map(({ log, agency, actor }) => (
              <tr key={log.id}>
                <td className="tabular px-4 py-2.5 text-stone-600">{log.createdAt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })}</td>
                <td className="px-4 py-2.5">{ACTION_LABEL[log.action] ?? log.action}</td>
                <td className="px-4 py-2.5">{agency ?? 'Plataforma'}</td>
                <td className="px-4 py-2.5 text-stone-600">{actor ?? 'Sistema'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
