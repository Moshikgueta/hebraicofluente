'use client';

/* A missão do módulo: uma situação de verdade, lida pelo aluno.
 * ─────────────────────────────────────────────────────────────────────────
 * O checkpoint diz "você sabe estas letras". A missão diz "você usou": o
 * mercado, a padaria, a ficha da escola, contados como uma história em três
 * ou quatro passos. O motor está em lib/engine/missao.ts.
 *
 * Não tranca nada. Quem não passa refaz, com as alternativas em outra ordem;
 * quem passa ganha o registro em `firsts` (`missao-N`), que o painel do
 * módulo lê para marcar a missão como feita. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { useProgress } from '@/lib/state/store';
import { allLetters, course, extras, missaoDoModulo, scenesUpTo, type CourseModule } from '@/lib/content';
import { lexicoDoCurso, missaoId, montarMissao, MISSAO_PASSA } from '@/lib/engine/missao';
import { rng } from '@/lib/engine/rng';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';
import { track } from '@/lib/analytics';

export function MissaoClient({ module: mod }: { module: CourseModule }) {
  const p = useProgress();
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'running' | 'result'>('intro');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<PlayerResult | null>(null);

  const missao = missaoDoModulo(mod.n);
  const exercises = useMemo(() => {
    if (!missao) return [];
    const lex = lexicoDoCurso(allLetters(), scenesUpTo(Number.MAX_SAFE_INTEGER), extras());
    /* Refazer a missão é outra rodada (lib/rodadas.ts). */
    return escolherRodada(`missao-${mod.n}`, seed => montarMissao(missao, lex, rng(seed))).itens;
  }, [missao, mod.n, run]);

  const feita = !!p.state.firsts[missaoId(mod.n)];
  const nextModule = course.modules.find(m => m.n === mod.n + 1);

  if (!missao) {
    return (
      <div className="focus-col grid gap-5">
        <p className="text-[16px] text-ink-body">Este módulo ainda não tem missão.</p>
        <LinkButton href={`/modulo/${mod.n}`} variant="secondary">Voltar ao módulo</LinkButton>
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <ExercisePlayer
        key={run}
        exercises={exercises}
        title={`Missão · ${missao.tituloPt}`}
        onDone={r => {
          registrarRodada(`missao-${mod.n}`, exercises);
          setResult(r);
          const passou = r.score >= MISSAO_PASSA;
          if (passou) p.markFirst(missaoId(mod.n));
          track('mission_completed', { id: missaoId(mod.n), score: r.score, correct: passou });
          setPhase('result');
        }}
      />
    );
  }

  if (phase === 'result' && result) {
    const passou = result.score >= MISSAO_PASSA;
    return (
      <div className="focus-col grid gap-5">
        <Milestone
          kicker={`Missão ${mod.n} · ${result.correct} de ${result.total}`}
          tone={passou ? 'bom' : 'parcial'}
          title={passou ? 'Missão cumprida.' : 'Quase - vale tentar de novo.'}
          body={passou
            ? missao.fechoPt
            : 'Nada se perde: refaça com calma, lendo letra por letra. As alternativas mudam de lugar.'}
        >
          <Button variant={passou ? 'secondary' : 'primary'}
                  onClick={() => { setRun(n => n + 1); setResult(null); setPhase('running'); }}>
            Refazer
          </Button>
          {passou && nextModule && (
            <Button onClick={() => router.push(`/modulo/${nextModule.n}`)}>
              Módulo {nextModule.n} - {nextModule.titlePt}
            </Button>
          )}
          {passou && !nextModule && (
            <Button onClick={() => router.push('/desafio-final')}>Ir para o desafio final</Button>
          )}
        </Milestone>
      </div>
    );
  }

  return (
    <div className="focus-col grid gap-6">
      <header className="grid gap-3">
        <Link href={`/modulo/${mod.n}`}
              className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Módulo {mod.n}
        </Link>
        <Badge tone="mint">Missão do módulo {mod.n}</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight">{missao.tituloPt}</h1>
      </header>

      <Card className="p-6">
        <p className="text-[16px] leading-relaxed text-ink-body">{missao.situacaoPt}</p>
      </Card>

      <Card tone="wash" className="p-6 grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-[var(--accent)]">Como funciona</p>
        <p className="text-[15px] leading-relaxed text-ink-body">
          {missao.passos.length} passos, na ordem da história, só com palavras que você já
          aprendeu. Leia com calma: passa com 70%, e dá para refazer quantas vezes quiser.
        </p>
      </Card>

      {feita && (
        <p className="font-ui text-[14px] text-[var(--green)]">✓ Você já cumpriu esta missão.</p>
      )}

      <Button size="lg" full
              onClick={() => { track('mission_started', { id: missaoId(mod.n) }); setPhase('running'); }}>
        {feita ? 'Fazer a missão de novo' : 'Começar a missão'}
      </Button>
    </div>
  );
}
