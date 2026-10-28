import type { Traducao } from '..';

/* lib/engine/pares-de-som.ts - a frase que separa os dois sons de cada par.
   O hebraico de cada frase é o mesmo nos dois idiomas. */
const pt = {
  heHet: 'O ה é um H leve e soprado, como no inglês "hello". O ח é raspado, na parte de trás da boca.',
  shinSamech: 'O שׁ soa como o CH de "chave". O ס soa como o S de "sapo".',
  zayinSamech: 'O ז tem voz, como o Z de "zebra". O ס não tem voz, como o S de "sapo".',
  tsadiSamech: 'O צ soa TS, como em "tsunami". O ס é só S, como em "sapo".',
  daletTav: 'O ד tem voz, como o D de "dado". O ת não tem voz, como o T de "tatu".',
  guimelKuf: 'O ג tem voz, como o G de "gato". O ק não tem voz, como o K de "casa".',
  betPe: 'O בּ tem voz, como o B de "bola". O פּ não tem voz, como o P de "pato".'
} as const;

const en: Traducao<typeof pt> = {
  // etapa 3: pronúncia, rever
  heHet: 'ה is a light, breathy H, as in "hello". ח is raspy, made at the back of the mouth.',
  // etapa 3: pronúncia, rever
  shinSamech: 'שׁ sounds like the SH in "shoe". ס sounds like the S in "sun".',
  // etapa 3: pronúncia, rever
  zayinSamech: 'ז is voiced, like the Z in "zebra". ס is unvoiced, like the S in "sun".',
  // etapa 3: pronúncia, rever
  tsadiSamech: 'צ sounds TS, as in "cats". ס is just S, as in "sun".',
  // etapa 3: pronúncia, rever
  daletTav: 'ד is voiced, like the D in "dog". ת is unvoiced, like the T in "top".',
  // etapa 3: pronúncia, rever
  guimelKuf: 'ג is voiced, like the G in "go". ק is unvoiced, like the K in "kite".',
  // etapa 3: pronúncia, rever
  betPe: 'בּ is voiced, like the B in "boy". פּ is unvoiced, like the P in "pen".'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
