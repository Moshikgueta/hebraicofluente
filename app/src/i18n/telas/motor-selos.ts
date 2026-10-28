import type { Traducao } from '..';

/* lib/selos.ts - o título de cada selo dos quadros da lição. */
const pt = {
  dica: 'Dica de leitura',
  brasileiro: 'Para quem fala português',
  erro: 'Erro comum',
  padrao: 'Padrão que você vai ver muito',
  curiosidade: 'Curiosidade'
} as const;

const en: Traducao<typeof pt> = {
  dica: 'Reading tip',
  // etapa 3: pronúncia, rever (o selo leva a bandeira do Brasil no código)
  brasileiro: 'For English speakers',
  erro: 'Common mistake',
  padrao: 'A pattern you will see a lot',
  curiosidade: 'Did you know?'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
