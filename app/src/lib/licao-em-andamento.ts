/* A lição em andamento, guardada na aba (auditoria de 01/10/2026, UXQA-003).
 * ─────────────────────────────────────────────────────────────────────────
 * Recarregar a página, ou o celular descartar a aba em segundo plano, no
 * meio da Prática voltava a lição para a etapa 1 e a Prática para a questão
 * 1. O exame final já sobrevivia a isso (desafio-final/FinalChallengeClient);
 * a lição, não.
 *
 * O que se guarda, por letra: a etapa em que a pessoa está e, na Prática, as
 * próprias questões sorteadas (dados puros) com a posição e os acertos. As
 * questões vão junto porque o sorteio depende das letras fracas, que mudam a
 * cada resposta: sortear de novo depois de recarregar daria outra lista, e o
 * índice guardado apontaria para outra pergunta.
 *
 * sessionStorage, e não localStorage: é o estado DESTA aba. Abrir a mesma
 * lição em outra aba, ou amanhã, começa do jeito de sempre. A fixação (etapa
 * 5) volta à etapa, com um teste novo: é nota, e recomeçar um teste não
 * entrega nada a quem recarregou. Vale por 12 horas.
 */

import type { Exercise } from '@/lib/engine/types';
import type { PosicaoNoPlayer } from '@/components/learn/ExercisePlayer';

const PREFIXO = 'hf-licao-em-andamento-v1:';
const VALIDADE_MS = 12 * 3_600_000;

export type LicaoEmAndamento = {
  etapa: number;
  pratica?: { itens: Exercise[] } & PosicaoNoPlayer;
  em: number;
};

export function lerLicao(id: string, agora = Date.now()): LicaoEmAndamento | null {
  try {
    if (typeof window === 'undefined') return null;
    const s = JSON.parse(window.sessionStorage.getItem(PREFIXO + id) || 'null') as LicaoEmAndamento | null;
    if (!s || typeof s.etapa !== 'number' || s.etapa < 1 || s.etapa > 5) return null;
    if (!(agora - Number(s.em) <= VALIDADE_MS)) return null;
    const p = s.pratica;
    if (p && !(Array.isArray(p.itens) && p.itens.length && Number.isInteger(p.i)
        && p.i >= 0 && p.i < p.itens.length && Number.isInteger(p.certas) && Array.isArray(p.erradas))) {
      delete s.pratica;
    }
    return s;
  } catch { return null; }
}

export function gravarLicao(id: string, s: Omit<LicaoEmAndamento, 'em'> | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (s) window.sessionStorage.setItem(PREFIXO + id, JSON.stringify({ ...s, em: Date.now() }));
    else window.sessionStorage.removeItem(PREFIXO + id);
  } catch { /* sem armazenamento: a lição só não sobrevive a recarregar */ }
}
