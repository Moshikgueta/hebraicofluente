import type { Traducao } from '..';

/* components/learn/ContadorDeLeitura.tsx */
const pt = {
  rotulo: 'Palavras que você consegue ler',
  novasCom: (nome: string, novas: number) =>
    `Com o ${nome}, ${novas === 1 ? 'uma palavra nova passou' : `${novas} palavras novas passaram`} a ser legíveis para você.`,
  verVocabulario: 'Ver o meu vocabulário'
} as const;

const en: Traducao<typeof pt> = {
  rotulo: 'Words you can read',
  novasCom: (nome, novas) =>
    `With ${nome}, ${novas === 1 ? 'one new word is' : `${novas} new words are`} now readable for you.`,
  verVocabulario: 'See my vocabulary'
};

const es: Traducao<typeof pt> = {
  rotulo: 'Palabras que puedes leer',
  novasCom: (nome, novas) =>
    `Con ${nome}, ${novas === 1 ? 'una palabra nueva pasó' : `${novas} palabras nuevas pasaron`} a ser legibles para ti.`,
  verVocabulario: 'Ver mi vocabulario'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
