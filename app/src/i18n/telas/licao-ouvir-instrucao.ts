import type { Traducao } from '..';

/* components/learn/OuvirInstrucao.tsx */
const pt = {
  /** O idioma da voz do aparelho que lê o enunciado. */
  vozLang: 'pt-BR',
  vozPrefixo: 'pt',
  pausarInstrucao: 'Pausar a instrução',
  continuarInstrucao: 'Continuar a instrução',
  ouvirInstrucaoNoIdioma: 'Ouvir a instrução em português',
  pausar: 'Pausar',
  continuar: 'Continuar',
  ouvirInstrucao: 'Ouvir a instrução'
} as const;

const en: Traducao<typeof pt> = {
  vozLang: 'en-US',
  vozPrefixo: 'en',
  pausarInstrucao: 'Pause the instructions',
  continuarInstrucao: 'Resume the instructions',
  ouvirInstrucaoNoIdioma: 'Listen to the instructions in English',
  pausar: 'Pause',
  continuar: 'Resume',
  ouvirInstrucao: 'Listen to the instructions'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
