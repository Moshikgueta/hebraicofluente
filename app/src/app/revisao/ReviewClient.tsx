'use client';

/* The quick review. Built from what this learner actually missed — never a
   generic drill — which is the whole reason the SRS pool stores misses rather
   than a log of everything seen. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { audioAvailable } from '@/components/learn/AudioButton';
import { useProgress } from '@/lib/state/store';
import { allLetters, getLetter } from '@/lib/content';
import { buildReview } from '@/lib/engine/exercises';
import { dueItems } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

export function ReviewClient() {
  const p = useProgress();
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [result, setResult] = useState<PlayerResult | null>(null);
  const [run, setRun] = useState(0);

  /* Only letters whose lesson is done can be reviewed: reviewing a letter the
     learner has not met yet is a test, not a review. */
  const learned = useMemo(
    () => allLetters().filter(l => (p.state.lessons[l.id]?.stagesDone.length ?? 0) > 0),
    [p.state.lessons]
  );
  const due = useMemo(() => dueItems(p.state, p.day), [p.state, p.day]);
  const weak = p.weak.length ? p.weak : learned.slice(-3).map(l => l.id);

  const exercises = useMemo(
    () => buildReview(weak, learned, { audioAvailable: audioAvailable(), count: 5, seed: `rev-${p.day}-${run}` }),
    [weak, learned, p.day, run]
  );

  if (!p.ready) return null;

  if (!learned.length) {
    return (
      <Card className="p-7 grid gap-3">
        <h1 className="text-[23px] font-bold">Ainda não há o que revisar</h1>
        <p className="text-[15px] leading-relaxed text-ink-body max-w-[48ch]">
          A revisão rápida se alimenta do que você erra. Faça a primeira lição e
          ela começa a aparecer aqui, no dia certo.
        </p>
        <LinkButton href="/" className="justify-self-start">Ir para a primeira lição</LinkButton>
      </Card>
    );
  }

  if (phase === 'done' && result) {
    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={`${result.correct} de ${result.total}`}
          title="Revisão feita."
          body="O que você errar hoje volta daqui a um dia. O que acertar volta mais tarde, e some quando estiver firme."
        >
          <Button variant="secondary" onClick={() => { setRun(n => n + 1); setResult(null); setPhase('running'); }}>
            Mais cinco
          </Button>
          <LinkButton href="/" variant="primary">Voltar ao início</LinkButton>
        </Milestone>
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <ExercisePlayer
        key={run}
        exercises={exercises}
        title="Revisão rápida"
        onDone={r => { setResult(r); p.finishReview(r.score); setPhase('done'); }}
      />
    );
  }

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-2">
        <Badge tone="neutral">3 minutos</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold">Revisão rápida</h1>
        <p className="font-ui text-[15px] text-ink-muted max-w-[50ch]">
          Cinco questões tiradas do que deu mais trabalho até aqui.
        </p>
      </header>

      <Card className="p-6 grid gap-4">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">
          {due.length ? 'Hoje vale revisar' : 'Nada pendente — vamos reforçar as últimas'}
        </p>
        <ul className="grid gap-2">
          {weak.map(id => {
            const l = getLetter(id);
            if (!l) return null;
            const misses = due.filter(d => d.letterId === id).reduce((a, d) => a + d.misses, 0);
            return (
              <li key={id} className="flex items-center gap-4">
                <He size="lg">{l.letter}</He>
                <span className="font-ui text-[15px] text-ink">{l.namePt}</span>
                {misses > 0 && (
                  <span className="ml-auto font-ui text-[13px] text-ink-muted">
                    {misses} {misses === 1 ? 'escorregada' : 'escorregadas'}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {!exercises.length ? (
        <Card tone="amber" className="p-5">
          <p className="text-[15px] leading-relaxed text-ink-body">
            Ainda não dá para montar uma revisão: com as letras de agora não há
            alternativas suficientes para uma questão honesta. Siga mais uma lição
            e volte.
          </p>
        </Card>
      ) : (
        <Button size="lg" full onClick={() => { track('review_started'); setPhase('running'); }}>
          Começar
        </Button>
      )}

      <Link href="/mapa" className="font-ui text-[13.5px] text-ink-muted hover:text-ink-body justify-self-center">
        Ver o mapa do curso
      </Link>
    </div>
  );
}
