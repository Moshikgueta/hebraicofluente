import { notFound } from 'next/navigation';
import { Flash } from '@/components/panel/Flash';
import { SelectField, TextField } from '@/components/panel/forms';
import { BackLink, PageHeader } from '@/components/panel/PanelShell';
import { Button, Card, Notice, Tag } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { formatRange } from '@/lib/dates';
import { withScope } from '@/lib/db/tenant';
import { agencyDetail } from '@/lib/domain/platform';
import { PLAN_LABEL, ROLE_LABEL, STATUS } from '@/lib/labels';
import { caravanContractAction, updateContractAction } from '../../actions';
import { AgencyUserForm } from './AgencyUserForm';
import { PlanOptions } from '@/components/panel/PlanOptions';

export default async function AgencyDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const staff = await requirePlatform();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => agencyDetail(tx, id));
  if (!d) notFound();
  const { ag, cars, team } = d;
  return (
    <div className="space-y-10">
      <BackLink href="/admin/agencias">Agências</BackLink>
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title={ag.name} eyebrow={ag.isDemo ? 'Agência de demonstração' : `Agência · ${ag.slug}`} />
      {ag.isDemo && <Notice tone="ochre">A agência de demonstração é recriada pelo comando de carga (npm run db:seed) e não tem contrato editável.</Notice>}

      <Card className="max-w-2xl p-5">
        <h2 className="font-display text-title font-medium">Contrato</h2>
        <form action={updateContractAction} className="mt-4">
          <input type="hidden" name="agencyId" value={ag.id} />
          <fieldset disabled={ag.isDemo} className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Plano padrão das caravanas novas" name="planId" defaultValue={ag.defaultPlanId}>
              <PlanOptions />
            </SelectField>
            <SelectField label="Situação" name="status" defaultValue={ag.status}>
              <option value="active">Ativa</option>
              <option value="suspended">Suspensa</option>
              <option value="archived">Arquivada</option>
            </SelectField>
            <TextField label="Vagas por caravana nova" name="defaultSeatLimit" type="number" min={1} max={5000} defaultValue={ag.defaultSeatLimit} required />
            <TextField label="Teto de caravanas ativas" name="maxActiveCaravans" type="number" min={1} max={500} defaultValue={ag.maxActiveCaravans} required />
            <div className="sm:col-span-2">
              <Button type="submit">Salvar contrato</Button>
            </div>
          </fieldset>
        </form>
      </Card>

      <section>
        <h2 className="font-display text-title font-medium">Caravanas</h2>
        <p className="mt-1 text-small text-stone-600">Plano e vagas de cada caravana. Baixar as vagas abaixo dos convites já criados não apaga convites: só impede novos.</p>
        {cars.length === 0 ? (
          <p className="mt-3 text-small text-stone-600">Nenhuma caravana.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {cars.map(({ c, invites }) => (
              <li key={c.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {c.name} <Tag tone={STATUS[c.status]?.tone}>{STATUS[c.status]?.label}</Tag>
                    </p>
                    <p className="text-micro text-stone-600">
                      {formatRange(c.startDate, c.endDate)} · {invites} convites ativos
                    </p>
                  </div>
                  <form action={caravanContractAction} className="mt-3 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="agencyId" value={ag.id} />
                    <input type="hidden" name="caravanId" value={c.id} />
                    <SelectField label="Plano" name="planId" id={`p-${c.id}`} defaultValue={c.planId}>
                      <PlanOptions />
                    </SelectField>
                    <TextField label="Vagas" name="seatLimit" id={`s-${c.id}`} type="number" min={0} max={5000} defaultValue={c.seatLimit} className="w-28" />
                    <Button type="submit" size="sm" variant="secondary">
                      Salvar
                    </Button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-2xl">
        <h2 className="font-display text-title font-medium">Equipe</h2>
        <ul className="mt-3 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
          {team.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-small">
              <span>
                <span className="font-semibold">{t.name}</span> <span className="text-stone-600">{t.email}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Tag>{ROLE_LABEL[t.role]}</Tag>
                {!t.hasPassword && <Tag tone="warning">Senha não definida</Tag>}
              </span>
            </li>
          ))}
          {team.length === 0 && <li className="px-4 py-3 text-small text-stone-600">Ninguém ainda.</li>}
        </ul>
        {!ag.isDemo && (
          <Card className="mt-4 p-5">
            <h3 className="font-semibold">Dar acesso a alguém da agência</h3>
            <p className="mt-1 text-micro text-stone-600">Gera um link de definir senha, válido por 3 dias. Nenhuma senha passa por você.</p>
            <div className="mt-4">
              <AgencyUserForm agencyId={ag.id} />
            </div>
            <p className="mt-3 text-micro text-stone-600">
              Papéis: Leitura vê tudo; Editor monta roteiro, conteúdo e convites; Administrador também publica e cuida da identidade; Responsável é o contato do contrato.
            </p>
          </Card>
        )}
        <p className="mt-3 text-micro text-stone-600">Plano atual: {PLAN_LABEL[ag.defaultPlanId]}.</p>
      </section>
    </div>
  );
}
