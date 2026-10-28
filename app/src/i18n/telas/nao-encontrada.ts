import type { Traducao } from '..';

const pt = {
  tituloDaAba: 'Página não encontrada - Hebraico Fluente',
  titulo: 'Esta página não existe',
  texto: 'Talvez o link esteja antigo.',
  voltar: 'Voltar ao início'
} as const;

const en: Traducao<typeof pt> = {
  tituloDaAba: 'Page not found - Hebraico Fluente',
  titulo: 'This page does not exist',
  texto: 'The link may be out of date.',
  voltar: 'Back to the start'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
