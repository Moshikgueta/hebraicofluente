'use client';

/* Academia de Leitura — the practice room.
 * ─────────────────────────────────────────────────────────────────────────
 * Everything here is generated from what the learner has already unlocked, by
 * the same engine that builds the lessons. Nothing is authored twice, nothing
 * can show a letter they have not met, and the room stays useful after the
 * twenty-second lesson — which is the point. A course you cannot practise is a
 * course you finish once and close.
 *
 * The timed mode races the learner against their OWN last time and nothing
 * else. There is no leaderboard and no target: "da última vez, 41 s" is
 * motivating; "o tempo médio é 28 s" is a reason to stop.
 */

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { SoundLab, VowelSigns } from '@/components/learn/SoundLab';
import { WritingCanvas } from '@/components/learn/WritingCanvas';
import { audioAvailable } from '@/components/learn/AudioButton';
import { ParaRevisar } from '@/components/game/Debt';
import { useProgress } from '@/lib/state/store';
import { allLetters, type Letter } from '@/lib/content';
import { onCarrier } from '@/lib/hebrew';
import { availableModes, buildGym, type GymMode } from '@/lib/engine/gym';
import { track } from '@/lib/analytics';

type Screen =
  | { kind: 'menu' }
  | { kind: 'run'; mode: GymMode; startedAt: number }
  | { kind: 'done'; mode: GymMode; result: PlayerResult; seconds: number }
  | { kind: 'lab' }
  | { kind: 'escrita' };

