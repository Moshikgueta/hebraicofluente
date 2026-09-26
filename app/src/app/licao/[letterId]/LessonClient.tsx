'use client';

/* The lesson: one template, 22 letters, five stages.
 *
 * The five stages are the workbook's own P1-P5, in the same order and for the
 * same reasons. What changes on screen is the medium, not the sequence:
 *   1 conhecer   - the letter, its sound, its syllables
 *   2 palavras   - vocabulary, discovered rather than listed
 *   3 escrever   - model, stroke order, tracing
 *   4 praticar   - mixed recognition and reading
 *   5 fixação    - the quiz that closes the letter
 *
 * A stage is marked done when the learner reaches its end, and XP is awarded
 * there - never on navigation. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { WritingCanvas } from '@/components/learn/WritingCanvas';
import { OndeNasceOSom } from '@/components/learn/OndeNasceOSom';
import { CompararPronuncia } from '@/components/learn/CompararPronuncia';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { SoundLab } from '@/components/learn/SoundLab';
import { CultureUnlock } from '@/components/learn/Culture';
import { AudioButton, audioAvailable, hasAudio } from '@/components/learn/AudioButton';
import { ANALOGIA_CURSIVA, MESMA_LETRA } from '@/lib/cursiva';
import {
  BrazilianTip, BridgeWords, HebrewLetterCard, Prose, ReadAloudRow,
  RealWorldHebrew, RegraCursiva, SyllableTrainer, TituloComSelo, WordReveal
} from '@/components/learn/Blocks';
import { Compreensao } from '@/components/learn/Compreensao';
import { ContadorDeLeitura } from '@/components/learn/ContadorDeLeitura';
import { CartaoMeuNome } from '@/components/learn/MeuNome';
import { useProgress } from '@/lib/state/store';
import { letraAtual, LIBERA_MARK, MASTERY_MARK, porQueTrancada } from '@/lib/state/rules';
import { allLetters, course, cultureAt, nextLetter, scenesForOrder, type Letter } from '@/lib/content';
import {
  buildLetterPractice, buildMiniTest, buildRemedial, type Exercise
} from '@/lib/engine/exercises';
import { track } from '@/lib/analytics';
import { nomeDaLicao, ordemDeEnsino, rotaDaLicao } from '@/lib/sons';

const STAGES = [
  { n: 1, label: 'Conhecer' },
  { n: 2, label: 'Palavras' },
  { n: 3, label: 'Escrever' },
  { n: 4, label: 'Praticar' },
  { n: 5, label: 'Fixação' }
] as const;

export function LessonClient({ letter }: { letter: Letter }) {
  const p = useProgress();
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [trancada, setTrancada] = useState<ReturnType<typeof porQueTrancada>>(null);
  const [quizResult, setQuizResult] = useState<PlayerResult | null>(null);
  const [quizRun, setQuizRun] = useState(0);

  const history = useMemo(
    () => allLetters().filter(l => l.order <= letter.order),
    [letter.order]
  );

  /* Dois conjuntos diferentes: a etapa 4 pratica, a 5 mede. Reaproveitar um
     só deixaria a pessoa decorar as respostas em vez das letras.

     A prática é montada em CAMADAS - reconhecer, som, discriminar, dentro da
     palavra, forma final, outra fonte, ler - e reserva ~30% para letras
     anteriores. O motor faz essa composição; aqui só se diz quantas e quais
     letras andaram custando. */
  const practice = useMemo(
    () => buildLetterPractice(letter, history, {
      audioAvailable: audioAvailable(),
      seed: `pratica-${letter.id}`, weak: p.weak
    }),
    [letter, history, p.weak]
  );
  /* O mini-teste: dez itens, um de cada coisa que "saber a letra" quer dizer
     - reconhecer, o som ou a variante, dentro de uma palavra, a forma que
     confunde, a CURSIVA, montar, ler, o significado, um DIGITADO - o único
     que não mostra a resposta na tela - e um de uma letra anterior. Outra
     semente a cada tentativa. */
  const quiz = useMemo(
    () => buildMiniTest(letter, history, {
      audioAvailable: audioAvailable(), seed: `mini-${letter.id}-${quizRun}`
    }),
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

  const done = useCallback((n: number) => {
    p.finishStage(letter.id, n);
    if (n < 5) setStage(n + 1);
  }, [p, letter.id]);

  const stagesDone = p.state.lessons[letter.id]?.stagesDone ?? [];
  const unlockedCard = cultureAt(p.mastered);
  const after = nextLetter(letter.id);
  /* Bet, Kaf e Pe têm a lição do outro som logo depois (Vet, Chaf, Fe): ela
     vem antes da letra seguinte e antes do checkpoint. */
  const ordemToda = ordemDeEnsino(allLetters(), course.modules);
  const seguinte = ordemToda[ordemToda.indexOf(letter.id) + 1];
  const somSeguinte = seguinte?.startsWith('som-') ? seguinte : null;
  const mod = course.modules.find(m => m.n === letter.module);
  const moduleFinished = !!mod && mod.letterIds.every(
    id => id === letter.id || (p.state.lessons[id]?.stagesDone.length ?? 0) >= 5
  );

  if (trancada) return <PortaTrancada letter={letter} porque={trancada} />;

  return (
    <div className="grid gap-6 reading">
      <LessonHeader letter={letter} stage={stage} stagesDone={stagesDone} onStage={setStage} />

      {stage === 1 && <StageConhecer letter={letter} history={history} onDone={() => done(1)} />}
      {stage === 2 && <StagePalavras letter={letter} onDone={() => done(2)} />}
      {stage === 3 && <StageEscrever letter={letter} onDone={() => done(3)} />}
      {stage === 4 && (
        <StagePraticar
          key={`p-${letter.id}`}
          exercises={practice} letter={letter} onDone={() => done(4)}
        />
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
          onResult={r => { setQuizResult(r); p.finishQuiz(letter.id, r.score); p.finishStage(letter.id, 5); }}
          onRetry={() => { setQuizResult(null); setQuizRun(n => n + 1); }}
          onNext={() => {
            if (somSeguinte) router.push(rotaDaLicao(somSeguinte));
            else if (moduleFinished && mod?.checkpoint) router.push(`/checkpoint/${mod.n}`);
            else if (after) router.push(`/licao/${after.id}`);
            else router.push('/mapa');
          }}
          /* O botão diz o ATO, e a linha embaixo dele diz o destino. Antes o
             botão dizia só o destino ("Próxima letra - Bet"), e a lição
             terminava sem nunca dizer que tinha terminado: o fim de uma
             etapa precisa soar como fim, senão ele é só mais um clique. */
          nextLabel="Concluir e continuar"
          nextHint={
            somSeguinte ? `Em seguida: o som ${nomeDaLicao(somSeguinte, allLetters(), course.modules)}, a outra metade de ${letter.namePt}`
              : moduleFinished && mod?.checkpoint ? `Em seguida: Checkpoint ${mod.n}`
              : after ? `Em seguida: letra ${after.namePt}` : 'De volta ao mapa do curso'
          }
        />
      )}
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
          ← Mapa
        </Link>
        <Badge tone="accent">
          Módulo {letter.module} · lição {letter.lesson} · letra {letter.order}/22
        </Badge>
      </div>
      <ol className="flex items-center gap-1.5" aria-label="Etapas da lição">
        {STAGES.map(s => {
          const isDone = stagesDone.includes(s.n);
          const isNow = stage === s.n;
          return (
            <li key={s.n} className="flex-1">
              <button
                type="button"
                onClick={() => onStage(s.n)}
                aria-current={isNow ? 'step' : undefined}
                aria-label={`Etapa ${s.n} de 5 - ${s.label}`}
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
  const mostraTudo = !enxuta || completa;
  return (
    <div className="grid gap-5">
      <Card className="p-6 sm:p-8 grid gap-6">
        <HebrewLetterCard letter={letter} />
        {mostraTudo && <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
            Quando terminar esta aula
          </p>
          <p className="text-[16px] leading-relaxed text-ink-body">
            Você vai conseguir reconhecer, pronunciar, ler e escrever{' '}
            <He size="inline">{letter.letter}</He>
            {letter.finalForm && <> - e a sua forma final, <He size="inline">{letter.finalForm}</He></>}.
          </p>
        </div>}
      </Card>

      <Card className="p-6 grid gap-3">
        <h2 className="text-[19px] font-semibold">Como pronunciar</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          <Prose text={letter.soundNotePt} />
        </p>
        {/* O lugar de onde o som sai, desenhado - em toda letra. */}
        <OndeNasceOSom articulacao={letter.articulacao} letra={letter.namePt} />
      </Card>

      {/* As duas (ou três) leituras, com um botão de som para cada uma.
          ──────────────────────────────────────────────────────────────
          O curso explicava em prosa que {{ש}} tem duas leituras e dava ao
          aluno UM botão de áudio - o da letra. Quem precisa ouvir a
          diferença entre "ch" e "s" não tinha onde ouvir a diferença.
          Cada variante tem `audioId` próprio; enquanto não há gravação,
          o botão simplesmente não aparece, e o quadro continua ensinando
          pelo desenho e pelo texto. */}
      <Leituras letter={letter} />

      {/* O que a letra FAZ, e não só que som ela tem.
          ──────────────────────────────────────────────────────────────
          Era o buraco da lição: o curso dizia "esta letra faz /m/" e
          seguia para as sílabas. As perguntas que o adulto brasileiro
          realmente tem - "por que essa letra está aí se eu não a escuto?",
          "por que ela mudou de formato?", "isso é vogal ou consoante?" -
          não eram respondidas em lugar nenhum, e a conclusão que sobrava
          era a de que o hebraico é arbitrário. */}
      {mostraTudo ? (
        <>
          <Ensinamento letter={letter} />
          <BrazilianTip mistake={letter.brazilianMistake} />
        </>
      ) : (
        <>
          {letter.ensino && <Lembre texto={letter.ensino.lembrePt} />}
          <button type="button" onClick={() => setCompleta(true)} aria-expanded={false}
                  className="justify-self-start min-h-[44px] px-1 font-ui text-[14.5px] font-semibold
                             text-[var(--accent)] underline underline-offset-2">
            Ver a explicação completa
          </button>
        </>
      )}

      <Card className="p-6 grid gap-4">
        <div className="grid gap-1">
          <h2 className="text-[19px] font-semibold">A letra com cada vogal</h2>
          <p className="font-ui text-[13.5px] text-ink-muted">
            Toque numa sílaba para ver a dica de pronúncia.
          </p>
        </div>
        <SyllableTrainer letter={letter} />
        {/* Ler as sílabas em voz alta e se ouvir: é onde a pronúncia da letra
            nova se forma, antes de ela virar hábito errado. */}
        <GravarLeitura
          titulo="Leia as sílabas em voz alta"
          instrucao={`Leia as ${letter.syllables.length} sílabas acima, da direita para a esquerda, grave e se ouça.`}
          audioId={letter.audioId}
          maxSegundos={45}
        />
        {/* Sílaba por sílaba, contra a gravação do curso: some sozinho
            enquanto nenhuma sílaba desta letra estiver gravada. */}
        <CompararPronuncia itens={letter.syllables} />
      </Card>

      {/* The same five vowels on the letters already learned. Seeing the column
          is what turns "מַ se lê ma" into "o patach faz a" - the generalisation
          the course depends on and used to leave the learner to make alone. */}
      {mostraTudo && history.length > 1 && (
        <SoundLab
          letters={history}
          compact
          title="Compare com as letras que você já sabe"
        />
      )}

      {/* Explicação → exemplo → PERGUNTAS → prática. A checagem fecha a
          etapa: duas a quatro perguntas sobre o que foi EXPLICADO, e não
          sobre o desenho da letra - reconhecer a forma o resto da lição já
          cobra. Ver components/learn/Compreensao.tsx. */}
      {letter.ensino?.checagem?.length > 0 && (
        <Compreensao
          id={`checagem-${letter.id}`}
          titulo="Entendeu? Perguntas rápidas"
          intro="Não vale nota e não tranca nada. Se errar, a explicação aparece na hora."
          perguntas={letter.ensino.checagem}
          fecho={{
            bom: 'Boa. Agora as palavras que esta letra abre.',
            parcial: 'Vale reler os quadros acima - são duas ou três ideias, e elas voltam nas próximas letras.'
          }}
        />
      )}

      <Button size="lg" onClick={onDone} full>Continuar para as palavras</Button>
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
   {{גָּבוֹהַּ}} errado e não entende por quê. */
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
  if (!e) return null;

  return (
    <div className="grid gap-4">
      <Card className="p-6 grid gap-3">
        <h2 className="text-[19px] font-semibold">O que esta letra faz</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          <Prose text={e.funcaoPt} />
        </p>
      </Card>

      {e.detalhePt && (
        <Card className="p-6 grid gap-3">
          <h2 className="text-[19px] font-semibold">Detalhe importante</h2>
          {/* A forma final MOSTRADA, e não só descrita: o par lado a lado
              diz em dois segundos o que um parágrafo não diz. */}
          {letter.finalForm && (
            <div className="flex items-center justify-center gap-5 rounded-[var(--r-md)]
                            bg-surface-2 px-4 py-4">
              <span className="grid justify-items-center gap-1">
                <He size="lg">{letter.letter}</He>
                <span className="font-ui text-[12px] text-ink-muted">no meio</span>
              </span>
              <span aria-hidden className="text-ink-muted text-[20px]">→</span>
              <span className="grid justify-items-center gap-1">
                <He size="lg">{letter.finalForm}</He>
                <span className="font-ui text-[12px] text-ink-muted">no fim</span>
              </span>
            </div>
          )}
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            <Prose text={e.detalhePt} />
          </p>
        </Card>
      )}

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

      <Lembre texto={e.lembrePt} />
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
        O que você precisa lembrar
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
            <h2 className="text-[21px] font-bold">Palavras que você já consegue ler</h2>
            <p className="font-ui text-[14px] text-ink-muted">
              Tente decifrar antes de revelar. Todas usam só letras que você já aprendeu.
            </p>
          </div>
          <WordList letter={letter} />
          <CompararPronuncia itens={letter.wordsToRead} titulo="Compare a sua leitura das palavras com a do curso" />
        </section>
      ) : (
        <Card tone="amber" className="p-6 grid gap-2">
          <h2 className="text-[18px] font-semibold">Ainda não dá para formar uma palavra</h2>
          <p className="text-[15px] leading-relaxed text-ink-body">
            Com {letter.alphabetSoFar.filter(c => c.length === 1).length === 2 ? 'uma consoante só' : 'as poucas letras que você tem até aqui'},
            nenhuma combinação fecha uma palavra de verdade. Isso muda já na próxima
            letra - e não volta a acontecer. Por enquanto, leia as sílabas.
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
          <p className="text-[15.5px] leading-relaxed text-ink-body">
            <Prose text={letter.didYouKnow} />
          </p>
        </Card>
      )}

      {/* Only the scenes this letter unlocks, and only ones the learner can
          decode - a sign you cannot read is not a reward. Most letters have
          none, which is what keeps the ones that do feeling earned.

          One at a time: vav unlocks three at once, and three stacked sign
          cards added 1,500px to a stage that was already five screens long.
          The first is the reward; the rest are there for whoever wants them. */}
      <Scenes letter={letter} />

      <Button size="lg" onClick={onDone} full>Continuar para a escrita</Button>
    </div>
  );
}

function Scenes({ letter }: { letter: Letter }) {
  const scenes = scenesForOrder(letter.order);
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
          Mais {rest} {rest === 1 ? 'lugar' : 'lugares'} onde você já consegue ler
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
          Ver mais {Math.min(3, rest)} {rest === 1 ? 'palavra' : 'palavras'}
          <span className="text-ink-muted"> · {rest} restantes</span>
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
        <h2 className="text-[21px] font-bold">Aprendendo a escrever</h2>
        <p className="font-ui text-[14px] text-ink-muted">
          A mesma letra, no desenho que se usa à mão.
        </p>
      </div>

      <Card className="p-6 grid gap-5">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="grid gap-2 justify-items-center">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">Impressa</p>
            <He size="display">{letter.letter}</He>
          </div>
          <div className="grid gap-2 justify-items-center">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">Cursiva</p>
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
          label={`${letter.namePt} - forma final`}
          onScored={score => p.recordWriting(letter.id, score)}
        />
      )}

      <Button size="lg" onClick={onDone} full>Continuar para a prática</Button>
    </div>
  );
}

/* ── 4 · praticar ───────────────────────────────────────────────────────── */
function StagePraticar({
  exercises, letter, onDone
}: { exercises: Exercise[]; letter: Letter; onDone: () => void }) {
  const [finished, setFinished] = useState(false);

  if (!exercises.length) {
    return (
      <div className="grid gap-5">
        <ReadAloudRow items={letter.syllables.map(s => s.he)} label="Leia em voz alta" />
        <Button size="lg" onClick={onDone} full>Continuar</Button>
      </div>
    );
  }

  return finished ? (
    <div className="grid gap-5">
      <Milestone
        kicker="Prática concluída"
        title="Agora o teste de verdade"
        body="A próxima etapa vale nota, e você pode repetir quantas vezes quiser."
      />
      <Button size="lg" onClick={onDone} full>Ir para a fixação</Button>
    </div>
  ) : (
    <ExercisePlayer
      exercises={exercises}
      title="Prática - sem nota"
      onDone={() => setFinished(true)}
    />
  );
}

/* ── 5 · fixação: o mini-teste, com portão de domínio ───────────────────
 *
 * Aqui a lição deixa de ser "rolei até o fim" e passa a ser "mostrei que
 * sei". Seis questões, e 80% delas - cinco - para a letra contar como
 * dominada. (Dizia "oito questões" aqui, e eram cinco: um comentário que
 * envelheceu sozinho porque não havia nada medindo se ele era verdade.)
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
  exercises, letter, history, result, onResult, onRetry, onNext, nextLabel, nextHint
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
            Vamos praticar mais um pouco.
          </p>
          <p className="font-ui text-[14.5px] leading-relaxed text-[var(--gold-body)]">
            Estas {reforco.length} questões saem do que escapou agora há pouco.
            Nada aqui vale nota.
          </p>
        </Card>
        <ExercisePlayer
          key={`ref-${letter.id}-${result.correct}`}
          exercises={reforco}
          title="Reforço"
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
        <Milestone
          tone={strong || fezReforco ? 'bom' : 'parcial'}
          kicker={`${result.correct} de ${result.total} · ${pct}%`}
          title={strong ? 'Mais uma letra dominada.'
            : fezReforco ? 'Reforço feito.'
            : result.score >= 0.6 ? 'Quase lá.'
            : `Vamos firmar ${letter.namePt}.`}
          /* A mensagem acompanha a nota de verdade. "Faltou pouco" num
             resultado de zero é a plataforma fingindo que não viu. */
          body={strong
            ? `Você reconhece ${letter.namePt} sozinha, dentro de uma palavra e entre as parecidas. Pode seguir com segurança.`
            : fezReforco
              ? `${letter.namePt} entrou na fila de revisão e volta amanhã, no dia certo. `
                + 'Ela ainda não conta como dominada - refaça o teste quando quiser, '
                + 'com outras perguntas, e ela passa a contar. Pode seguir.'
              : result.score >= 0.6
                ? 'Faltou pouco. Quatro questões rápidas, montadas a partir do que escapou, e seguimos.'
                : 'Esta letra ainda não está firme, e tudo bem - é para isso que existe a prática. Quatro questões montadas a partir do que escapou.'}
        >
          {!strong && !fezReforco && reforco.length > 0 && (
            <Button onClick={() => setFase('reforco')}>Praticar mais um pouco</Button>
          )}
          <Button variant={strong ? 'secondary' : 'ghost'} onClick={() => { setFase('teste'); onRetry(); }}>
            Refazer o teste
          </Button>
          <Button variant={strong || fezReforco ? 'primary' : 'secondary'} onClick={onNext}>
            {nextLabel}
          </Button>
          <p className="basis-full font-ui text-[13px] text-ink-muted m-0">{nextHint}</p>
        </Milestone>
      </div>
    );
  }

  return (
    <ExercisePlayer
      exercises={exercises}
      title={`Mini-teste - letra ${letter.namePt}`}
      onDone={r => { track('quiz_completed', { letterId: letter.id, score: r.score }); onResult(r); }}
    />
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
            A letra <He size="inline">{letter.letter}</He> ainda não abriu
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-body max-w-[46ch] mx-auto">
            {porque.falta === 'licao' ? (
              <>Ela vem depois de <strong className="font-semibold text-ink">{anterior?.namePt}</strong>,
              e essa lição ainda não foi concluída. Cada letra usa as anteriores nas
              palavras - é por isso que a ordem importa.</>
            ) : (
              <>Falta a fixação de <strong className="font-semibold text-ink">{anterior?.namePt}</strong>.
              Sua melhor nota lá foi {Math.round((porque.nota ?? 0) * 100)}%, e esta letra abre
              a partir de {Math.round(LIBERA_MARK * 100)}%. Dá para refazer quantas vezes quiser -
              as perguntas mudam a cada tentativa.</>
            )}
          </p>
        </div>
        <div className="grid gap-2 w-full max-w-[320px] pt-1">
          <LinkButton href={rotaDaLicao(porque.anterior)} size="lg" full>
            {porque.falta === 'licao'
              ? `Ir para ${anterior?.namePt}`
              : `Refazer a fixação de ${anterior?.namePt}`}
          </LinkButton>
          {atual !== porque.anterior && atualL && (
            <LinkButton href={rotaDaLicao(atual)} variant="secondary" full>
              Continuar de onde parei ({atualL.namePt})
            </LinkButton>
          )}
          <LinkButton href="/mapa" variant="ghost" full>Ver o mapa</LinkButton>
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
  if (!letter.variantes?.length) return null;

  return (
    <Card className="p-6 grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-[19px] font-semibold">
          {letter.variantes.length === 2 ? 'As duas leituras' : 'As leituras desta letra'}
        </h2>
        <p className="font-ui text-[13.5px] text-ink-muted">
          Mesmo desenho de letra. O que muda é o sinal - e é nele que você olha
          antes de pronunciar.
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
              <span className="ml-auto shrink-0">
                <AudioButton audioId={v.audioId} label="" size="sm" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
