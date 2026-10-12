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

import { somPt } from '@/lib/som-pt';
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
import { TesteFinalCard } from '@/components/game/TesteFinal';
import { AlphabetGrid, ModuleProgress } from '@/components/game/AlphabetGrid';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, getLetter, getModule } from '@/lib/content';
import { Prose } from '@/components/learn/Blocks';
import { ContadorDeLeitura } from '@/components/learn/ContadorDeLeitura';
import { CartaoMeuNome } from '@/components/learn/MeuNome';
import { alphabetComplete, aula0Feita, isExtraModuleDone, isLessonComplete, LIBERA_MARK, needsWarmUp, porQueTrancada } from '@/lib/state/rules';
import { useAccount } from '@/lib/account/store';
import { CourseShelf } from '@/components/platform/CourseShelf';
import { OfertaProximoCurso } from '@/components/platform/ProximoPasso';
import { AccessNotice } from '@/components/platform/AccessNotice';
import { AntesEDepois } from '@/components/platform/AntesEDepois';
import { primeiraLeituraId } from '@/lib/laboratorio';
import { resumoDoDominio } from '@/lib/dominio';
import { ehContraste, idDoSom, nomeDaLicao, ordemDeEnsino, rotaDaLicao, soOLadoDoPonto } from '@/lib/sons';

/** Itens vencidos a partir dos quais o painel sugere revisar antes da lição. */
export const REVISAO_URGENTE = 15;

