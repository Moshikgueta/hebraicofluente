/* O envio das estatísticas de aprendizagem (30/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Só contagens, em lote: que tipo de exercício, de que lição, certo ou
 * errado; e que etapa de que lição foi concluída pela primeira vez. Nada de
 * texto, resposta digitada, nome ou horário. O servidor soma por dia e não
 * guarda quem mandou (worker/src/api/estatisticas.js).
 *
 * Só liga com a pessoa conectada (EnvioDeEstatisticas, no layout): a capa e
 * as páginas abertas não mandam nada.
 */

import type { LearningEvent } from './analytics';
import { N_FAIXAS } from './tempo-de-etapa';

export type EventoEnviado =
  | { e: 'resposta'; k: string; l: string; c: boolean }
  /* `f`: a faixa de tempo ativo da etapa (lib/tempo-de-etapa.ts), quando medida. */
  | { e: 'etapa'; l: string; s: number; f?: number };

const ID = /^[a-z0-9-]{1,40}$/;

/** O evento do app, reduzido ao que vai para o servidor - ou nada. */
export function paraEnvio(ev: LearningEvent): EventoEnviado | null {
  const { letterId, kind, correct, stage, primeira, faixa } = ev.props;
  if (!letterId || !ID.test(letterId)) return null;
  if (ev.name === 'exercise_answered' && kind && ID.test(kind) && typeof correct === 'boolean') {
    return { e: 'resposta', k: kind, l: letterId, c: correct };
  }
  if (ev.name === 'stage_completed' && primeira === true && Number.isInteger(stage) && stage! >= 1 && stage! <= 5) {
    const f = Number.isInteger(faixa) && faixa! >= 0 && faixa! < N_FAIXAS ? faixa! : undefined;
    return f === undefined ? { e: 'etapa', l: letterId, s: stage! } : { e: 'etapa', l: letterId, s: stage!, f };
  }
  return null;
}

export const LOTE_MAX = 40;
export const INTERVALO_MS = 20_000;

/**
 * O acumulador: junta os eventos e manda quando o lote enche, a cada
 * INTERVALO_MS, ou quando a página sai de vista. `mandar` recebe o lote e
 * se é a saída da página (aí o envio tem de ser o que sobrevive a ela).
 */
export function criarEnviador(mandar: (lote: EventoEnviado[], saindo: boolean) => void) {
  let fila: EventoEnviado[] = [];
  const umLote = (saindo: boolean) => {
    const lote = fila.slice(0, LOTE_MAX);
    fila = fila.slice(LOTE_MAX);
    mandar(lote, saindo);
  };
  /* Tudo o que houver, em quantos lotes precisar. */
  const esvaziar = (saindo = false) => { while (fila.length) umLote(saindo); };
  return {
    receber(evs: LearningEvent[]) {
      for (const ev of evs) {
        const x = paraEnvio(ev);
        if (x) fila.push(x);
      }
      /* Com a página aberta, só lote cheio; o resto espera o relógio. */
      while (fila.length >= LOTE_MAX) umLote(false);
    },
    esvaziar,
    pendentes: () => fila.length
  };
}
