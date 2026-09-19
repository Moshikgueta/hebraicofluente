'use client';

/* A prateleira: todos os cursos, na ordem da trilha.
 * ─────────────────────────────────────────────────────────────────────────
 * Alfabetização → A1 → A2 → B1. A ordem é a do catálogo e não é decorativa:
 * é a resposta visual para "e depois?", que é a pergunta que decide se um
 * aluno que terminou um curso compra o seguinte ou some.
 *
 * Aparece no painel e na página /cursos, com o mesmo componente, de propósito.
 */

import Link from 'next/link';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import { allCourses, FLAGSHIP, isPlayable, type CatalogCourse } from '@/lib/catalog';
import { Card } from '@/components/ui/Card';
import { CourseCard, courseCardState } from './CourseCard';

export function CourseShelf({
  headingPt, variant = 'cards'
}: {
  headingPt?: string;
  /** `rows` é a forma curta: uma linha por curso, sem argumento de venda.
   *  O painel usa esta - ver a nota em `ShelfRows`. */
  variant?: 'cards' | 'rows';
}) {
  const account = useAccount();
  const p = useProgress();
  const courses = allCourses();

  return (
    <section aria-labelledby="prateleira" className="grid gap-3">
      <h2 id="prateleira"
          className={`font-display text-[17px] font-bold text-ink ${headingPt ? '' : 'sr-only'}`}>
        {headingPt ?? 'Cursos'}
      </h2>
      {variant === 'rows' ? <ShelfRows courses={courses} /> : (
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0">
        {courses.map(c => {
          const owned = account.can(c.slug);
          return (
            <li key={c.slug}>
              <CourseCard
                course={c}
                state={courseCardState(c, owned)}
                /* Só a alfabetização tem progresso medido; os outros cursos
                   ainda não têm motor, então não há o que medir. */
                progress={owned && c.slug === FLAGSHIP ? p.progress : undefined}
              />
            </li>
          );
        })}
      </ul>
      )}
    </section>
  );
}

/* A forma curta, para o painel do aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * O painel abria com o card grande "continuar de onde parou" e FECHAVA com
 * quatro cards de venda - a mesma alfabetização repetida no fim, mais três
 * argumentos comerciais, cerca de 1.400px no telefone, embaixo da tela de
 * quem já pagou. Aqui a pergunta "e depois?" continua respondida, em quatro
 * linhas: o que é seu, o que vem, e uma porta para a página que vende.
 *
 * A prateleira de cards continua existindo, inteira, em /cursos - que é onde
 * alguém está decidindo comprar. */
function ShelfRows({ courses }: { courses: CatalogCourse[] }) {
  const account = useAccount();

  return (
    <Card className="p-1.5 grid gap-0.5">
      {/* `grid-cols-1` e `min-w-0`: sem os dois, a coluna da grade é medida
          pelo conteúdo e a linha mais comprida empurra a PÁGINA INTEIRA para
          530px num telefone de 390 - rolagem lateral no painel. O `truncate`
          só corta o texto depois que o pai aceita ser estreito. */}
      <ul className="list-none p-0 m-0 grid grid-cols-1 gap-0.5">
        {courses.map(c => {
          const owned = account.can(c.slug);
          const state = courseCardState(c, owned);
          return (
            <li key={c.slug} className="min-w-0">
              <Link
                href={state === 'owned' ? '/meu-hebraico' : `/cursos/${c.slug}`}
                className="flex items-center gap-3 min-h-[52px] px-2.5 rounded-[var(--r-md)]
                           hover:bg-surface-2 transition-colors"
              >
                <span aria-hidden className="font-display text-[15px] font-bold tabular-nums
                                             text-[color-mix(in_srgb,var(--accent)_45%,transparent)]">
                  {c.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-ui text-[14px] font-medium text-ink truncate">
                    {c.titlePt}
                  </span>
                  <span className="block font-ui text-[12px] text-ink-muted truncate">
                    {state === 'owned' ? 'Na sua conta'
                      : isPlayable(c) ? 'Disponível'
                      : c.taglinePt}
                  </span>
                </span>
                <span className="font-ui text-[12px] text-ink-muted shrink-0">
                  {state === 'owned' ? '✓' : isPlayable(c) ? '🔒' : 'em breve'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/cursos"
            className="flex items-center min-h-[44px] px-2.5 font-ui text-[13px]
                       text-[var(--accent)] hover:underline">
        Ver todos os cursos →
      </Link>
    </Card>
  );
}
