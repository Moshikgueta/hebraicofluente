import { eq } from 'drizzle-orm';
import { Flash } from '@/components/panel/Flash';
import { Button, Card, Tag } from '@/components/ui';
import { activities, caravanContents } from '@/lib/db/schema';
import { activityFeatureEnabled, effectiveFeatures, TOGGLES } from '@/lib/domain/features';
import { EDITORIAL, PLAN_LABEL } from '@/lib/labels';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { updateFeaturesAction } from '../../actions';

export default async function ActivitiesStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, plan, canEdit, staff } = await getPanelCaravan(id);
  const f = effectiveFeatures(car.features, plan.features);
  const { acts, chosen } = await agencyTx(staff, async (tx) => ({
    acts: await tx.select().from(activities),
    chosen: new Set((await tx.select({ id: caravanContents.destinationId }).from(caravanContents).where(eq(caravanContents.caravanId, id))).map((r) => r.id)),
  }));
  const isDemo = staff.agencyIsDemo;
  return (
    <div className="max-w-3xl">
      <Flash ok={q.ok} erro={q.erro} />
      <form action={updateFeaturesAction}>
        <input type="hidden" name="caravanId" value={car.id} />
        <fieldset disabled={!canEdit}>
          <ul className="space-y-3">
            {TOGGLES.map((t) => {
              const inPlan = plan.features.includes(t.planFeature);
              return (
                <li key={t.key}>
                  <Card className="flex items-start gap-3 p-4">
                    <input id={`ft-${t.key}`} type="checkbox" name={t.key} defaultChecked={f[t.key]} disabled={!inPlan} className="mt-1 h-4 w-4 accent-[#1f4a6b]" />
                    <label htmlFor={`ft-${t.key}`} className="min-w-0 flex-1">
                      <span className="block font-semibold">{t.label}</span>
                      <span className="block text-small text-stone-600">{t.hint}</span>
                      {!inPlan && <span className="mt-1 block text-micro font-semibold text-warning">Não incluído no plano {PLAN_LABEL[plan.id]}.</span>}
                    </label>
                  </Card>
                </li>
              );
            })}
          </ul>
          <Button type="submit" className="mt-5">
            Salvar atividades
          </Button>
        </fieldset>
      </form>

      <h2 className="mt-12 font-display text-title font-medium">O que entra na próxima publicação</h2>
      <p className="mt-1 text-small text-stone-600">Atividades da biblioteca ligadas aos destinos escolhidos, mais as gerais. Quizzes de destinos fora da seleção ficam de fora.</p>
      <ul className="mt-4 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
        {acts.map((a) => {
          const statusOk = a.status === 'approved' || (isDemo && a.status === 'in_review');
          const featureOk = activityFeatureEnabled(a.feature, f);
          const destOk = !a.destinationId || chosen.has(a.destinationId);
          const ok = statusOk && featureOk && destOk;
          return (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-small">
              <span className={ok ? 'font-semibold' : 'text-stone-600'}>{a.title}</span>
              <span className="flex items-center gap-1.5">
                <Tag tone={EDITORIAL[a.status]?.tone}>{EDITORIAL[a.status]?.label}</Tag>
                {ok ? <Tag tone="success">Entra</Tag> : <Tag>{!featureOk ? 'Recurso desligado' : !destOk ? 'Destino não escolhido' : 'Aguarda revisão'}</Tag>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