export function AcademiaClient() {
  const p = useProgress();
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });

  /* Only what has been unlocked. A letter whose lesson was started counts:
     the learner has met it, and practising it is exactly what they should be
     doing. */
  const unlocked = useMemo<Letter[]>(
    () => allLetters().filter(l => (p.state.lessons[l.id]?.stagesDone.length ?? 0) > 0),
    [p.state.lessons]
  );

  const audio = audioAvailable();
  const modes = useMemo(
    () => availableModes(p.state, unlocked, audio, p.day),
    [p.state, unlocked, audio, p.day]
  );

  const start = useCallback((mode: GymMode) => {
    track('gym_started', { mode: mode.id });
    setScreen({ kind: 'run', mode, startedAt: Date.now() });
  }, []);

  if (screen.kind === 'run') {
    const run = buildGym(screen.mode, p.state, unlocked, { audioAvailable: audio, day: p.day });
    if (!run.exercises.length) {
      return (
        <Empty onBack={() => setScreen({ kind: 'menu' })}>
          Este modo ainda não tem material suficiente. Siga mais uma lição e volte.
        </Empty>
      );
    }
    return (
      <div className="focus-col grid gap-5">
        <GymHeader mode={screen.mode} label={run.label} onBack={() => setScreen({ kind: 'menu' })} />
        <ExercisePlayer
          key={screen.mode.id + screen.startedAt}
          exercises={run.exercises}
          title={screen.mode.titlePt}
          onDone={result => {
            const seconds = Math.round((Date.now() - screen.startedAt) / 1000);
            track('gym_completed', { mode: screen.mode.id, score: result.score, seconds });
            p.finishGym(screen.mode.id, result.score, seconds);
            setScreen({ kind: 'done', mode: screen.mode, result, seconds });
          }}
        />
      </div>
    );
  }

  if (screen.kind === 'done') {
    const { mode, result, seconds } = screen;
    const pct = Math.round(result.score * 100);
    const prev = p.state.gym?.[mode.id];
    /* The previous best was written by finishGym before this screen rendered,
       so "da última vez" has to come from the run before that one. */
    const earlier = prev?.previousSeconds ?? null;
    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={`${result.correct} de ${result.total} · ${pct}%`}
          title={pct >= 80 ? 'Boa sessão.' : 'Sessão feita.'}
          body={
            mode.timed && earlier != null
              ? `Você levou ${seconds} s. Da última vez: ${earlier} s.`
              : mode.timed
                ? `Você levou ${seconds} s. Da próxima vez dá para comparar.`
                : pct >= 80
                  ? 'Esse material está firme. Vale trocar de modo.'
                  : 'O que escapou já entrou na fila de revisão.'
          }
        >
          <Button onClick={() => start(mode)}>Mais uma</Button>
          <Button variant="secondary" onClick={() => setScreen({ kind: 'menu' })}>
            Escolher outro modo
          </Button>
        </Milestone>
      </div>
    );
  }

  if (screen.kind === 'lab') {
    return (
      <div className="grid gap-5">
        <GymHeader
          mode={{ titlePt: 'Sons e sinais' } as GymMode}
          label="Tudo o que você já pode ler"
          onBack={() => setScreen({ kind: 'menu' })}
        />
        <SoundLab letters={unlocked} />
        <div className="grid gap-2 reading">
          <h2 className="font-display text-[19px] font-bold text-ink mt-2">Os sinais de vogal</h2>
          <p className="font-ui text-[14px] text-ink-muted">
            O mesmo sinal vale em qualquer consoante. É por isso que aprender cinco
            sinais vale mais do que decorar sílaba por sílaba.
          </p>
        </div>
        <VowelSigns demoLetter={unlocked[unlocked.length - 1]?.letter} />
      </div>
    );
  }

  if (screen.kind === 'escrita') {
    /* The letter the learner is weakest at writing, or the newest one. Writing
       practice with nothing to aim at is doodling. */
    const target = unlocked
      .slice()
      .sort((a, b) => {
        const s = (l: Letter) => p.state.skills[l.id]?.escrever?.streak ?? -1;
        return s(a) - s(b) || b.order - a.order;
      })[0] ?? unlocked[unlocked.length - 1];
    if (!target) return <Empty onBack={() => setScreen({ kind: 'menu' })}>Faça a primeira lição.</Empty>;
    return (
      <div className="grid gap-5">
        <GymHeader
          mode={{ titlePt: 'Escrita' } as GymMode}
          label={`A letra que mais precisa: ${target.namePt}`}
          onBack={() => setScreen({ kind: 'menu' })}
        />
        <WritingCanvas
          glyph={target.letter}
          letterId={target.id}
          label={target.namePt}
          onScored={score => p.recordWriting(target.id, score)}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-3 reading">
        <Badge tone="accent">Academia de Leitura</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold">Praticar</h1>
        <p className="font-ui text-[15px] text-ink-muted">
          Tudo aqui é montado com as letras que você já aprendeu — {unlocked.length} até
          agora. Escolha o que quer treinar, ou deixe a revisão escolher por você.
        </p>
      </header>

      {!unlocked.length ? (
        <Card tone="amber" className="p-6 grid gap-3">
          <p className="text-[15px] leading-relaxed text-ink-body">
            A academia abre depois da primeira lição — ela só usa letras que você já viu,
            e por enquanto não há nenhuma.
          </p>
          <LinkButton href="/meu-hebraico" className="justify-self-start">Começar a primeira letra</LinkButton>
        </Card>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {modes.map(({ mode, ready, whyNot }) => (
              <li key={mode.id}>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => start(mode)}
                  className={`w-full h-full text-left rounded-[var(--r-lg)] border p-4 grid gap-1.5
                    transition-colors
                    ${ready
                      ? 'border-line bg-surface hover:border-[var(--accent-soft)] hover:bg-[var(--accent-wash)]'
                      : 'border-line-soft bg-surface-2 opacity-70 cursor-default'}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden className="w-9 h-9 rounded-[var(--r-md)] bg-surface-2
                                                 grid place-items-center text-[16px] text-ink">
                      {/[֐-׿]/.test(mode.icon)
                        /* A bare vowel mark has nothing to sit on and renders
                           as a stray dot in the corner of the tile; onCarrier
                           puts it on U+25CC, which is Unicode's own way of
                           showing a combining mark on its own. */
                        ? <He size="inline">{onCarrier(mode.icon)}</He>
                        : mode.icon}
                    </span>
                    <span className="font-display text-[16px] font-bold text-ink">{mode.titlePt}</span>
                    {mode.timed && (
                      <span className="ml-auto font-ui text-[11px] uppercase tracking-[.07em]
                                       text-[var(--accent)]">tempo</span>
                    )}
                  </span>
                  <span className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
                    {ready ? mode.descPt : whyNot}
                  </span>
                  <GymBest modeId={mode.id} />
                </button>
              </li>
            ))}
          </ul>

          {/* What the course thinks you are bad at, said out loud. Without it,
              "a revisão escolhe por você" is a claim taken on faith. */}
          <ParaRevisar />

          {/* Not a quiz: the two reference surfaces. Kept at the bottom because
              a learner who came here to practise should not land on a table. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ReferenceCard
              title="Sons e sinais"
              desc="A tabela inteira: cada letra com cada vogal, para ouvir e comparar."
              onClick={() => setScreen({ kind: 'lab' })}
            />
            <ReferenceCard
              title="Escrita"
              desc="Traçar e escrever à mão a letra que mais precisa."
              onClick={() => setScreen({ kind: 'escrita' })}
            />
          </div>
        </>
      )}
    </div>
  );
}

function GymBest({ modeId }: { modeId: string }) {
  const p = useProgress();
  const rec = p.state.gym?.[modeId];
  if (!rec?.runs) return null;
  return (
    <span className="font-ui text-[12px] text-ink-muted tabular-nums">
      {rec.runs} {rec.runs === 1 ? 'sessão' : 'sessões'}
      {rec.bestSeconds != null && ` · melhor tempo ${rec.bestSeconds} s`}
      {rec.bestSeconds == null && rec.best != null && ` · melhor ${Math.round(rec.best * 100)}%`}
    </span>
  );
}

function ReferenceCard({
  title, desc, onClick
}: { title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-[var(--r-lg)] border border-dashed border-line bg-surface
                 p-4 grid gap-1 hover:bg-surface-2 transition-colors min-h-[88px]"
    >
      <span className="font-display text-[15.5px] font-bold text-ink">{title}</span>
      <span className="font-ui text-[13px] leading-relaxed text-ink-muted">{desc}</span>
    </button>
  );
}

function GymHeader({
  mode, label, onBack
}: { mode: GymMode; label: string; onBack: () => void }) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px]
                   text-ink-muted hover:text-ink-body"
      >
        ← Academia
      </button>
      <span className="font-ui text-[13px] text-ink-muted ml-auto">{label}</span>
    </header>
  );
}

function Empty({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="focus-col grid gap-4">
      <Card tone="amber" className="p-6">
        <p className="text-[15px] leading-relaxed text-ink-body">{children}</p>
      </Card>
      <Button variant="secondary" onClick={onBack} className="justify-self-start">
        Voltar
      </Button>
    </div>
  );
}

export function AcademiaLink() {
  return (
    <Link
      href="/academia"
      className="flex items-center justify-between gap-4 rounded-[var(--r-md)] border
                 border-line bg-surface px-4 py-3 hover:bg-surface-2 transition-colors"
    >
      <span className="font-ui text-[14px] text-ink">
        Quer praticar mais? Academia de Leitura
      </span>
      <span aria-hidden className="text-ink-muted">→</span>
    </Link>
  );
}
