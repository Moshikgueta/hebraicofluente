'use client';

/* The lesson: one template, 22 letters, five stages.
 *
 * The five stages are the workbook's own P1-P5, in the same order and for the
 * same reasons. What changes on screen is the medium, not the sequence:
 *   1 conhecer   - the letter, its sound, its syllables
 *   2 palavras   - vocabulary, discovered rather than listed
 *   3 escrever   - model, stroke order, tracing
 *   4 fixação    - guided reinforcement, no score (FixacaoGuiada)
 *   5 exercícios - the graded quiz that closes the letter
 *
 * A stage is marked done when the learner reaches its end, and XP is awarded
 * there - never on navigation. */

import { tx } from '@/i18n/telas/licao-lesson-client';
import { SugestaoDePar } from '@/components/learn/SugestaoDePar';
import { AvaliarLicao } from '@/components/learn/AvaliarLicao';
import { useCallback, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import { useTempoAtivo } from '@/lib/tempo-de-etapa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { gravarLicao, lerLicao, type LicaoEmAndamento } from '@/lib/licao-em-andamento';
import { WritingCanvas } from '@/components/learn/WritingCanvas';
import { OndeNasceOSom } from '@/components/learn/OndeNasceOSom';
import { CompararPronuncia } from '@/components/learn/CompararPronuncia';
import { SoundLab } from '@/components/learn/SoundLab';
import { CultureUnlock } from '@/components/learn/Culture';
import { AudioButton, audioAvailable, hasAudio } from '@/components/learn/AudioButton';
import { ANALOGIA_CURSIVA, MESMA_LETRA } from '@/lib/cursiva';
import {
  BrazilianTip, BridgeWords, HebrewLetterCard, Prose,
  RealWorldHebrew, RegraCursiva, SyllableTrainer, TituloComSelo, WordReveal
} from '@/components/learn/Blocks';
import { Compreensao } from '@/components/learn/Compreensao';
import { MeExplica } from '@/components/learn/MeExplica';
import { AberturaDoLugar } from '@/components/aventura/AberturaDoLugar';
import { CelebracaoDaLetra } from '@/components/aventura/CartaDaLetra';
import { FixacaoGuiada } from '@/components/learn/FixacaoGuiada';
import { CompararSons } from '@/components/learn/CompararSons';
import { GravacaoDoProfessor } from '@/components/learn/GravacaoDoProfessor';
import { alvoDaLetra } from '@/lib/fixacao';
import { ContadorDeLeitura } from '@/components/learn/ContadorDeLeitura';
import { CartaoMeuNome } from '@/components/learn/MeuNome';
import { useProgress } from '@/lib/state/store';
import { acertosPara, FIXACAO_ITENS, letraAtual, letraLiberada, LIBERA_MARK, MASTERY_MARK, porQueTrancada } from '@/lib/state/rules';
import { allLetters, course, cultureAt, nextLetter, scenesForOrder, semOSomDe, type Letter } from '@/lib/content';
import {
  buildMiniTest, buildRemedial, type Exercise
} from '@/lib/engine/exercises';
import { track } from '@/lib/analytics';
import { somPt } from '@/lib/som-pt';
import { glifoDaLicao, nomeDaLicao, ordemDeEnsino, rotaDaLicao, semPalavrasDeSom, soOLadoDoPonto } from '@/lib/sons';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';

const STAGES = [
  { n: 1, label: tx.conhecer },
  { n: 2, label: tx.palavras },
  { n: 3, label: tx.escrever },
  { n: 4, label: tx.fixacao },
  { n: 5, label: tx.exercicios }
] as const;

export function LessonClient({ letter: letraInteira }: { letter: Letter }) {
  /* Bet, Kaf e Pe: as palavras do outro som (טוֹב, מֶלֶךְ, סֵפֶר) ficam para a
     lição de som logo depois - nem a tela nem os exercícios desta as usam.
     E a lição mostra só o lado com o ponto: sem o quadro B/V, K/Ch, P/F e
     sem os exercícios de variante, que viraram a lição 20 (29/09/2026). */
  const letter = useMemo(() => soOLadoDoPonto(semPalavrasDeSom(letraInteira)), [letraInteira]);
  const p = useProgress();
  const router = useRouter();
  /* A etapa e a Prática voltam de onde estavam depois de recarregar
     (lib/licao-em-andamento.ts). No estado inicial, e não num efeito: esta
     tela só monta no navegador, depois de o CourseGate trazer o conteúdo. */
  const [salvo] = useState<LicaoEmAndamento | null>(() => lerLicao(letraInteira.id));
  const [stage, setStageCru] = useState(() => salvo?.etapa ?? 1);
  const [trancada, setTrancada] = useState<ReturnType<typeof porQueTrancada>>(null);
  const [quizResult, setQuizResult] = useState<PlayerResult | null>(null);
  const [quizRun, setQuizRun] = useState(0);

  const history = useMemo(
    () => allLetters().filter(l => l.order <= letter.order).map(l => (l.id === letter.id ? letter : l)),
    [letter]
  );

  /* A etapa 4 é a Fixação guiada (sem nota) e a 5 são os Exercícios (com
     nota). Até 11/10/2026 a 4 era um segundo bloco de perguntas dos mesmos
     geradores da 5: o aluno fazia o teste duas vezes seguidas. Ver
     components/learn/FixacaoGuiada.tsx. */
  const alvo = useMemo(() => alvoDaLetra(letter, history), [letter, history]);
  /* O mini-teste: dez itens, um de cada coisa que "saber a letra" quer dizer
     - reconhecer, o som ou a variante, dentro de uma palavra, a forma que
     confunde, a CURSIVA, montar, ler, o significado, um DIGITADO - o único
     que não mostra a resposta na tela - e um de uma letra anterior. Outra
     semente a cada tentativa. */
  const quiz = useMemo(
    () => escolherRodada(`licao-fixacao-${letter.id}`, seed => buildMiniTest(letter, history, {
      audioAvailable: audioAvailable(), seed
    })).itens,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letter, history, quizRun]
  );

  /* A trava de progressão, do lado da rota.
   * ─────────────────────────────────────────────────────────────────────
   * O cadeado no mapa é o aviso; isto é a porta. Sem isto, `/licao/kaf/`
   * digitado na barra de endereços abre a lição 21 para quem está na
   * terceira - e o que essa pessoa encontra é uma tela onde a maior parte
   * dos símbolos é ruído. A ordem do curso não é burocracia: é a condição
   * para as palavras fazerem sentido.
   *
   * SÓ DEPOIS DE `p.ready`. O progresso chega do servidor de forma
   * assíncrona, e um aluno que estuda há meses não pode ser expulso da
   * própria lição durante o instante em que o estado ainda está vazio -
   * seria a trava confundindo "não carregou" com "não pode". É a mesma
   * razão pela qual um erro de rede nunca rebaixa uma letra dominada.
   *
   * E não é segurança de CONTEÚDO: quem protege o material é o portão de
   * pagamento, no Worker. Esta trava protege o CAMINHO de aprendizagem. */
  useEffect(() => {
    if (!p.ready) return;
    const ordem = ordemDeEnsino(allLetters(), course.modules);
    setTrancada(porQueTrancada(p.state, ordem, letter.id));
  }, [p.ready, p.state, letter.id]);

  /* Trocar de etapa desmonta o botão que tinha o foco, e ele caía no
     <body>, com a página parada no meio (auditoria de 28/09, UX-002). Se o
     foco se perdeu, ele vai para a etapa atual na barra de etapas, que fica
     no topo: quem usa teclado ou leitor de tela sabe onde está e segue com
     Tab para o conteúdo novo. */
  const primeiraEtapa = useRef(true);
  useEffect(() => {
    if (primeiraEtapa.current) { primeiraEtapa.current = false; return; }
    const id = requestAnimationFrame(() => {
      const a = document.activeElement;
      if (a && a !== document.body && document.body.contains(a)) return;
      document.querySelector<HTMLElement>(`[aria-label="${tx.etapas}"] [aria-current="step"]`)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [stage]);

  /* ── o Voltar do navegador volta uma etapa ─────────────────────────────
     As etapas não eram entradas do histórico, e o Voltar no meio da Prática
     saía da lição (auditoria de 01/10/2026, UXQA-003). Cada etapa nova vira
     uma entrada com a MESMA URL (`pushState` nativo, que o roteador do Next
     acompanha); o Voltar desfaz uma etapa, e só da primeira entrada é que
     sai da lição. */
  const etapaAtual = useRef(stage);
  etapaAtual.current = stage;
  const setStage = useCallback((n: number) => {
    if (n !== etapaAtual.current && typeof window !== 'undefined') {
      window.history.pushState({ ...window.history.state, hfEtapa: n }, '', window.location.href);
    }
    setStageCru(n);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    /* A entrada em que a lição abriu guarda a etapa de abertura. */
    if (typeof window.history.state?.hfEtapa !== 'number') {
      window.history.replaceState({ ...window.history.state, hfEtapa: stage }, '', window.location.href);
    }
    const aoVoltar = (e: PopStateEvent) => {
      const n = (e.state as { hfEtapa?: unknown } | null)?.hfEtapa;
      if (typeof n !== 'number' || n < 1 || n > 5) return;
      setStageCru(n);
    };
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
    // só na montagem: a entrada inicial é marcada uma vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gravarLicao(letter.id, { etapa: stage });
  }, [letter.id, stage]);

  /* O tempo ativo da etapa aberta: só a faixa sai, nas estatísticas, na
     primeira vez que a etapa é concluída (lib/tempo-de-etapa.ts). */
  const tempoDaEtapa = useTempoAtivo(`${letter.id}:${stage}`);
  const done = useCallback((n: number) => {
    p.finishStage(letter.id, n, undefined, tempoDaEtapa());
    if (n < 5) setStage(n + 1);
  }, [p, letter.id, setStage, tempoDaEtapa]);

  const stagesDone = p.state.lessons[letter.id]?.stagesDone ?? [];
  const unlockedCard = cultureAt(p.mastered);
  const after = nextLetter(letter.id);
  /* Resh, Bet, Kaf e Pe têm uma lição de som logo depois (Sin, Vet, Chaf,
     Fe): ela vem antes da letra seguinte e antes do checkpoint. */
  const ordemToda = ordemDeEnsino(allLetters(), course.modules);
  const seguinte = ordemToda[ordemToda.indexOf(letter.id) + 1];
  const somSeguinte = seguinte?.startsWith('som-') ? seguinte : null;
  const mod = course.modules.find(m => m.n === letter.module);
  const moduleFinished = !!mod && mod.letterIds.every(
    id => id === letter.id || (p.state.lessons[id]?.stagesDone.length ?? 0) >= 5
  );

  /* A lição seguinte abre com esta nota? Abaixo de LIBERA_MARK o botão
     principal não pode mandar para uma porta trancada (UXQA-002): ele vira
     "Refazer os exercícios". */
  const proximaTrancada = !!seguinte && !letraLiberada(p.state, ordemToda, seguinte);

  if (trancada) return <PortaTrancada letter={letter} porque={trancada} />;

  return (
    <div className="grid gap-6 reading">
      <LessonHeader letter={letter} stage={stage} stagesDone={stagesDone} onStage={setStage} />

      {stage === 1 && <StageConhecer letter={letter} history={history} onDone={() => done(1)} />}
      {stage === 2 && <StagePalavras letter={letter} onDone={() => done(2)} />}
      {stage === 3 && <StageEscrever letter={letter} onDone={() => done(3)} />}
      {stage === 4 && (
        <FixacaoGuiada key={`f-${letter.id}`} alvo={alvo} onDone={() => done(4)} />
      )}
      {/* A card earned by the letter just finished, shown where it was earned.
          `cultureAt` fires on the exact count, so it appears once and then
          lives in /historia. */}
      {stage === 5 && quizResult && unlockedCard && (
        <CultureUnlock card={unlockedCard} />
      )}
      {/* O número de palavras, com quantas ESTA letra abriu. Só depois da
          fixação: antes disso a letra ainda não conta como concluída. */}
      {stage === 5 && quizResult && <ContadorDeLeitura letra={letter} />}
      {/* Aparece uma vez na vida: no fim da letra que torna o nome do aluno
          escrevível, e enquanto ele não o escreveu. */}
      {stage === 5 && quizResult && <CartaoMeuNome contexto="licao" />}

      {stage === 5 && (
        <StageFixacao
          key={`q-${letter.id}-${quizRun}`}
          exercises={quiz}
          letter={letter}
          history={history}
          result={quizResult}
          onResult={r => {
            registrarRodada(`licao-fixacao-${letter.id}`, quiz);
            setQuizResult(r); p.finishQuiz(letter.id, r.score); p.finishStage(letter.id, 5, undefined, tempoDaEtapa());
          }}
          onRetry={() => { setQuizResult(null); setQuizRun(n => n + 1); }}
          onNext={() => {
            gravarLicao(letter.id, null);
            if (somSeguinte) router.push(rotaDaLicao(somSeguinte));
            else if (moduleFinished && mod?.checkpoint) router.push(`/checkpoint/${mod.n}`);
            else if (after) router.push(`/licao/${after.id}`);
            else router.push('/mapa');
          }}
          /* O botão diz o ATO, e a linha embaixo dele diz o destino. Antes o
             botão dizia só o destino ("Próxima letra - Bet"), e a lição
             terminava sem nunca dizer que tinha terminado: o fim de uma
             etapa precisa soar como fim, senão ele é só mais um clique. */
          nextLabel={tx.concluirEContinuar}
          proximaTrancada={proximaTrancada}
          nextHint={
            somSeguinte ? tx.emSeguidaSom(nomeDaLicao(somSeguinte, allLetters(), course.modules))
              : moduleFinished && mod?.checkpoint ? tx.emSeguidaCheckpoint(mod.n)
              : after ? tx.emSeguidaLetra(after.namePt) : tx.deVolta
          }
        />
      )}
      {/* "Como foi esta lição?": depois da nota, uma vez por lição neste
          aparelho, anônima. Ver components/learn/AvaliarLicao.tsx. */}
      {stage === 5 && quizResult && <AvaliarLicao licao={letter.id} />}
    </div>
  );
}

function LessonHeader({
  letter, stage, stagesDone, onStage
}: { letter: Letter; stage: number; stagesDone: number[]; onStage: (n: number) => void }) {
  return (
    <header className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/mapa"
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px]
                         text-ink-muted hover:text-ink-body">
          {tx.mapa}
        </Link>
        <Badge tone="accent">
          {tx.badge(letter.module, letter.lesson, letter.order)}
        </Badge>
      </div>
      {/* A ajuda curta, em toda etapa, sem sair da lição (28/10/2026). */}
      <div className="-mt-2"><MeExplica letter={letter} /></div>
      <ol className="flex items-center gap-1.5" aria-label={tx.etapas}>
        {STAGES.map(s => {
          const isDone = stagesDone.includes(s.n);
          const isNow = stage === s.n;
          return (
            <li key={s.n} className="flex-1">
              <button
                type="button"
                onClick={() => onStage(s.n)}
                aria-current={isNow ? 'step' : undefined}
                aria-label={tx.etapaDe(s.n, s.label)}
                className="w-full min-h-[44px] grid content-center gap-1.5 group"
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors
                    ${isNow ? 'bg-[var(--accent)]' : isDone ? 'bg-[var(--green)]' : 'bg-surface-2'}`}
                />
                <span className={`font-ui text-[11px] sm:text-[12px] transition-colors
                  ${isNow ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </header>
  );
}

/* ── 1 · conhecer ───────────────────────────────────────────────────────── */
/* A etapa 1 enxuta, a partir da letra 12.
   ─────────────────────────────────────────────────────────────────────────
   Quem chegou à letra 12 já fez onze vezes o mesmo ritual: objetivos, o que a
   letra faz, detalhe, dica para brasileiro, padrão, dica de leitura, erro
   típico, comparação com as outras letras. Repetir tudo por extenso no mesmo
   formato ensina a rolar a tela sem ler. Daqui em diante, o que fica à vista
   é o que muda de letra para letra - a forma, o som (com o desenho da boca),
   as leituras, o resumo e as sílabas - e a explicação completa fica a um
   toque, inteira, para quem quiser. As perguntas rápidas continuam: são elas
   que dizem se o resumo bastou. */
export const ENXUTA_DESDE = 12;

function StageConhecer({
  letter, history, onDone
}: { letter: Letter; history: Letter[]; onDone: () => void }) {
  const enxuta = letter.order >= ENXUTA_DESDE;
  const [completa, setCompleta] = useState(false);
  const [comparar, setComparar] = useState(false);
  const mostraTudo = !enxuta || completa;
  const [passo, setPasso] = useState(0);
  const topo = useRef<HTMLDivElement>(null);
  const temChecagem = (letter.ensino?.checagem?.length ?? 0) > 0;
  const ensinadas = useMemo(() => new Set([...history, letter].map(l => l.letter)), [history, letter]);

  /* Os passos da etapa (28/10/2026, decisão do dono: "em telas curtas").
     ─────────────────────────────────────────────────────────────────────
     Era uma página só, de 4.000 a 5.000 px no celular: a letra, a pronúncia,
     a explicação, as sílabas e as perguntas, tudo de uma vez. O conteúdo é o
     mesmo; ele chega um bloco por vez, na ordem em que se aprende: ver a
     letra, ouvir, entender, praticar com as vogais, conferir. Voltar é
     livre, e nenhum passo é cobrado: "Próximo" sempre anda. */
  const passos: { nome: string; corpo: ReactNode }[] = [
    {
      nome: tx.descobrir,
      corpo: (
        <>
          <Card className="p-6 sm:p-8 grid gap-6 overflow-hidden">
            {/* A letra chega no lugar do módulo dela (a aventura ilustrada). */}
            <AberturaDoLugar modulo={letter.module} ensinadas={ensinadas} />
            <HebrewLetterCard letter={letter} />
            {mostraTudo && <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5">
              <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
                {tx.oQueVamos}
              </p>
              <p className="text-[16px] leading-relaxed text-ink-body">
                {tx.voceVai(<He size="inline">{glifoDaLicao(letter)}</He>,
                  letter.finalForm ? <He size="inline">{letter.finalForm}</He> : null)}
              </p>
            </div>}
          </Card>
          <GravacaoDoProfessor id={`letter-${letter.id}-intro`}
            textoPt={tx.gravacaoIntro(letter.namePt)} />
        </>
      )
    },
    {
      nome: tx.ouvir,
      corpo: (
        <>
          <Card className="p-6 grid gap-3">
            <h2 className="text-[19px] font-semibold">{tx.comoPronunciar}</h2>
            <p className="text-[15.5px] leading-relaxed text-ink-body">
              <Prose text={letter.soundNotePt} />
            </p>
            {/* O lugar de onde o som sai, desenhado - em toda letra. */}
            <OndeNasceOSom articulacao={letter.articulacao} letra={letter.namePt} />
            {letter.id === 'het' && (
              <GravacaoDoProfessor id="letter-het-pronunciation"
                textoPt={tx.gravacaoHet} />
            )}
          </Card>
          {/* As duas (ou três) leituras, com um botão de som para cada uma:
              quem precisa ouvir a diferença entre "ch" e "s" tem onde ouvir. */}
          <Leituras letter={letter} />
        </>
      )
    },
    {
      nome: tx.entender,
      /* O que a letra FAZ, e não só que som ela tem: "por que essa letra está
         aí se eu não a escuto?", "por que ela mudou de formato?". */
      corpo: mostraTudo ? (
        <>
          <Ensinamento letter={letter} />
          <BrazilianTip mistake={letter.brazilianMistake} />
          <GravacaoDoProfessor id={`letter-${letter.id}-common-mistake`} />
        </>
      ) : (
        <>
          {letter.ensino && <Lembre texto={letter.ensino.lembrePt} />}
          <button type="button" onClick={() => setCompleta(true)} aria-expanded={false}
                  className="justify-self-start min-h-[44px] px-1 font-ui text-[14.5px] font-semibold
                             text-[var(--accent)] underline underline-offset-2">
            {tx.explicacaoCompleta}
          </button>
        </>
      )
    },
    {
      nome: tx.praticar,
      corpo: (
        <>
          <Card className="p-6 grid gap-4">
            <div className="grid gap-1">
              <h2 className="text-[19px] font-semibold">{tx.comCadaVogal}</h2>
              <p className="font-ui text-[13.5px] text-ink-muted">
                {letter.syllables.some(s => hasAudio(s.audioId))
                  ? tx.toqueParaOuvir
                  : tx.toqueParaDica}
              </p>
            </div>
            {/* Tocar na sílaba toca o som dela, e o gravar-e-comparar fica logo
                abaixo, para a sílaba escolhida. Sem nenhuma sílaba gravada, volta
                a grade de dicas. */}
            {letter.syllables.some(s => hasAudio(s.audioId)) ? (
              <>
                <CompararPronuncia itens={letter.syllables} grade />
                <div className="flex flex-wrap items-center gap-3">
                  <AudioButton audioId={letter.audioId} label={tx.ouvirNome(letter.namePt)} slow />
                </div>
              </>
            ) : <SyllableTrainer letter={letter} />}
          </Card>
          {/* As mesmas vogais nas letras já aprendidas, a um toque: ver a coluna
              é o que transforma "מַ se lê ma" em "o patach faz a". */}
          {mostraTudo && history.length > 1 && (comparar ? (
            <SoundLab letters={history} compact title={tx.compareComAsQueSabe} />
          ) : (
            <button type="button" onClick={() => setComparar(true)} aria-expanded={false}
                    className="justify-self-start min-h-[44px] px-1 font-ui text-[14.5px] font-semibold
                               text-[var(--accent)] underline underline-offset-2">
              {tx.compararComAsQueSabe}
            </button>
          ))}
        </>
      )
    },
    ...(temChecagem ? [{
      nome: tx.conferir,
      /* Explicação → exemplo → PERGUNTAS → prática: duas a quatro perguntas
         sobre o que foi EXPLICADO. Ver components/learn/Compreensao.tsx. */
      corpo: (
        <Compreensao
          id={`checagem-${letter.id}`}
          titulo={tx.entendeu}
          intro={tx.naoVaiNota}
          perguntas={letter.ensino.checagem}
          fecho={{
            bom: tx.fechoBom,
            parcial: tx.fechoParcial
          }}
        />
      )
    }] : [])
  ];

  const ultimo = passo === passos.length - 1;
  const ir = (n: number) => {
    setPasso(n);
    /* O passo novo começa do alto, e o foco vai junto: quem usa leitor de
       tela ouve o nome do passo, e não o fim do anterior. */
    requestAnimationFrame(() => {
      topo.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
      topo.current?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="grid gap-5">
      {/* Pontos, e não uma barra: logo acima ficam as abas das etapas, e uma
          segunda barra cheia ali parecia outra fileira de abas. */}
      <div ref={topo} tabIndex={-1}
           className="flex items-center justify-between gap-3 outline-none scroll-mt-[76px]">
        <p className="m-0 font-ui text-[14px] font-semibold text-ink">{passos[passo]!.nome}</p>
        <p className="m-0 flex items-center gap-2.5 font-ui text-[13px] text-ink-muted">
          <span aria-hidden className="flex gap-1.5">
            {passos.map((x, k) => (
              <span key={x.nome}
                    className={`w-2 h-2 rounded-full transition-colors duration-[var(--dur-toque)]
                      ${k <= passo ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`} />
            ))}
          </span>
          <span className="tabular-nums">{tx.passoDe(passo + 1, passos.length)}</span>
        </p>
      </div>

      <div key={passo} className="grid gap-5 hf-passo">
        {passos[passo]!.corpo}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-2">
        {passo > 0 ? (
          <Button variant="secondary" size="lg" onClick={() => ir(passo - 1)}>{tx.voltar}</Button>
        ) : <span />}
        {ultimo
          ? <Button size="lg" onClick={onDone} full>{tx.continuarPalavras}</Button>
          : <Button size="lg" onClick={() => ir(passo + 1)} full>
              {tx.proximo(passos[passo + 1]!.nome.toLowerCase())}
            </Button>}
      </div>
    </div>
  );
}

/* ── o que a letra faz ─────────────────────────────────────────────────────
   Quatro quadros, e três deles só aparecem quando há o que dizer. Uma letra
   sem particularidade nenhuma não ganha um "detalhe importante" escrito para
   preencher espaço - o aluno aprende rápido a pular quadro que nunca traz
   nada, e aí ele pula o que traz.

   Os rótulos com emoji foram pedidos assim, e o emoji é `aria-hidden`: quem
   usa leitor de tela não precisa ouvir "lâmpada" antes de cada título. */
/* ── 💡 a dica de leitura ──────────────────────────────────────────────────
   Quatro passos e dois exemplos. O formato é fixo porque a dica é sempre a
   mesma coisa: você vai encontrar ISTO, e quando encontrar, faça ASSIM.

   O último passo de toda dica é "leia a palavra como uma unidade", e ele
   não é enfeite: decifrar letra por letra é o hábito que o curso inteiro
   está tentando substituir, e uma dica que termina numa regra mecânica
   reforça exatamente o contrário.

   A `notaPt` existe para impedir a leitura literal da dica. Uma pista de
   leitura vira superstição no instante em que o aluno a trata como lei -
   "{{ה}} no fim é sempre A" é falso, e um aluno que acredita nisso lê
   {{גָבוֹהַ}} errado e não entende por quê. */
function DicaDeLeitura({ dica }: { dica: NonNullable<Letter['ensino']['dicaLeitura']> }) {
  return (
    <Card tone="wash" className="p-6 grid gap-4">
      <div className="grid gap-1">
        <TituloComSelo selo="dica" className="text-[var(--teal-ink)]" />
        {/* Pelo <Prose>, e não cru: o título cita a letra, e a primeira
            captura desta tela mostrava "Viu {'{{'}ה{'}}'} no final?" com as
            chaves. É o mesmo descuido da checagem do {{ב}}, duas semanas
            atrás - toda prosa do dado passa por aqui, sem exceção. */}
        <h2 className="text-[18px] font-semibold"><Prose text={dica.tituloPt} /></h2>
      </div>

      <ol className="grid gap-2 list-none p-0 m-0">
        {dica.passos.map((p, i) => (
          <li key={p} className="flex gap-3 text-[15.5px] leading-relaxed text-ink-body">
            <span aria-hidden
                  className="shrink-0 w-6 h-6 rounded-full bg-surface text-[var(--teal-ink)]
                             font-ui text-[12.5px] font-bold grid place-items-center">
              {i + 1}
            </span>
            <span><Prose text={p} /></span>
          </li>
        ))}
      </ol>

      <ul className="grid gap-2.5 list-none p-0 m-0">
        {dica.exemplos.map(ex => (
          <li key={ex.he}
              className="flex items-center gap-4 rounded-[var(--r-md)] bg-surface px-4 py-3">
            <He size="word">{ex.he}</He>
            <span className="min-w-0 grid gap-0.5">
              <span className="font-ui text-[15px] font-semibold text-ink">{ex.translitPt}</span>
              <span className="font-ui text-[13px] text-ink-muted leading-snug">{ex.ptPt}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="text-[14.5px] leading-relaxed text-ink-body border-t
                    border-[color:var(--line-soft)] pt-3">
        <Prose text={dica.notaPt} />
      </p>
    </Card>
  );
}

function Ensinamento({ letter }: { letter: Letter }) {
  const e = letter.ensino;
  /* O aprofundamento recolhido (30/09/2026). A etapa 1 do Álef tinha seis
     telas de celular antes da primeira sílaba, e o maior bloco era este. À
     vista fica o que a letra faz e o que lembrar; o detalhe, a nota para
     brasileiro, o padrão e a dica de leitura ficam a um toque, inteiros. O
     detalhe de letra com forma final continua à vista: é ele que mostra o
     desenho do fim da palavra. */
  const [aberto, setAberto] = useState(false);
  if (!e) return null;
  const detalheAVista = !!(e.detalhePt && letter.finalForm);
  const recolhidos = [
    e.detalhePt && !detalheAVista, e.paraBrasileiroPt, e.padraoPt, e.dicaLeitura
  ].filter(Boolean).length;

  const detalhe = e.detalhePt && (
        <Card className="p-6 grid gap-3">
          <h2 className="text-[19px] font-semibold">{tx.detalhe}</h2>
          {/* A forma final MOSTRADA, e não só descrita: o par lado a lado
              diz em dois segundos o que um parágrafo não diz. */}
          {letter.finalForm && (
            <div className="flex items-center justify-center gap-5 rounded-[var(--r-md)]
                            bg-surface-2 px-4 py-4">
              <span className="grid justify-items-center gap-1">
                <He size="lg">{letter.letter}</He>
                <span className="font-ui text-[12px] text-ink-muted">{tx.noMeio}</span>
              </span>
              <span aria-hidden className="text-ink-muted text-[20px]">→</span>
              <span className="grid justify-items-center gap-1">
                <He size="lg">{letter.finalForm}</He>
                <span className="font-ui text-[12px] text-ink-muted">{tx.noFim}</span>
              </span>
            </div>
          )}
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            <Prose text={e.detalhePt} />
          </p>
        </Card>
  );

  return (
    <div className="grid gap-4">
      <Card className="p-6 grid gap-3">
        <h2 className="text-[19px] font-semibold">{tx.oQueFaz}</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          <Prose text={e.funcaoPt} />
        </p>
      </Card>

      {detalheAVista && detalhe}

      <Lembre texto={e.lembrePt} />

      {recolhidos > 0 && !aberto && (
        <button type="button" onClick={() => setAberto(true)} aria-expanded={false}
                className="justify-self-start min-h-[44px] px-1 font-ui text-[14.5px] font-semibold
                           text-[var(--accent)] underline underline-offset-2">
          {tx.verMais(recolhidos)}
        </button>
      )}

      {aberto && (
        <>
          {!detalheAVista && detalhe}

          {e.paraBrasileiroPt && (
            <Card tone="wash" className="p-6 grid gap-2">
              <TituloComSelo selo="brasileiro" className="text-[var(--teal-ink)]" />
              <p className="text-[15.5px] leading-relaxed text-ink-body">
                <Prose text={e.paraBrasileiroPt} />
              </p>
            </Card>
          )}

          {/* 🧠 - o padrão que volta o curso inteiro. Opcional de propósito: a
              maioria das letras não tem um, e inventar um para preencher o
              quadro ensina o aluno a pular o quadro. */}
          {e.padraoPt && (
            <Card className="p-6 grid gap-2">
              <TituloComSelo selo="padrao" className="text-ink-muted" />
              <p className="text-[15.5px] leading-relaxed text-ink-body">
                <Prose text={e.padraoPt} />
              </p>
            </Card>
          )}

          {e.dicaLeitura && <DicaDeLeitura dica={e.dicaLeitura} />}
        </>
      )}
    </div>
  );
}

/* Sem selo, e isto é decisão: este quadro é o FECHO da explicação, e não um
   dos cinco tipos. Ele carregava 💡, que agora pertence à dica de leitura -
   um símbolo, um dono. O destaque continua o mesmo, que é o que fazia ele
   funcionar. Na etapa 1 enxuta (letra 12 em diante) é o único quadro da
   explicação que fica à vista. */
function Lembre({ texto }: { texto: string }) {
  return (
    <Card className="p-5 grid gap-1.5 border-[color:var(--teal)]">
      <h2 className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--teal-ink)]">
        {tx.lembrar}
      </h2>
      <p className="text-[16px] leading-relaxed text-ink">
        <Prose text={texto} />
      </p>
    </Card>
  );
}

/* ── 2 · palavras ───────────────────────────────────────────────────────── */
function StagePalavras({ letter, onDone }: { letter: Letter; onDone: () => void }) {
  const canRead = letter.wordsToRead.length > 0;
  return (
    <div className="grid gap-5">
      <BridgeWords letter={letter} />

      {canRead ? (
        <section className="grid gap-4">
          <div className="grid gap-1">
            <h2 className="text-[21px] font-bold">{tx.jaConsegueLer}</h2>
            <p className="font-ui text-[14px] text-ink-muted">
              {tx.tenteDecifrar}
            </p>
          </div>
          <WordList letter={letter} />
          {letter.id === 'tav' && (
            <GravacaoDoProfessor id="letter-alef-tav-example"
              textoPt={tx.gravacaoTav} />
          )}
          <CompararPronuncia itens={letter.wordsToRead} titulo={tx.compareLeitura} />
        </section>
      ) : (
        <Card tone="amber" className="p-6 grid gap-2">
          <h2 className="text-[18px] font-semibold">{tx.semPalavra}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body">
            {tx.semPalavraTexto(letter.alphabetSoFar.filter(c => c.length === 1).length === 2)}
          </p>
          <div className="pt-2">
            <HeSeq items={letter.syllables.map(s => s.he)} size="word" />
          </div>
        </Card>
      )}

      {/* 📖 - era uma etiqueta "Você sabia?" sem selo, embora o conteúdo
          fosse exatamente o quinto tipo da lista. O texto não mudou: só
          passou a se anunciar com o mesmo símbolo em toda tela onde
          aparece curiosidade. */}
      {letter.wordsToRecognize.length > 0 && (
        <Card tone="wash" className="p-6 grid gap-2">
          <TituloComSelo selo="curiosidade" className="text-[var(--teal-ink)]" />
          {letter.didYouKnowTitle && (
            <p className="font-ui text-[17px] font-semibold text-ink">{letter.didYouKnowTitle}</p>
          )}
          {/* Um parágrafo por linha em branco no texto (19/10/2026). */}
          {letter.didYouKnow.split(/\n\n+/).map((par, i) => (
            <p key={i} className="text-[15.5px] leading-relaxed text-ink-body">
              <Prose text={par} />
            </p>
          ))}
        </Card>
      )}
      {letter.wordsToRecognize.length > 0 && letter.maisCuriosidades.map(c => (
        <Card key={c.tituloPt} tone="wash" className="p-6 grid gap-2">
          <TituloComSelo selo="curiosidade" className="text-[var(--teal-ink)]" />
          <p className="font-ui text-[17px] font-semibold text-ink">{c.tituloPt}</p>
          {c.textoPt.split(/\n\n+/).map((par, i) => (
            <p key={i} className="text-[15.5px] leading-relaxed text-ink-body">
              <Prose text={par} />
            </p>
          ))}
        </Card>
      ))}

      {/* Ouça a diferença (19/10/2026): só nas letras que trazem a
          comparação em letters.json - hoje, o ר com o ח. */}
      {letter.compararSons && <CompararSons comparacao={letter.compararSons} />}

      {/* Only the scenes this letter unlocks, and only ones the learner can
          decode - a sign you cannot read is not a reward. Most letters have
          none, which is what keeps the ones that do feeling earned.

          One at a time: vav unlocks three at once, and three stacked sign
          cards added 1,500px to a stage that was already five screens long.
          The first is the reward; the rest are there for whoever wants them. */}
      <Scenes letter={letter} />

      <Button size="lg" onClick={onDone} full>{tx.continuarEscrita}</Button>
    </div>
  );
}

function Scenes({ letter }: { letter: Letter }) {
  /* Sem as placas que usam o som que a lição seguinte ensina (PED-025). */
  const scenes = scenesForOrder(letter.order).filter(semOSomDe(letter.id));
  const [shown, setShown] = useState(1);
  if (!scenes.length) return null;
  const rest = scenes.length - shown;
  return (
    <div className="grid gap-4">
      {scenes.slice(0, shown).map(scene => (
        <RealWorldHebrew key={scene.id} scene={scene} />
      ))}
      {rest > 0 && (
        <Button variant="secondary" onClick={() => setShown(scenes.length)} full>
          {tx.maisLugares(rest)}
        </Button>
      )}
    </div>
  );
}

/* Three at a time.
   A letter with nine words made stage 2 a 4,400px scroll on a phone - five
   screens of the same card, which is where a learner starts swiping instead of
   reading. Three is about one screen: enough to work on, short enough to
   finish, and the rest is one tap away for whoever wants it. */
function WordList({ letter }: { letter: Letter }) {
  const [shown, setShown] = useState(3);
  const words = letter.wordsToRead;
  const rest = words.length - shown;

  return (
    <div className="grid gap-3">
      {words.slice(0, shown).map(w => (
        <WordReveal key={w.he} word={w} mark={letter.letter} />
      ))}
      {rest > 0 && (
        <Button variant="secondary" onClick={() => setShown(n => n + 3)} full>
          {tx.verMaisPalavras(Math.min(3, rest), rest)}
          <span className="text-ink-muted">{tx.restantes(rest)}</span>
        </Button>
      )}
    </div>
  );
}

/* ── 3 · escrever ───────────────────────────────────────────────────────── */
function StageEscrever({ letter, onDone }: { letter: Letter; onDone: () => void }) {
  const p = useProgress();
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="text-[21px] font-bold">{tx.aprendendoAEscrever}</h2>
        <p className="font-ui text-[14px] text-ink-muted">
          {tx.mesmaLetra}
        </p>
      </div>

      <Card className="p-6 grid gap-5">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="grid gap-2 justify-items-center">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.impressa}</p>
            {/* Com o daguesh no Bet, Kaf e Pe (27/10/2026): a impressa da lição
                é a que tem o som dela. À mão, o ponto não se escreve. */}
            <He size="display">{glifoDaLicao(letter)}</He>
          </div>
          <div className="grid gap-2 justify-items-center">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">{tx.cursiva}</p>
            <He size="display" cursive>{letter.letter}</He>
          </div>
        </div>
        {/* O PORQUÊ, e não só a conclusão.
            ────────────────────────────────────────────────
            Aqui dizia "ninguém escreve hebraico à mão em letra de imprensa",
            que é a conclusão sem o argumento. O aluno passou duas etapas
            lendo um desenho e é mandado treinar outro; sem o motivo, isso
            soa a capricho - e quem acha que é capricho pula a etapa.

            O texto vem de lib/cursiva.ts, o mesmo que o módulo 0 lê: as
            duas telas dizem a mesma coisa porque é a mesma frase. */}
        <div className="grid gap-3 border-t border-[color:var(--line-soft)] pt-5">
          <RegraCursiva />
          <p className="font-ui text-[14px] leading-relaxed text-ink-body">{ANALOGIA_CURSIVA}</p>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">{MESMA_LETRA}</p>
        </div>
      </Card>

      <WritingCanvas
        glyph={letter.letter}
        letterId={letter.id}
        label={letter.namePt}
        onScored={score => p.recordWriting(letter.id, score)}
      />

      {letter.finalForm && (
        <WritingCanvas
          glyph={letter.finalForm}
          letterId={`${letter.id}-final`}
          label={tx.formaFinal(letter.namePt)}
          onScored={score => p.recordWriting(letter.id, score)}
        />
      )}

      <Button size="lg" onClick={onDone} full>{tx.continuarFixacao}</Button>
    </div>
  );
}

/* ── 5 · exercícios: o mini-teste, com portão de domínio ────────────────
 *
 * Aqui a lição deixa de ser "rolei até o fim" e passa a ser "mostrei que
 * sei". FIXACAO_ITENS questões (20), e 75% delas (MASTERY_MARK, 15 de 20)
 * para a lição contar como concluída; a seguinte abre com LIBERA_MARK (80%,
 * 16 de 20). Os números moram em lib/state/rules.ts e a tela os lê de
 * lá: este comentário já disse "seis" e "oito" quando eram outros.
 *
 * O portão NÃO tranca. Quem fica abaixo recebe "vamos praticar mais um pouco"
 * e quatro questões montadas a partir dos PRÓPRIOS erros - não um sorteio
 * novo, que seria outra coisa e não reforço. Depois disso a letra fecha de
 * qualquer jeito, com a nota registrada e os itens errados na fila de revisão:
 * travar um adulto na letra 7 é como se perde um aluno, e o sistema de revisão
 * existe justamente para que nada fique para trás sem voltar.
 *
 * ── a barra é UMA ────────────────────────────────────────────────────────
 * Até 21/09/2026 eram duas, e a de cima era decorativa: esta tela dizia "Mais
 * uma letra dominada" a partir de 0,8, e o estado não olhava nota nenhuma -
 * qualquer resultado marcava a etapa 5 e a letra entrava na contagem. A
 * palavra na tela não significava coisa alguma.
 *
 * Agora significa. `MASTERY_MARK` é a mesma constante que decide a contagem de
 * letras, as conquistas e o destravamento do exame final. O que a pessoa lê e
 * o que o sistema acredita passaram a ser a mesma frase.
 */
const PASSA = MASTERY_MARK;

function StageFixacao({
  exercises, letter, history, result, onResult, onRetry, onNext, nextLabel, nextHint, proximaTrancada = false
}: {
  exercises: Exercise[];
  letter: Letter;
  history: Letter[];
  result: PlayerResult | null;
  onResult: (r: PlayerResult) => void;
  onRetry: () => void;
  onNext: () => void;
  nextLabel: string;
  /** Para onde o botão leva, em uma linha, embaixo dele. */
  nextHint: string;
  /** A lição seguinte ainda não abre com a melhor nota desta. */
  proximaTrancada?: boolean;
}) {
  /* 'teste' → 'reforco' → 'fechado'. O reforço só existe quando a nota
     ficou abaixo do portão. */
  const [fase, setFase] = useState<'teste' | 'reforco' | 'fechado'>('teste');

  const reforco = useMemo(
    () => result && result.score < PASSA
      ? buildRemedial(letter, history, result.missed.map(id => id.split('-')[0] ?? letter.id), {
          audioAvailable: audioAvailable(), seed: `reforco-${letter.id}-${result.correct}`, count: 4
        })
      : [],
    [result, letter, history]
  );

  if (result && fase === 'reforco' && reforco.length > 0) {
    return (
      <div className="grid gap-5">
        <Card tone="ember" className="p-5 grid gap-1.5">
          <p className="font-display text-[17px] font-semibold text-[var(--gold-ink)]">
            {tx.praticarMais}
          </p>
          <p className="font-ui text-[14.5px] leading-relaxed text-[var(--gold-body)]">
            {tx.reforcoTexto(reforco.length)}
          </p>
        </Card>
        <ExercisePlayer
          key={`ref-${letter.id}-${result.correct}`}
          exercises={reforco}
          title={tx.reforco}
          repetirErros
          onDone={() => setFase('fechado')}
        />
      </div>
    );
  }

  if (result) {
    const pct = Math.round(result.score * 100);
    const strong = result.score >= PASSA;
    const fezReforco = fase === 'fechado';
    return (
      <div className="grid gap-5">
        {/* A carta da letra entra na coleção (28/10/2026, a aventura
            ilustrada). Só com a nota que passa; o resultado de sempre vem
            logo abaixo, igual. */}
        {strong && <CelebracaoDaLetra letter={letter} />}
        <Milestone
          tone={strong || fezReforco ? 'bom' : 'parcial'}
          kicker={tx.placar(result.correct, result.total, pct)}
          title={strong ? tx.maisUma
            : fezReforco ? tx.reforcoFeito
            : result.score >= 0.6 ? tx.quaseLa
            : tx.vamosFirmar(letter.namePt)}
          /* A mensagem acompanha a nota de verdade. "Faltou pouco" num
             resultado de zero é a plataforma fingindo que não viu. */
          body={strong && !proximaTrancada
            ? tx.reconhece(letter.namePt)
            : proximaTrancada && (strong || fezReforco)
              ? tx.filaTrancada(letter.namePt, Math.round(LIBERA_MARK * 100))
            : fezReforco
              ? tx.filaReforco(letter.namePt)
              : result.score >= 0.6
                ? tx.faltouPouco
                : tx.naoFirme}
        >
          {!strong && !fezReforco && reforco.length > 0 && (
            <Button variant={proximaTrancada ? 'secondary' : 'primary'} onClick={() => setFase('reforco')}>
              {tx.praticarMaisUmPouco}
            </Button>
          )}
          {proximaTrancada ? (
            /* A próxima lição ainda não abre: o caminho principal é refazer,
               e "Em seguida" some, porque ele apontaria para uma porta
               trancada (UXQA-002). */
            <>
              <Button variant={!strong && !fezReforco && reforco.length > 0 ? 'secondary' : 'primary'}
                      onClick={() => { setFase('teste'); onRetry(); }}>
                {tx.refazerPrecisa(Math.round(LIBERA_MARK * 100))}
              </Button>
              <p className="basis-full font-ui text-[13px] text-ink-muted m-0">
                {tx.proximaAbre(Math.round(LIBERA_MARK * 100), acertosPara(LIBERA_MARK), FIXACAO_ITENS)}
              </p>
            </>
          ) : (
            <>
              <Button variant={strong ? 'secondary' : 'ghost'} onClick={() => { setFase('teste'); onRetry(); }}>
                {tx.refazerTeste}
              </Button>
              <Button variant={strong || fezReforco ? 'primary' : 'secondary'} onClick={onNext}>
                {nextLabel}
              </Button>
              <p className="basis-full font-ui text-[13px] text-ink-muted m-0">{nextHint}</p>
            </>
          )}
        </Milestone>
        {strong && <MinhaConquista letter={letter} />}
        <SugestaoDePar />
      </div>
    );
  }

  return (
    <ExercisePlayer
      exercises={exercises}
      title={tx.exerciciosLetra(letter.namePt)}
      onDone={r => { track('quiz_completed', { letterId: letter.id, score: r.score }); onResult(r); }}
    />
  );
}

/* ── Minha conquista ──────────────────────────────────────────────────────
   O fim de uma letra dito como CAPACIDADE, e não como etapa cumprida
   (11/10/2026): o que o aluno consegue fazer agora que não conseguia antes
   da lição. Só aparece com a nota de domínio: dizer "você reconhece" para
   quem ficou abaixo dela seria a tela fingindo. O número de palavras novas
   já está logo abaixo, no contador de leitura. */
function MinhaConquista({ letter }: { letter: Letter }) {
  /* O segundo som de cada letra vem de um sinal diferente, e a frase diz
     qual: o daguesh em ב, כ, פ. O ש tem as suas duas leituras em lições
     separadas (Shin e Sin), e por isso aqui tem um som só. */
  const doisSons = letter.sound.includes(' ou ');
  const semSom = letter.sound.startsWith('(');
  return (
    <Card tone="mint" className="p-5 grid gap-2.5">
      <p className="font-ui text-[13px] font-bold uppercase tracking-[.08em] text-[var(--teal-ink)] m-0">{tx.minhaConquista}</p>
      <ul className="grid gap-1.5 text-[15px] leading-relaxed text-ink list-disc pl-5 m-0">
        {/* A etapa Escrever da lição traça a cursiva, e a etapa Conhecer mostra
            a impressa: quem chega aqui com a nota viu e praticou as duas. */}
        <li>{tx.conquista1(letter.namePt)}</li>
        <li>{semSom
          ? tx.conquistaSemSom(letter.namePt)
          : doisSons
            ? tx.conquistaDoisSons(letter.namePt, somPt(letter.sound))
            : tx.conquistaSom(letter.namePt, somPt(letter.sound))}</li>
        <li>{tx.conquista3(letter.namePt)}</li>
      </ul>
      <Link href="/leitura" className="inline-flex items-center min-h-[44px] w-fit font-ui text-[14px] font-medium text-[var(--teal-ink)] underline">
        {tx.laboratorio}
      </Link>
    </Card>
  );
}

/* ── a porta trancada ──────────────────────────────────────────────────────
   Não é um erro, e não é castigo: é o curso explicando a própria ordem. A
   tela diz QUAL letra falta, O QUE falta nela, e leva até lá com um clique -
   um "bloqueado" seco é a forma mais rápida de alguém achar que o produto
   quebrou.

   Ela aparece depois do progresso ter carregado (ver a nota do `useEffect`
   lá em cima), então nunca pisca na frente de quem tem acesso. */
function PortaTrancada({ letter, porque }: {
  letter: Letter;
  porque: NonNullable<ReturnType<typeof porQueTrancada>>;
}) {
  const p = useProgress();
  const ordem = ordemDeEnsino(allLetters(), course.modules);
  /* A anterior pode ser uma lição de som: Kaf vem depois de Vet. */
  const anterior = { namePt: nomeDaLicao(porque.anterior, allLetters(), course.modules) };
  const atual = letraAtual(p.state, ordem);
  const atualL = { namePt: nomeDaLicao(atual, allLetters(), course.modules) };

  /* A primeira letra antes da Aula 0 (11/10/2026): o que falta não é uma
     lição, é a aula de antes das letras. */
  if (porque.falta === 'aula0') {
    return (
      <div className="grid gap-5 focus-col">
        <Card className="p-6 sm:p-8 grid gap-4 justify-items-center text-center">
          <h1 className="font-display text-[23px] sm:text-[27px] font-bold leading-tight text-ink">
            {tx.antesDaPrimeira}
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-body max-w-[46ch] mx-auto">
            {tx.abreComAula0(<He size="inline">{letter.letter}</He>)}
          </p>
          <div className="grid gap-2 w-full max-w-[320px] pt-1">
            <LinkButton href="/inicio" size="lg" full>{tx.irAula0}</LinkButton>
            <LinkButton href="/mapa" variant="ghost" full>{tx.verMapa}</LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-5 focus-col">
      <Card className="p-6 sm:p-8 grid gap-4 justify-items-center text-center">
        <span aria-hidden className="w-12 h-12 rounded-full bg-surface-2 grid place-items-center">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <rect x="3.4" y="7" width="9.2" height="6.2" rx="1.6"
                  stroke="var(--locked)" strokeWidth="1.5" />
            <path d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7"
                  stroke="var(--locked)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <div className="grid gap-2">
          <h1 className="font-display text-[23px] sm:text-[27px] font-bold leading-tight text-ink">
            {tx.naoAbriu(<He size="inline">{letter.letter}</He>)}
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-body max-w-[46ch] mx-auto">
            {porque.falta === 'licao' ? (
              tx.vemDepois(<strong className="font-semibold text-ink">{anterior?.namePt}</strong>)
            ) : (
              tx.faltamExercicios(<strong className="font-semibold text-ink">{anterior?.namePt}</strong>,
                Math.round((porque.nota ?? 0) * 100), Math.round(LIBERA_MARK * 100))
            )}
          </p>
        </div>
        <div className="grid gap-2 w-full max-w-[320px] pt-1">
          <LinkButton href={rotaDaLicao(porque.anterior)} size="lg" full>
            {porque.falta === 'licao'
              ? tx.irPara(anterior?.namePt)
              : tx.refazerDe(anterior?.namePt)}
          </LinkButton>
          {atual !== porque.anterior && atualL && (
            <LinkButton href={rotaDaLicao(atual)} variant="secondary" full>
              {tx.continuarDeOnde(atualL.namePt)}
            </LinkButton>
          )}
          <LinkButton href="/mapa" variant="ghost" full>{tx.verMapa}</LinkButton>
        </div>
      </Card>
    </div>
  );
}

/* ── as leituras de uma letra que tem mais de uma ──────────────────────────
   Uma linha por leitura: o desenho grande, o nome, ONDE está o sinal que a
   distingue, e o som. A coluna "onde olhar" é a que ensina - "ponto no alto
   à direita" é acionável, "/ʃ/" não é. */
function Leituras({ letter }: { letter: Letter }) {
  /* Uma leitura só não é quadro: é o som da letra, que o cartão já mostra.
     É o caso de Bet, Kaf e Pe desde que o lado sem ponto tem lição própria
     (soOLadoDoPonto em lib/sons.ts). */
  if ((letter.variantes?.length ?? 0) < 2) return null;

  return (
    <Card className="p-6 grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-[19px] font-semibold">
          {letter.variantes.length === 2 ? tx.duasLeituras : tx.leiturasDestaLetra}
        </h2>
        <p className="font-ui text-[13.5px] text-ink-muted">
          {tx.mesmoDesenho}
        </p>
      </div>
      <ul className="grid gap-2.5 list-none p-0 m-0">
        {letter.variantes.map(v => (
          <li key={v.he}
              className="flex items-center gap-4 rounded-[var(--r-md)] bg-surface-2 px-4 py-3">
            <span className="shrink-0 w-[58px] grid place-items-center">
              <He size="lg">{v.he}</He>
            </span>
            <span className="min-w-0 grid gap-0.5">
              <span className="font-ui text-[15px] font-semibold text-ink">
                {v.nomePt} · <Prose text={v.comoPt} />
              </span>
              <span className="font-ui text-[13px] leading-snug text-ink-muted">
                <Prose text={v.ondePt} />
              </span>
            </span>
            {hasAudio(v.audioId) && (
              <span className="ml-auto shrink-0 grid justify-items-center gap-0.5">
                <AudioButton audioId={v.audioId} label="" size="sm"
                             ariaLabel={tx.ouvirExemplo(v.nomePt, v.exemploHe)} />
                {/* O que toca é um exemplo: uma consoante sozinha não se
                    pronuncia. Mostrado, para o som não parecer da letra solta. */}
                <He size="inline">{v.exemploHe}</He>
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
