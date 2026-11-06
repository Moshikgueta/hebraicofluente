/* Impressa e cursiva: a fonte única do que o curso diz sobre as duas formas.
 * ─────────────────────────────────────────────────────────────────────────
 * A regra aparece em dois lugares - no módulo 0, onde o aluno encontra a
 * ideia pela primeira vez, e na etapa "Escrever" de cada uma das 22 lições,
 * onde ela vira ação. Duas telas dizendo a mesma coisa com palavras
 * ligeiramente diferentes é como um curso começa a parecer descuidado, e
 * como uma delas fica para trás quando a outra muda.
 *
 * Até aqui a lição resumia tudo numa frase - "ninguém escreve hebraico à mão
 * em letra de imprensa" - que é a CONCLUSÃO sem o argumento. Quem lê aquilo
 * antes de entender a diferença ou obedece sem entender, ou desconfia: ele
 * acabou de passar duas etapas lendo a forma impressa e agora é mandado
 * treinar outro desenho, sem motivo declarado.
 *
 * O motivo está aqui.
 */

import { tx } from '@/i18n/telas/motor-cursiva';

/** Onde cada forma é usada de verdade. */
export const ONDE_IMPRESSA = [
  tx.impLivros, tx.impSites, tx.impJornais, tx.impAplicativos,
  tx.impPlacas, tx.impLegendas, tx.impDocumentos, tx.impMaterial
] as const;

export const ONDE_CURSIVA = [
  tx.curCaderno, tx.curAnotacoes, tx.curListas, tx.curRecados,
  tx.curFormularios, tx.curQuadro, tx.curQualquer
] as const;

/** A regra, em duas linhas. É o que fica quando tudo o mais sumir. */
export const REGRA_CURSIVA = {
  ler: tx.regraLer,
  escrever: tx.regraEscrever
} as const;

/** Por que não basta copiar a forma impressa à mão. */
export const ANALOGIA_CURSIVA = tx.analogia;

/** A ressalva que evita o medo de "então são dois alfabetos?". */
export const MESMA_LETRA = tx.mesmaLetra;

/** O que o curso cobra de cursiva, e quando - a expectativa, dita cedo. */
export const CURSIVA_NO_CURSO = tx.noCurso;
