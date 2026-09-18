'use client';

/* Modules 6 and 7 as lessons.
 *
 * They introduce no letter, so they do not fit the five-stage letter template —
 * and forcing them into it would be worse than useless: there is no new glyph
 * to trace and no new syllable table. What they do have is the plan's own three
 * lessons, so that is the shape:
 *
 *   module 6 — 16: the three letters without their dot
 *              17: the five final forms, together for the first time
 *              18: read without nikud
 *   module 7 — 19: the gerech
 *              20: read the loanwords
 *              21: the quiz that closes the alphabet
 *
 * Progress is stored under the module id (`mod6`, `mod7`) in the same
 * `lessons` map as a letter, with three stages instead of five, and the closing
 * quiz is recorded as a checkpoint (`cp6`, `cp7`). No new state shape.
 */

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { AudioButton } from '@/components/learn/AudioButton';
import { Prose, WorkbookLink } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import { course, extras, type CourseModule } from '@/lib/content';
import { buildDageshQuiz, buildGerechQuiz } from '@/lib/engine/extras';
import { EXTRA_STAGE_UNITS } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

export type ExtraSlug = 'sem-o-ponto' | 'sons-modernos';

const STAGES: Record<ExtraSlug, { n: number; label: string; lesson: number }[]> = {
  'sem-o-ponto': [
    { n: 1, label: 'Sem o ponto', lesson: 16 },
    { n: 2, label: 'As finais', lesson: 17 },
    { n: 3, label: 'Sem nikud', lesson: 18 }
  ],
  'sons-modernos': [
    { n: 1, label: 'O gerech', lesson: 19 },
    { n: 2, label: 'Ler', lesson: 20 },
    { n: 3, label: 'Fecho', lesson: 21 }
  ]
};

