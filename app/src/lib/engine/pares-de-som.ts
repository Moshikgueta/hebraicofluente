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

export type ParDeSom = {
  /** As duas letras, pelo glifo de base em letters.json. */
  a: string;
  b: string;
  /** A frase que separa os dois sons. */
  notaPt: string;
};

export const PARES_DE_SOM: readonly ParDeSom[] = [
  { a: 'ה', b: 'ח', notaPt: 'O ה é um H leve e soprado, como no inglês "hello". O ח é raspado, na parte de trás da boca.' },
  { a: 'ש', b: 'ס', notaPt: 'O שׁ soa como o CH de "chave". O ס soa como o S de "sapo".' },
  { a: 'ז', b: 'ס', notaPt: 'O ז tem voz, como o Z de "zebra". O ס não tem voz, como o S de "sapo".' },
  { a: 'צ', b: 'ס', notaPt: 'O צ soa TS, como em "tsunami". O ס é só S, como em "sapo".' },
  { a: 'ד', b: 'ת', notaPt: 'O ד tem voz, como o D de "dado". O ת não tem voz, como o T de "tatu".' },
  { a: 'ג', b: 'ק', notaPt: 'O ג tem voz, como o G de "gato". O ק não tem voz, como o K de "casa".' },
  { a: 'ב', b: 'פ', notaPt: 'O בּ tem voz, como o B de "bola". O פּ não tem voz, como o P de "pato".' }
];
