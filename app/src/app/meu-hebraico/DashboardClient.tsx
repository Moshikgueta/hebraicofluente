'use client';

/* Meu Hebraico - o painel do aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * Responde a uma pergunta - "o que eu faço hoje?" - e responde com UMA ação
 * principal, porque fadiga de decisão é o que faz curso de auto-estudo não
 * terminar.
 *
 * Desde que a plataforma tem conta, ele responde a uma segunda pergunta logo
 * abaixo: "e depois?". A prateleira de cursos fica no fim, nunca no topo. Um
 * painel que abre com quatro cursos à venda é uma loja; o aluno que entrou
 * hoje quer a aula de hoje.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge, Skeleton } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { ProgressBar, StreakCard } from '@/components/game/Game';
import { AlphabetGrid, ModuleProgress } from '@/components/game/AlphabetGrid';
import { useProgress } from '@/lib/state/store';
import { course, getLetter, getModule } from '@/lib/content';
import { Prose } from '@/components/learn/Blocks';
import { isExtraModuleDone, isLessonComplete, needsWarmUp } from '@/lib/state/rules';
import { useAccount } from '@/lib/account/store';
import { CourseShelf } from '@/components/platform/CourseShelf';
import { AccessNotice } from '@/components/platform/AccessNotice';

export function DashboardClient() {
  const p = useProgress();
  const account = useAccount();


  /* Where to pick up: the first lesson that is not finished, in course order.
     A checkpoint interrupts when its whole module is done and it is not. */
  const next = useMemo(() => {
    for (const m of course.modules) {
      /* Modules 6 and 7 teach no letter but are not optional: they are where
         reading without nikud starts. They sit in the sequence, in order. */
      if (!m.letterIds.length) {
        if (!isExtraModuleDone(p.state, m.id)) {
          return { kind: 'extra' as const, module: m };
        }
        continue;
      }
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

  /* O nome do onboarding manda, e não o da conta: é o apelido que a pessoa
     escolheu para este curso, e ela pode ter aberto a conta com o nome
     completo por causa da nota fiscal. O da conta é a reserva. */
  const name = p.state.onboarding.name?.trim()
    || account.session?.account.name.trim().split(/\s+/)[0]
    || '';

  return (
    <div className="grid gap-6 sm:gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight">
          {greeting()}{name ? `, ${name}` : ''} 👋
        </h1>
        <p className="font-ui text-[15px] text-ink-muted">
          {p.mastered === 0
            ? 'Vamos continuar seu hebraico? Começamos pela primeira letra.'
            : `Você já domina ${p.mastered} ${p.mastered === 1 ? 'letra' : 'letras'} de ${course.totalLetters}.`}
        </p>
      </header>

      <AccessNotice />

      {/* Coming back after a gap: three questions on what was slipping, before
          anything new. A learner who has been away for a week and is handed a
          brand-new letter spends the lesson quietly discovering they have
          forgotten the last one. */}
      {needsWarmUp(p.state, p.day) && (
        <Card tone="mint" className="p-5 sm:p-6 grid sm:grid-cols-[1fr_auto] items-center gap-4">
          <div className="grid gap-1">
            <p className="font-display text-[18px] font-bold text-ink">Vamos aquecer?</p>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              Você esteve fora alguns dias. Três minutos no que estava escapando e
              a lição de hoje rende muito mais.
            </p>
          </div>
          <LinkButton href="/revisao" className="justify-self-start sm:justify-self-end">
            Aquecer
          </LinkButton>
        </Card>
      )}

      {/* The primary action, alone and unmissable. */}
      <section aria-labelledby="continuar">
        <h2 id="continuar" className="sr-only">Continuar aprendendo</h2>
        {next.kind === 'letter' && (
          <Card tone="wash" className="p-6 sm:p-7 grid sm:grid-cols-[auto_1fr_auto] items-center gap-5">
            <div className="w-[76px] h-[76px] rounded-[var(--r-lg)] bg-surface grid place-items-center shrink-0">
              <He size="xl">{next.letter.letter}</He>
            </div>
            <div className="grid gap-1 min-w-0">
              <Badge tone="accent">Módulo {next.module.n} · lição {next.letter.lesson}</Badge>
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
                {next.module.titlePt} - hora de conferir
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

        {next.kind === 'extra' && (
          <Card tone="wash" className="p-6 sm:p-7 grid sm:grid-cols-[1fr_auto] items-center gap-5">
            <div className="grid gap-1">
              <Badge tone="accent">Módulo {next.module.n}</Badge>
              <p className="font-display text-[21px] font-bold text-ink mt-1">
                {next.module.titlePt}
              </p>
              <p className="font-ui text-[14px] text-ink-body">
                Nenhuma letra nova - e é o módulo que separa quem decora de quem lê.
              </p>
            </div>
            <LinkButton href={`/modulo/${next.module.n}`} size="lg" className="w-full sm:w-auto">
              {(p.state.lessons[next.module.id]?.stagesDone.length ?? 0) > 0 ? 'Continuar' : 'Começar'}
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

      {/* Below lg this is the phone layout, unchanged: two cards, then the
          progress summary. At lg it becomes the dashboard - the whole alphabet
          on the left, the day's state on the right. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)] lg:gap-6 lg:items-start">
        <section aria-labelledby="alfabeto" className="order-2 lg:order-1 grid gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="alfabeto" className="font-display text-[17px] font-bold text-ink">
              O alfabeto
            </h2>
            {/* 44px of height even though the text is 13px: a link on a phone
                is hit with a fingertip, not a cursor. */}
            <Link href="/mapa"
                  className="inline-flex items-center min-h-[44px] font-ui text-[13px]
                             text-[var(--accent)] hover:underline">
              Ver o mapa →
            </Link>
          </div>
          <Card className="p-4 sm:p-5">
            <AlphabetGrid />
          </Card>

          {/* Fechado no telefone. A grade logo acima já responde "onde estou" -
              a lista de sete módulos abaixo dela repetia a mesma informação
              por mais 600px, e é a terceira barra de progresso da mesma tela.
              Quem quer o detalhe abre; ninguém mais rola por cima dele. */}
          <details className="lg:hidden group">
            <summary className="flex items-center gap-2 min-h-[44px] cursor-pointer
                                font-display text-[17px] font-bold text-ink list-none
                                [&::-webkit-details-marker]:hidden">
              Módulos
              <span aria-hidden className="font-ui text-[13px] font-normal text-ink-muted
                                           transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="pt-2"><ModuleProgress /></div>
          </details>

          {/* Dentro da coluna da esquerda, e não embaixo das duas.
              A lista de módulos faz a coluna da direita passar de 900px; solta
              embaixo, a prateleira deixava um vão branco do tamanho de meia
              tela entre a grade e ela. Aqui as duas colunas terminam juntas.
              No telefone só existe uma coluna e a ordem não muda. */}
          <div className="mt-2 lg:mt-4">
            <CourseShelf headingPt="Seus cursos" variant="rows" />
          </div>
        </section>

        <aside className="order-1 lg:order-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StreakCard days={p.streak} goalUnits={p.goalUnits} goalTarget={p.goalTargetToday} />

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

          <div className="hidden lg:grid gap-2 sm:col-span-2 lg:col-span-1">
            <h2 className="font-display text-[17px] font-bold text-ink">Módulos</h2>
            <ModuleProgress />
          </div>
        </aside>
      </div>

      <Card className="p-5 grid gap-4 lg:hidden">
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

/* A primeira vez depois da compra.
 *
 * Não é mais uma página de vendas - quem chega aqui já pagou, e repetir o
 * argumento de venda para quem já comprou soa a cobrança. O texto diz o que
 * vai acontecer agora e manda para o onboarding, que é onde a pessoa escolhe
 * o nome e a meta diária. */
function Welcome() {
  const m1 = getModule(1);
  return (
    <>
      <Card tone="wash" className="p-7 sm:p-10 grid gap-5 text-center">
        <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
          Bem-vindo ao Hebraico Fluente
        </p>
        <div className="flex justify-center gap-3 py-2">
          {['מ', 'ת', 'א', 'נ', 'ה', 'י'].map(l => (
            <He key={l} size="lg" dim>{l}</He>
          ))}
        </div>
        <h1 className="text-[30px] sm:text-[38px] font-bold leading-[1.15]">
          Seu curso está liberado.
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-body max-w-[48ch] mx-auto">
          São 22 letras, em {course.modules.filter(m => m.letterIds.length).length} módulos.
          Antes da primeira, duas perguntas rápidas: como você quer ser chamado e
          quanto tempo por dia dá para estudar.
        </p>
        <div className="pt-2">
          <LinkButton href="/onboarding" size="lg">Começar</LinkButton>
        </div>
      </Card>

      {m1 && (
        <Card className="p-6 grid gap-3">
          <Badge tone="accent">Começa assim</Badge>
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
