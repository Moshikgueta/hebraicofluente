'use client';

/* A lição 20: com e sem o ponto, os três pares juntos (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Bet, Kaf e Pe ensinam só o lado com o ponto; Vet, Chaf e Fe, só o lado sem
 * ele. Esta é a lição em que os dois lados se encontram, no fim do módulo 5 e
 * antes do checkpoint - o pedido do dono do curso foi exatamente esse: cada
 * som na sua lição, e o contraste no fim.
 *
 * Ela anda pelo caminho como uma lição de som (`som-contraste`): as mesmas
 * cinco etapas, a mesma trava e a mesma fixação, e por isso entra na ordem de
 * ensino, na porcentagem do curso e no mapa sem código novo.
 *
 *   1 os pares   - os três pares e a regra do ponto
 *   2 sílabas    - as sílabas lado a lado, com ponto e sem ponto
 *   3 palavras   - palavras dos dois lados, para ler em voz alta
 *   4 praticar   - os exercícios de contraste dos três, misturados
 *   5 fixação    - com nota; a mesma regra de domínio de toda lição
 */

import { tx } from '@/i18n/telas/licao-contraste-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Milestone } from '@/components/game/Game';
import { ExercisePlayer, type PlayerResult } from '@/components/learn/ExercisePlayer';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { BrazilianTip, Prose } from '@/components/learn/Blocks';
import { useProgress } from '@/lib/state/store';
import { LIBERA_MARK, MASTERY_MARK, porQueTrancada } from '@/lib/state/rules';
import { allLetters, course } from '@/lib/content';
import type { DageshLetter, SomLicao } from '@/lib/engine/extras';
import { CONTRASTE, idDoSom, ordemDeEnsino, rodadaDoContraste } from '@/lib/sons';
import { track } from '@/lib/analytics';
import { escolherRodada, registrarRodada } from '@/lib/rodadas';
import { Linha, marcaDe, Par, Trancada, useDestino } from './SomLessonClient';
import { FixacaoGuiada } from '@/components/learn/FixacaoGuiada';
import { alvoDoSom } from '@/lib/fixacao';

const STAGES = [
  { n: 1, label: tx.osPares },
  { n: 2, label: tx.silabas },
  { n: 3, label: tx.palavras },
  { n: 4, label: tx.fixacao },
  { n: 5, label: tx.exercicios }
] as const;

