'use client';

/* The course map, in two shapes.
 *
 * A vertical spine, not a winding cartoon path: the learner is an adult and
 * the question they are asking is "how far in am I, and what is left". The
 * whole journey is visible from the start - future lessons are dimmed, never
 * hidden, because hiding the road is what makes a course feel endless.
 *
 * On a phone the spine is right: one thing under another, scrolled with a
 * thumb. On a desk it was 3,500 pixels tall - the whole journey existed and
 * you could never see it. So at 1024px the same data becomes a BOARD: the
 * seven units of the teaching plan side by side, each a panel with its letters
 * and its checkpoint, the course in about a screen and a half. */

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { ProgressBar } from '@/components/game/Game';
import { useProgress } from '@/lib/state/store';
import { course, getLetter, type CourseModule, type MapNode } from '@/lib/content';
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
          na ordem do plano de aulas - não na ordem do dicionário.
        </p>
        <ProgressBar
          value={p.progress}
          label={`${p.mastered} de ${course.totalLetters} letras`}
          sublabel={`${Math.round(p.progress * 100)}%`}
        />
      </header>

      <Spine nodes={nodes} currentIndex={currentIndex} />

      <div className="hidden lg:block"><Board /></div>
    </div>
  );
}

/* ── o telefone: a espinha, com um módulo aberto ────────────────────────
 * O mapa mostra o caminho inteiro, e isso não muda - esconder a estrada é o
 * que faz um curso parecer infinito. O que muda é o PESO de cada trecho.
 *
 * Aberta de ponta a ponta, a espinha eram 27 cartões idênticos e 3.689px de
 * rolagem no telefone: sete telas em que tudo tem a mesma importância e a
 * única linha que interessa - onde eu parei - passa voando no meio. Agora o
 * módulo em que a pessoa está fica aberto e os outros viram uma faixa com as
 * letras dele, que continua dizendo o que vem e abre num toque.
 *
 * No desktop nada disso existe: lá o espaço é horizontal e o quadro mostra o
 * curso inteiro de uma vez, que é a vantagem real de uma tela grande.
 */
type Linha = { node: MapNode; index: number };
type Trecho =
  | { kind: 'solo'; node: MapNode; index: number }
  | { kind: 'modulo'; module: CourseModule; index: number; linhas: Linha[] };

function agrupar(nodes: MapNode[]): Trecho[] {
  const out: Trecho[] = [];
  let aberto: Extract<Trecho, { kind: 'modulo' }> | null = null;
  nodes.forEach((node, index) => {
    if (node.kind === 'module') {
      aberto = { kind: 'modulo', module: node.module, index, linhas: [] };
      out.push(aberto);
      return;
    }
    if (node.kind === 'letter' || node.kind === 'checkpoint') {
      if (aberto) { aberto.linhas.push({ node, index }); return; }
    } else {
      aberto = null;
    }
    out.push({ kind: 'solo', node, index });
  });
  return out;
}

function Spine({ nodes, currentIndex }: { nodes: MapNode[]; currentIndex: number }) {
  const trechos = agrupar(nodes);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const estado = (i: number) => (i < currentIndex ? 'done' : i === currentIndex ? 'now' : 'ahead');

  return (
    <ol className="lg:hidden relative grid gap-2 pl-[26px] sm:pl-[34px]">
      {/* the spine */}
      <span aria-hidden className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-line-soft" />

      {trechos.map(t => {
        if (t.kind === 'solo') {
          return <MapRow key={keyOf(t.node, t.index)} node={t.node} state={estado(t.index)} />;
        }
        /* Aberto: onde a pessoa está, ou o que ela mandou abrir. */
        const contemAtual = currentIndex >= t.index
          && currentIndex <= (t.linhas[t.linhas.length - 1]?.index ?? t.index);
        const aberto = abertos[t.module.id] ?? contemAtual;
        return (
          /* Um fragmento, e não um <li> em volta: cabeçalho e linhas são
             irmãos dentro do <ol>, que é o que a lista significa. */
          <Fragment key={t.module.id}>
            <ModuloCabecalho
              module={t.module}
              aberto={aberto}
              atual={contemAtual}
              onToggle={() => setAbertos(a => ({ ...a, [t.module.id]: !aberto }))}
            />
            {aberto && t.linhas.map(l => (
              <MapRow key={keyOf(l.node, l.index)} node={l.node} state={estado(l.index)} />
            ))}
          </Fragment>
        );
      })}
    </ol>
  );
}

