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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