export function ContrasteClient({ sons, dagesh, modulo, licao }: {
  /** Vet, Chaf e Fe, na ordem do módulo. */
  sons: SomLicao[];
  dagesh: { rulePt: string; warningPt: string; letters: DageshLetter[] };
  modulo: number;
  licao: number;
}) {
  const p = useProgress();
  const router = useRouter();
  const versaoAudio = useRegistroDeAudio();
  const id = idDoSom(CONTRASTE);
  const [stage, setStage] = useState(1);
  const [trancada, setTrancada] = useState<ReturnType<typeof porQueTrancada>>(null);
  const [resultado, setResultado] = useState<PlayerResult | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const ordem = useMemo(() => ordemDeEnsino(allLetters(), course.modules), []);

  useEffect(() => {
    if (!p.ready) return;
    setTrancada(porQueTrancada(p.state, ordem, id));
  }, [p.ready, p.state, ordem, id]);

  /* A etapa 4 é a Fixação guiada, um par por vez, sem nota: ouvir, ligar
     o som à letra com dica e comparar com o par. Até 11/10/2026 ela era a
     mesma rodada de perguntas da etapa 5, com outra semente. */
  const [par, setPar] = useState(0);
  const alvos = useMemo(() => sons.map(alvoDoSom), [sons]);
  const teste = useMemo(
    () => escolherRodada(`contraste-fixacao`, seed => rodadaDoContraste(sons, { seed, count: 12, temAudio: hasAudio })).itens,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sons, tentativa, versaoAudio]
  );

  const feito = useCallback((n: number) => {
    p.finishStage(id, n);
    if (n < 5) setStage(n + 1);
  }, [p, id]);

  const destino = useDestino(modulo, id, ordem);

  if (trancada) return <Trancada titulo={tx.naoAbriu} trancada={trancada} />;

  const stagesDone = p.state.lessons[id]?.stagesDone ?? [];

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/mapa"
                className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
            {tx.mapa}
          </Link>
          <Badge tone="accent">{tx.badge(modulo, licao)}</Badge>
        </div>
        <ol className="flex items-center gap-1.5" aria-label={tx.etapas}>
          {STAGES.map(s => {
            const isDone = stagesDone.includes(s.n);
            const isNow = stage === s.n;
            return (
              <li key={s.n} className="flex-1">
                <button type="button" onClick={() => setStage(s.n)}
                        aria-current={isNow ? 'step' : undefined}
                        aria-label={tx.etapaDe(s.n, s.label)}
                        className="w-full min-h-[44px] grid content-center gap-1.5">
                  <span className={`block h-1.5 rounded-full transition-colors
                    ${isNow ? 'bg-[var(--accent)]' : isDone ? 'bg-[var(--green)]' : 'bg-surface-2'}`} />
                  <span className={`font-ui text-[11px] sm:text-[12px] ${isNow ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      {stage === 1 && <OsPares sons={sons} dagesh={dagesh} onDone={() => feito(1)} />}
      {stage === 2 && <Silabas sons={sons} onDone={() => feito(2)} />}
      {stage === 3 && <Palavras sons={sons} onDone={() => feito(3)} />}
      {stage === 4 && (
        <FixacaoGuiada
          key={`f-contraste-${par}`}
          alvo={alvos[Math.min(par, alvos.length - 1)]!}
          so={['ouvir', 'som', 'revisao']}
          rotuloDoGrupo={tx.parDe(Math.min(par, alvos.length - 1) + 1, alvos.length)}
          rotuloFim={par < alvos.length - 1 ? tx.proximoPar : tx.irExercicios}
          onDone={() => (par < alvos.length - 1 ? setPar(n => n + 1) : (setPar(0), feito(4)))}
        />
      )}
      {stage === 5 && (
        resultado ? (
          <Resultado r={resultado}
                     onRetry={() => { setResultado(null); setTentativa(n => n + 1); }}
                     onNext={() => router.push(destino.href)}
                     dica={destino.dica} />
        ) : (
          <ExercisePlayer
            key={`fix-contraste-${tentativa}`}
            exercises={teste}
            title={tx.tituloExercicios}
            onDone={r => {
              track('quiz_completed', { letterId: id, score: r.score });
              registrarRodada('contraste-fixacao', teste);
              setResultado(r);
              p.finishQuiz(id, r.score);
              p.finishStage(id, 5);
            }}
          />
        )
      )}
    </div>
  );
}

/* ── 1 · os pares ──────────────────────────────────────────────────────── */
function OsPares({ sons, dagesh, onDone }: {
  sons: SomLicao[]; dagesh: { rulePt: string; warningPt: string; letters: DageshLetter[] }; onDone: () => void;
}) {
  return (
    <div className="grid gap-5">
      <Card className="p-6 sm:p-8 grid gap-5">
        <h1 className="text-[23px] sm:text-[27px] font-bold leading-tight text-center">{tx.comESem}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">
          {tx.seisSons}
        </p>
        <ul className="grid gap-3 list-none p-0 m-0">
          {sons.map(S => (
            <li key={S.id} className="grid grid-cols-2 gap-3" dir="ltr">
              <Lado he={S.he} nome={S.namePt} som={S.som} final={S.finalHe} destaque />
              <Lado he={S.parHe} nome={S.parNomePt} som={S.parSom} />
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="wash" className="p-6 grid gap-3">
        <h2 className="text-[18px] font-semibold">{tx.quandoVem}</h2>
        <p className="text-[15.5px] leading-relaxed text-ink-body"><Prose text={dagesh.rulePt} /></p>
        {sons.map(S => {
          const D = dagesh.letters.find(d => d.id === S.parId);
          return D?.notePt ? (
            <p key={S.id} className="text-[15px] leading-relaxed text-ink-body border-t border-[color:var(--line-soft)] pt-3">
              <He size="inline">{D.hard}</He> <He size="inline">{D.soft}</He> · <Prose text={D.notePt} />
            </p>
          ) : null;
        })}
      </Card>

      <BrazilianTip mistake={{
        wrong: sons[sons.length - 1]!.erro.wrong,
        right: sons[sons.length - 1]!.erro.right,
        why: dagesh.warningPt
      }} />

      <Button size="lg" onClick={onDone} full>{tx.continuarSilabas}</Button>
    </div>
  );
}

function Lado({ he, nome, som, final, destaque = false }: {
  he: string; nome: string; som: string; final?: string | null; destaque?: boolean;
}) {
  return (
    <span className={`grid justify-items-center gap-1 rounded-[var(--r-md)] p-3
      ${destaque ? 'bg-[var(--accent-wash)]' : 'bg-surface-2'}`}>
      <span className="flex items-baseline gap-3">
        <He size="xl">{he}</He>
        {final && <He size="lg">{final}</He>}
      </span>
      <span className="font-ui text-[14px] font-semibold text-ink">{nome} · {som.toUpperCase()}</span>
    </span>
  );
}

/* ── 2 · sílabas ───────────────────────────────────────────────────────── */
function Silabas({ sons, onDone }: { sons: SomLicao[]; onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="text-[21px] font-bold">{tx.silabasLado}</h2>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {tx.leiaCadaLinha}
        </p>
      </div>
      {sons.map(S => (
        <Card key={S.id} className="p-5 grid gap-2">
          <div className="grid grid-cols-2 gap-3 font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted text-center">
            <span>{S.namePt} · {S.rotuloPt}</span>
            <span>{S.parNomePt} · {S.parRotuloPt}</span>
          </div>
          {S.silabas.map((s, i) => {
            const par = S.parSilabas[i];
            return (
              <div key={s.he} className="grid grid-cols-2 gap-3" dir="ltr">
                <Par he={s.he} translit={s.translit} audioId={s.audioId} destaque />
                {par && <Par he={par.he} translit={par.translit} audioId={par.audioId} />}
              </div>
            );
          })}
        </Card>
      ))}
      <Button size="lg" onClick={onDone} full>{tx.continuarPalavras}</Button>
    </div>
  );
}

/* ── 3 · palavras ──────────────────────────────────────────────────────── */
function Palavras({ sons, onDone }: { sons: SomLicao[]; onDone: () => void }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="text-[21px] font-bold">{tx.palavrasLados}</h2>
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body">
          {tx.olheOMiolo}
        </p>
      </div>
      {sons.map(S => (
        <div key={S.id} className="grid sm:grid-cols-2 gap-3">
          <Card className="p-5 grid gap-2 content-start">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-[var(--accent)]">
              {S.namePt} · {S.som} · <He size="inline">{S.he}</He>
            </p>
            {S.palavras.map(w => <Linha key={w.he} w={w} mark={marcaDe(S, w.he)} />)}
          </Card>
          <Card className="p-5 grid gap-2 content-start">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
              {S.parNomePt} · {S.parSom} · <He size="inline">{S.parHe}</He>
            </p>
            {S.parPalavras.map(w => <Linha key={w.he} w={w} mark={[...S.parHe][0]!} />)}
          </Card>
        </div>
      ))}
      <GravarLeitura
        titulo={tx.leiaDoisLados}
        instrucao={tx.leiaDoisLadosInstrucao}
        maxSegundos={90}
      />
      <Button size="lg" onClick={onDone} full>{tx.continuarFixacao}</Button>
    </div>
  );
}

/* ── 5 · o resultado ───────────────────────────────────────────────────── */
function Resultado({ r, onRetry, onNext, dica }: {
  r: PlayerResult; onRetry: () => void; onNext: () => void; dica: string;
}) {
  const pct = Math.round(r.score * 100);
  const bom = r.score >= MASTERY_MARK;
  return (
    <Milestone
      tone={bom ? 'bom' : 'parcial'}
      kicker={tx.placar(r.correct, r.total, pct)}
      title={bom ? tx.firmes : tx.vamosFirmar}
      body={bom
        ? tx.bom
        : tx.refaca(Math.round(LIBERA_MARK * 100))}
    >
      <Button variant={bom ? 'secondary' : 'primary'} onClick={onRetry}>{tx.refazer}</Button>
      <Button variant={bom ? 'primary' : 'secondary'} onClick={onNext}>{tx.concluir}</Button>
      <p className="basis-full font-ui text-[13px] text-ink-muted m-0">{dica}</p>
    </Milestone>
  );
}
