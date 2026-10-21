import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { REGION_LABEL } from '@content/destinations';
import { Flash } from '@/components/panel/Flash';
import { Button, He, Notice, Tag } from '@/components/ui';
import { caravanContents, culturalContents, destinations, stops } from '@/lib/db/schema';
import { EDITORIAL } from '@/lib/labels';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { setContentsAction } from '../../actions';

export default async function ContentStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canEdit, staff, plan } = await getPanelCaravan(id);
  const { all, chosen, fromStops } = await agencyTx(staff, async (tx) => ({
    all: await tx
      .select({ d: destinations, status: culturalContents.editorialStatus, revision: culturalContents.revision })
      .from(destinations)
      .leftJoin(culturalContents, and(eq(culturalContents.destinationId, destinations.id), eq(culturalContents.locale, 'pt-BR')))
      .orderBy(asc(destinations.namePt)),
    chosen: new Set((await tx.select({ id: caravanContents.destinationId }).from(caravanContents).where(eq(caravanContents.caravanId, id))).map((r) => r.id)),
    fromStops: new Set(
      (await tx.select({ id: stops.destinationId }).from(stops).where(and(eq(stops.caravanId, id), isNotNull(stops.destinationId)))).map((r) => r.id as string),
    ),
  }));
  const regions = Object.keys(REGION_LABEL) as (keyof typeof REGION_LABEL)[];
  const isDemo = staff.agencyIsDemo;
  return (
    <div className="max-w-3xl">
      <Flash ok={q.ok} erro={q.erro} />
      <p className="text-small text-ink-soft">
        Escolha os lugares da biblioteca que entram na caravana. Os destinos das paradas do roteiro já vêm marcados como sugestão. Uma caravana real só leva texto com revisão
        editorial aprovada; o que ainda estiver em revisão aparece para o viajante como &quot;em preparação&quot;.
      </p>
      {!plan.features.includes('culture') && (
        <Notice tone="warning" className="mt-4">
          O plano desta caravana não inclui conteúdo cultural: os destinos aparecem só com nome.
        </Notice>
      )}
      <form action={setContentsAction} className="mt-8">
        <input type="hidden" name="caravanId" value={car.id} />
        <fieldset disabled={!canEdit} className="space-y-8">
          {regions.map((r) => {
            const list = all.filter((a) => a.d.region === r);
            if (!list.length) return null;
            return (
              <section key={r}>
                <h2 className="font-display text-title font-medium">{REGION_LABEL[r]}</h2>
                <ul className="mt-3 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
                  {list.map(({ d, status, revision }) => {
                    const st = status ?? d.status;
                    const usable = st === 'approved' || (isDemo && st === 'in_review');
                    return (
                      <li key={d.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-stone-100/50">
                          <input type="checkbox" name="destinationId" value={d.id} defaultChecked={chosen.has(d.id)} className="h-4 w-4 accent-[#1f4a6b]" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-small font-semibold">{d.namePt}</span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              <Tag tone={EDITORIAL[st]?.tone}>{EDITORIAL[st]?.label}</Tag>
                              {revision && <span className="text-micro text-stone-600">revisão {revision}</span>}
                              {fromStops.has(d.id) && <Tag tone="brand">No roteiro</Tag>}
                              {!usable && <span className="text-micro text-stone-600">entra só com o nome</span>}
                            </span>
                          </span>
                          <He display className="text-[1.15rem] text-stone-700">
                            {d.nameHe}
                          </He>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          <Button type="submit">Salvar seleção</Button>
        </fieldset>
      </form>
    </div>
  );
}