export function ExtraLessonClient({ slug, module: mod }: { slug: ExtraSlug; module: CourseModule }) {
  const p = useProgress();
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [result, setResult] = useState<PlayerResult | null>(null);
  const [run, setRun] = useState(0);

  const stateId = mod.id;                       // 'mod6' | 'mod7'
  const cpId = `cp${mod.n}`;
  const stagesDone = p.state.lessons[stateId]?.stagesDone ?? [];
  const steps = STAGES[slug];

  const quiz = useMemo(
    () => slug === 'sem-o-ponto'
      ? buildDageshQuiz(extras, 10, `mod6-${run}`)
      : buildGerechQuiz(extras, 8, `mod7-${run}`),
    [slug, run]
  );

  const done = useCallback((n: number) => {
    p.finishStage(stateId, n, EXTRA_STAGE_UNITS);
    if (n < 3) setStage(n + 1);
  }, [p, stateId]);

  const nextModule = course.modules.find(m => m.n === mod.n + 1);

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/modulo/${mod.n}`}
                className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px]
                           text-ink-muted hover:text-ink-body">
            ← Módulo {mod.n}
          </Link>
          <Badge tone="teal">Módulo {mod.n} · lição {steps[stage - 1]?.lesson}</Badge>
        </div>
        <ol className="flex items-center gap-1.5" aria-label="Etapas do módulo">
          {steps.map(s => {
            const isDone = stagesDone.includes(s.n);
            const isNow = stage === s.n;
            return (
              <li key={s.n} className="flex-1">
                <button
                  type="button"
                  onClick={() => setStage(s.n)}
                  aria-current={isNow ? 'step' : undefined}
                  aria-label={`Etapa ${s.n} de 3 — ${s.label}`}
                  className="w-full min-h-[44px] grid content-center gap-1.5"
                >
                  <span className={`block h-1.5 rounded-full transition-colors
                    ${isNow ? 'bg-[var(--teal-band)]' : isDone ? 'bg-[var(--green)]' : 'bg-surface-2'}`} />
                  <span className={`font-ui text-[11px] sm:text-[12px]
                    ${isNow ? 'text-ink font-semibold' : 'text-ink-muted'}`}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      {slug === 'sem-o-ponto' && stage === 1 && <DageshStage onDone={() => done(1)} />}
      {slug === 'sem-o-ponto' && stage === 2 && <FinalsStage onDone={() => done(2)} />}
      {slug === 'sons-modernos' && stage === 1 && <GerechStage onDone={() => done(1)} />}
      {slug === 'sons-modernos' && stage === 2 && <GerechWordsStage onDone={() => done(2)} />}

      {stage === 3 && (
        result ? (
          <ClosingResult
            mod={mod} result={result}
            onRetry={() => { setResult(null); setRun(n => n + 1); }}
            onNext={() => {
              if (nextModule && nextModule.n <= 7) router.push(`/modulo/${nextModule.n}`);
              else router.push('/desafio-final');
            }}
            nextLabel={nextModule && nextModule.n <= 7
              ? `Módulo ${nextModule.n} — ${nextModule.titlePt}`
              : 'Ir para o desafio final'}
          />
        ) : slug === 'sem-o-ponto' ? (
          <UnpointedStage
            quiz={quiz}
            onDone={r => {
              setResult(r);
              p.finishCheckpoint(cpId, r.score);
              p.finishStage(stateId, 3, EXTRA_STAGE_UNITS);
            }}
          />
        ) : (
          <ExercisePlayer
            key={run}
            exercises={quiz}
            title="Fecho do alfabeto"
            onDone={r => {
              setResult(r);
              p.finishCheckpoint(cpId, r.score);
              p.finishStage(stateId, 3, EXTRA_STAGE_UNITS);
            }}
          />
        )
      )}

      {stage < 3 && <WorkbookLink pages={mod.workbookPages} what="este módulo" />}
    </div>
  );
}

/* ── 6.1 · the three letters without their dot ──────────────────────────── */
function DageshStage({ onDone }: { onDone: () => void }) {
  const D = extras.dagesh;
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h1 className="text-[25px] sm:text-[30px] font-bold leading-tight">Sem o ponto</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">
          Três letras — <He size="inline">ב</He>, <He size="inline">כ</He> e{' '}
          <He size="inline">פ</He> — têm dois sons. <Prose text={D.rulePt} />
        </p>
      </div>

      <Card tone="amber" className="p-5">
        <p className="font-ui text-[13px] font-semibold uppercase tracking-[.06em] text-[var(--amber)] mb-2">
          Isto não é detalhe de acabamento
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body"><Prose text={D.warningPt} /></p>
      </Card>

      {D.letters.map(L => (
        <Card key={L.id} className="p-5 sm:p-6 grid gap-4">
          <div className="flex items-baseline gap-4 flex-wrap">
            <He size="xl">{L.hard}</He>
            <span className="text-ink-muted">e</span>
            <He size="xl">{L.soft}</He>
            <h2 className="font-display text-[18px] font-semibold ml-auto">{L.namePt}</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {([['Com daguesh', L.hard, L.hardPt, L.hardWords],
               ['Sem daguesh', L.soft, L.softPt, L.softWords]] as const).map(([label, glyph, sound, words]) => (
              <div key={label} className="rounded-[var(--r-md)] bg-surface-2 p-4 grid gap-3">
                <div className="flex items-center gap-3">
                  <He size="lg">{glyph}</He>
                  <span className="font-ui text-[15px] font-semibold text-[var(--teal-band)]">{sound}</span>
                  <span className="font-ui text-[12px] text-ink-muted ml-auto">{label}</span>
                </div>
                <ul className="grid gap-1.5">
                  {words.map(w => (
                    <li key={w.he} className="flex items-baseline justify-between gap-3">
                      <He size="word" mark={L.soft}>{w.he}</He>
                      <span className="font-ui text-[12.5px] text-ink-muted text-right">{w.pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-[14.5px] leading-relaxed text-ink-body"><Prose text={L.notePt} /></p>
          <p className="font-ui text-[12.5px] text-ink-muted">
            À mão ninguém escreve o daguesh — a cursiva é a mesma nos dois casos.
            Só o contexto distingue.
          </p>
        </Card>
      ))}

      <Button size="lg" full onClick={onDone}>Continuar para as formas finais</Button>
    </div>
  );
}

/* ── 6.2 · the five finals, together ────────────────────────────────────── */
function FinalsStage({ onDone }: { onDone: () => void }) {
  const F = extras.finals;
  const descends = F.filter(x => x.descends);
  const stays = F.filter(x => !x.descends);
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h1 className="text-[25px] sm:text-[30px] font-bold leading-tight">As cinco formas finais</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">
          Você conheceu cada uma junto com a sua letra. Aqui elas estão juntas pela
          primeira vez — e é assim, em bloco, que elas se fixam.
        </p>
      </div>

      <div className="grid gap-3">
        {F.map(x => (
          <Card key={x.fin} className="p-4 grid grid-cols-[auto_auto_1fr_auto] items-center gap-4">
            <He size="lg" dim>{x.base}</He>
            <span aria-hidden className="text-ink-muted">→</span>
            <span className="flex items-baseline gap-3 flex-wrap">
              <He size="lg">{x.fin}</He>
              <span className="font-ui text-[13px] text-ink-muted">{x.namePt}</span>
            </span>
            <span className="grid gap-0.5 justify-items-end">
              <He size="word" mark={x.fin}>{x.word}</He>
              <span className="font-ui text-[12px] text-ink-muted">{x.pt}</span>
            </span>
          </Card>
        ))}
      </div>

      <Card tone="wash" className="p-5 grid gap-3">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-[var(--teal-band)]">
          O atalho visual
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body">
          Quatro das cinco descem abaixo da linha —{' '}
          <HeSeq items={descends.map(x => x.fin)} size="word" sep={null} /> — e só{' '}
          <He size="word">{stays[0]?.fin ?? ''}</He> fecha em cima.
          Se desceu, é fim de palavra.
        </p>
      </Card>

      <Button size="lg" full onClick={onDone}>Continuar — ler sem nikud</Button>
    </div>
  );
}

/* ── 6.3 · reading without the vowels ───────────────────────────────────── */
function UnpointedStage({
  quiz, onDone
}: { quiz: ReturnType<typeof buildDageshQuiz>; onDone: (r: PlayerResult) => void }) {
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const U = extras.unpointed;

  if (phase === 'quiz') {
    return <ExercisePlayer exercises={quiz} title="Módulo 6 — fecho" onDone={onDone} />;
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h1 className="text-[25px] sm:text-[30px] font-bold leading-tight">Ler sem nikud</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">{U.introPt}</p>
      </div>

      <div className="grid gap-2.5">
        {U.words.map(w => <UnpointedRow key={w.bare} word={w} />)}
      </div>

      <Button size="lg" full onClick={() => { track('checkpoint_started', { checkpointId: 'cp6' }); setPhase('quiz'); }}>
        Estou pronto — fazer o fecho do módulo
      </Button>
    </div>
  );
}

function UnpointedRow({
  word
}: { word: { bare: string; pointed: string; translit: string; pt: string; audioId: string } }) {
  const [shown, setShown] = useState(false);
  return (
    <Card className="p-4 flex items-center gap-4">
      <He size="lg">{word.bare}</He>
      <div className="ml-auto flex items-center gap-3">
        {shown ? (
          <span className="grid gap-0.5 justify-items-end animate-rise">
            <He size="word" dim>{word.pointed}</He>
            <span className="font-ui text-[12.5px] text-ink-muted">{word.translit} · {word.pt}</span>
          </span>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShown(true)}>Conferir</Button>
        )}
        <AudioButton audioId={word.audioId} label="" size="sm" />
      </div>
    </Card>
  );
}

/* ── 7.1 · the gerech ───────────────────────────────────────────────────── */
function GerechStage({ onDone }: { onDone: () => void }) {
  const G = extras.gerech;
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h1 className="text-[25px] sm:text-[30px] font-bold leading-tight">Os sons modernos</h1>
        <p className="text-[16px] leading-relaxed text-ink-body"><Prose text={G.introPt} /></p>
      </div>

      <Card className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">O sinal</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body"><Prose text={G.signNotePt} /></p>
      </Card>

      <div className="grid gap-3">
        {G.letters.map(g => (
          <Card key={g.id} className="p-5 grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-4">
            <He size="lg" dim>{g.base}</He>
            <span aria-hidden className="text-ink-muted">→</span>
            <He size="lg">{g.he}</He>
            <span className="grid gap-0.5 min-w-0">
              <span className="font-ui text-[16px] font-semibold text-[var(--teal-band)]">{g.pt}</span>
              <span className="font-ui text-[12.5px] text-ink-muted leading-snug">{g.likePt}</span>
            </span>
            <AudioButton audioId={g.audioId} label="" size="sm" />
          </Card>
        ))}
      </div>

      <Card tone="wash" className="p-5">
        <p className="text-[15px] leading-relaxed text-ink-body">
          Estes três sons quase só aparecem em nomes próprios e em palavras
          importadas — que é exatamente onde um brasileiro mais acerta, porque já
          sabe como elas soam.
        </p>
      </Card>

      <Button size="lg" full onClick={onDone}>Continuar — ler as palavras</Button>
    </div>
  );
}

/* ── 7.2 · the loanwords ────────────────────────────────────────────────── */
function GerechWordsStage({ onDone }: { onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h1 className="text-[25px] sm:text-[30px] font-bold leading-tight">Leia e confira</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">
          Todas as palavras desta página você já conhece em português. Leia cada
          uma em voz alta antes de olhar o significado.
        </p>
      </div>

      {extras.gerech.letters.map(g => (
        <Card key={g.id} className="p-5 grid gap-3">
          <div className="flex items-center gap-3">
            <He size="lg">{g.he}</He>
            <span className="font-ui text-[15px] font-semibold text-[var(--teal-band)]">{g.pt}</span>
            <span className="ml-auto"><AudioButton audioId={g.audioId} label="" size="sm" /></span>
          </div>
          <ul className="grid gap-2">
            {g.words.map(w => (
              <li key={w.he}
                  className="flex items-center justify-between gap-4 rounded-[var(--r-md)]
                             bg-surface-2 px-4 py-3">
                <He size="word" mark={g.he}>{w.he}</He>
                <span className="font-ui text-[13.5px] text-ink-muted">{w.pt}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Button size="lg" full onClick={onDone}>Continuar para o fecho</Button>
    </div>
  );
}

function ClosingResult({
  mod, result, onRetry, onNext, nextLabel
}: {
  mod: CourseModule; result: PlayerResult;
  onRetry: () => void; onNext: () => void; nextLabel: string;
}) {
  const pct = Math.round(result.score * 100);
  const strong = result.score >= 0.7;
  return (
    <div className="grid gap-5">
      <Milestone
        kicker={`Módulo ${mod.n} · ${result.correct} de ${result.total} · ${pct}%`}
        title={strong ? 'Módulo concluído.' : 'Vale repetir antes de seguir.'}
        body={strong
          ? 'Este é o módulo que separa quem decora de quem lê.'
          : 'Sem pressa e sem penalidade — refaça e veja o que ainda escapa.'}
      >
        <Button variant={strong ? 'secondary' : 'primary'} onClick={onRetry}>Refazer</Button>
        <Button variant={strong ? 'primary' : 'secondary'} onClick={onNext}>{nextLabel}</Button>
      </Milestone>
      {strong && (
        <Card tone="mint" className="p-5">
          <p className="text-[16px] leading-relaxed text-ink"><Prose text={mod.milestonePt} /></p>
        </Card>
      )}
    </div>
  );
}
