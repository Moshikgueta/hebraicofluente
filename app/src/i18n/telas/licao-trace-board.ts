import type { Traducao } from '..';

/* components/learn/TraceBoard.tsx */
const pt = {
  areaDeEscrita: (letra: string) => `Área de escrita para a letra ${letra}`,
  feito: 'Feito. Compare com o modelo e veja o que você mudaria.'
} as const;

const en: Traducao<typeof pt> = {
  areaDeEscrita: letra => `Writing area for the letter ${letra}`,
  feito: 'Done. Compare it with the model and see what you would change.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
