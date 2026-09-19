'use client';

/* Academia de Leitura - the practice room.
 * ─────────────────────────────────────────────────────────────────────────
 * Everything here is generated from what the learner has already unlocked, by
 * the same engine that builds the lessons. Nothing is authored twice, nothing
 * can show a letter they have not met, and the room stays useful after the
 * twenty-second lesson - which is the point. A course you cannot practise is a
 * course you finish once and close.
 *
 * The timed mode races the learner against their OWN last time and nothing
 * else. There is no leaderboard and no target: "da última vez, 41 s" is
 * motivating; "o tempo médio é 28 s" is a reason to stop.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { Match, type ResultadoJogo } from '@/components/game/Match';
import { Blast } from '@/components/game/Blast';
import { TestRun, RelatorioTeste, type ResultadoTeste } from '@/components/game/TestRun';
import {
  deLetras, montarBaralho, perguntasDe, TIPOS_POR_JOGO, type Par, type Pergunta
} from '@/lib/engine/deck';
import { letterMastery } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

type Jogo = 'match' | 'blast' | 'teste';

type Screen =
  | { kind: 'menu' }
  | { kind: 'run'; mode: GymMode; startedAt: number }
  | { kind: 'done'; mode: GymMode; result: PlayerResult; seconds: number }
  | { kind: 'jogo'; jogo: Jogo; rodada: number }
  | { kind: 'jogoFim'; jogo: Jogo; rodada: number; r: ResultadoJogo }
  | { kind: 'testeFim'; rodada: number; r: ResultadoTeste }
  | { kind: 'lab' }
  | { kind: 'escrita' };

/* Os três jogos, descritos no mesmo formato dos modos da academia - é a
   mesma prateleira, e eles não são um anexo. */
