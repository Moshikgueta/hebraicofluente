'use client';

/* O card de curso — o mesmo objeto no site e dentro da plataforma.
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro estados, e o que muda entre eles é só a faixa e o botão:
 *
 *   · seu        — a conta tem acesso. Botão: continuar.
 *   · disponível — existe e está à venda. Botão: ver o curso.
 *   · em breve   — existe como página, não como aula. Botão: ver o que vem.
 *   · trancado   — o curso está pronto mas a conta não comprou.
 *
 * O curso trancado CONTINUA VISÍVEL. Esconder o que a pessoa ainda não tem é
 * o instinto errado: ninguém compra o que não sabe que existe, e um aluno que
 * terminou a alfabetização precisa ver o A1 esperando por ele. O que o
 * trancado não faz é fingir que abre — ele leva à página do curso, que é onde
 * se decide, e o cadeado é visível.
 */

import Link from 'next/link';
import { Card, Badge } from '@/components/ui/Card';
import { brl, installment, isPlayable, type CatalogCourse } from '@/lib/catalog';

export type CourseCardState = 'owned' | 'available' | 'soon' | 'locked';

export function courseCardState(c: CatalogCourse, owned: boolean): CourseCardState {
  if (!isPlayable(c)) return 'soon';
  return owned ? 'owned' : 'locked';
}

const BADGE: Record<CourseCardState, { label: string; tone: 'accent' | 'mint' | 'neutral' }> = {
  owned:     { label: 'Seu curso', tone: 'mint' },
  available: { label: 'Disponível', tone: 'accent' },
  locked:    { label: 'Disponível', tone: 'accent' },
  soon:      { label: 'Em breve', tone: 'neutral' }
};

export function CourseCard({
  course, state, progress
}: {
  course: CatalogCourse;
  state: CourseCardState;
  /** 0–1, só para o curso que a pessoa já tem. */
  progress?: number;
}) {
  const badge = BADGE[state];
  const href = state === 'owned' ? '/meu-hebraico' : `/cursos/${course.slug}`;
  const cta =
    state === 'owned' ? 'Continuar'
      : state === 'soon' ? 'Ver o que vem'
      : 'Ver o curso';

  return (
    <Card
      as="article"
      tone={state === 'owned' ? 'wash' : 'surface'}
      className={`p-5 grid gap-3 content-start ${state === 'soon' ? 'opacity-90' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden className="font-display text-[28px] font-bold leading-none
                                      text-[color-mix(in_srgb,var(--accent)_35%,transparent)]
                                      tabular-nums">
          {course.code}
        </span>
        <div className="flex items-center gap-2">
          {state === 'locked' && (
            <span aria-hidden title="Ainda não está na sua conta"
                  className="text-[14px] text-ink-muted">🔒</span>
          )}
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </div>

      <div className="grid gap-1">
        <h3 className="font-display text-[19px] font-bold text-ink leading-snug">
          {course.titlePt}
        </h3>
        <p className="font-ui text-[12.5px] text-ink-muted">
          {course.levelPt}
          {course.cefr ? ` · ${course.cefr}` : ''}
          {' · '}
          {course.stats.modules} módulos
          {course.stats.lessons ? ` · ${course.stats.lessons} lições` : ''}
        </p>
      </div>

      <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
        {course.taglinePt}
      </p>

      {state === 'owned' && progress !== undefined && (
        <div className="grid gap-1.5 pt-1">
          <div className="h-[6px] rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                 style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="font-ui text-[12px] text-ink-muted tabular-nums">
            {Math.round(progress * 100)}% concluído
          </p>
        </div>
      )}

      {state === 'locked' && (
        <p className="font-ui text-[13px] text-ink-body">
          <strong className="font-semibold text-ink">{brl(course.price.brl)}</strong>
          {' '}ou {installment(course.price).n}x de {brl(installment(course.price).brl)}
        </p>
      )}

      <Link
        href={href}
        className="mt-1 inline-flex items-center justify-center min-h-[44px] rounded-[var(--r-md)]
                   border border-line bg-surface font-ui text-[14px] font-medium text-ink
                   hover:bg-surface-2 transition-colors"
      >
        {cta}
      </Link>
    </Card>
  );
}
