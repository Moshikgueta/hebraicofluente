import Link from 'next/link';
import { Flash } from '@/components/panel/Flash';
import { SelectField, TextField } from '@/components/panel/forms';
import { PageHeader } from '@/components/panel/PanelShell';
import { Button, Card, Tag } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { withScope } from '@/lib/db/tenant';
import { listAgencies } from '@/lib/domain/platform';
import { PLAN_LABEL } from '@/lib/labels';
import { PlanOptions } from '@/components/panel/PlanOptions';
import { createAgencyAction } from '../actions';

export const metadata = { title: 'Agências' };

export default async function AgenciesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requirePlatform();
  const list = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => listAgencies(tx));
  return (
    <div className="space-y-8">
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title="Agências e contratos" description="Cada agência é um espaço isolado. O contrato define o plano padrão, as vagas por caravana e o teto de caravanas ativas." />
      <div className="overflow-x-auto rounded-md bg-paper-raised ring-1 ring-stone-200">
        <table className="w-full min-w-[44rem] text-left text-small">
          <thead className="border-b border-stone-200 text-micro uppercase tracking-[0.1em] text-stone-600">
            <tr>
              <th className="px-4 py-3">Agência</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3 text-right">Caravanas</th>
              <th className="px-4 py-3 text-right">Vagas</th>
              <th className="px-4 py-3 text-right">Convites ativos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {list.map(({ a, caravans, seats, invites }) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/agencias/${a.id}`} className="font-semibold hover:underline">
                    {a.name}
                  </Link>
                  <span className="ml-2 inline-flex gap-1">
                    {a.isDemo && <Tag tone="ochre">Demonstração</Tag>}
                    {a.status !== 'active' && <Tag tone="danger">{a.status === 'suspended' ? 'Suspensa' : 'Arquivada'}</Tag>}
                  </span>
                </td>
                <td className="px-4 py-3">{PLAN_LABEL[a.defaultPlanId]}</td>
                <td className="tabular px-4 py-3 text-right">
                  {caravans}/{a.maxActiveCaravans}
                </td>
                <td className="tabular px-4 py-3 text-right">{seats}</td>
                <td className="tabular px-4 py-3 text-right">{invites}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="max-w-2xl p-5">
        <h2 className="font-display text-title font-medium">Nova agência</h2>
        <form action={createAgencyAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" name="name" required maxLength={120} className="sm:col-span-2" />
          <TextField label="E-mail de contato" name="contactEmail" type="email" maxLength={200} className="sm:col-span-2" />
          <SelectField label="Plano padrão" name="planId" defaultValue="completa">
            <PlanOptions />
          </SelectField>
          <TextField label="Vagas por caravana" name="defaultSeatLimit" type="number" min={1} max={5000} defaultValue={50} required />
          <TextField label="Caravanas ativas (teto)" name="maxActiveCaravans" type="number" min={1} max={500} defaultValue={5} required />
          <div className="sm:col-span-2">
            <Button type="submit">Criar agência</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
