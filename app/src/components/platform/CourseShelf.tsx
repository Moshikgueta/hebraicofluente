'use client';

/* A prateleira: todos os cursos, na ordem da trilha.
 * ─────────────────────────────────────────────────────────────────────────
 * Alfabetização → A1 → A2 → B1. A ordem é a do catálogo e não é decorativa:
 * é a resposta visual para "e depois?", que é a pergunta que decide se um
 * aluno que terminou um curso compra o seguinte ou some.
 *
 * Aparece no painel e na página /cursos, com o mesmo componente, de propósito.
 */

import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import { allCourses, FLAGSHIP } from '@/lib/catalog';
import { CourseCard, courseCardState } from './CourseCard';

export function CourseShelf({ headingPt }: { headingPt?: string }) {
  const account = useAccount();
  const p = useProgress();
  const courses = allCourses();

  return (
    <section aria-labelledby="prateleira" className="grid gap-3">
      <h2 id="prateleira"
          className={`font-display text-[17px] font-bold text-ink ${headingPt ? '' : 'sr-only'}`}>
        {headingPt ?? 'Cursos'}
      </h2>
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
    </section>
  );
}
