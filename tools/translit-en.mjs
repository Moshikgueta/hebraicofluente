/* translit-en.mjs - a transliteração do site em inglês
 * ─────────────────────────────────────────────────────────────────────────
 * A fonte continua sendo a transliteração prática para brasileiros
 * (data/translit.json, "pt-BR-practical-v1"). O site em inglês usa outra
 * grafia, decidida pelo dono em 28/10/2026 (PLANO-INGLES.md, etapa 3), e ela
 * sai desta conversão, sempre a mesma, em vez de uma segunda tabela escrita à
 * mão que poderia discordar da primeira:
 *
 *   sem acento na sílaba forte   shalóm -> shalom, Hashém -> Hashem
 *   s simples entre vogais       késsef -> kesef (o "ss" era para o
 *                                brasileiro não ler Z)
 *   g antes de e e i             guéshem -> geshem, Guímel -> Gimel
 *   ג׳ (o j de "jeans")          dj -> j
 *   ז׳ (o s de "measure")        j -> zh
 *   ח e כ                        ch, como já era (Chanukah, l'chaim)
 *   צ׳ (o ch de "chips")         tch, como já era
 *
 * Tira o acento agudo e o circunflexo ("malê"); o til fica: "São Paulo".
 */

const AGUDO = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', â: 'a', ê: 'e', ô: 'o' };

/** Uma transliteração do curso (ou um trecho com várias palavras) em inglês. */
export function translitEn(texto) {
  return String(texto)
    // g antes de e/i: o "u" do português só segurava o som duro
    .replace(/([Gg])u(?=[eiéíEIÉÍ])/g, '$1')
    // ז׳: o j sozinho (sem d antes) é o som de "measure"
    .replace(/(^|[^dD])j/g, '$1zh')
    .replace(/(^|[^dD])J/g, '$1Zh')
    // ג׳: o dj vira o j do inglês
    .replace(/dj/g, 'j').replace(/Dj/g, 'J').replace(/DJ/g, 'J')
    // o ss entre vogais
    .replace(/ss/g, 's')
    // por último, o acento agudo da sílaba forte
    .replace(/[áéíóúÁÉÍÓÚâêô]/g, c => AGUDO[c]);
}

/* Nomes de sinais e letras que o português escreve sem acento, mas com grafia
   própria: trocados palavra inteira, só dentro de texto em inglês. */
export const NOMES_EN = {
  daguesh: 'dagesh', Daguesh: 'Dagesh',
  gerech: 'geresh', Gerech: 'Geresh', gueresh: 'geresh', Gueresh: 'Geresh',
  guéresh: 'geresh', Guéresh: 'Geresh',
  /* As festas, na grafia que o público em inglês conhece. */
  Pessach: 'Pesach', Sucot: 'Sukkot', Chanucá: 'Chanukah', Chanuca: 'Chanukah'
};

const LATINA = 'A-Za-zÀ-ÖØ-öø-ÿ';
const PALAVRA = new RegExp(`[${LATINA}]+(?:[-'][${LATINA}]+)*`, 'g');

/**
 * Num texto em INGLÊS (uma tradução, um rótulo de tela), converte o que é
 * transliteração e deixa o inglês em paz: palavra com acento agudo (o inglês
 * quase não tem), tudo o que está entre «» (é como o curso marca a
 * transliteração no meio da frase) e os nomes de NOMES_EN.
 */
export function translitNoTexto(texto) {
  let s = String(texto).replace(/«([^»]*)»/g, (_, dentro) => `«${translitEn(dentro)}»`);
  s = s.replace(PALAVRA, p => {
    if (NOMES_EN[p]) return NOMES_EN[p];
    return /[áéíóúÁÉÍÓÚ]/.test(p) ? translitEn(p) : p;
  });
  return s;
}
