'use client';

/* The course map.
 *
 * A vertical spine, not a winding cartoon path: the learner is an adult and
 * the question they are asking is "how far in am I, and what is left". The
 * whole journey is visible from the start — future lessons are dimmed, never
 * hidden, because hiding the road is what makes a course feel endless. */

import Link from 'next/link';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { ProgressBar } from '@/components/game/Game';
import { useProgress } from '@/lib/state/store';
import { course, type CourseModule, type MapNode } from '@/lib/content';
import { Prose } from '@/components/learn/Blocks';
import { isLessonComplete, STAGE_COUNT } from '@/lib/state/rules';

export function CourseMapClient({ nodes }: { nodes: MapNode[] }) {
  const p = useProgress();

  /* "Current" is the first thing not finished. Everything before it is open
     for revisiting; everything after is reachable but visually quiet. */
  const currentIndex = nodes.findIndex(n =>
    (n.kind === 'letter' && !isLessonComplete(p.state, n.letter.id)) ||
    (n.kind === 'checkpoint' && !p.state.checkpoints[n.checkpoint.id]?.passedAt)
  );

  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <h1 className="text-[27px] sm:text-[33px] font-bold">O caminho inteiro</h1>
        <p className="font-ui text-[15px] text-ink-muted max-w-[52ch]">
          {course.totalLetters} letras em {course.modules.filter(m => m.letterIds.length).length} módulos,
          na ordem do plano de aulas — não na ordem do dicionário.
        </p>
        <ProgressBar
          value={p.progress}
          label={`${p.mastered} de ${course.totalLetters} letras`}
          sublabel={`${Math.round(p.progress * 100)}%`}
        />
      </header>

      <ol className="relative grid gap-2 pl-[26px] sm:pl-[34px]">
        {/* the spine */}
        <span aria-hidden className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-line-soft" />

        {nodes.map((node, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'now' : 'ahead';
          return <MapRow key={keyOf(node, i)} node={node} state={state} />;
        })}
      </ol>
    </div>
  );
}

const keyOf = (n: MapNode, i: number): string =>
  n.kind === 'letter' ? n.letter.id
  : n.kind === 'module' ? n.module.id
  : n.kind === 'checkpoint' ? n.checkpoint.id
  : `${n.kind}-${i}`;

type RowState = 'done' | 'now' | 'ahead';

