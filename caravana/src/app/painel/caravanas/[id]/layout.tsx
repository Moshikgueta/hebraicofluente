import type { ReactNode } from 'react';
import { BackLink } from '@/components/panel/PanelShell';
import { Tag } from '@/components/ui';
import { formatRange } from '@/lib/dates';
import { PLAN_LABEL, STATUS } from '@/lib/labels';
import { getPanelCaravan } from '@/lib/panel-data';
import { StepNav } from './StepNav';

export default async function CaravanLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { car } = await getPanelCaravan(id);
  return (
    <div>
      <BackLink href="/painel/caravanas">Caravanas</BackLink>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="font-display text-display-m font-medium tracking-[-0.01em]">{car.name}</h1>
        <Tag tone={STATUS[car.status]?.tone}>{STATUS[car.status]?.label}</Tag>
      </div>
      <p className="mt-1 text-small text-stone-600">
        {formatRange(car.startDate, car.endDate)} · {PLAN_LABEL[car.planId] ?? car.planId} · {car.seatLimit} vagas contratadas
      </p>
      <div className="mt-6">
        <StepNav base={`/painel/caravanas/${car.id}`} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
