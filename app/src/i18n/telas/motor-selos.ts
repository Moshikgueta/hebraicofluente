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

const es: Traducao<typeof pt> = {
  dica: 'Consejo de lectura',
  // etapa 3: pronúncia, rever (o selo leva a bandeira do Brasil no código)
  brasileiro: 'Para quien habla español',
  erro: 'Error común',
  padrao: 'Un patrón que vas a ver mucho',
  curiosidade: '¿Sabías que...?'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