function ModuloCabecalho({
  module: m, aberto, atual, onToggle
}: {
  module: CourseModule; aberto: boolean; atual: boolean; onToggle: () => void;
}) {
  const p = useProgress();
  const letras = m.letterIds.map(getLetter).filter(l => !!l);
  const feitas = letras.filter(l => isLessonComplete(p.state, l.id)).length;

  return (
    <li className="relative pt-6 pb-1">
      <span aria-hidden
        className="absolute left-[-26px] sm:left-[-34px] top-[30px] w-[24px] sm:w-[32px] h-[2px] bg-line-soft" />

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Badge tone="accent">Módulo {m.n}</Badge>
        <h2 className="font-display text-[17px] font-bold text-ink">{m.titlePt}</h2>
      </div>

      {m.letterIds.length === 0 ? (
        <ExtraModuleRow module={m} />
      ) : aberto ? (
        <p className="font-ui text-[13px] text-ink-muted mt-1">
          {m.letterIds.length} letras · lições {m.lessons[0]?.n}-{m.lessons[m.lessons.length - 1]?.n}
          {!atual && (
            <>
              {' · '}
              <button type="button" onClick={onToggle}
                      className="font-ui text-[13px] text-[var(--accent)] hover:underline">
                fechar
              </button>
            </>
          )}
        </p>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={false}
          className="mt-2 w-full flex items-center gap-3 rounded-[var(--r-md)] border border-line
                     bg-surface px-3 min-h-[56px] text-left hover:bg-surface-2 transition-colors"
        >
          <span className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            {letras.map(L => (
              <He key={L.id} size="word" dim={!isLessonComplete(p.state, L.id)}>{L.letter}</He>
            ))}
          </span>
          <span className="font-ui text-[12px] tabular-nums text-ink-muted shrink-0">
            {feitas === letras.length && letras.length > 0 ? 'concluído ✓' : `${feitas}/${letras.length}`}
          </span>
          <span aria-hidden className="font-ui text-[13px] text-ink-muted shrink-0">▾</span>
        </button>
      )}
    </li>
  );
}

