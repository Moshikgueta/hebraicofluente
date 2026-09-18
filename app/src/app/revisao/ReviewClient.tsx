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
import { dueItems, weakestSkill, weakLetters } from '@/lib/state/rules';
import type { Skill } from '@/lib/state/types';
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

  /* Glyph → letter id, so a confusion stored as "ד for ר" can pull BOTH
     letters into the review. Drilling ד without ר beside it teaches nothing
     about the distinction that is actually failing. */
  const byGlyph = useMemo(() => {
    const m = new Map<string, string>();
    for (const L of allLetters()) {
      m.set(L.letter, L.id);
      if (L.finalForm) m.set(L.finalForm, L.id);
    }
    return m;
  }, []);

  /* The store's `weak` sees only the SRS queue; this one also sees skills that
     have slipped and pairs being traded. */
  const weak = useMemo(() => {
    const w = weakLetters(p.state, p.day, 5, byGlyph).filter(id => learned.some(l => l.id === id));
    return w.length ? w : learned.slice(-3).map(l => l.id);
  }, [p.state, p.day, byGlyph, learned]);

  /* Aim at the failing skill where there is one: a learner who reads ק and
     cannot hear it should get listening, not more reading. */
  const skills = useMemo(() => {
    const wanted = new Set<Skill>();
    for (const id of weak) {
      const s = weakestSkill(p.state.skills[id]);
      /* `escrever` has no generated question — it is produced on a canvas —
         and `ouvir` has none either until the recordings land. Asking for
         either would narrow the review to nothing. */
      if (!s || s === 'escrever') continue;
      if (s === 'ouvir' && !audioAvailable()) continue;
      wanted.add(s);
    }
    return wanted.size && wanted.size < 4 ? [...wanted] : undefined;
  }, [weak, p.state.skills]);

  const exercises = useMemo(
    () => buildReview(weak, learned, {
      audioAvailable: audioAvailable(), count: 5, seed: `rev-${p.day}-${run}`, skills
    }),
    [weak, learned, p.day, run, skills]
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

      {/* Naming the pair, kindly. "Percebemos que ר e ד ainda estão
          confundindo você" is a fact about the work, not about the learner —
          and it is the thing that makes the review feel like it is paying
          attention rather than shuffling. */}
      {p.confusions.length > 0 && (
        <Card tone="wash" className="p-5 grid gap-2">
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
            Percebemos que <He size="inline">{p.confusions[0]!.correct}</He> e{' '}
            <He size="inline">{p.confusions[0]!.chosen}</He> ainda estão se
            misturando. Vamos praticar um pouco mais as duas.
          </p>
          <Link href="/academia"
                className="font-ui text-[13px] text-[var(--teal-band)] hover:underline min-h-[44px] flex items-center">
            Treinar só esse par na Academia →
          </Link>
        </Card>
      )}

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
