import type { Traducao } from '..';

/* As perguntas dos cardápios (05/11/2026): lib/engine/cardapio.ts. */
const pt = {
  oQueE: (he: string) => `O que é {{${he}}}?`,
  quantoCusta: (sentido: string) => `Quanto custa: ${sentido}?`,
  porque: (he: string, translit: string, sentido: string, preco: string) => `{{${he}}} (${translit}): ${sentido}, ${preco}.`
} as const;

const en: Traducao<typeof pt> = {
  oQueE: (he: string) => `What is {{${he}}}?`,
  quantoCusta: (sentido: string) => `How much is it: ${sentido}?`,
  porque: (he: string, translit: string, sentido: string, preco: string) => `{{${he}}} (${translit}): ${sentido}, ${preco}.`
};

const es: Traducao<typeof pt> = {
  oQueE: (he: string) => `¿Qué es {{${he}}}?`,
  quantoCusta: (sentido: string) => `¿Cuánto cuesta: ${sentido}?`,
  porque: (he: string, translit: string, sentido: string, preco: string) => `{{${he}}} (${translit}): ${sentido}, ${preco}.`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
