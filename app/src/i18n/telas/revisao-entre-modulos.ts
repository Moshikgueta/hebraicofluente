import type { Traducao } from '..';

/* A revisão entre módulos (03/11/2026): lib/state/rules.ts `PortaDeModulo`,
   a lição trancada, o checkpoint e o painel. */
const pt = {
  porque: (n: number, proximo: number) =>
    `O módulo ${proximo} abre depois da revisão do módulo ${n}: um checkpoint curto, feito num dia depois do dia em que você estudou as letras. Revisar depois de uma noite de sono é o que fixa as letras na memória.`,
  abreAmanha: 'A revisão abre amanhã.',
  irRevisao: (n: number) => `Ir para a revisão do módulo ${n}`,
  amanhaTitulo: 'A revisão abre amanhã',
  amanhaTexto: 'Você estudou letras deste módulo hoje. A revisão fica para amanhã: revisar depois de uma noite de sono é o que fixa as letras na memória. Até lá, dá para refazer os exercícios das letras acima.'
} as const;

const en: Traducao<typeof pt> = {
  porque: (n: number, proximo: number) =>
    `Module ${proximo} opens after the module ${n} review: a short checkpoint, taken on a later day than the one you studied the letters. Reviewing after a night's sleep is what makes the letters stick.`,
  abreAmanha: 'The review opens tomorrow.',
  irRevisao: (n: number) => `Go to the module ${n} review`,
  amanhaTitulo: 'The review opens tomorrow',
  amanhaTexto: 'You studied letters from this module today. The review waits until tomorrow: reviewing after a night\'s sleep is what makes the letters stick. Until then, you can redo the exercises for the letters above.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
