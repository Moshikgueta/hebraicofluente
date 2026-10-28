import type { Traducao } from '..';

/* lib/trace-score.ts - o diagnóstico de cada traçado. */
const pt = {
  bom: 'Muito bem! A forma está lá.',
  faltouParte: 'Quase! Faltou parte da letra - tente cobrir o modelo inteiro.',
  sigaAForma: 'Quase! Tente seguir um pouco mais a forma do modelo.',
  deNovo: 'Tente de novo olhando o modelo. Toque em “Ver o traçado” para rever a ordem.'
} as const;

const en: Traducao<typeof pt> = {
  bom: 'Well done! The shape is there.',
  faltouParte: 'Almost! Part of the letter is missing - try to cover the whole model.',
  sigaAForma: 'Almost! Try to follow the shape of the model a little more closely.',
  // o nome do botão tem de ser o mesmo do inglês do quadro de traçado
  deNovo: 'Try again while looking at the model. Tap “Show the strokes” to review the order.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
