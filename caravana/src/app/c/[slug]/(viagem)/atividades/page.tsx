import Link from 'next/link';
import { IconCheck, IconChevronRight } from '@/components/icons';
import { Eyebrow, EmptyState, Tag } from '@/components/ui';
import { getTrip } from '@/lib/trip';

export const metadata = { title: 'Atividades' };

const TYPE: Record<string, string> = { quiz: 'Quiz do destino', hebrew: 'Hebraico', challenge: 'Desafio cultural' };

export default async function ActivitiesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { snapshot: s, base, progress } = await getTrip(slug);
  const done = s.activities.filter((a) => progress.completed[a.slug]).length;
  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-8 sm:px-6">
      <Eyebrow>Experiências interativas</Eyebrow>
      <h1 className="mt-2 font-display text-display-l font-medium tracking-[-0.02em]">Atividades</h1>
      <p className="mt-2 text-ink-soft">
        {s.activities.length > 0 ? `${done} de ${s.activities.length} concluídas. Cada uma leva poucos minutos e explica cada resposta.` : 'Nenhuma atividade nesta caravana.'}
      </p>
      {s.activities.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Sem atividades por enquanto">A agência não ativou atividades para esta caravana.</EmptyState>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-stone-200 overflow-hidden rounded-md bg-paper-raised ring-1 ring-stone-200">
          {s.activities.map((a) => {
            const c = progress.completed[a.slug];
            return (
              <li key={a.slug}>
                <Link href={`${base}/atividades/${a.slug}`} className="flex items-center gap-4 px-4 py-4 hover:bg-stone-100/60">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${c ? 'bg-success-soft text-success' : 'bg-brand-tint text-brand-text'}`}>
                    {c ? <IconCheck size={20} /> : <span className="tabular text-small font-semibold">{a.questions.length}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{a.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-micro text-stone-600">
                      <Tag>{TYPE[a.type] ?? a.type}</Tag>
                      {c ? `Concluída · ${c.score}/${c.total} de primeira` : `${a.questions.length} perguntas`}
                    </span>
                  </span>
                  <IconChevronRight size={20} className="text-stone-500" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
