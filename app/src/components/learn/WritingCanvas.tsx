'use client';

/* Escrever uma letra hebraica com o dedo.
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro etapas, nesta ordem, e elas são o ponto do componente:
 *
 *   1 ver     - assistir à ordem dos traços (StrokeOrderPlayer, acima)
 *   2 traçar  - o modelo em força total, passar por cima
 *   3 guia    - o modelo esmaecido até virar dica
 *   4 livre   - nada além da linha
 *
 * O apoio sai aos poucos porque é assim que uma habilidade motora se aprende,
 * e porque o momento em que alguém desenha um {{ג}} com a tela vazia vale mais
 * do que qualquer selo.
 *
 * ── o que mora aqui e o que mora no quadro ──────────────────────────────
 * O QUADRO - o canvas, a conta de coordenadas, a regra do celular e o
 * cálculo da nota - foi extraído para `TraceBoard.tsx` quando a capa passou a
 * oferecer uma etapa de escrita na aula aberta da Álef. Ele é público por
 * construção: não lê conteúdo pago, e é isso que permite à página de vendas
 * usá-lo sem derrubar a árvore do React.
 *
 * O que sobrou aqui é o que é do CURSO: a progressão das quatro etapas, a
 * ordem dos traços lida da geometria paga, e o registro da nota no progresso
 * do aluno.
 */

import { tx } from '@/i18n/telas/licao-writing-canvas';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StrokeOrderPlayer } from './StrokeOrder';
import { TraceBoard, type QuadroHandle, type Veredito } from './TraceBoard';
import { track } from '@/lib/analytics';

type Step = 1 | 2 | 3 | 4;

const STEPS: { n: Step; label: string; hint: string; guide: number }[] = [
  { n: 1, label: tx.ver, hint: tx.verDica, guide: 0 },
  { n: 2, label: tx.tracar, hint: tx.tracarDica, guide: 0.22 },
  { n: 3, label: tx.guiaFraco, hint: tx.guiaFracoDica, guide: 0.08 },
  { n: 4, label: tx.semModelo, hint: tx.semModeloDica, guide: 0 }
];

export function WritingCanvas({
  glyph, letterId, label, onScored
}: {
  glyph: string;
  /** Para a geometria dos traços: `mem`, ou `mem-final`. */
  letterId: string;
  label: string;
  /** Chamado uma vez por tentativa com uma nota de 0 a 1, para as habilidades. */
  onScored?: (score: number) => void;
}) {
  const quadro = useRef<QuadroHandle>(null);
  const [step, setStep] = useState<Step>(1);
  const [hasInk, setHasInk] = useState(false);
  const [verdict, setVerdict] = useState<Veredito | null>(null);

  const current = STEPS.find(s => s.n === step)!;

  const clear = useCallback(() => {
    quadro.current?.limpar();
    setVerdict(null);
  }, []);

  const check = useCallback(() => {
    const v = quadro.current?.conferir();
    if (!v) return;
    setVerdict(v);
    onScored?.(v.score);
    track('trace_completed', { letterId, score: v.score, stage: step });
  }, [letterId, step, onScored]);

  const goStep = (n: Step) => { setStep(n); clear(); };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3
                      border-b border-[color:var(--line-soft)]">
        <h3 className="font-ui text-[13px] font-semibold uppercase tracking-[.07em] text-ink-muted">
          {label}
        </h3>
        <ol className="flex items-center gap-1" aria-label={tx.etapas}>
          {STEPS.map(s => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => goStep(s.n)}
                aria-current={step === s.n ? 'step' : undefined}
                className={`min-h-[44px] px-2.5 sm:px-3 rounded-full font-ui text-[12.5px] font-medium
                  transition-colors
                  ${step === s.n
                    ? 'bg-[var(--accent-wash)] text-[var(--accent)]'
                    : 'text-ink-muted hover:bg-surface-2'}`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {step === 1 ? (
        <div className="p-5 sm:p-6 grid gap-4 justify-items-center">
          <StrokeOrderPlayer letterId={letterId} label={label} />
          <p className="font-ui text-[13.5px] text-ink-muted text-center max-w-[40ch]">
            {current.hint} {tx.cursiva}
          </p>
          <Button onClick={() => goStep(2)} size="md">{tx.comecar}</Button>
        </div>
      ) : (
        <>
          <TraceBoard
            ref={quadro}
            glyph={glyph}
            guia={current.guide}
            label={label}
            onTinta={setHasInk}
          />

          <div className="p-4 sm:p-5 grid gap-3 border-t border-[color:var(--line-soft)]">
            <p className="font-ui text-[13.5px] text-ink-muted">
              {current.hint} <span className="whitespace-nowrap">{tx.direcao}</span>
            </p>

            {verdict && (
              <div
                role="status"
                className={`rounded-[var(--r-md)] px-4 py-3 font-ui text-[14px] leading-relaxed
                  ${verdict.tone === 'good' ? 'bg-mint text-[var(--mint-ink)]'
                    : 'bg-[var(--amber-wash)] text-[var(--amber)]'}`}
              >
                {verdict.message}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <Button onClick={check} disabled={!hasInk} size="md">{tx.conferir}</Button>
              <Button variant="secondary" size="sm" onClick={clear} disabled={!hasInk}>
                {tx.limpar}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => goStep(1)}>
                {tx.verTracado}
              </Button>
              {step < 4 && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => goStep((step + 1) as Step)}
                  className="ml-auto"
                >
                  {tx.proxima}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
