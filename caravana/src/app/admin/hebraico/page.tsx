import { asc } from 'drizzle-orm';
import { hebrewCategories } from '@content/hebrew';
import { Flash } from '@/components/panel/Flash';
import { PageHeader } from '@/components/panel/PanelShell';
import { Button, He, Notice, Tag } from '@/components/ui';
import { requirePlatform } from '@/lib/auth/next';
import { hebrewExpressions } from '@/lib/db/schema';
import { withScope } from '@/lib/db/tenant';
import { hebrewReviewAction } from '../actions';

export const metadata = { title: 'Hebraico' };

export default async function AdminHebrew({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const staff = await requirePlatform();
  const rows = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => tx.select().from(hebrewExpressions).orderBy(asc(hebrewExpressions.position)));
  const pending = rows.filter((r) => r.reviewStatus !== 'reviewed').length;
  return (
    <div className="space-y-6">
      <Flash ok={q.ok} erro={q.erro} />
      <PageHeader title="Hebraico para a viagem" description={`${rows.length} expressões · ${pending} aguardando revisão de falante nativo.`} />
      <Notice>
        Caravanas de agências reais só publicam expressões revisadas. A revisão confere a grafia sem vogais, o nikud, a transliteração e a tradução. Gravações de falante nativo são
        cadastradas em audio_assets; o envio de arquivos depende do armazenamento, que ainda não está ligado.
      </Notice>
      {hebrewCategories.map((cat) => {
        const list = rows.filter((r) => r.category === cat.id);
        if (!list.length) return null;
        return (
          <section key={cat.id}>
            <h2 className="font-display text-title font-medium">{cat.label}</h2>
            <ul className="mt-3 divide-y divide-stone-200 rounded-md bg-paper-raised ring-1 ring-stone-200">
              {list.map((e) => (
                <li key={e.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <He className="text-[1.4rem]">{e.hebrew}</He>
                    {e.hebrewPointed && <He className="text-[1.4rem] text-stone-600">{e.hebrewPointed}</He>}
                    <span className="text-small italic">{e.transliteration}</span>
                    <span className="text-small text-stone-600">{e.translation}</span>
                    {e.audioAssetId ? <Tag tone="success">Gravação</Tag> : <Tag>Sem gravação</Tag>}
                  </div>
                  <form action={hebrewReviewAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="slug" value={e.slug} />
                    {e.reviewStatus === 'reviewed' ? (
                      <>
                        <Tag tone="success">Revisada</Tag>
                        <Button type="submit" name="reviewed" value="0" size="sm" variant="quiet">
                          Reabrir
                        </Button>
                      </>
                    ) : (
                      <>
                        <label className="sr-only" htmlFor={`r-${e.slug}`}>
                          Revisado por
                        </label>
                        <input id={`r-${e.slug}`} name="reviewer" placeholder="Revisado por" maxLength={120} className="h-9 w-36 rounded-sm bg-paper px-2 text-small ring-1 ring-inset ring-stone-300" />
                        <Button type="submit" name="reviewed" value="1" size="sm" variant="secondary">
                          Marcar revisada
                        </Button>
                      </>
                    )}
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
