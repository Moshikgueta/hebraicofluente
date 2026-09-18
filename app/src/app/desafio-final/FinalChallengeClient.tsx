'use client';

/* O exame final.
 * ─────────────────────────────────────────────────────────────────────────
 * Five parts, six once there are recordings, each scored on its own. A single
 * percentage cannot answer "can this person read Hebrew?", because reading is
 * several skills stacked and a learner can be strong in three of them and
 * still not read — so the report says WHICH part was weak and links straight
 * to the drill for it.
 *
 * It is gated by real progress rather than by a paywall: it only makes sense
 * with the whole alphabet in hand, and it says so. Retries are unlimited, free,
 * and generate a DIFFERENT exam each time — remembering last week's answers is
 * not the skill being examined.
 *
 * Passing is what issues the certificate, which is why the date of the first
 * pass is never overwritten by a later, worse attempt.
 */

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone, ProgressBar } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { audioAvailable } from '@/components/learn/AudioButton';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, scenesUpTo } from '@/lib/content';
import { buildExam, examReport, partsFor, EXAM_PASS, type Exam, type PartResult }
  from '@/lib/engine/exam';
import { isLessonComplete } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

type Phase =
  | { kind: 'intro' }
  | { kind: 'brief'; index: number }        // the screen before a part starts
  | { kind: 'running'; index: number }
  | { kind: 'done' };

