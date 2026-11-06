/* O resumo da semana (28/10/2026, pedido do dono: "faz tudo", item 7).
 * ─────────────────────────────────────────────────────────────────────────
 * Sete dias terminando hoje, contados só do que o progresso já guarda:
 *   · os dias com estudo e o tempo (`days[d].units`, 20 s cada);
 *   · as letras concluídas na semana (`lessons[id].completedAt`);
 *   · as palavras que passaram a se ler por causa delas: as legíveis com as
 *     letras de hoje menos as legíveis com as letras de antes da semana.
 * Nada novo no estado. A fala da Yael sai daqui (`falaDaSemana`), e o texto
 * mora no dicionário da tela.
 */

import type { Letter } from '@/lib/content';
import type { LearnerState } from '@/lib/state/types';
import { isLessonComplete } from '@/lib/state/rules';
import { alfabetoDe, palavrasLegiveis, vocabularioDoCurso } from '@/lib/engine/palavras';

export type DiaDaSemana = { chave: string; dow: number; units: number };

export type ResumoDaSemana = {
  dias: DiaDaSemana[];
  diasEstudados: number;
  minutos: number;
  letras: Letter[];
  palavrasNovas: number;
};

/** As sete chaves YYYY-MM-DD terminando em `hoje`, em UTC (o dia é o que o
 *  app gravou, não o fuso de quem olha). */
export function seteDias(hoje: string): { chave: string; dow: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${hoje}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return { chave: d.toISOString().slice(0, 10), dow: d.getUTCDay() };
  });
}

export function resumoDaSemana(state: LearnerState, hoje: string, todas: readonly Letter[]): ResumoDaSemana {
  const dias = seteDias(hoje).map(d => ({ ...d, units: state.days[d.chave]?.units ?? 0 }));
  const inicio = dias[0]!.chave;
  const concluidas = todas.filter(l => isLessonComplete(state, l.id));
  const daSemana = (l: Letter) => (state.lessons[l.id]?.completedAt ?? '').slice(0, 10) >= inicio;
  const letras = concluidas.filter(daSemana);
  const vocab = vocabularioDoCurso(todas);
  const agora = palavrasLegiveis(vocab, alfabetoDe(concluidas)).length;
  const antes = palavrasLegiveis(vocab, alfabetoDe(concluidas.filter(l => !daSemana(l)))).length;
  const units = dias.reduce((n, d) => n + d.units, 0);
  return {
    dias,
    diasEstudados: dias.filter(d => d.units > 0).length,
    minutos: Math.round(units / 3),
    letras,
    palavrasNovas: Math.max(0, agora - antes)
  };
}

export type FalaDaSemana = 'quieta' | 'ritmo' | 'palavras' | 'continua';

/** O que a Yael comenta, e com que cara. */
export function falaDaSemana(r: ResumoDaSemana): { fala: FalaDaSemana; humor: 'pensando' | 'comemora' | 'feliz' | 'parada' } {
  if (r.diasEstudados === 0) return { fala: 'quieta', humor: 'pensando' };
  if (r.diasEstudados >= 5) return { fala: 'ritmo', humor: 'comemora' };
  if (r.palavrasNovas > 0) return { fala: 'palavras', humor: 'feliz' };
  return { fala: 'continua', humor: 'parada' };
}
