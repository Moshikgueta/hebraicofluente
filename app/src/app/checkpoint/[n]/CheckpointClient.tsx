'use client';

/* A checkpoint closes a module. It is the workbook's own review section, not
 * an invented milestone: the units of the teaching plan hold three to six
 * letters each, and the review lands where the plan puts it.
 *
 * Passing is 70%. Failing is not a failure - it is a suggestion to revisit one
 * or two letters, named specifically, and the retry is unlimited. */

import { CompartilharConquista } from '@/components/learn/CompartilharConquista';
import { conquistaDoModulo } from '@/lib/compartilhar';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ContadorDeLeitura } from '@/components/learn/ContadorDeLeitura';
import { useRouter } from 'next/navigation';
import { He, HeSeq } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone, ProgressBar } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { audioAvailable } from '@/components/learn/AudioButton';
import { Prose } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, type CourseModule, type Letter } from '@/lib/content';
import { buildCheckpoint } from '@/lib/engine/exercises';
import { buildSemPontos, MODULOS_COM_RAMPA } from '@/lib/engine/palavras';
import { rng } from '@/lib/engine/rng';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';
import { isLessonComplete, isLessonMastered, PASS_MARK, REGRA_DO_DOMINIO_CURTA } from '@/lib/state/rules';
import { track } from '@/lib/analytics';

export function CheckpointClient({ module: mod, letters }: { module: CourseModule; letters: Letter[] }) {
  const p = useProgress();
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'running' | 'result'>('intro');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<PlayerResult | null>(null);
  /* As palavras sem pontos do fim (módulos 3 a 5): quantas acertou. Fora da
     nota do checkpoint, que continua sendo sobre as letras do módulo. */
  const [rampa, setRampa] = useState<{ certas: number; total: number } | null>(null);

  const history = useMemo(() => allLetters().filter(l => l.order <= (mod.upTo ?? 0)), [mod.upTo]);
  const comRampa = MODULOS_COM_RAMPA.includes(mod.n);
  /* Refazer o checkpoint é outra rodada, com o que já apareceu no fim da
     fila (lib/rodadas.ts). */
  const exercises = useMemo(
    () => escolherRodada(`checkpoint-${mod.n}`, seed => [
      ...buildCheckpoint(letters, history, { audioAvailable: audioAvailable(), count: 12, seed }),
      ...(comRampa ? buildSemPontos(history, rng(`${seed}-sem-pontos`)) : [])
    ]).itens,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letters, history, mod.n, run, comRampa]
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
          title={passed ? `${pct}% - checkpoint concluído.` : `${pct}% - quase lá.`}
          body={passed
            ? `Você agora conhece ${history.length} letras do alfabeto hebraico.`
            : 'Faltou pouco. Vale rever as letras abaixo e refazer - sem pressa e sem penalidade.'}
        >
          <Button variant={passed ? 'secondary' : 'primary'} onClick={() => { setRun(n => n + 1); setResult(null); setPhase('running'); }}>
            Refazer
          </Button>
          {passed && (
            <Button onClick={() => router.push(`/modulo/${mod.n}/missao`)}>
              Missão do módulo
            </Button>
          )}
          {passed && nextModule && (
            <Button variant="secondary" onClick={() => router.push(`/modulo/${nextModule.n}`)}>
              Módulo {nextModule.n} - {nextModule.titlePt}
            </Button>
          )}
          {passed && !nextModule && (
            <Button onClick={() => router.push('/desafio-final')}>Ir para o desafio final</Button>
          )}
          {passed && <CompartilharConquista id={conquistaDoModulo(mod.n)} />}
        </Milestone>

        {passed && (
          <Card tone="mint" className="p-5">
            <p className="text-[16px] leading-relaxed text-ink"><Prose text={mod.milestonePt} /></p>
          </Card>
        )}
        {rampa && (
          <Card tone="wash" className="p-5 grid gap-1.5">
            <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">Sem os pontinhos</p>
            <p className="text-[15px] leading-relaxed text-ink-body m-0">
              Você leu {rampa.certas} de {rampa.total} palavras sem nikud, do jeito que elas aparecem
              na rua. Isso não entra na nota: é um aquecimento para o módulo 6, onde os pontos
              somem de vez.
            </p>
          </Card>
        )}

        {/* O fim de um módulo é o melhor momento para o número: "conheço seis
            letras" vira "leio N palavras". */}
        {passed && <ContadorDeLeitura />}

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
          registrarRodada(`checkpoint-${mod.n}`, exercises);
          /* A nota é só dos itens do checkpoint; a rampa sem pontos é
             prática e é contada à parte. */
          const daRampa = (id: string) => id.startsWith('sempontos-');
          const totalRampa = exercises.filter(e => daRampa(e.id)).length;
          const errosRampa = r.missed.filter(daRampa).length;
          const total = r.total - totalRampa;
          const missed = r.missed.filter(id => !daRampa(id));
          const correct = total - missed.length;
          const nucleo = { correct, total, score: total ? correct / total : 0, missed };
          setRampa(totalRampa ? { certas: totalRampa - errosRampa, total: totalRampa } : null);
          setResult(nucleo);
          if (mod.checkpoint) p.finishCheckpoint(mod.checkpoint.id, nucleo.score);
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
        {/* "Concluída" e "dominada" são palavras diferentes (UXQA-005): o
            título não afirma domínio sobre uma letra concluída a 50%. */}
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted">As letras deste módulo</p>
        <ul className="grid gap-2">
          {letters.map(l => {
            const done = isLessonComplete(p.state, l.id);
            const dominada = isLessonMastered(p.state, l.id);
            return (
              <li key={l.id} className="flex items-center gap-3">
                <span aria-hidden className={dominada ? 'text-[var(--green)]' : 'text-ink-muted'}>
                  {dominada ? '✓' : done ? '◐' : '○'}
                </span>
                <He size="word" dim={!done}>{l.letter}</He>
                <span className={`font-ui text-[14px] ${done ? 'text-ink' : 'text-ink-muted'}`}>
                  {l.namePt}
                  <span className="text-ink-muted">
                    {dominada ? ' · dominada' : done ? ' · concluída' : ''}
                  </span>
                </span>
                {!dominada && (
                  <Link href={`/licao/${l.id}`}
                        className="ml-auto inline-flex items-center min-h-[44px] pl-3 font-ui text-[13px]
                                   text-[var(--accent)] hover:underline">
                    {done ? `refazer os exercícios (${REGRA_DO_DOMINIO_CURTA})` : 'fazer a lição'}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <ProgressBar
          value={letters.length ? readyLetters.length / letters.length : 0}
          label="Lições concluídas"
          sublabel={`${readyLetters.length} / ${letters.length}`}
        />
      </Card>

      <Card tone="wash" className="p-6 grid gap-3">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-[var(--accent)]">
          O que vem no checkpoint
        </p>
        <p className="text-[15px] leading-relaxed text-ink-body">
          12 questões misturando reconhecimento, leitura, vocabulário e as formas
          finais - só com letras que você já viu. Passa com 70%, e dá para refazer
          quantas vezes quiser.
          {comRampa && ' No fim vêm 3 palavras que você já conhece, sem os pontinhos, como aparecem na rua. Elas não entram na nota.'}
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
