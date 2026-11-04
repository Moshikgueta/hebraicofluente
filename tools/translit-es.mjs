/* translit-es.mjs - a transliteração do site em espanhol
 * ─────────────────────────────────────────────────────────────────────────
 * A fonte continua sendo a transliteração prática para brasileiros
 * (data/translit.json, "pt-BR-practical-v1"). O site em espanhol (04/11/2026)
 * usa a grafia que quem fala espanhol lê sem tropeçar, e ela sai desta
 * conversão, sempre a mesma, como a do inglês (translit-en.mjs).
 * PRIMEIRA VERSÃO, para o dono aprovar (PLANO-ESPANHOL.md, etapa 3):
 *
 *   ח e כ (o som de "jota")    ch -> j        léchem -> léjem, Chanucá -> Janucá
 *   צ׳ (o ch de "chico")       tch -> ch      tchips -> chips
 *   ז׳ (o j do português)      j -> zh        jakét -> zhakét
 *   ג׳ (o dj de "jeans")       dj -> y        djins -> yins
 *   s simples entre vogais     ss -> s        késsef -> késef
 *   circunflexo                â ê ô -> á é ó malê -> malé
 *
 * O acento agudo da sílaba forte FICA: o espanhol lê "shalóm" e "Hashém" como
 * o curso pede. "gue/gui" também fica: em espanhol o u segura o g duro igual.
 */

const CIRCUNFLEXO = { â: 'á', ê: 'é', ô: 'ó', Â: 'Á', Ê: 'É', Ô: 'Ó' };

/** Uma transliteração do curso (ou um trecho com várias palavras) em espanhol. */
export function translitEs(texto) {
  return String(texto)
    // צ׳ e ג׳ guardados antes, para o ch e o j de baixo não os pegarem
    .replace(/tch/g, '\u0001').replace(/Tch/g, '\u0002').replace(/TCH/g, '\u0002')
    .replace(/dj/g, '\u0003').replace(/Dj/g, '\u0004').replace(/DJ/g, '\u0004')
    // ז׳: o j do português
    .replace(/j/g, 'zh').replace(/J/g, 'Zh')
    // ח e כ
    .replace(/ch/g, 'j').replace(/Ch/g, 'J').replace(/CH/g, 'J')
    .replace(/\u0001/g, 'ch').replace(/\u0002/g, 'Ch')
    .replace(/\u0003/g, 'y').replace(/\u0004/g, 'Y')
    .replace(/ss/g, 's')
    .replace(/[âêôÂÊÔ]/g, c => CIRCUNFLEXO[c]);
}

/* Nomes de sinais, letras e festas com grafia própria em espanhol. */
export const NOMES_ES = {
  gerech: 'guéresh', Gerech: 'Guéresh', gueresh: 'guéresh', Gueresh: 'Guéresh',
  Pessach: 'Pésaj', Chanucá: 'Janucá', Chanuca: 'Janucá', Het: 'Jet', Sámech: 'Sámej'
};