export function FinalChallengeClient() {
  const p = useProgress();
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [results, setResults] = useState<PartResult[]>([]);
  const [attempt, setAttempt] = useState(() => (p.state.finalChallenge.attempts ?? 0) + 1);

  const letters = allLetters();
  const ready = letters.filter(l => isLessonComplete(p.state, l.id));
  const audio = audioAvailable();
  const scenes = useMemo(() => scenesUpTo(course.totalLetters), []);

  /* One exam per attempt. Rebuilt only when the attempt number changes, so
     leaving a part and coming back does not reshuffle the questions. */
  const exam = useMemo(
    () => buildExam(letters, scenes, { audioAvailable: audio, attempt }),
    [letters, scenes, audio, attempt]
  );

  const finishPart = useCallback((r: PlayerResult, index: number) => {
    const section = exam.sections[index]!;
    const next = [...results, { partId: section.part.id, correct: r.correct, total: r.total }];
    setResults(next);

    if (index + 1 < exam.sections.length) {
      setPhase({ kind: 'brief', index: index + 1 });
      return;
    }
    const report = examReport(next);
    p.finishExam(report.score, Object.fromEntries(
      next.map(x => [x.partId, { correct: x.correct, total: x.total }])
    ));
    track('course_completed', { score: report.score });
    setPhase({ kind: 'done' });
  }, [exam.sections, results, p]);

  const restart = useCallback(() => {
    setAttempt(n => n + 1);
    setResults([]);
    setPhase({ kind: 'brief', index: 0 });
  }, []);

  /* ── running a part ───────────────────────────────────────────────────── */
  if (phase.kind === 'running') {
    const section = exam.sections[phase.index]!;
    return (
      <div className="grid gap-5">
        <ExamProgress exam={exam} index={phase.index} results={results} />
        <ExercisePlayer
          key={`${attempt}-${section.part.id}`}
          exercises={section.exercises}
          title={`Parte ${phase.index + 1} · ${section.part.titlePt}`}
          onDone={r => finishPart(r, phase.index)}
        />
      </div>
    );
  }

  /* ── the screen between parts ─────────────────────────────────────────── */
  if (phase.kind === 'brief') {
    const section = exam.sections[phase.index]!;
    return (
      <div className="focus-col grid gap-5">
        <ExamProgress exam={exam} index={phase.index} results={results} />
        <Card className="p-6 sm:p-8 grid gap-4">
          <Badge tone="teal">Parte {phase.index + 1} de {exam.sections.length}</Badge>
          <h1 className="text-[26px] sm:text-[32px] font-bold leading-tight">
            {section.part.titlePt}
          </h1>
          <p className="text-[16px] leading-relaxed text-ink-body max-w-[52ch]">
            {section.part.descPt}
          </p>
          <p className="font-ui text-[13.5px] text-ink-muted">
            {section.exercises.length} questões. Sem tempo, sem penalidade por errar.
          </p>
          <Button size="lg" full onClick={() => setPhase({ kind: 'running', index: phase.index })}>
            {results.length === 0 ? 'Começar' : 'Continuar'}
          </Button>
        </Card>
      </div>
    );
  }

  /* ── the report ───────────────────────────────────────────────────────── */
  if (phase.kind === 'done') {
    const report = examReport(results);
    const pct = Math.round(report.score * 100);
    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={`${report.correct} de ${report.total} · ${pct}%`}
          title={report.bandPt.titlePt}
          body={report.bandPt.bodyPt}
        />

        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[color:var(--line-soft)]">
            <h2 className="font-display text-[16px] font-bold text-ink">Parte por parte</h2>
          </div>
          <ul className="divide-y divide-[color:var(--line-soft)]">
            {results.map(r => {
              const part = exam.sections.find(s => s.part.id === r.partId)!.part;
              const s = r.total ? r.correct / r.total : 0;
              const weak = s < EXAM_PASS;
              return (
                <li key={r.partId} className="px-5 py-3.5 grid gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-ui text-[14.5px] font-medium text-ink flex-1 min-w-0">
                      {part.titlePt}
                    </span>
                    <span className="font-ui text-[13.5px] tabular-nums text-ink-muted shrink-0">
                      {r.correct}/{r.total}
                    </span>
                  </div>
                  <span className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <span
                      className={`block h-full rounded-full ${weak ? 'bg-[var(--amber)]' : 'bg-[var(--green)]'}`}
                      style={{ width: `${Math.round(s * 100)}%` }}
                    />
                  </span>
                  {weak && (
                    <Link
                      href="/academia"
                      className="inline-flex items-center min-h-[44px] font-ui text-[13px]
                                 text-[var(--teal-band)] hover:underline"
                    >
                      Treinar {part.titlePt.toLowerCase()} na Academia →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        {report.passed ? (
          <Card tone="mint" className="p-6 grid gap-3">
            <Badge tone="mint">Aprovado</Badge>
            <h2 className="font-display text-[20px] font-bold leading-snug">
              Seu certificado está pronto.
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-body">
              Com o seu nome, a data e as 22 letras — para baixar ou postar.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <LinkButton href="/certificado" size="lg">Ver o certificado</LinkButton>
              <LinkButton href="/concluido" variant="secondary">O que você conquistou</LinkButton>
            </div>
          </Card>
        ) : (
          <Card className="p-6 grid gap-3">
            <p className="text-[15px] leading-relaxed text-ink-body">
              O certificado sai a partir de {Math.round(EXAM_PASS * 100)}%. Faltaram{' '}
              {Math.max(1, Math.ceil(report.total * EXAM_PASS) - report.correct)} questões —
              e a próxima tentativa é um exame novo, não o mesmo.
            </p>
            <Button onClick={restart} className="justify-self-start">Refazer o exame</Button>
          </Card>
        )}

        {report.passed && (
          <Button variant="ghost" onClick={restart} className="justify-self-center">
            Refazer mesmo assim
          </Button>
        )}
      </div>
    );
  }

  /* ── the door ─────────────────────────────────────────────────────────── */
  const enough = ready.length >= course.totalLetters;
  const parts = partsFor(audio);
  const best = p.state.finalChallenge.best;

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Badge tone="teal">Exame final</Badge>
        <h1 className="text-[28px] sm:text-[36px] font-bold leading-tight">
          Hebraico de verdade, sem apoio
        </h1>
        <p className="text-[16px] leading-relaxed text-ink-body max-w-[52ch]">
          {parts.reduce((n, x) => n + x.count, 0)} questões em {parts.length} partes, com as
          22 letras e sem transliteração. Cada parte tem a sua própria nota — no fim
          você vê exatamente o que está firme e o que não está.
        </p>
      </header>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[color:var(--line-soft)]">
          <h2 className="font-display text-[16px] font-bold text-ink">O que cai</h2>
        </div>
        <ol className="divide-y divide-[color:var(--line-soft)]">
          {parts.map((part, i) => (
            <li key={part.id} className="px-5 py-3 flex gap-3">
              <span aria-hidden className="font-ui text-[13px] tabular-nums text-ink-muted w-5 shrink-0">
                {i + 1}
              </span>
              <span className="grid gap-0.5 min-w-0">
                <span className="font-ui text-[14.5px] font-medium text-ink">{part.titlePt}</span>
                <span className="font-ui text-[13px] leading-relaxed text-ink-muted">
                  {part.descPt}
                </span>
              </span>
              <span className="ml-auto font-ui text-[12.5px] tabular-nums text-ink-muted shrink-0">
                {part.count}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      {!audio && (
        <p className="font-ui text-[13px] leading-relaxed text-ink-muted">
          A parte de escuta entra quando as gravações chegarem. Até lá o exame não
          cobra o que o curso ainda não pôde ensinar.
        </p>
      )}

      <Card className="p-6 grid gap-4">
        <ProgressBar
          value={course.totalLetters ? ready.length / course.totalLetters : 0}
          label="Letras concluídas"
          sublabel={`${ready.length} / ${course.totalLetters}`}
        />
        <div className="flex flex-wrap gap-2">
          {letters.map(l => (
            <span key={l.id} className={isLessonComplete(p.state, l.id) ? '' : 'opacity-30'}>
              <He size="word">{l.letter}</He>
            </span>
          ))}
        </div>
        {best != null && (
          <p className="font-ui text-[13px] text-ink-muted">
            Melhor resultado até agora: {Math.round(best * 100)}%
            {p.state.finalChallenge.passedAt ? ' · aprovado' : ''}
            {p.state.finalChallenge.attempts
              ? ` · ${p.state.finalChallenge.attempts} ${p.state.finalChallenge.attempts === 1 ? 'tentativa' : 'tentativas'}`
              : ''}
          </p>
        )}
      </Card>

      {enough ? (
        <>
          <Button size="lg" full onClick={() => setPhase({ kind: 'brief', index: 0 })}>
            Começar o exame
          </Button>
          <p className="font-ui text-[13px] text-ink-muted text-center">
            Aprovação a partir de {Math.round(EXAM_PASS * 100)}%. Sem limite de tentativas,
            e cada tentativa é um exame diferente.
          </p>
          {p.state.finalChallenge.passedAt && (
            <LinkButton href="/certificado" variant="secondary" className="justify-self-center">
              Ver o meu certificado
            </LinkButton>
          )}
        </>
      ) : (
        <Card tone="amber" className="p-5 grid gap-3">
          <p className="text-[15px] leading-relaxed text-ink-body">
            Faltam {course.totalLetters - ready.length} letras. O exame só faz sentido
            com o alfabeto inteiro — e ele fica aqui esperando, sem prazo.
          </p>
          <LinkButton href="/mapa" variant="secondary" className="justify-self-start">
            Voltar ao mapa
          </LinkButton>
        </Card>
      )}
    </div>
  );
}

/* A bar that shows the PARTS, not the questions: in a six-part exam "12 de 30"
   tells the learner much less than "part 3 of 6, two behind you". */
function ExamProgress({
  exam, index, results
}: { exam: Exam; index: number; results: PartResult[] }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Partes do exame">
      {exam.sections.map((s, i) => {
        const done = results.some(r => r.partId === s.part.id);
        const now = i === index;
        return (
          <li key={s.part.id} className="flex-1 grid gap-1.5">
            <span
              className={`block h-1.5 rounded-full ${
                done ? 'bg-[var(--green)]' : now ? 'bg-[var(--teal-band)]' : 'bg-surface-2'}`}
            />
            <span className={`font-ui text-[10.5px] sm:text-[11.5px] leading-none truncate
              ${now ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
              {s.part.titlePt}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