export function DashboardClient() {
  const p = useProgress();
  const account = useAccount();


  /* Where to pick up: the first lesson that is not finished, in course order.
     A checkpoint interrupts when its whole module is done and it is not. */
  const next = useMemo(() => {
    for (const m of course.modules) {
      /* As lições do módulo na ordem do plano: letras e lições de som (Vet
         logo depois de Bet, Tch/Dj/J antes do fecho do módulo 7). */
      for (const ls of m.lessons) {
        if (ls.som && !isLessonComplete(p.state, idDoSom(ls.som))) {
          return { kind: 'som' as const, som: ls.som, nome: ls.nomePt ?? ls.som, lesson: ls.n, module: m };
        }
        for (const id of ls.letters ?? []) {
          if (!isLessonComplete(p.state, id)) {
            return { kind: 'letter' as const, letter: getLetter(id)!, module: m };
          }
        }
      }
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

  /* A próxima lição pode estar trancada: a anterior foi concluída com nota
     abaixo de LIBERA_MARK. Aí o cartão principal aponta para TERMINAR a
     anterior, nunca para a porta trancada (auditoria de 01/10/2026, UXQA-002). */
  const terminar = useMemo(() => {
    const id = next.kind === 'letter' ? next.letter.id : next.kind === 'som' ? idDoSom(next.som) : null;
    if (!id) return null;
    const ordem = ordemDeEnsino(allLetters(), course.modules);
    const porque = porQueTrancada(p.state, ordem, id);
    /* Antes da Aula 0 o cartão principal já é ela (`aula0Primeiro`). */
    if (!porque || porque.falta === 'aula0') return null;
    return {
      id: porque.anterior,
      nome: nomeDaLicao(porque.anterior, allLetters(), course.modules),
      nota: porque.nota
    };
  }, [next, p.state]);

  /* A Aula 0 é a ação principal enquanto não foi CONCLUÍDA (desde 11/10/2026
     ela é obrigatória e abre a primeira letra). Depois, a lição. */
  const aula0Primeiro = !aula0Feita(p.state);

  /* O primeiro módulo de letras concluído cuja Primeira Leitura ainda não
     foi feita. Um por vez: quem chega com três módulos prontos lê o primeiro. */
  const primeiraPendente = useMemo(() => course.modules.find(m => m.kind === 'letters'
    && m.letterIds.length > 0
    && m.letterIds.every(id => isLessonComplete(p.state, id))
    && !p.state.firsts?.[primeiraLeituraId(m.n)]) ?? null, [p.state]);

  const dominio = useMemo(() => resumoDoDominio(p.state, allLetters().map(l => l.id)), [p.state]);

  const alfabetoFechado = alphabetComplete(p.state, allLetters().map(l => l.id));

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
            {greeting()}{name ? `, ${name}` : ''}.
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
      {/* E também quando a revisão acumulou (11/10/2026): com REVISAO_URGENTE
          itens vencidos, a letra nova vai em cima de letras que estão
          escapando. A ação principal continua sendo a lição; isto vem antes
          dela, como sugestão. */}
      {(needsWarmUp(p.state, p.day) || p.dueCount >= REVISAO_URGENTE) && (
        <Card tone="mint" className="p-5 sm:p-6 grid sm:grid-cols-[1fr_auto] items-center gap-4">
          <div className="grid gap-1">
            <p className="font-display text-[18px] font-bold text-ink">Revisar antes de continuar</p>
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              {needsWarmUp(p.state, p.day)
                ? 'Você esteve fora alguns dias. Três minutos no que estava escapando e a lição de hoje rende muito mais.'
                : `Você tem ${p.dueCount} ${p.dueCount === 1 ? 'item' : 'itens'} para revisar. Uma revisão rápida agora vai ajudar você a aprender a próxima letra com mais facilidade.`}
            </p>
          </div>
          <LinkButton href="/revisao" className="justify-self-start sm:justify-self-end">
            Revisar agora
          </LinkButton>
        </Card>
      )}

      {/* The primary action, alone and unmissable. */}
      <section aria-labelledby="continuar">
        <h2 id="continuar" className="sr-only">Continuar aprendendo</h2>
        {aula0Primeiro && (
          <div className="grid gap-2">
            <CartaoCurso
              kicker="Antes da primeira letra"
              titulo="Como o hebraico funciona"
              sub="A aula que abre a primeira letra: a direção da leitura, o alfabeto, o nikud e como este curso funciona. Termina com uma checagem curta, e aí o Álef abre."
              pct={p.progress}
              href="/inicio"
              cta="Começar pela Aula 0"
            />
          </div>
        )}

        {!aula0Primeiro && terminar && (
          <CartaoCurso
            kicker="Curso em andamento"
            titulo={flagship().titlePt}
            sub={`Faltam os exercícios de ${terminar.nome}: a próxima lição abre com ${Math.round(LIBERA_MARK * 100)}%.`
              + (terminar.nota != null ? ` Sua melhor nota até agora: ${Math.round(terminar.nota * 100)}%.` : '')}
            pct={p.progress}
            href={rotaDaLicao(terminar.id)}
            cta={`Terminar ${terminar.nome}`}
          />
        )}

        {!aula0Primeiro && !terminar && next.kind === 'letter' && (
          <CartaoCurso
            kicker="Curso em andamento"
            titulo={flagship().titlePt}
            sub={`Módulo ${next.module.n} · lição ${next.letter.lesson} - letra ${next.letter.namePt}, som ${somPt(soOLadoDoPonto(next.letter).sound)}`}
            pct={p.progress}
            href={`/licao/${next.letter.id}`}
            cta={(p.state.lessons[next.letter.id]?.stagesDone.length ?? 0) > 0
              ? 'Continuar aprendendo' : 'Começar a lição'}
          />
        )}

        {!aula0Primeiro && !terminar && next.kind === 'som' && (
          <CartaoCurso
            kicker="Curso em andamento"
            titulo={flagship().titlePt}
            sub={`Módulo ${next.module.n} · lição ${next.lesson} - ${ehContraste(next.som) ? next.nome.toLowerCase() : `o som ${next.nome}`}`}
            pct={p.progress}
            href={`/som/${next.som}`}
            cta={(p.state.lessons[idDoSom(next.som)]?.stagesDone.length ?? 0) > 0
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

      {/* A Primeira Leitura do módulo que acabou de fechar (11/10/2026). */}
      {!aula0Primeiro && primeiraPendente && (
        <Card tone="wash" className="p-5 grid gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="grid gap-1 min-w-0">
            <Badge tone="accent">Minha Primeira Leitura</Badge>
            <p className="font-display text-[17px] font-semibold text-ink mt-1">
              Módulo {primeiraPendente.n} concluído! Hora de praticar a leitura.
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink-body">
              Algumas palavras formadas com as letras e os sinais vocálicos que você já aprendeu. Você lê por conta própria, depois ouve e confere.
            </p>
          </div>
          <LinkButton href={`/leitura?primeira=${primeiraPendente.n}`} className="shrink-0">Ler agora</LinkButton>
        </Card>
      )}

      {/* A aula 0, e o peso dela muda com o momento.
          ──────────────────────────────────────────────────────────────
          Para quem ainda não abriu lição nenhuma é um cartão de verdade,
          logo abaixo da ação principal: as cinco coisas que ninguém explica
          a um brasileiro antes da primeira letra - para que lado se lê, por
          que as vogais não são letras, por que uma letra muda de desenho no
          fim da palavra, e como o curso funciona.

          Para quem já começou vira uma linha discreta, porque aí é consulta
          e não caminho. Em nenhum dos dois casos ela é obrigatória. */}
      {aula0Primeiro ? null : licoesFeitas === 0 ? (
        <Card className="p-5 grid gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="grid gap-1 min-w-0">
            <Badge tone="accent">Antes da primeira letra</Badge>
            <p className="font-display text-[17px] font-semibold text-ink mt-1">
              Como o hebraico funciona
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink-body">
              Dez minutos de leitura: a direção, o alfabeto, o que muda em relação
              ao português e como este curso funciona.
            </p>
          </div>
          <LinkButton href="/inicio" variant="secondary" className="shrink-0">Ler agora</LinkButton>
        </Card>
      ) : (
        <p className="font-ui text-[13.5px] text-ink-muted">
          <Link href="/inicio" className="hover:text-[var(--accent)]">
            Como o hebraico funciona
          </Link>{' '}
          · a explicação de antes da primeira letra, para reler quando quiser.
        </p>
      )}

      {/* Logo depois da ação de hoje, e antes dos números: os quatro
          contadores dizem QUANTO foi feito, e este cartão diz o que aquilo
          virou. Ele só aparece quando há frase legível - por volta da metade
          do alfabeto - e some sozinho antes disso. */}
      <AntesEDepois />

      {/* O pedido de depoimento (29/09/2026), só depois de seis lições - antes
          disso a pessoa ainda não tem o que contar. Discreto e sem troca:
          nada de XP ou desconto por depoimento. Ver /depoimento. */}
      {licoesFeitas >= 6 && (
        <p className="font-ui text-[13.5px] text-ink-muted">
          <Link href="/depoimento" className="hover:text-[var(--accent)] underline underline-offset-2">
            Conte como está sendo
          </Link>{' '}
          · o seu depoimento ajuda o curso e quem está pensando em começar.
        </p>
      )}

      {/* Os quatro números, e depois revisar e a semana. É a ordem do design,
          e ela responde na sequência certa: o que eu já fiz, o que está
          pendente, e como foi a semana. */}
      <section aria-label="Seus números" className="grid gap-3
                          [grid-template-columns:repeat(auto-fit,minmax(168px,1fr))]">
        {/* 12/10/2026: "letras dominadas" é o domínio por habilidade
            (lib/dominio.ts); "lições concluídas" é a regra antiga, as cinco
            etapas com 75% (`p.mastered`), a mesma do alfabeto abaixo. */}
        <CartaoNumero n={dominio.contagem.dominada} rotulo={dominio.contagem.dominada === 1 ? 'letra dominada' : 'letras dominadas'}
                      tom="teal" icone={<IconeLetras />} />
        <CartaoNumero n={p.mastered} rotulo={p.mastered === 1 ? 'lição concluída' : 'lições concluídas'}
                      tom="teal" icone={<IconeLicoes />} />
        <CartaoNumero n={p.dueCount} rotulo={p.dueCount === 1 ? "item a revisar" : "itens a revisar"} tom="gold" icone={<IconeRevisar />} />
        <CartaoNumero n={tempoSemana} rotulo="nesta semana" tom="neutro" icone={<IconeTempo />} />
      </section>

      {/* Meu domínio das letras (11/10/2026): o que ele SABE, por habilidade,
          ao lado do que ele concluiu. Some até haver um exercício feito. */}
      {dominio.letras.length > 0 && (
        <Card className="p-5 grid gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="grid gap-1 min-w-0">
            <p className="font-display text-[17px] font-semibold text-ink m-0">Meu domínio das letras</p>
            <p className="font-ui text-[14.5px] leading-relaxed text-ink-body m-0">
              {`Dominadas: ${dominio.contagem.dominada} · Quase dominadas: ${dominio.contagem.quase}`}
              {dominio.paraPraticar.length > 0 &&
                ` · Para reforçar: ${dominio.paraPraticar.map(d => getLetter(d.letterId)?.namePt).join(', ')}`}
            </p>
          </div>
          <LinkButton href="/meu-hebraico/dominio" variant="secondary" className="shrink-0">Ver o meu domínio</LinkButton>
        </Card>
      )}

      {/* "Letras dominadas" é o que o curso mede; "palavras que você lê" é o
          que o aluno sente. Os dois ficam juntos, e o segundo leva ao
          vocabulário. Some enquanto não há letra concluída. */}
      {licoesFeitas > 0 && <ContadorDeLeitura />}
      <CartaoMeuNome />

      <div className="grid gap-3.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start">
        <CartaoRevisao />
        <CartaoSemana />
      </div>

      {/* Os exercícios disponíveis, num lugar só. Antes eles existiam apenas
          dentro da Academia, a dois toques de distância - e um jogo que é
          preciso procurar não é jogado. O teste final fecha a fileira, com o
          cadeado dizendo quantas letras faltam. */}
      <section aria-labelledby="praticar" className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="praticar" className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
            Praticar agora
          </h2>
          <Link href="/academia"
                className="inline-flex items-center min-h-[44px] font-ui text-[13px]
                           text-[var(--teal-ink)] hover:underline">
            Ver tudo →
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0">
          {([
            ['/leitura', 'Leitura', 'Pratique a leitura de palavras no seu ritmo.'],
            ['/academia?jogo=match', 'Match', 'Junte letra, nome e som.'],
            ['/academia?jogo=blast', 'Blast', 'Rápido, com sequência de acertos.'],
            ['/academia?jogo=teste', 'Teste', 'Nota no fim e revisão dos erros.']
          ] as const).map(([href, titulo, desc]) => (
            <li key={href}>
              <Link href={href}
                    className="h-full flex flex-col gap-1 rounded-[16px] border border-line
                               bg-[var(--card)] p-4 transition-[box-shadow,border-color]
                               duration-[250ms] hover:shadow-[var(--sh)] hover:border-[var(--teal)]">
                <span className="font-display text-[16px] font-semibold tracking-[-0.018em] text-ink">
                  {titulo}
                </span>
                <span className="font-ui text-[13px] leading-[1.45] text-ink-muted">{desc}</span>
              </Link>
            </li>
          ))}
        </ul>
        <TesteFinalCard compacto />
      </section>

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
                             text-[var(--teal-ink)] hover:underline">
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

      {/* A oferta do curso seguinte aparece num momento só: quando as 22
          letras estão fechadas. Antes disso o aluno está no meio de uma
          coisa, e vender a próxima no meio da atual é o que faz o painel de
          um curso pago parecer um panfleto. Depois disso "e agora?" é a
          pergunta que ele mesmo está fazendo. */}
      {alfabetoFechado && <OfertaProximoCurso />}

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
          {/* O "22" estava escrito à mão aqui. É o mesmo defeito que pôs dois
              números diferentes na vitrine: letra e lição são grandezas
              parecidas, e a cópia manual erra em silêncio. */}
          São {course.totalLetters} letras, em {course.modules.length} módulos.
          Antes da primeira, três perguntas rápidas: por que você quer aprender, quanto
          tempo por dia dá para estudar e o que você já sabe.
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