/* ── the desk: a board ──────────────────────────────────────────────────── */
function Board() {
  return (
    <div className="grid gap-4">
      <Card className="hover:bg-surface-2 transition-colors">
        <Link href="/inicio" className="p-4 flex items-center gap-4">
          <span aria-hidden className="w-[34px] h-[34px] shrink-0 rounded-full border-2 border-[var(--green)]
                                      text-[var(--green)] grid place-items-center text-[13px]">◇</span>
          <span className="min-w-0">
            <span className="block font-display text-[16px] font-semibold text-ink">
              Comece aqui - como o hebraico funciona
            </span>
            <span className="block font-ui text-[13px] text-ink-muted">
              Direção, os sinais de vogal, como praticar
            </span>
          </span>
        </Link>
      </Card>

      {/* The five modules that teach letters, then - on their own row - the two
          that teach no new letter. That split is the teaching plan's own, and
          on a board it is worth showing rather than burying in the flow. */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 items-start">
        {course.modules.filter(m => m.letterIds.length > 0)
          .map(m => <ModulePanel key={m.id} module={m} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        {course.modules.filter(m => m.letterIds.length === 0)
          .map(m => <ModulePanel key={m.id} module={m} />)}
      </div>

      <Card tone="wash">
        <Link href="/desafio-final" className="p-5 flex items-center gap-4">
          <span aria-hidden className="w-[34px] h-[34px] shrink-0 rounded-full border-2 border-[var(--accent)]
                                      text-[var(--accent)] grid place-items-center text-[13px]">★</span>
          <span className="min-w-0">
            <span className="block font-display text-[17px] font-bold text-ink">O desafio final</span>
            <span className="block font-ui text-[13px] text-ink-body">
              As {course.totalLetters} letras, sem transliteração para se apoiar.
            </span>
          </span>
        </Link>
      </Card>
    </div>
  );
}

function ModulePanel({ module: m }: { module: CourseModule }) {
  const p = useProgress();
  const letters = m.letterIds.map(getLetter).filter(l => !!l);
  const isExtra = letters.length === 0;
  const cpPassed = !!p.state.checkpoints[`cp${m.n}`]?.passedAt;
  const doneCount = isExtra
    ? Math.min(3, p.state.lessons[m.id]?.stagesDone.length ?? 0)
    : letters.filter(l => isLessonComplete(p.state, l.id)).length;
  const total = isExtra ? 3 : letters.length;
  const currentId = course.letters.find(x => !isLessonComplete(p.state, x.id))?.id;

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-[color:var(--line-soft)] grid gap-1.5">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Módulo {m.n}</Badge>
          <span className="ml-auto font-ui text-[12px] tabular-nums text-ink-muted">
            {cpPassed ? 'concluído ✓' : `${doneCount}/${total}`}
          </span>
        </div>
        <h2 className="font-display text-[15.5px] font-bold text-ink leading-snug">{m.titlePt}</h2>
        <span className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <span
            className={`block h-full rounded-full transition-[width] duration-500
              ${cpPassed ? 'bg-[var(--green)]' : 'bg-[var(--accent)]'}`}
            style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
          />
        </span>
      </div>

      {isExtra ? (
        <div className="p-4 grid gap-1">
          {/* No new letter here, so the panel says what the module is FOR -
              its own milestone, not a generic line repeated twice. */}
          <p className="font-ui text-[13px] leading-relaxed text-ink-muted">
            <Prose text={m.milestonePt} />
          </p>
          <ExtraModuleRow module={m} />
        </div>
      ) : (
        <ul className="p-2 grid gap-0.5">
          {letters.map(L => {
            const done = isLessonComplete(p.state, L.id);
            const stages = p.state.lessons[L.id]?.stagesDone.length ?? 0;
            const current = L.id === currentId;
            return (
              <li key={L.id}>
                <Link
                  href={`/licao/${L.id}`}
                  className={`flex items-center gap-3 rounded-[var(--r-sm)] px-2 py-1.5 transition-colors
                    ${current ? 'bg-[var(--accent-wash)]' : 'hover:bg-surface-2'}`}
                >
                  <span aria-hidden className={`w-4 text-center text-[11px]
                    ${done ? 'text-[var(--green)]' : current ? 'text-[var(--accent)]' : 'text-ink-muted'}`}>
                    {done ? '✓' : current ? '●' : '○'}
                  </span>
                  <He size="word" dim={!done && !current}>{L.letter}</He>
                  <span className={`font-ui text-[13px] truncate
                    ${done || current ? 'text-ink' : 'text-ink-muted'}`}>
                    {L.order}. {L.namePt}
                  </span>
                  {stages > 0 && !done && (
                    <span className="ml-auto font-ui text-[11px] tabular-nums text-[var(--accent)]">
                      {stages}/{STAGE_COUNT}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {m.checkpoint && (
        <Link
          href={`/checkpoint/${m.n}`}
          className="flex items-center gap-3 px-4 py-3 border-t border-[color:var(--line-soft)]
                     hover:bg-surface-2 transition-colors"
        >
          <span aria-hidden className={`text-[12px] ${cpPassed ? 'text-[var(--green)]' : 'text-ink-muted'}`}>◆</span>
          <span className="font-ui text-[13px] font-medium text-ink">Checkpoint {m.n}</span>
          <span className="ml-auto font-ui text-[12px] text-ink-muted tabular-nums">
            {p.state.checkpoints[m.checkpoint.id]?.best != null
              ? `${Math.round(p.state.checkpoints[m.checkpoint.id]!.best! * 100)}%`
              : '-'}
          </span>
        </Link>
      )}
    </Card>
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

  /* `module` não chega aqui: na espinha ele é o cabeçalho do trecho, desenhado
     por `ModuloCabecalho`, que é quem sabe abrir e fechar. */

  if (node.kind === 'letter') {
    const L = node.letter;
    const doneCount = p.state.lessons[L.id]?.stagesDone.length ?? 0;
    const complete = doneCount >= STAGE_COUNT;
    return (
      <Row dot={complete ? '✓' : state === 'now' ? '●' : '○'} state={state}>
        <Link href={`/licao/${L.id}`} className="flex items-center gap-4">
          <span className={`w-[52px] h-[52px] rounded-[var(--r-md)] grid place-items-center shrink-0
            ${state === 'now' ? 'bg-[var(--accent-wash)]' : 'bg-surface-2'}`}>
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
              <span className="block font-ui text-[12px] text-[var(--accent)] mt-0.5">
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
                     text-[var(--accent)] hover:underline">
      <span aria-hidden className={passed ? 'text-[var(--green)]' : 'text-[var(--accent)]'}>
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
            : state === 'now' ? 'border-[var(--accent)] text-[var(--accent)]'
            : 'border-line text-ink-muted'}`}
      >
        {dot}
      </span>
      <Card
        className={`p-3.5 transition-colors ${state === 'ahead' ? 'opacity-70' : ''}
          ${state === 'now' ? 'border-[var(--accent-soft)]' : ''} hover:bg-surface-2`}
      >
        {children}
      </Card>
    </li>
  );
}
