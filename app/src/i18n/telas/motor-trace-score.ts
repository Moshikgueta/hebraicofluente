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

const es: Traducao<typeof pt> = {
  bom: '¡Muy bien! La forma está ahí.',
  faltouParte: '¡Casi! Faltó parte de la letra: intenta cubrir el modelo entero.',
  sigaAForma: '¡Casi! Intenta seguir un poco más la forma del modelo.',
  // o nome do botão tem de ser o mesmo do espanhol do quadro de traçado
  deNovo: 'Intenta de nuevo mirando el modelo. Toca “Ver el trazado” para repasar el orden.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
