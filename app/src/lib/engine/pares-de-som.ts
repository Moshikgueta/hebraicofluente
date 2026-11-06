/* As letras parecidas no SOM (12/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A Batalha treinava só o DESENHO: {{ד}}/{{ר}}, {{ה}}/{{ח}}, os pares de
 * `confusableWith`, que é sobre forma. Parecer no desenho e parecer no som
 * são duas metas diferentes: uma é o olho, a outra é o ouvido. Estes são os
 * pares em que o brasileiro troca o SOM - e cada um tem a frase que separa
 * os dois, revisada.
 *
 * Só pares de sons DIFERENTES no hebraico de hoje. {{ח}} e {{כ}} sem daguesh,
 * {{ט}} e {{ת}}, {{ק}} e {{כּ}} soam iguais: para ler, não há o que separar
 * pelo ouvido, e pô-los aqui ensinaria uma diferença que não existe.
 *
 * O som que toca é a sílaba com A de cada letra (`syllables`, vogal `a`),
 * gravada em estúdio; sem gravação das duas, o par não entra.
 */

import { tx } from '@/i18n/telas/motor-pares-de-som';

export type ParDeSom = {
  /** As duas letras, pelo glifo de base em letters.json. */
  a: string;
  b: string;
  /** A frase que separa os dois sons. */
  notaPt: string;
};

export const PARES_DE_SOM: readonly ParDeSom[] = [
  { a: 'ה', b: 'ח', notaPt: tx.heHet },
  { a: 'ש', b: 'ס', notaPt: tx.shinSamech },
  { a: 'ז', b: 'ס', notaPt: tx.zayinSamech },
  { a: 'צ', b: 'ס', notaPt: tx.tsadiSamech },
  { a: 'ד', b: 'ת', notaPt: tx.daletTav },
  { a: 'ג', b: 'ק', notaPt: tx.guimelKuf },
  { a: 'ב', b: 'פ', notaPt: tx.betPe }
];
