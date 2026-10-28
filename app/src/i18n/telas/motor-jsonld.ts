import type { Traducao } from '..';

/* lib/jsonld.ts - os textos dos dados estruturados (o que a busca lê). */
const pt = {
  professorDescricao: 'Israelense, professor de idiomas e educador, criador do Hebraico Fluente.',
  inicio: 'Início'
} as const;

const en: Traducao<typeof pt> = {
  professorDescricao: 'Israeli language teacher and educator, creator of Hebraico Fluente.',
  inicio: 'Home'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
