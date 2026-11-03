import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { Flash } from '@/components/panel/Flash';
import { IconEye } from '@/components/icons';
import { Button, Card, LinkButton, Notice, Tag } from '@/components/ui';
import { caravanPublications } from '@/lib/db/schema';
import { diffSnapshots } from '@/lib/domain/diff';
import { buildSnapshot, currentSnapshot, libraryUpdatesSince, publicationChecks } from '@/lib/domain/publication';
import { agencyTx, getPanelCaravan } from '@/lib/panel-data';
import { archiveAction, publishAction, unpublishAction } from '../../actions';

export default async function PublishStep({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const { car, canPublish, staff } = await getPanelCaravan(id);
  const data = await agencyTx(staff, async (tx) => {
    const current = await currentSnapshot(tx, id);
    const draft = await buildSnapshot(tx, id, (current?.version ?? 0) + 1);
    return {
      current,
      draft,
      checks: await publicationChecks(tx, id),
      updates: await libraryUpdatesSince(tx, current),
      history: await tx
        .select({ version: caravanPublications.version, at: caravanPublications.publishedAt })
        .from(caravanPublications)
        .where(eq(caravanPublications.caravanId, id))
        .orderBy(desc(caravanPublications.version))
        .limit(8),
    };
  });
  const changes = car.status === 'published' || data.current ? diffSnapshots(data.current, data.draft) : diffSnapshots(null, data.draft);
  const important = changes.filter((c) => c.important);
  const hidden = { name: 'caravanId', value: car.id };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem] [&>*]:min-w-0">
      <div className="max-w-2xl space-y-8">
        <Flash ok={q.ok} erro={q.erro} detail={q.erro === 'publication_blocked' ? data.checks.blocking.join(' ') : undefined} />
        <section>
          <h2 className="font-display text-title font-medium">Pendências</h2>
          {data.checks.blocking.length === 0 && data.checks.warnings.length === 0 && <p className="mt-2 text-small text-success">Nenhuma pendência.</p>}
          <ul className="mt-3 space-y-2">
            {data.checks.blocking.map((b) => (
              <li key={b}>
                <Notice tone="danger">{b}</Notice>
              </li>
            ))}
            {data.checks.warnings.map((w) => (
              <li key={w}>
                <Notice tone="warning">{w}</Notice>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-title font-medium">{data.current ? `O que muda em relação à versão ${data.current.version}` : 'Primeira publicação'}</h2>
          {changes.length === 0 ? (
            <p className="mt-2 text-small text-stone-600">O rascunho é igual à versão publicada.</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {changes.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-small">
                  {c.important ? <Tag tone="warning">Importante</Tag> : <Tag>Ajuste</Tag>}
                  <span className="pt-0.5">{c.text}</span>
                </li>
              ))}
            </ul>
          )}
          {data.updates.length > 0 && (
            <Notice tone="brand" title="Novidades na biblioteca" className="mt-4">
              <ul className="list-inside list-disc">
                {data.updates.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <p className="mt-1">A caravana publicada continua com a versão anterior até você publicar de novo.</p>
            </Notice>
          )}
        </section>

        <section>
          <LinkButton href={`/painel/caravanas/${car.id}/previa`} variant="secondary">
            <IconEye size={18} /> Ver a prévia do viajante
          </LinkButton>
        </section>

        {canPublish ? (
          <Card className="p-5">
            <form action={publishAction} className="space-y-4">
              <input type="hidden" {...hidden} />
              {important.length > 0 && (
                <Notice tone="warning" title="Esta publicação muda informações importantes da viagem">
                  Avise os viajantes também pelos canais oficiais da agência: nem todos vão abrir a experiência antes da próxima atividade.
                </Notice>
              )}
              <label className="flex items-start gap-2 text-small">
                <input type="checkbox" name="confirm" className="mt-0.5 h-4 w-4 accent-[#1f4a6b]" />
                <span>Revisei a prévia e quero que os viajantes passem a ver esta versão.</span>
              </label>
              <Button type="submit" disabled={data.checks.blocking.length > 0}>
                {data.current ? `Publicar versão ${data.current.version + 1}` : 'Publicar caravana'}
              </Button>
            </form>
            {car.status === 'published' && (
              <form action={unpublishAction} className="mt-5 border-t border-stone-200 pt-5">
                <input type="hidden" {...hidden} />
                <p className="text-small text-stone-600">Despublicar tira a experiência do ar para todos os viajantes, sem apagar convites nem progresso.</p>
                <Button type="submit" variant="danger" size="sm" className="mt-3">
                  Despublicar
                </Button>
              </form>
            )}
            {car.status !== 'archived' && (
              <details className="mt-5 border-t border-stone-200 pt-5">
                <summary className="cursor-pointer text-small font-semibold text-stone-600">Arquivar caravana</summary>
                <form action={archiveAction} className="mt-3">
                  <input type="hidden" {...hidden} />
                  <p className="text-small text-stone-600">Arquivar tira a caravana do ar e libera o limite de caravanas ativas do contrato. Os dados ficam guardados.</p>
                  <Button type="submit" variant="danger" size="sm" className="mt-3">
                    Arquivar
                  </Button>
                </form>
              </details>
            )}
          </Card>
        ) : (
          <Notice>Publicar, despublicar e arquivar ficam com administradores da agência.</Notice>
        )}
      </div>

      <aside className="space-y-3">
        <h2 className="text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">Versões publicadas</h2>
        {data.history.length === 0 ? (
          <p className="text-small text-stone-600">Nenhuma ainda.</p>
        ) : (
          <ol className="space-y-1.5 text-small">
            {data.history.map((h) => (
              <li key={h.version} className="flex justify-between gap-3">
                <span className="font-semibold">
                  Versão {h.version}
                  {data.current?.version === h.version && car.status === 'published' && <span className="ml-1.5 text-micro text-success">no ar</span>}
                </span>
                <time className="tabular text-stone-600">{h.at.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</time>
              </li>
            ))}
          </ol>
        )}
        <p className="pt-2 text-micro text-stone-600">
          Cada publicação guarda uma cópia completa do que o viajante vê. Os convites ficam em{' '}
          <Link href={`/painel/caravanas/${car.id}/convites`} className="font-semibold text-sea">
            Convites
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
