'use client';

/* A checkpoint closes a module. It is the workbook's own review section, not
 * an invented milestone: the units of the teaching plan hold three to six
 * letters each, and the review lands where the plan puts it.
 *
 * Passing is 70%. Failing is not a failure — it is a suggestion to revisit one
 * or two letters, named specifically, and the retry is unlimited. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone, ProgressBar } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { audioAvailable } from '@/components/learn/AudioButton';
import { Prose, WorkbookLink } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, type CourseModule, type Letter } from '@/lib/content';
import { buildCheckpoint } from '@/lib/engine/exercises';
import { isLessonComplete, PASS_MARK } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

export function CheckpointClient({ module: mod, letters }: { module: CourseModule; letters: Letter[] }) {
  const p = useProgress();
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'running' | 'result'>('intro');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<PlayerResult | null>(null);

  const history = useMemo(() => allLetters().filter(l => l.order <= (mod.upTo ?? 0)), [mod.upTo]);
  const exercises = useMemo(
    () => buildCheckpoint(letters, history, {
      audioAvailable: audioAvailable(), count: 12, seed: `cp-${mod.n}-${run}`
    }),
    [letters, history, mod.n, run]
  );

  const readyLetters = letters.filter(l => isLessonComplete(p.state, l.id));
  const record = mod.checkpoint ? p.state.checkpoints[mod.checkpoint.id] : undefined;
  const nextModule = course.modules.find(m => m.n === mod.n + 1 && m.letterIds.length);

  if (phase === 'result' && result) {
    const pct = Math.round(result.score * 100);
    const passed = result.score >= PASS_MARK;
    /* `missed` holds exercise ids; the letter is their first segment. */
    const weak = [...new Set(result.missed.map(id => id.split('-')[0] ?? ''))]
      .map(id => letters.find(l => l.id === id))
      .filter((l): l is Letter => !!l);

    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={`Checkpoint ${mod.n} · ${result.correct} de ${result.total}`}
          title={passed ? `${pct}% — checkpoint concluído.` : `${pct}% — quase lá.`}
          body={passed
            ? `Você agora conhece ${history.length} letras do alfabeto hebraico.`
            : 'Faltou pouco. Vale rever as letras abaixo e refazer — sem pressa e sem penalidade.'}
        >
          <Button variant={passed ? 'secondary' : 'primary'} onClick={() => { setRun(n => n + 1); setResult(null); setPhase('running'); }}>
            Refazer
          </Button>
          {passed && nextModule && (
            <Button onClick={() => router.push(`/modulo/${nextModule.n}`)}>
              Módulo {nextModule.n} — {nextModule.titlePt}
            </Button>
          )}
          {passed && !nextModule && (
            <Button onClick={() => router.push('/desafio-final')}>Ir para o desafio final</Button>
          )}
        </Milestone>

        {passed && (
          <Card tone="mint" className="p-5">
            <p className="text-[16px] leading-relaxed text-ink"><Prose text={mod.milestonePt} /></p>
          </Card>
        )}

        {weak.length > 0 && (
          <Card className="p-5 grid gap-3">
            <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
              Vale voltar nestas
            </p>
            <ul className="grid gap-2">
              {weak.map(l => (
                <li key={l.id}>
                  <Link href={`/licao/${l.id}`}
                        className="flex items-center gap-4 rounded-[var(--r-md)] p-3 hover:bg-surface-2">
                    <He size="lg">{l.letter}</He>
                    <span className="font-ui text-[15px] text-ink">{l.namePt}</span>
                    <span aria-hidden className="ml-auto text-ink-muted">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <ExercisePlayer
        key={run}
        exercises={exercises}
        title={`Checkpoint ${mod.n}`}
        onDone={r => {
          setResult(r);
          if (mod.checkpoint) p.finishCheckpoint(mod.checkpoint.id, r.score);
          setPhase('result');
        }}
      />
    );
  }

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Link href="/mapa" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">← Mapa</Link>
        <Badge tone="mint">Checkpoint {mod.n}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight">{mod.titlePt}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body max-w-[52ch]">
          <Prose text={mod.introPt} />
        </p>
      </header>

      <Card className="p-6 grid gap-4">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">Você já domina</p>
        <ul className="grid gap-2">
          {letters.map(l => {
            const done = isLessonComplete(p.state, l.id);
            return (
              <li key={l.id} className="flex items-center gap-3">
                <span aria-hidden className={done ? 'text-[var(--green)]' : 'text-ink-muted'}>
                  {done ? '✓' : '○'}
                </span>
                <He size="word" dim={!done}>{l.letter}</He>
                <span className={`font-ui text-[14px] ${done ? 'text-ink' : 'text-ink-muted'}`}>
                  {l.namePt}
                </span>
                {!done && (
                  <Link href={`/licao/${l.id}`}
                        className="ml-auto inline-flex items-center min-h-[44px] pl-3 font-ui text-[13px]
                                   text-[var(--accent)] hover:underline">
                    fazer a lição
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <ProgressBar
          value={letters.length ? readyLetters.length / letters.length : 0}
          label="Lições do módulo"
          sublabel={`${readyLetters.length} / ${letters.length}`}
        />
      </Card>

      <Card tone="wash" className="p-6 grid gap-3">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-[var(--accent)]">
          O que vem no checkpoint
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body">
          12 questões misturando reconhecimento, leitura, vocabulário e as formas
          finais — só com letras que você já viu. Passa com 70%, e dá para refazer
          quantas vezes quiser.
        </p>
        <div className="pt-1">
          <HeSeq items={letters.map(l => l.letter)} size="word" />
        </div>
      </Card>

      {record?.best != null && (
        <p className="font-ui text-[13.5px] text-ink-muted">
          Melhor resultado até agora: {Math.round(record.best * 100)}% em {record.attempts}{' '}
          {record.attempts === 1 ? 'tentativa' : 'tentativas'}.
        </p>
      )}

      <WorkbookLink pages={mod.checkpoint?.workbookPages ?? null} what="esta revisão" />

      {readyLetters.length < letters.length ? (
        <Card tone="amber" className="p-5 grid gap-3">
          <p className="text-[15px] leading-relaxed text-ink-body">
            Faltam {letters.length - readyLetters.length} lições deste módulo. Você pode
            fazer o checkpoint assim mesmo, mas ele cobra as {letters.length} letras.
          </p>
          <Button variant="secondary" className="justify-self-start"
                  onClick={() => { track('checkpoint_started', { checkpointId: mod.checkpoint?.id }); setPhase('running'); }}>
            Fazer mesmo assim
          </Button>
        </Card>
      ) : (
        <Button size="lg" full
                onClick={() => { track('checkpoint_started', { checkpointId: mod.checkpoint?.id }); setPhase('running'); }}>
          Começar o checkpoint
        </Button>
      )}

      <LinkButton href="/mapa" variant="ghost" size="sm" className="justify-self-center">
        Voltar ao mapa
      </LinkButton>
    </div>
  );
}
