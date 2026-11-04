import type { Traducao } from '..';

/* app/layout.tsx: o que não é da marca (essa mora em geral.ts) */
const pt = {
  pularParaConteudo: 'Pular para o conteúdo'
} as const;

const en: Traducao<typeof pt> = {
  pularParaConteudo: 'Skip to content'
};

const es: Traducao<typeof pt> = {
  pularParaConteudo: 'Saltar al contenido'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