function MapRow({ node, state }: { node: MapNode; state: RowState }) {
  const p = useProgress();

  if (node.kind === 'intro') {
    return (
      <Row dot="◇" state="done">
        <Link href="/inicio" className="block">
          <p className="font-display text-[16px] font-semibold text-ink">Como o hebraico funciona</p>
          <p className="font-ui text-[13px] text-ink-muted">Direção, sinais de vogal, como praticar</p>
        </Link>
      </Row>
    );
  }

  if (node.kind === 'module') {
    const m = node.module;
    return (
      <li className="relative pt-6 pb-2">
        <span aria-hidden
          className="absolute left-[-26px] sm:left-[-34px] top-[30px] w-[24px] sm:w-[32px] h-[2px] bg-line-soft" />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Badge tone="teal">Módulo {m.n}</Badge>
          <h2 className="font-display text-[17px] font-bold text-ink">{m.titlePt}</h2>
        </div>
        {m.letterIds.length > 0 && (
          <p className="font-ui text-[13px] text-ink-muted mt-1">
            {m.letterIds.length} letras · lições {m.lessons[0]?.n}–{m.lessons[m.lessons.length - 1]?.n}
          </p>
        )}
        {m.letterIds.length === 0 && (
          <ExtraModuleRow module={m} />
        )}
      </li>
    );
  }

  if (node.kind === 'letter') {
    const L = node.letter;
    const doneCount = p.state.lessons[L.id]?.stagesDone.length ?? 0;
    const complete = doneCount >= STAGE_COUNT;
    return (
      <Row dot={complete ? '✓' : state === 'now' ? '●' : '○'} state={state}>
        <Link href={`/licao/${L.id}`} className="flex items-center gap-4">
          <span className={`w-[52px] h-[52px] rounded-[var(--r-md)] grid place-items-center shrink-0
            ${state === 'now' ? 'bg-[var(--teal-wash)]' : 'bg-surface-2'}`}>
            <He size="lg" dim={state === 'ahead'}>{L.letter}</He>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2 flex-wrap">
              <span className={`font-display text-[16px] font-semibold
                ${state === 'ahead' ? 'text-ink-muted' : 'text-ink'}`}>
                {L.order}. {L.namePt}
              </span>
              <span className="font-ui text-[13px] text-ink-muted">{L.sound}</span>
            </span>
            {doneCount > 0 && !complete && (
              <span className="block font-ui text-[12px] text-[var(--teal-band)] mt-0.5">
                {doneCount} de {STAGE_COUNT} etapas
              </span>
            )}
          </span>
        </Link>
      </Row>
    );
  }

  if (node.kind === 'checkpoint') {
    const cp = node.checkpoint;
    const rec = p.state.checkpoints[cp.id];
    return (
      <Row dot="◆" state={rec?.passedAt ? 'done' : state}>
        <Link href={`/checkpoint/${node.module.n}`} className="block">
          <p className="font-display text-[16px] font-semibold text-ink">
            Checkpoint {node.module.n}
          </p>
          <p className="font-ui text-[13px] text-ink-muted">
            {rec?.best != null
              ? `Melhor resultado: ${Math.round(rec.best * 100)}%`
              : `As ${cp.letterIds.length} letras do módulo, juntas`}
          </p>
        </Link>
      </Row>
    );
  }

  return (
    <Row dot="★" state={state}>
      <Link href="/desafio-final" className="block">
        <p className="font-display text-[16px] font-semibold text-ink">O desafio final</p>
        <p className="font-ui text-[13px] text-ink-muted">Hebraico de verdade, sem apoio</p>
      </Link>
    </Row>
  );
}

/* Modules 6 and 7 are real lessons with real progress, so they get a row that
   reports it rather than a bare link. */
function ExtraModuleRow({ module: m }: { module: CourseModule }) {
  const p = useProgress();
  const doneCount = p.state.lessons[m.id]?.stagesDone.length ?? 0;
  const passed = !!p.state.checkpoints[`cp${m.n}`]?.passedAt;
  return (
    <Link href={`/modulo/${m.n}`}
          className="mt-1 flex items-center gap-3 min-h-[44px] font-ui text-[13px]
                     text-[var(--teal-band)] hover:underline">
      <span aria-hidden className={passed ? 'text-[var(--green)]' : 'text-[var(--teal-band)]'}>
        {passed ? '✓' : doneCount > 0 ? '●' : '○'}
      </span>
      <Prose text={m.subPt} />
      {doneCount > 0 && !passed && (
        <span className="text-ink-muted">· {doneCount} de 3</span>
      )}
      <span aria-hidden className="ml-auto">→</span>
    </Link>
  );
}

function Row({ children, dot, state }: { children: React.ReactNode; dot: string; state: RowState }) {
  return (
    <li className="relative">
      <span
        aria-hidden
        className={`absolute left-[-26px] sm:left-[-34px] top-1/2 -translate-y-1/2
          w-[24px] h-[24px] rounded-full grid place-items-center text-[11px] font-bold
          border-2 bg-paper
          ${state === 'done' ? 'border-[var(--green)] text-[var(--green)]'
            : state === 'now' ? 'border-[var(--teal-band)] text-[var(--teal-band)]'
            : 'border-line text-ink-muted'}`}
      >
        {dot}
      </span>
      <Card
        className={`p-3.5 transition-colors ${state === 'ahead' ? 'opacity-70' : ''}
          ${state === 'now' ? 'border-[var(--teal)]' : ''} hover:bg-surface-2`}
      >
        {children}
      </Card>
    </li>
  );
}
