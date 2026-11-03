import { asc, count, eq } from 'drizzle-orm';
import { Flash } from '@/components/panel/Flash';
import { PageHeader } from '@/components/panel/PanelShell';
import { Button, Tag } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { activities, activityQuestions } from '@/lib/db/schema';
import { withScope } from '@/lib/db/tenant';
import { EDITORIAL } from '@/lib/labels';
import { activityStatusAction } from '../actions';

export const metadata = { title: 'Atividades' };

export default async function AdminActivities({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requirePlatform();
  const rows = await withScope({ kind: 'platform', userId: staff.userId }, (tx) =>
    tx
      .select({ a: activities, n: count(activityQuestions.id) })
      .from(activities)
      .leftJoin(activityQuestions, eq(activityQuestions.activityId, activities.id))
      .groupBy(activities.id)
      .orderBy(asc(activities.slug)),
  );
  return (
    <div className="space-y-6">
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title="Atividades da biblioteca" description="Só atividades aprovadas entram nas caravanas de agências reais. As perguntas ficam em content/activities.ts e são carregadas pelo comando de carga." />
      <ul className="divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
        {rows.map(({ a, n }) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{a.title}</span>
              <span className="block text-micro text-stone-600">
                {a.slug} · {n} perguntas · recurso {a.feature}
              </span>
            </span>
            <Tag tone={EDITORIAL[a.status]?.tone}>{EDITORIAL[a.status]?.label}</Tag>
            <form action={activityStatusAction} className="flex gap-1.5">
              <input type="hidden" name="activityId" value={a.id} />
              {a.status !== 'approved' && (
                <Button type="submit" name="status" value="approved" size="sm" variant="secondary">
                  Aprovar
                </Button>
              )}
              {a.status !== 'in_review' && (
                <Button type="submit" name="status" value="in_review" size="sm" variant="quiet">
                  Em revisão
                </Button>
              )}
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
