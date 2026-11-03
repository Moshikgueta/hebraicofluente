import { and, desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Flash } from '@/components/panel/Flash';
import { TextArea, TextField } from '@/components/panel/forms';
import { BackLink, PageHeader } from '@/components/panel/PanelShell';
import { Button, Card, He, Notice, Tag } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { culturalContentRevisions, culturalContents, destinations } from '@/lib/db/schema';
import { withScope } from '@/lib/db/tenant';
import { serializeSections } from '@/lib/domain/editorial';
import { EDITORIAL } from '@/lib/labels';
import { editorialStatusAction, updateContentAction } from '../../actions';

export default async function EditDestination({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const q = await searchParams;
  const staff = await requirePlatform();
  const data = await withScope({ kind: 'platform', userId: staff.userId }, async (tx) => {
    const [d] = await tx.select().from(destinations).where(eq(destinations.slug, slug));
    if (!d) return null;
    const [c] = await tx.select().from(culturalContents).where(and(eq(culturalContents.destinationId, d.id), eq(culturalContents.locale, 'pt-BR')));
    const revs = c
      ? await tx.select({ revision: culturalContentRevisions.revision, at: culturalContentRevisions.createdAt }).from(culturalContentRevisions).where(eq(culturalContentRevisions.contentId, c.id)).orderBy(desc(culturalContentRevisions.revision)).limit(10)
      : [];
    return { d, c, revs };
  });
  if (!data) notFound();
  const { d, c, revs } = data;
  const st = c?.editorialStatus ?? d.status;
  return (
    <div className="space-y-8">
      <BackLink href="/admin/biblioteca">Biblioteca</BackLink>
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader
        title={d.namePt}
        eyebrow={
          <span className="flex items-center gap-2">
            <Tag tone={EDITORIAL[st]?.tone}>{EDITORIAL[st]?.label}</Tag> {c && `revisão ${c.revision}`}
            {c?.reviewedBy && ` · aprovado por ${c.reviewedBy}`}
          </span>
        }
        actions={
          <He display className="text-[2rem] text-stone-700">
            {d.nameHe}
          </He>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_18rem] [&>*]:min-w-0">
        <Card className="p-5">
          <form action={updateContentAction} className="space-y-5">
            <input type="hidden" name="destinationId" value={d.id} />
            <input type="hidden" name="slug" value={d.slug} />
            <TextField label="Título" name="title" defaultValue={c?.title ?? d.namePt} required maxLength={120} />
            <TextArea label="Resumo" name="summary" defaultValue={c?.summary ?? ''} required maxLength={600} rows={3} />
            <TextArea label="Onde fica" name="geography" defaultValue={c?.geography ?? ''} maxLength={400} rows={2} />
            <TextArea
              label="Seções"
              name="sections"
              defaultValue={c ? serializeSections(c.sections) : '## História resumida\n\n[fato] '}
              rows={22}
              className="[&_textarea]:font-mono [&_textarea]:text-[0.86rem]"
              hint="## Título da seção. Cada parágrafo começa com [fato], [tradição], [interpretação] ou [dica]. Fonte opcional no fim: {fonte: Josefo, livro VI}."
            />
            <TextArea label="O que observar (um por linha)" name="observe" defaultValue={c?.observe.join('\n') ?? ''} rows={4} />
            <TextArea label="Referências (uma por linha: título | detalhe)" name="references" defaultValue={c?.references.map((r) => (r.detail ? `${r.label} | ${r.detail}` : r.label)).join('\n') ?? ''} rows={4} />
            <Notice>Salvar cria a revisão {(c?.revision ?? 0) + 1}. Um texto aprovado volta para &quot;em revisão&quot; até ser aprovado de novo.</Notice>
            <Button type="submit">Salvar nova revisão</Button>
          </form>
        </Card>
        <aside className="space-y-6">
          {c && (
            <Card className="p-4">
              <h2 className="font-semibold">Situação editorial</h2>
              <form action={editorialStatusAction} className="mt-3 space-y-3">
                <input type="hidden" name="destinationId" value={d.id} />
                <input type="hidden" name="slug" value={d.slug} />
                <TextField label="Revisado por" name="reviewer" maxLength={120} hint="Obrigatório para aprovar." id="rev-name" />
                <div className="flex flex-col gap-2">
                  <Button type="submit" name="status" value="approved" size="sm">
                    Aprovar revisão {c.revision}
                  </Button>
                  <Button type="submit" name="status" value="in_review" size="sm" variant="secondary">
                    Marcar em revisão
                  </Button>
                  <Button type="submit" name="status" value="draft" size="sm" variant="quiet">
                    Voltar para rascunho
                  </Button>
                </div>
              </form>
            </Card>
          )}
          <div>
            <h2 className="text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">Revisões</h2>
            <ol className="mt-2 space-y-1 text-small">
              {revs.map((r) => (
                <li key={r.revision} className="flex justify-between">
                  <span>Revisão {r.revision}</span>
                  <time className="tabular text-stone-600">{r.at.toLocaleDateString('pt-BR')}</time>
                </li>
              ))}
              {revs.length === 0 && <li className="text-stone-600">Sem texto ainda.</li>}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
