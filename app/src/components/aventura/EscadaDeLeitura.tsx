'use client';

/* A escada de leitura do Laboratório (28/10/2026, Laboratório 2.0).
 * ─────────────────────────────────────────────────────────────────────────
 * Os três níveis de apoio como três degraus: com ajuda, com menos ajuda,
 * sem ajuda. Cada degrau conta as palavras que o aluno MARCOU como lidas
 * naquele nível (`leituraAutoavaliada`, que já existia). É autoavaliação, e
 * a tela diz isso: o domínio das letras continua saindo só dos exercícios
 * corrigidos.
 *
 * Os marcos (`marcoAlcancado`) são as primeiras vezes de cada degrau e as
 * dez sem ajuda. Eles aparecem uma vez, na hora em que acontecem, com uma
 * comemoração curta; nada é gravado além do que já se gravava.
 */

import type { LearnerState } from '@/lib/state/types';
import type { NivelDeApoio } from '@/lib/laboratorio';

const DEGRAUS: { id: NivelDeApoio; nome: string }[] = [
  { id: 'guiada', nome: 'Com ajuda' },
  { id: 'menos-ajuda', nome: 'Menos ajuda' },
  { id: 'independente', nome: 'Sem ajuda' }
];

export function lidasNoNivel(state: LearnerState, nivel: NivelDeApoio): number {
  return state.leituraAutoavaliada?.[`laboratorio-${nivel}`]?.consegui ?? 0;
}

/** O marco que a próxima palavra lida neste nível alcança, se alcança. */
export function marcoAlcancado(antes: number, nivel: NivelDeApoio): string | null {
  const depois = antes + 1;
  if (depois === 1) {
    return nivel === 'guiada' ? 'Sua primeira palavra lida no laboratório.'
      : nivel === 'menos-ajuda' ? 'Sua primeira palavra lida com menos ajuda.'
      : 'Sua primeira palavra lida sem ajuda nenhuma.';
  }
  if (nivel === 'independente' && (depois === 10 || depois === 50)) {
    return `${depois} palavras lidas sem ajuda.`;
  }
  return null;
}

export function EscadaDeLeitura({ state, nivel }: { state: LearnerState; nivel: NivelDeApoio }) {
  return (
    <div className="grid gap-2">
      <ol className="grid grid-cols-3 items-end gap-1.5 list-none p-0 m-0" aria-label="Palavras que você marcou como lidas, por nível de ajuda">
        {DEGRAUS.map((d, k) => {
          const n = lidasNoNivel(state, d.id);
          const atual = d.id === nivel;
          return (
            <li key={d.id} className="grid gap-1">
              <span aria-hidden
                    className={`block rounded-t-[10px] transition-colors duration-[var(--dur)]
                                ${atual ? 'bg-[var(--teal)]' : n > 0 ? 'bg-[var(--teal-soft)]' : 'bg-[var(--sand)]'}`}
                    style={{ height: `${14 + k * 12}px` }} />
              <span className="font-ui text-[12px] font-semibold text-ink text-center leading-tight">{d.nome}</span>
              <span className="font-ui text-[12px] text-ink-muted text-center tabular-nums">
                {n} {n === 1 ? 'palavra' : 'palavras'}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="m-0 font-ui text-[12.5px] text-ink-muted">
        Contam as palavras que você marcou como lidas. O domínio das letras vem dos exercícios corrigidos.
      </p>
    </div>
  );
}

/* As faíscas do marco: posições fixas. */
const FAISCAS = [{ x: '8%', y: '20%', d: '0ms' }, { x: '90%', y: '18%', d: '120ms' }, { x: '50%', y: '6%', d: '220ms' }];

export function MarcoDeLeitura({ texto, onFechar }: { texto: string; onFechar: () => void }) {
  return (
    <div role="status"
         className="relative overflow-hidden rounded-[var(--r-lg)] bg-[var(--accent-bg)] text-white px-5 py-5
                    grid gap-2 justify-items-center text-center shadow-[var(--sh)] animate-rise">
      {FAISCAS.map(f => (
        <span key={f.x} aria-hidden className="animate-spark absolute w-2.5 h-2.5 rounded-[2px] bg-[var(--gold)]"
              style={{ left: f.x, top: f.y, animationDelay: f.d }} />
      ))}
      <p className="m-0 font-ui text-[12px] font-bold uppercase tracking-[.12em] text-[var(--teal-lite)]">Marco de leitura</p>
      <p className="m-0 font-display text-[19px] font-semibold text-white">{texto}</p>
      <button type="button" onClick={onFechar}
              className="min-h-[44px] px-3 font-ui text-[14px] font-semibold text-white underline underline-offset-4">
        Continuar lendo
      </button>
    </div>
  );
}
