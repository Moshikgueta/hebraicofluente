import { asc } from 'drizzle-orm';
import { FEATURE_LABEL } from '@content/plans';
import { Flash } from '@/components/panel/Flash';
import { TextField } from '@/components/panel/forms';
import { PageHeader } from '@/components/panel/PanelShell';
import { Button, Card, Notice } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { plans } from '@/lib/db/schema';
import { withScope } from '@/lib/db/tenant';
import { updatePlanAction } from '../actions';

export const metadata = { title: 'Planos' };

export default async function AdminPlans({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requirePlatform();
  const rows = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => tx.select().from(plans).orderBy(asc(plans.priceCents)));
  return (
    <div className="space-y-6">
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title="Planos" description="Preços de referência e recursos de cada plano. Os recursos decidem, no servidor, o que cada caravana publica." />
      <Notice>Não há cobrança integrada nesta etapa. A tabela serve para identificar o plano contratado, aplicar recursos e limites e preparar a integração de cobrança futura.</Notice>
      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((p) => (
          <Card key={p.id} className="p-5">
            <form action={updatePlanAction} className="space-y-4">
              <input type="hidden" name="planId" value={p.id} />
              <TextField label="Nome" name="name" id={`n-${p.id}`} defaultValue={p.name} required maxLength={80} />
              <TextField
                label={p.priceUnit === 'participant' ? 'Preço por participante (R$)' : `Preço por grupo de até ${p.groupSize} (R$)`}
                name="price"
                id={`p-${p.id}`}
                defaultValue={(p.priceCents / 100).toFixed(2).replace('.', ',')}
                inputMode="decimal"
                required
              />
              <label className="flex items-center gap-2 text-small">
                <input type="checkbox" name="isActive" defaultChecked={p.isActive} className="h-4 w-4 accent-[#1f4a6b]" /> Disponível para contratos novos
              </label>
              <ul className="space-y-1 text-small text-ink-soft">
                {p.features.map((f) => (
                  <li key={f}>· {FEATURE_LABEL[f] ?? f}</li>
                ))}
              </ul>
              <Button type="submit" size="sm">
                Salvar
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