export const JOGOS: Record<Jogo, { titlePt: string; descPt: string; minimo: number }> = {
  match: {
    titlePt: 'Match',
    descPt: 'Junte cada letra ao seu nome, ao seu som ou a uma palavra.',
    minimo: 3
  },
  blast: {
    titlePt: 'Blast',
    descPt: 'Rápido: aparece uma letra, você escolhe. Sequência de acertos na tela.',
    minimo: 4
  },
  teste: {
    titlePt: 'Teste',
    descPt: 'Sem correção durante. No fim, a nota e a lista do que escapou.',
    minimo: 4
  }
};

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

  /* Deep-link: o painel manda para cá com o jogo já escolhido, para que
     "Match" no painel seja um toque e não três. */
  const busca = useSearchParams();
  const pedido = busca?.get('jogo');
  useEffect(() => {
    if (pedido === 'match' || pedido === 'blast' || pedido === 'teste') {
      setScreen({ kind: 'jogo', jogo: pedido, rodada: 0 });
    }
  }, [pedido]);

  /* As letras que mais custam entram primeiro no baralho. É o mesmo sinal que
     alimenta a revisão - aqui ele só decide a ORDEM, nunca o conteúdo. */
  const peso = useCallback((letterId: string) => {
    const m = letterMastery(p.state, letterId);
    return m === 'novo' ? 1.6 : m === 'aprendendo' ? 1.4 : m === 'forte' ? 0.6 : 1;
  }, [p.state]);

  const fazerJogo = useCallback((jogo: Jogo, rodada: number): {
    baralho: Par[]; perguntas: Pergunta[];
  } => {
    const semente = `${jogo}-${unlocked.length}-${rodada}`;
    const fontes = deLetras(unlocked, TIPOS_POR_JOGO[jogo]);
    const quantos = jogo === 'match' ? 6 : jogo === 'blast' ? 12 : 10;
    const baralho = montarBaralho(fontes, { quantos, semente, peso });
    const perguntas = jogo === 'match' ? [] : perguntasDe(baralho, fontes, {
      semente: `${semente}-q`,
      sentido: jogo === 'teste' ? 'misto' : 'he'
    });
    return { baralho, perguntas };
  }, [unlocked, peso]);

  /* Cada tentativa alimenta o mesmo modelo que as lições alimentam: o jogo
     não tem placar próprio, ele escreve na mesma memória. */
  const registrar = useCallback((a: { id: string; letterId: string; certo: boolean }) => {
    if (!a.letterId) return;
    p.answer({ itemId: `jogo:${a.id}`, letterId: a.letterId, correct: a.certo, skill: 'rec' });
  }, [p]);

  /* ── os três jogos ──────────────────────────────────────────────────── */
  if (screen.kind === 'jogo') {
    const { baralho, perguntas } = fazerJogo(screen.jogo, screen.rodada);
    const info = JOGOS[screen.jogo];
    const poucos = screen.jogo === 'match'
      ? baralho.length < info.minimo
      : perguntas.length < info.minimo;

    if (poucos) {
      return (
        <Empty onBack={() => setScreen({ kind: 'menu' })}>
          {screen.jogo === 'match'
            ? 'O Match precisa de pelo menos três pares diferentes. Siga mais uma lição e volte.'
            : 'Ainda não há letras suficientes para montar as alternativas. Siga mais uma lição e volte.'}
        </Empty>
      );
    }

    return (
      <div className="focus-col grid gap-5">
        <GymHeader
          mode={{ titlePt: info.titlePt } as GymMode}
          label={info.titlePt}
          onBack={() => setScreen({ kind: 'menu' })}
        />
        {screen.jogo === 'match' && (
          <Match
            key={`m-${screen.rodada}`}
            baralho={baralho}
            semente={`match-${unlocked.length}-${screen.rodada}`}
            onResposta={a => registrar({ id: a.parId, letterId: a.letterId, certo: a.certo })}
            onFim={r => {
              const score = r.total ? r.acertos / (r.acertos + r.erros || 1) : 0;
              p.finishGym('match', score, r.segundos);
              track('game_completed', { jogo: 'match', score: r.total ? r.acertos / (r.acertos + r.erros || 1) : 0, seconds: r.segundos });
              setScreen({ kind: 'jogoFim', jogo: 'match', rodada: screen.rodada, r });
            }}
          />
        )}
        {screen.jogo === 'blast' && (
          <Blast
            key={`b-${screen.rodada}`}
            perguntas={perguntas}
            onResposta={registrar}
            onFim={r => {
              p.finishGym('blast', r.total ? r.acertos / r.total : 0, r.segundos);
              track('game_completed', { jogo: 'blast', score: r.total ? r.acertos / r.total : 0, seconds: r.segundos });
              setScreen({ kind: 'jogoFim', jogo: 'blast', rodada: screen.rodada, r });
            }}
          />
        )}
        {screen.jogo === 'teste' && (
          <TestRun
            key={`t-${screen.rodada}`}
            perguntas={perguntas}
            onResposta={registrar}
            onFim={r => {
              p.finishGym('teste', r.score, r.segundos);
              track('game_completed', { jogo: 'teste', score: r.score, seconds: r.segundos });
              setScreen({ kind: 'testeFim', rodada: screen.rodada, r });
            }}
          />
        )}
      </div>
    );
  }

  if (screen.kind === 'testeFim') {
    return (
      <div className="focus-col grid gap-5">
        <GymHeader mode={{ titlePt: 'Teste' } as GymMode} label="Resultado"
                   onBack={() => setScreen({ kind: 'menu' })} />
        <RelatorioTeste
          r={screen.r}
          onRefazer={() => setScreen({ kind: 'jogo', jogo: 'teste', rodada: screen.rodada + 1 })}
        >
          <Button variant="secondary" onClick={() => setScreen({ kind: 'menu' })}>
            Voltar para a academia
          </Button>
          <LinkButton href="/meu-hebraico" variant="ghost">Continuar o curso</LinkButton>
        </RelatorioTeste>
      </div>
    );
  }

  if (screen.kind === 'jogoFim') {
    const { r, jogo } = screen;
    const pct = r.total ? Math.round((r.acertos / r.total) * 100) : 0;
    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={jogo === 'match'
            ? `${r.total} pares · ${r.erros} ${r.erros === 1 ? 'erro' : 'erros'} · ${r.segundos}s`
            : `${r.acertos} de ${r.total} · ${pct}%`}
          title={r.erros === 0 ? 'Sem um erro.' : pct >= 70 ? 'Boa sessão.' : 'Sessão feita.'}
          body={r.erros === 0
            ? 'Esse conjunto está firme. Vale aumentar o material: siga mais uma letra.'
            : 'O que escapou já entrou na fila de revisão, no dia certo de voltar.'}
        >
          <Button onClick={() => setScreen({ kind: 'jogo', jogo, rodada: screen.rodada + 1 })}>
            Mais uma
          </Button>
          <Button variant="secondary" onClick={() => setScreen({ kind: 'menu' })}>
            Escolher outro
          </Button>
          <LinkButton href="/meu-hebraico" variant="ghost">Continuar o curso</LinkButton>
        </Milestone>
      </div>
    );
  }

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
          Tudo aqui é montado com as letras que você já aprendeu - {unlocked.length} até
          agora. Escolha o que quer treinar, ou deixe a revisão escolher por você.
        </p>
      </header>

      {!unlocked.length ? (
        <Card tone="amber" className="p-6 grid gap-3">
          <p className="text-[15px] leading-relaxed text-ink-body">
            A academia abre depois da primeira lição - ela só usa letras que você já viu,
            e por enquanto não há nenhuma.
          </p>
          <LinkButton href="/meu-hebraico" className="justify-self-start">Começar a primeira letra</LinkButton>
        </Card>
      ) : (
        <>
          {/* Os três jogos primeiro, e em cartões maiores: são eles que
              alguém abre quando tem cinco minutos e nenhuma paciência para
              escolher um modo. Os treinos por assunto continuam logo abaixo,
              para quem sabe o que quer. */}
          <section aria-labelledby="jogos" className="grid gap-3">
            <h2 id="jogos" className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
              Jogos rápidos
            </h2>
            <ul className="grid gap-3 sm:grid-cols-3 list-none p-0 m-0">
              {(['match', 'blast', 'teste'] as const).map(jogo => (
                <li key={jogo}>
                  <button
                    type="button"
                    onClick={() => setScreen({ kind: 'jogo', jogo, rodada: 0 })}
                    className="w-full h-full text-left rounded-[18px] border border-line bg-[var(--card)]
                               p-5 grid gap-1.5 content-start transition-[box-shadow,border-color]
                               duration-[250ms] hover:shadow-[var(--sh)] hover:border-[var(--teal)]"
                  >
                    <span aria-hidden className="w-10 h-10 rounded-[12px] bg-[var(--teal-soft)]
                                                 grid place-items-center mb-1">
                      <IconeJogo jogo={jogo} />
                    </span>
                    <span className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink">
                      {JOGOS[jogo].titlePt}
                    </span>
                    <span className="font-ui text-[13.5px] leading-[1.5] text-ink-muted">
                      {JOGOS[jogo].descPt}
                    </span>
                    <GymBest modeId={jogo} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em] text-ink mt-2">
            Treinar por assunto
          </h2>
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

/* Três desenhos de traço, no peso do resto do sistema: dois cartões que se
   juntam, um raio e uma prancheta. */
function IconeJogo({ jogo }: { jogo: 'match' | 'blast' | 'teste' }) {
  const comum = {
    width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none',
    stroke: 'var(--teal)', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true
  };
  if (jogo === 'match') return (
    <svg {...comum}>
      <rect x="2.4" y="4" width="6.6" height="12" rx="2" />
      <rect x="11" y="4" width="6.6" height="12" rx="2" />
      <path d="M9 10h2" />
    </svg>
  );
  if (jogo === 'blast') return (
    <svg {...comum}><path d="M11.2 2.4 4.6 11h4.6l-.8 6.6L15.4 9h-4.6l.4-6.6Z" /></svg>
  );
  return (
    <svg {...comum}>
      <rect x="4" y="2.8" width="12" height="14.4" rx="2.4" />
      <path d="M7.4 8.2h5.2M7.4 11.8h3.4" />
    </svg>
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
