/* O Diário de descobertas (28/10/2026, master prompt 3.0, parte 7).
 * ─────────────────────────────────────────────────────────────────────────
 * O diário NÃO tem estado próprio: ele lê o que o progresso já guarda, com a
 * data de cada coisa, e monta a linha do tempo do aluno. Nada aqui é
 * escrito pela tela, e nada é inventado - uma entrada só existe se a data
 * dela existe no estado.
 *
 *   · Aula 0 concluída           `firsts['aula-0-concluida']`
 *   · letra concluída            `lessons[id].completedAt` (só as de letra)
 *   · checkpoint aprovado        `checkpoints[id].passedAt`
 *   · Primeira Leitura do módulo `firsts['primeira-leitura-mN']`
 *   · mini-texto lido            `firsts['texto-N']`
 *   · missão cumprida            `firsts['missao-N']`
 *   · conquista                  `achievements[].unlockedAt`
 */

import type { LearnerState } from '@/lib/state/types';
import type { CourseModule, Letter } from '@/lib/content';
import { AULA0_CONCLUIDA, ACHIEVEMENTS } from '@/lib/state/rules';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/motor-diario';

export type TipoDeEntrada = 'aula0' | 'letra' | 'checkpoint' | 'leitura' | 'texto' | 'missao' | 'conquista';

export type EntradaDoDiario = {
  id: string;
  quando: string;          // ISO
  tipo: TipoDeEntrada;
  texto: string;
  /** O glifo, quando a entrada é de uma letra. */
  letra?: string;
  href?: string;
};

const valida = (d: unknown): d is string => typeof d === 'string' && !Number.isNaN(Date.parse(d));

export function entradasDoDiario(
  state: LearnerState, letras: readonly Letter[], modulos: readonly CourseModule[]
): EntradaDoDiario[] {
  const e: EntradaDoDiario[] = [];
  const f = state.firsts ?? {};

  if (valida(f[AULA0_CONCLUIDA])) {
    e.push({ id: 'aula0', quando: f[AULA0_CONCLUIDA]!, tipo: 'aula0', texto: tx.aula0, href: '/inicio' });
  }
  for (const l of letras) {
    const quando = state.lessons[l.id]?.completedAt;
    if (valida(quando)) {
      e.push({ id: `letra-${l.id}`, quando, tipo: 'letra', texto: fmt(tx.letra, { nome: l.namePt }), letra: l.letter, href: `/licao/${l.id}` });
    }
  }
  for (const m of modulos) {
    const cp = m.checkpoint ? state.checkpoints[m.checkpoint.id]?.passedAt : null;
    if (valida(cp)) e.push({ id: `cp-${m.n}`, quando: cp, tipo: 'checkpoint', texto: fmt(tx.checkpoint, { n: m.n }), href: `/modulo/${m.n}` });
    const pl = f[`primeira-leitura-m${m.n}`];
    if (valida(pl)) e.push({ id: `pl-${m.n}`, quando: pl, tipo: 'leitura', texto: fmt(tx.leitura, { n: m.n }), href: `/leitura?primeira=${m.n}` });
    const lido = f[`texto-${m.n}`];
    if (valida(lido)) e.push({ id: `tx-${m.n}`, quando: lido, tipo: 'texto', texto: fmt(tx.texto, { n: m.n }), href: `/modulo/${m.n}/texto` });
    const mi = f[`missao-${m.n}`];
    if (valida(mi)) e.push({ id: `mi-${m.n}`, quando: mi, tipo: 'missao', texto: fmt(tx.missao, { n: m.n }), href: `/modulo/${m.n}/missao` });
  }
  for (const a of state.achievements ?? []) {
    const def = ACHIEVEMENTS.find(d => d.id === a.id);
    if (def && valida(a.unlockedAt)) e.push({ id: `cq-${a.id}`, quando: a.unlockedAt, tipo: 'conquista', texto: fmt(tx.conquista, { titulo: def.titlePt }) });
  }
  /* A mais recente primeiro: o diário abre na última página escrita. */
  return e.sort((a, b) => Date.parse(b.quando) - Date.parse(a.quando) || a.id.localeCompare(b.id));
}

/** As entradas agrupadas por dia (YYYY-MM-DD do registro). */
export function porDia(entradas: readonly EntradaDoDiario[]): { dia: string; entradas: EntradaDoDiario[] }[] {
  const grupos = new Map<string, EntradaDoDiario[]>();
  for (const x of entradas) {
    const dia = x.quando.slice(0, 10);
    grupos.set(dia, [...(grupos.get(dia) ?? []), x]);
  }
  return [...grupos].map(([dia, entradas]) => ({ dia, entradas }));
}

/** Os lugares visitados: o módulo com alguma lição começada (os módulos sem
 *  letra, 6 e 7, contam pela etapa própria). */
export function lugaresVisitados(
  state: LearnerState, letras: readonly Letter[], modulos: readonly CourseModule[]
): Set<number> {
  const comecou = (id: string) => (state.lessons[id]?.stagesDone.length ?? 0) > 0;
  const n = new Set(letras.filter(l => comecou(l.id)).map(l => l.module));
  for (const m of modulos) if (!m.letterIds.length && comecou(m.id)) n.add(m.n);
  return n;
}
