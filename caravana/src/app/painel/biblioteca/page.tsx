import { and, asc, eq } from 'drizzle-orm';
import { REGION_LABEL } from '@content/destinations';
import { PageHeader } from '@/components/panel/PanelShell';
import { He, Tag } from '@/components/ui';
import { requireAgency } from '@/lib/auth/next';
import { culturalContents, destinations } from '@/lib/db/schema';
import { EDITORIAL } from '@/lib/labels';
import { agencyTx } from '@/lib/panel-data';

export const metadata = { title: 'Biblioteca cultural' };

export default async function LibraryPage() {
  const staff = await requireAgency('viewer');
  const rows = await agencyTx(staff, (tx) =>
    tx
      .select({ d: destinations, c: culturalContents })
      .from(destinations)
      .leftJoin(culturalContents, and(eq(culturalContents.destinationId, destinations.id), eq(culturalContents.locale, 'pt-BR')))
      .orderBy(asc(destinations.region), asc(destinations.namePt)),
  );
  return (
    <div>
      <PageHeader
        title="Biblioteca cultural"
        description="Conteúdo da Minha Caravana Digital, compartilhado entre todas as agências e revisado pela equipe editorial. Escolha o que entra em cada caravana na etapa Conteúdo cultural."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {rows.map(({ d, c }) => {
          const st = c?.editorialStatus ?? d.status;
          return (
            <article key={d.id} className="rounded-md bg-paper-raised p-4 ring-1 ring-stone-200">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-title font-medium">{d.namePt}</p>
                <He display className="text-[1.2rem] text-stone-700">
                  {d.nameHe}
                </He>
              </div>
              <p className="text-micro text-stone-600">
                {REGION_LABEL[d.region as keyof typeof REGION_LABEL]} · {d.transliteration}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Tag tone={EDITORIAL[st]?.tone}>{EDITORIAL[st]?.label}</Tag>
                {c && <Tag>revisão {c.revision}</Tag>}
                {c && <Tag>{c.references.length} referências</Tag>}
              </div>
              {c && <p className="mt-2 line-clamp-3 text-small text-ink-soft">{c.summary}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
