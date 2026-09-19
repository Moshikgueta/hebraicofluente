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

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { WritingCanvas } from '@/components/learn/WritingCanvas';
import { SoundLab } from '@/components/learn/SoundLab';
import { CultureUnlock } from '@/components/learn/Culture';
import { audioAvailable } from '@/components/learn/AudioButton';
import {
  BrazilianTip, BridgeWords, HebrewLetterCard, Prose, ReadAloudRow,
  RealWorldHebrew, SyllableTrainer, WordReveal, WorkbookLink
} from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, cultureAt, nextLetter, scenesForOrder, type Letter } from '@/lib/content';
import {
  buildLetterPractice, buildMiniTest, buildRemedial, type Exercise
} from '@/lib/engine/exercises';
import { track } from '@/lib/analytics';

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
      audioAvailable: audioAvailable(), count: 10,
      seed: `pratica-${letter.id}`, weak: p.weak
    }),
    [letter, history, p.weak]
  );
  /* O mini-teste: cinco itens, um de cada coisa que "saber a letra" quer
     dizer, e o quinto de uma letra anterior. Outra semente a cada tentativa. */
  const quiz = useMemo(
    () => buildMiniTest(letter, history, {
      audioAvailable: audioAvailable(), seed: `mini-${letter.id}-${quizRun}`
    }),
    [letter, history, quizRun]
  );

  const done = useCallback((n: number) => {
    p.finishStage(letter.id, n);
    if (n < 5) setStage(n + 1);
  }, [p, letter.id]);

  const stagesDone = p.state.lessons[letter.id]?.stagesDone ?? [];
  const unlockedCard = cultureAt(p.mastered);
  const after = nextLetter(letter.id);
  const mod = course.modules.find(m => m.n === letter.module);
  const moduleFinished = !!mod && mod.letterIds.every(
    id => id === letter.id || (p.state.lessons[id]?.stagesDone.length ?? 0) >= 5
  );

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
            if (moduleFinished && mod?.checkpoint) router.push(`/checkpoint/${mod.n}`);
            else if (after) router.push(`/licao/${after.id}`);
            else router.push('/mapa');
          }}
          /* O botão diz o ATO, e a linha embaixo dele diz o destino. Antes o
             botão dizia só o destino ("Próxima letra - Bet"), e a lição
             terminava sem nunca dizer que tinha terminado: o fim de uma
             etapa precisa soar como fim, senão ele é só mais um clique. */
          nextLabel="Concluir e continuar"
          nextHint={
            moduleFinished && mod?.checkpoint ? `Em seguida: Checkpoint ${mod.n}`
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
function StageConhecer({
  letter, history, onDone
}: { letter: Letter; history: Letter[]; onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <Card className="p-6 sm:p-8 grid gap-6">
        <HebrewLetterCard letter={letter} />
        <div className="grid gap-2 border-t border-[color:var(--line-soft)] pt-5">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
            Quando terminar esta aula
          </p>
          <p className="text-[16px] leading-relaxed text-ink-body">
            Você vai conseguir reconhecer, pronunciar, ler e escrever{' '}
            <He size="inline">{letter.letter}</He>
            {letter.finalForm && <> - e a sua forma final, <He size="inline">{letter.finalForm}</He></>}.
          </p>
        </div>
      </Card>

      <Card className="p-6 grid gap-3">
        <h2 className="text-[19px] font-semibold">Conhecendo a letra</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body">
          <Prose text={letter.soundNotePt} />
        </p>
      </Card>

      <BrazilianTip mistake={letter.brazilianMistake} />

      <Card className="p-6 grid gap-4">
        <div className="grid gap-1">
          <h2 className="text-[19px] font-semibold">A letra com cada vogal</h2>
          <p className="font-ui text-[13.5px] text-ink-muted">
            Toque numa sílaba para ver a dica de pronúncia.
          </p>
        </div>
        <SyllableTrainer letter={letter} />
      </Card>

      {/* The same five vowels on the letters already learned. Seeing the column
          is what turns "מַ se lê ma" into "o patach faz a" - the generalisation
          the course depends on and used to leave the learner to make alone. */}
      {history.length > 1 && (
        <SoundLab
          letters={history}
          compact
          title="Compare com as letras que você já sabe"
        />
      )}

      <Button size="lg" onClick={onDone} full>Continuar para as palavras</Button>
    </div>
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

      {letter.wordsToRecognize.length > 0 && (
        <Card tone="wash" className="p-6 grid gap-3">
          <Badge tone="accent">Você sabia?</Badge>
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

      <WorkbookLink pages={letter.workbookPages} what="estas palavras" />
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
          Ninguém escreve hebraico à mão em letra de imprensa. A cursiva é a que vale a pena treinar.
        </p>
      </div>

      <Card className="p-6 grid sm:grid-cols-2 gap-6">
        <div className="grid gap-2 justify-items-center">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">Impressa</p>
          <He size="display">{letter.letter}</He>
        </div>
        <div className="grid gap-2 justify-items-center">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">Cursiva</p>
          <He size="display" cursive>{letter.letter}</He>
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

      <WorkbookLink pages={letter.workbookPages} what="a escrita" />
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
 * sei". Cinco questões, e 80% para fechar a letra.
 *
 * O portão NÃO tranca. Quem fica abaixo dos 80% recebe "vamos praticar mais
 * um pouco" e quatro questões montadas a partir dos PRÓPRIOS erros - não um
 * sorteio novo, que seria outra coisa e não reforço. Depois disso a letra
 * fecha de qualquer jeito, com a nota registrada e os itens errados na fila
 * de revisão: travar um adulto na letra 7 é como se perde um aluno, e o
 * sistema de revisão existe justamente para que nada fique para trás sem
 * voltar.
 */
const PASSA = 0.8;

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
              ? `${letter.namePt} entrou na fila de revisão e volta em poucos dias, no dia certo. Pode seguir.`
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
