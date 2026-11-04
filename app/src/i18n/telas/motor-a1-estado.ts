import type { Traducao } from '..';

/* lib/state/a1-estado.ts - os nomes das habilidades e das situações de
   revisão do Hebraico A1. */
const pt = {
  leitura: 'Leitura',
  escuta: 'Escuta',
  vocabulario: 'Vocabulário',
  gramatica: 'Gramática',
  comunicacao: 'Comunicação',
  escrita: 'Escrita',
  agora: 'Rever agora',
  logo: 'Rever logo',
  depois: 'Rever depois',
  dominado: 'Dominado'
} as const;

const en: Traducao<typeof pt> = {
  leitura: 'Reading',
  escuta: 'Listening',
  vocabulario: 'Vocabulary',
  gramatica: 'Grammar',
  comunicacao: 'Communication',
  escrita: 'Writing',
  agora: 'Review now',
  logo: 'Review soon',
  depois: 'Review later',
  dominado: 'Mastered'
};

const es: Traducao<typeof pt> = {
  leitura: 'Lectura',
  escuta: 'Escucha',
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  comunicacao: 'Comunicación',
  escrita: 'Escritura',
  agora: 'Repasar ahora',
  logo: 'Repasar pronto',
  depois: 'Repasar después',
  dominado: 'Dominado'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
