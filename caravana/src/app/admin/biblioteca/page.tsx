import Link from 'next/link';
import { and, asc, eq } from 'drizzle-orm';
import { REGION_LABEL } from '@content/destinations';
import { PageHeader } from '@/components/panel/PanelShell';
import { He, Tag } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { culturalContents, destinations } from '@/lib/db/schema';
import { withScope } from '@/lib/db/tenant';
import { EDITORIAL } from '@/lib/labels';

export const metadata = { title: 'Biblioteca' };

export default async function AdminLibrary() {
  const staff = await requirePlatform();
  const rows = await withScope({ kind: 'platform', userId: staff.userId }, (tx) =>
    tx
      .select({ d: destinations, c: culturalContents })
      .from(destinations)
      .leftJoin(culturalContents, and(eq(culturalContents.destinationId, destinations.id), eq(culturalContents.locale, 'pt-BR')))
      .orderBy(asc(destinations.region), asc(destinations.namePt)),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca cultural"
        description="Uma edição aqui cria uma revisão nova e volta o texto para revisão. Caravanas publicadas continuam com a versão que publicaram; a agência é avisada de que há versão nova."
      />
      <ul className="divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
        {rows.map(({ d, c }) => {
          const st = c?.editorialStatus ?? d.status;
          return (
            <li key={d.id}>
              <Link href={`/admin/biblioteca/${d.slug}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-stone-100/50">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{d.namePt}</span>
                  <span className="block text-micro text-stone-600">{REGION_LABEL[d.region as keyof typeof REGION_LABEL]}</span>
                </span>
                <Tag tone={EDITORIAL[st]?.tone}>{EDITORIAL[st]?.label}</Tag>
                {c && <Tag>rev. {c.revision}</Tag>}
                <He display className="text-[1.1rem] text-stone-700">
                  {d.nameHe}
                </He>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
