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
import {
  CartaoCurso, CartaoNumero, CartaoRevisao, CartaoSemana,
  IconeLetras, IconeLicoes, IconeRevisar, IconeTempo
} from '@/components/platform/Painel';
import { flagship } from '@/lib/catalog';
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

  /* Lições concluídas: uma lição do curso são as cinco etapas de uma letra,
     e os módulos sem letra contam pelas três etapas próprias. */
  const licoesFeitas = Object.values(p.state.lessons)
    .filter(l => (l?.stagesDone.length ?? 0) >= 5).length;

  /* `units` são blocos de 20 segundos - ver a nota em Painel.tsx. */
  const minutosSemana = Math.round(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(`${p.day}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() - i);
      return p.state.days[d.toISOString().slice(0, 10)]?.units ?? 0;
    }).reduce((a, b) => a + b, 0) / 3
  );
  const tempoSemana = minutosSemana >= 60
    ? `${Math.floor(minutosSemana / 60)}h${String(minutosSemana % 60).padStart(2, '0')}`
    : `${minutosSemana}min`;

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
      <header className="flex items-start gap-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <h1 className="font-display text-[27px] sm:text-[31px] font-semibold leading-[1.1] tracking-[-0.028em] mb-1">
            {greeting()}{name ? `, ${name}` : ''} 👋
          </h1>
          <p className="font-ui text-[16px] sm:text-[16.5px] text-ink-muted">
            {p.mastered === 0
              ? 'Vamos continuar seu hebraico? Começamos pela primeira letra.'
              : 'Continue de onde você parou.'}
          </p>
        </div>
        {/* A sequência sai do cartão e vira pílula no cabeçalho: é o número
            que a pessoa quer ver primeiro, e ele não precisa de um cartão
            inteiro para ser lido. */}
        {p.streak > 0 && (
          <p className="flex items-center gap-2.5 rounded-full bg-[var(--gold-soft)] px-4 py-2.5">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M9 2c1.8 2.8.7 4.3-.6 5.7-1.2 1.3-2.2 2.5-2.2 4.3a2.8 2.8 0 0 0 5.6 0c0-.8-.2-1.4-.6-2.1 1.9.9 3 2.4 3 4.2A5.2 5.2 0 0 1 9 16a5.2 5.2 0 0 1-5.2-5.2C3.8 7 7.4 5.6 9 2Z"
                    stroke="var(--gold)" strokeWidth="1.35" strokeLinejoin="round" />
            </svg>
            <span className="font-ui text-[15px] font-bold text-[var(--gold-ink)] tabular-nums">
              {p.streak} {p.streak === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
          </p>
        )}
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
          <CartaoCurso
            kicker="Curso em andamento"
            titulo={flagship().titlePt}
            sub={`Módulo ${next.module.n} · lição ${next.letter.lesson} - letra ${next.letter.namePt}, som ${next.letter.sound}`}
            pct={p.progress}
            href={`/licao/${next.letter.id}`}
            cta={(p.state.lessons[next.letter.id]?.stagesDone.length ?? 0) > 0
              ? 'Continuar aprendendo' : 'Começar a lição'}
          />
        )}

        {next.kind === 'checkpoint' && (
          <CartaoCurso
            kicker={`Checkpoint ${next.module.n}`}
            titulo={next.module.titlePt}
            sub={`As ${next.module.letterIds.length} letras do módulo, juntas.`}
            pct={p.progress}
            href={`/checkpoint/${next.module.n}`}
            cta="Fazer o checkpoint"
          />
        )}

        {next.kind === 'extra' && (
          <CartaoCurso
            kicker={`Módulo ${next.module.n}`}
            titulo={next.module.titlePt}
            sub="Nenhuma letra nova - e é o módulo que separa quem decora de quem lê."
            pct={p.progress}
            href={`/modulo/${next.module.n}`}
            cta={(p.state.lessons[next.module.id]?.stagesDone.length ?? 0) > 0
              ? 'Continuar aprendendo' : 'Começar o módulo'}
          />
        )}

        {next.kind === 'done' && (
          <CartaoCurso
            kicker="Alfabeto concluído"
            titulo="Você chegou ao fim do alfabeto."
            sub="As 22 letras, sem transliteração para se apoiar."
            pct={1}
            href="/desafio-final"
            cta="Ir para o desafio final"
          />
        )}
      </section>

      {/* Os quatro números, e depois revisar e a semana. É a ordem do design,
          e ela responde na sequência certa: o que eu já fiz, o que está
          pendente, e como foi a semana. */}
      <section aria-label="Seus números" className="grid gap-3
                          [grid-template-columns:repeat(auto-fit,minmax(168px,1fr))]">
        <CartaoNumero n={p.mastered} rotulo={p.mastered === 1 ? 'letra dominada' : 'letras dominadas'}
                      tom="teal" icone={<IconeLetras />} />
        <CartaoNumero n={licoesFeitas} rotulo={licoesFeitas === 1 ? 'lição concluída' : 'lições concluídas'}
                      tom="teal" icone={<IconeLicoes />} />
        <CartaoNumero n={p.dueCount} rotulo="a revisar" tom="gold" icone={<IconeRevisar />} />
        <CartaoNumero n={tempoSemana} rotulo="nesta semana" tom="neutro" icone={<IconeTempo />} />
      </section>

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start">
        <CartaoRevisao />
        <CartaoSemana />
      </div>

      {/* A grade do alfabeto e a lista de módulos. Ficam DEPOIS dos números
          e do cartão de revisão: são a resposta para "onde estou no curso
          inteiro", que é uma pergunta mais calma do que "o que faço agora". */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(250px,1fr)] lg:gap-6 lg:items-start">
        <section aria-labelledby="alfabeto" className="grid gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="alfabeto" className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
              O alfabeto
            </h2>
            {/* 44px de altura mesmo com texto de 13px: um link no telefone é
                acertado com a ponta do dedo, e não com um cursor. */}
            <Link href="/mapa"
                  className="inline-flex items-center min-h-[44px] font-ui text-[13px]
                             text-[var(--teal)] hover:underline">
              Ver o mapa →
            </Link>
          </div>
          <Card className="p-4 sm:p-5">
            <AlphabetGrid />
          </Card>

          {/* Fechado no telefone: a grade logo acima já responde "onde estou",
              e a lista de sete módulos repetia a mesma informação por mais
              600px. Quem quer o detalhe abre. */}
          <details className="lg:hidden group">
            <summary className="flex items-center gap-2 min-h-[44px] cursor-pointer
                                font-display text-[18px] font-semibold text-ink list-none
                                [&::-webkit-details-marker]:hidden">
              Módulos
              <span aria-hidden className="font-ui text-[13px] font-normal text-ink-muted
                                           transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="pt-2"><ModuleProgress /></div>
          </details>
        </section>

        <aside className="hidden lg:grid gap-2 content-start">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">Módulos</h2>
          <ModuleProgress />
        </aside>
      </div>

      {/* No fim, e não no topo: o painel é de quem já comprou. Em linhas, e
          não em cards de venda. */}
      <CourseShelf headingPt="Seus cursos" variant="rows" />
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
