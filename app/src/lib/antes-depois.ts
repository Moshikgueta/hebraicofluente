/* "Isto, no seu primeiro dia, era um desenho."
 * ─────────────────────────────────────────────────────────────────────────
 * O curso mede letras dominadas, lições concluídas e minutos na semana. São
 * números honestos e nenhum deles é o motivo pelo qual alguém estuda: quem
 * comprou não quer 14 letras, quer o instante em que uma linha de hebraico
 * para de ser desenho. Esse instante acontece e passa despercebido, porque
 * ninguém guarda o "antes" para comparar.
 *
 * Então o curso guarda. A data de início já está no estado (`onboarding`), a
 * ordem em que as letras entram já está no conteúdo, e juntas elas dizem uma
 * coisa que nenhum contador diz: esta frase aqui, em tal dia, você não
 * conseguia ler.
 *
 * Este módulo é só a escolha - pura, sem React e sem tela, para poder ser
 * testada. Três decisões moram nela:
 *
 *   · o que conta como "consegue ler" é a ordem CORRIDA: todas as letras até
 *     a N concluídas. Uma frase cuja penúltima letra ficou para trás seria
 *     uma promessa quebrada na cara do aluno, e o curso é sequencial de
 *     qualquer forma;
 *   · a frase gira por DIA, e não por visita. Recarregar a página não pode
 *     virar uma máquina de frases novas: a graça é voltar amanhã;
 *   · e gira da mais nova para a mais antiga, porque a frase que acabou de
 *     ser destravada é a que ainda surpreende.
 */

import type { Sentence } from '@/lib/content-publico';

export type AntesEDepois = {
  frase: Sentence;
  /** YYYY-MM-DD do primeiro dia de curso. */
  desde: string;
  /** Dias corridos entre o primeiro dia e hoje. */
  dias: number;
  /** Quantas frases a pessoa já consegue ler, esta inclusive. */
  total: number;
};

/** A maior ordem N tal que TODAS as letras até N estão concluídas. */
export function ordemCorrida(
  letras: readonly { id: string; order: number }[],
  concluida: (id: string) => boolean
): number {
  let n = 0;
  for (const L of [...letras].sort((a, b) => a.order - b.order)) {
    if (!concluida(L.id)) break;
    n = L.order;
  }
  return n;
}

const DIA = 86_400_000;

/** Dias corridos entre duas datas YYYY-MM-DD. Negativo vira 0. */
export function diasEntre(de: string, ate: string): number {
  const a = Date.parse(`${de}T12:00:00Z`);
  const b = Date.parse(`${ate}T12:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / DIA));
}

/**
 * A frase para mostrar hoje, ou `null` quando ainda não há o que mostrar.
 *
 * Devolve `null` de propósito em dois casos, e os dois são sobre não mentir:
 * sem nenhuma frase legível não há "depois", e no mesmo dia em que a pessoa
 * começou não há "antes" - "há 0 dias isto era um desenho" é uma frase vazia.
 */
export function antesEDepois(
  sentences: readonly Sentence[],
  ordem: number,
  inicio: string | null,
  hoje: string
): AntesEDepois | null {
  if (!inicio) return null;
  const lidas = sentences
    .filter(s => s.after <= ordem)
    .sort((a, b) => b.after - a.after || a.id.localeCompare(b.id));
  if (!lidas.length) return null;

  const dias = diasEntre(inicio, hoje);
  if (dias < 1) return null;

  /* `dias - 1` e não `dias`: o primeiro dia em que o cartão pode aparecer é o
     segundo de curso, e ele tem de abrir na frase mais nova, que é o índice 0. */
  return { frase: lidas[(dias - 1) % lidas.length]!, desde: inicio, dias, total: lidas.length };
}
