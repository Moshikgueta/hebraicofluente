import Link from 'next/link';
import { PageHeader } from '@/components/panel/PanelShell';
import { IconChevronRight } from '@/components/icons';
import { Card, LinkButton, Notice, Stat, Tag } from '@/components/ui';
import { requireAgency } from '@/lib/auth/next';
import { roleAtLeast } from '@/lib/auth/sessions';
import { formatRange, todayIn } from '@/lib/dates';
import { withScope } from '@/lib/db/tenant';
import { dashboardMetrics, listCaravans } from '@/lib/domain/agency';
import { ACTION_LABEL, STATUS } from '@/lib/labels';

export const metadata = { title: 'Visão geral' };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function Dashboard() {
  const staff = await requireAgency('viewer');
  const today = todayIn('America/Sao_Paulo');
  const { m, list } = await withScope({ kind: 'agency', agencyId: staff.agencyId, userId: staff.userId }, async (tx) => ({
    m: await dashboardMetrics(tx, staff.agencyId, today),
    list: await listCaravans(tx),
  }));
  const next = list.filter((c) => c.status !== 'archived' && c.endDate >= today).slice(0, 4);
  const pct = m.engagedShare === null ? '·' : `${Math.round(m.engagedShare * 100)}%`;
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={staff.agencyName}
        title="Visão geral"
        description="Números da agência, contados no banco a partir dos convites e das atividades concluídas. Nenhum dado individual de viajante aparece aqui."
        actions={roleAtLeast(staff.role, 'editor') ? <LinkButton href="/painel/caravanas/nova">Nova caravana</LinkButton> : undefined}
      />
      {m.agency.isDemo && <Notice tone="ochre">Os números abaixo vêm de 18 viajantes fictícios criados para a demonstração.</Notice>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Caravanas em andamento" value={m.activeCaravans} hint={`${plural(m.upcomingCaravans, 'publicada por vir', 'publicadas por vir')} · ${m.draftCaravans} em rascunho`} />
        <Stat label="Viajantes com acesso" value={m.travelersWithAccess} hint={plural(m.invitesActive, 'convite ativo', 'convites ativos')} />
        <Stat label="Vagas contratadas" value={m.seatsContracted} hint={`${Math.max(0, m.seatsContracted - m.invitesActive)} ainda livres`} />
        <Stat label="Atividades concluídas" value={m.activitiesCompleted} hint={`${plural(m.badgesAwarded, 'selo', 'selos')} · ${plural(m.destinationsRead, 'leitura', 'leituras')}`} />
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <Stat label="Engajamento" value={pct} hint="Viajantes que concluíram ao menos uma atividade, entre os que já abriram o convite." />
        <Stat label="Limite de caravanas ativas" value={`${list.filter((c) => c.status !== 'archived').length} de ${m.agency.maxActiveCaravans}`} hint={`Plano padrão do contrato: ${m.agency.planId === 'completa' ? 'Experiência Completa' : m.agency.planId === 'essencial' ? 'Essencial' : 'White-label Premium'}`} />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        <section>
          <h2 className="font-display text-title font-medium">Próximas caravanas</h2>
          {next.length === 0 ? (
            <p className="mt-3 text-small text-stone-600">Nenhuma caravana por vir.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {next.map((c) => (
                <li key={c.id}>
                  <Link href={`/painel/caravanas/${c.id}`} className="block">
                    <Card className="flex items-center gap-4 px-4 py-3.5 hover:ring-stone-300">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{c.name}</p>
                        <p className="text-micro text-stone-600">{formatRange(c.startDate, c.endDate)}</p>
                      </div>
                      <div className="text-right">
                        <Tag tone={STATUS[c.status]?.tone}>{STATUS[c.status]?.label}</Tag>
                        <p className="tabular mt-1 text-micro text-stone-600">
                          {c.invites}/{c.seatLimit} vagas
                        </p>
                      </div>
                      <IconChevronRight size={18} className="text-stone-500" />
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="font-display text-title font-medium">Atividade recente da equipe</h2>
          {m.recent.length === 0 ? (
            <p className="mt-3 text-small text-stone-600">Nada registrado ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
              {m.recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-small">
                  <span>{ACTION_LABEL[r.action] ?? r.action}</span>
                  <time className="tabular text-micro text-stone-600">{r.createdAt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
