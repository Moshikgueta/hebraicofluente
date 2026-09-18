'use client';

/* The final challenge. It is gated by real progress, not by a paywall or a
   timer: it only makes sense once the alphabet is in place, and it says so. */

import { useMemo, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone, ProgressBar } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { audioAvailable } from '@/components/learn/AudioButton';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, scenesUpTo } from '@/lib/content';
import { buildFinalChallenge } from '@/lib/engine/exercises';
import { isLessonComplete } from '@/lib/state/rules';

export function FinalChallengeClient() {
  const p = useProgress();
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [result, setResult] = useState<PlayerResult | null>(null);

  const letters = allLetters();
  const ready = letters.filter(l => isLessonComplete(p.state, l.id));
  /* Every scene, because by here every letter is taught. */
  const scenes = useMemo(() => scenesUpTo(course.totalLetters), []);
  const exercises = useMemo(
    () => buildFinalChallenge(letters, scenes, {
      audioAvailable: audioAvailable(), count: 20, seed: 'final'
    }),
    [letters, scenes]
  );

  if (phase === 'done' && result) {
    return (
      <div className="focus-col grid gap-6">
        <Milestone
          kicker={`${result.correct} de ${result.total}`}
          title="Agora você consegue ler hebraico."
          body="Há algumas semanas isto era um conjunto de símbolos. Você reconhece as 22 letras, as 5 formas finais e lê palavras inteiras com nikud."
        />
        <Card className="p-7 grid gap-4 text-center">
          <p className="font-display text-[44px] font-bold text-ink tabular-nums">
            {ready.length} / {course.totalLetters}
          </p>
          <p className="font-ui text-[14px] text-ink-muted">letras dominadas</p>
          <LinkButton href="/concluido" size="lg" className="justify-self-center">
            Ver o que você conquistou
          </LinkButton>
        </Card>
        <NextCoursePreview />
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <ExercisePlayer
        exercises={exercises}
        title="O desafio final"
        onDone={r => { setResult(r); p.finishFinalChallenge(r.score); setPhase('done'); }}
      />
    );
  }

  const enough = ready.length >= course.totalLetters;

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Badge tone="teal">O desafio final</Badge>
        <h1 className="text-[28px] sm:text-[36px] font-bold leading-tight">
          Hebraico de verdade, sem apoio
        </h1>
        <p className="text-[16px] leading-relaxed text-ink-body max-w-[52ch]">
          20 questões com as 22 letras: reconhecimento, leitura, formas finais e
          vocabulário — sem transliteração para se apoiar.
        </p>
      </header>

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
      </Card>

      {enough ? (
        <Button size="lg" full onClick={() => setPhase('running')}>Começar o desafio</Button>
      ) : (
        <Card tone="amber" className="p-5 grid gap-3">
          <p className="text-[15px] leading-relaxed text-ink-body">
            Faltam {course.totalLetters - ready.length} letras. O desafio só faz
            sentido com o alfabeto inteiro — e ele fica aqui esperando, sem prazo.
          </p>
          <LinkButton href="/mapa" variant="secondary" className="justify-self-start">
            Voltar ao mapa
          </LinkButton>
        </Card>
      )}
    </div>
  );
}

/* No urgency, no countdown, no popup. The course is finished and stays
   available; this is a door, not a wall. */
function NextCoursePreview() {
  return (
    <Card tone="wash" className="p-6 sm:p-8 grid gap-4">
      <Badge tone="teal">Depois do alfabeto</Badge>
      <h2 className="text-[22px] font-bold leading-snug">
        Você aprendeu a ler. Agora está pronto para começar a entender e falar.
      </h2>
      <ul className="grid gap-2 text-[15px] leading-relaxed text-ink-body">
        {['Apresentação pessoal', 'Perguntas básicas', 'Verbos essenciais',
          'Situações do dia a dia', 'Conversação', 'Compreensão']
          .map(s => (
            <li key={s} className="flex gap-3">
              <span aria-hidden className="text-[var(--teal-band)]">→</span>{s}
            </li>
          ))}
      </ul>
      <div className="flex flex-wrap gap-3 pt-1">
        <LinkButton href="/mapa" variant="secondary">Continuar revisando</LinkButton>
      </div>
      <p className="font-ui text-[12.5px] text-ink-muted">
        O curso de alfabetização continua aberto para sempre. Nada aqui é bloqueado.
      </p>
    </Card>
  );
}
