'use client';

/* The dashboard. It answers one question — "o que eu faço hoje?" — and it
 * answers it with ONE primary action, because decision fatigue is what stops
 * self-study courses being finished. */

import Link from 'next/link';
import { useMemo } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge, Skeleton } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { ProgressBar, StreakCard } from '@/components/game/Game';
import { useProgress } from '@/lib/state/store';
import { course, getLetter, getModule } from '@/lib/content';
import { Prose } from '@/components/learn/Blocks';
import { isLessonComplete } from '@/lib/state/rules';

export default function Dashboard() {
  const p = useProgress();


  /* Where to pick up: the first lesson that is not finished, in course order.
     A checkpoint interrupts when its whole module is done and it is not. */
  const next = useMemo(() => {
    for (const m of course.modules) {
      if (!m.letterIds.length) continue;
      for (const id of m.letterIds) {
        if (!isLessonComplete(p.state, id)) {
          return { kind: 'letter' as const, letter: getLetter(id)!, module: m };
        }
      }
      if (m.checkpoint && !p.state.checkpoints[m.checkpoint.id]?.passedAt) {
        return { kind: 'checkpoint' as const, checkpoint: m.checkpoint, module: m };
      }
    }
    return { kind: 'done' as const };
  }, [p.state]);

  if (!p.ready) return <DashboardSkeleton />;

  if (!p.state.onboarding) {
    return (
      <div className="grid gap-6">
        <Welcome />
      </div>
    );
  }

  const name = p.state.onboarding.name?.trim();

  return (
    <div className="grid gap-6 sm:gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight">
          {greeting()}{name ? `, ${name}` : ''}.
        </h1>
        <p className="font-ui text-[15px] text-ink-muted">
          {p.mastered === 0
            ? 'Vamos começar pela primeira letra.'
            : `Você já domina ${p.mastered} ${p.mastered === 1 ? 'letra' : 'letras'} de ${course.totalLetters}.`}
        </p>
      </header>

      {/* The primary action, alone and unmissable. */}
      <section aria-labelledby="continuar">
        <h2 id="continuar" className="sr-only">Continuar aprendendo</h2>
        {next.kind === 'letter' && (
          <Card tone="wash" className="p-6 sm:p-7 grid sm:grid-cols-[auto_1fr_auto] items-center gap-5">
            <div className="w-[76px] h-[76px] rounded-[var(--r-lg)] bg-surface grid place-items-center shrink-0">
              <He size="xl">{next.letter.letter}</He>
            </div>
            <div className="grid gap-1 min-w-0">
              <Badge tone="teal">Módulo {next.module.n} · lição {next.letter.lesson}</Badge>
              <p className="font-display text-[21px] font-bold text-ink mt-1">
                Letra {next.letter.namePt}
              </p>
              <p className="font-ui text-[14px] text-ink-muted">
                Letra {next.letter.order} de {course.totalLetters} · som {next.letter.sound}
              </p>
            </div>
            <LinkButton href={`/licao/${next.letter.id}`} size="lg" className="w-full sm:w-auto">
              {(p.state.lessons[next.letter.id]?.stagesDone.length ?? 0) > 0 ? 'Continuar' : 'Começar'}
            </LinkButton>
          </Card>
        )}

        {next.kind === 'checkpoint' && (
          <Card tone="mint" className="p-6 sm:p-7 grid sm:grid-cols-[1fr_auto] items-center gap-5">
            <div className="grid gap-1">
              <Badge tone="mint">Checkpoint {next.module.n}</Badge>
              <p className="font-display text-[21px] font-bold text-ink mt-1">
                {next.module.titlePt} — hora de conferir
              </p>
              <p className="font-ui text-[14px] text-ink-body">
                As {next.module.letterIds.length} letras do módulo, juntas.
              </p>
            </div>
            <LinkButton href={`/checkpoint/${next.module.n}`} size="lg" className="w-full sm:w-auto">
              Fazer o checkpoint
            </LinkButton>
          </Card>
        )}

        {next.kind === 'done' && (
          <Card tone="mint" className="p-6 sm:p-7 grid gap-3">
            <p className="font-display text-[21px] font-bold">Você chegou ao fim do alfabeto.</p>
            <LinkButton href="/desafio-final" size="lg" className="justify-self-start">
              Ir para o desafio final
            </LinkButton>
          </Card>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <StreakCard days={p.streak} goalAnswered={p.goalAnswered} goalTarget={p.goalTargetToday} />

        <Card className="p-5 grid gap-3 content-start">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="text-[18px] text-ink-muted">↻</span>
            <p className="font-display text-[19px] font-bold text-ink">Revisão rápida</p>
          </div>
          {p.dueCount > 0 ? (
            <>
              <p className="font-ui text-[13.5px] leading-relaxed text-ink-body">
                Hoje vale revisar:{' '}
                {p.weak.map(id => getLetter(id)).filter(Boolean).map((l, i) => (
                  <span key={l!.id}>
                    {i > 0 && <span className="text-ink-muted"> · </span>}
                    <He size="inline">{l!.letter}</He>
                  </span>
                ))}
              </p>
              <LinkButton href="/revisao" variant="secondary" size="sm" className="justify-self-start">
                Revisar · 3 minutos
              </LinkButton>
            </>
          ) : (
            <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
              Nada pendente por enquanto. Quando você errar alguma coisa, ela aparece
              aqui no dia certo para ser revista.
            </p>
          )}
        </Card>
      </div>

      <Card className="p-5 grid gap-4">
        <ProgressBar
          value={p.progress}
          label="Curso completo"
          sublabel={`${Math.round(p.progress * 100)}%`}
        />
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-ui text-[13px] text-ink-muted">
          <span><strong className="text-ink font-semibold tabular-nums">{p.mastered}</strong> / {course.totalLetters} letras</span>
          <span><strong className="text-ink font-semibold tabular-nums">{p.state.xp}</strong> XP</span>
          <span><strong className="text-ink font-semibold tabular-nums">{p.state.achievements.length}</strong> conquistas</span>
        </div>
        <Link href="/mapa" className="font-ui text-[14px] font-medium text-[var(--teal-band)] hover:underline">
          Ver o mapa do curso →
        </Link>
      </Card>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

function Welcome() {
  const m1 = getModule(1);
  return (
    <>
      <Card tone="wash" className="p-7 sm:p-10 grid gap-5 text-center">
        <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--teal-band)]">
          Do zero ao alfabeto inteiro
        </p>
        <div className="flex justify-center gap-3 py-2">
          {['מ', 'ת', 'א', 'נ', 'ה', 'י'].map(l => (
            <He key={l} size="lg" dim>{l}</He>
          ))}
        </div>
        <h1 className="text-[30px] sm:text-[38px] font-bold leading-[1.15]">
          Você sempre achou que o hebraico era impossível.
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-body max-w-[48ch] mx-auto">
          São 22 letras. Em {course.modules.filter(m => m.letterIds.length).length} módulos,
          você vai reconhecer, ler e escrever todas elas — e ler palavras inteiras já
          na terceira lição.
        </p>
        <div className="pt-2">
          <LinkButton href="/onboarding" size="lg">Começar</LinkButton>
        </div>
      </Card>

      {m1 && (
        <Card className="p-6 grid gap-3">
          <Badge tone="teal">Começa assim</Badge>
          <p className="font-display text-[18px] font-semibold">{m1.titlePt}</p>
          <p className="text-[15px] leading-relaxed text-ink-body"><Prose text={m1.milestonePt} /></p>
        </Card>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-[132px] w-full rounded-[var(--r-lg)]" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-[148px] rounded-[var(--r-lg)]" />
        <Skeleton className="h-[148px] rounded-[var(--r-lg)]" />
      </div>
    </div>
  );
}
