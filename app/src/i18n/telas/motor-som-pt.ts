import type { Traducao } from '..';

/* lib/som-pt.ts - o som de cada letra, escrito para quem fala a língua do
   site (o IPA de data/letters.json fica como detalhe). */
const pt = {
  mudo: 'mudo: só a vogal soa',
  mudoMaioria: 'mudo para a maioria: só a vogal soa',
  m: 'm, como em "mãe"',
  t: 't, como em "tatu"',
  n: 'n, como em "nada"',
  h: 'h soprado, como no inglês "hello"',
  j: 'i, como em "iate"',
  g: 'g, como em "gato"',
  d: 'd, como em "dado"',
  sh: 'ch, como em "chave"',
  l: 'l, como em "lua"',
  r: 'r macio do fundo da boca, como o francês',
  v: 'v, como em "vaca"',
  z: 'z, como em "zebra"',
  ch: 'som produzido na parte de trás da boca, parecido com alguns tipos de R carioca',
  s: 's, como em "sapo"',
  ts: 'ts, como em "tsunami"',
  k: 'k, como o c de "casa"',
  b: 'b, como em "bola"',
  p: 'p, como em "pato"',
  f: 'f, como em "faca"',
  ou: ' ou '
} as const;

const en: Traducao<typeof pt> = {
  mudo: 'silent: only the vowel sounds',
  mudoMaioria: 'silent for most speakers: only the vowel sounds',
  // etapa 3: pronúncia, rever
  m: 'm, as in "mother"',
  // etapa 3: pronúncia, rever
  t: 't, as in "top"',
  // etapa 3: pronúncia, rever
  n: 'n, as in "no"',
  // etapa 3: pronúncia, rever
  h: 'a breathy h, as in "hello"',
  // etapa 3: pronúncia, rever
  j: 'y, as in "yes"',
  // etapa 3: pronúncia, rever
  g: 'g, as in "go"',
  // etapa 3: pronúncia, rever
  d: 'd, as in "dog"',
  // etapa 3: pronúncia, rever
  sh: 'sh, as in "shoe"',
  // etapa 3: pronúncia, rever
  l: 'l, as in "lamp"',
  // etapa 3: pronúncia, rever
  r: 'a soft r from the back of the mouth, like the French r',
  // etapa 3: pronúncia, rever
  v: 'v, as in "van"',
  // etapa 3: pronúncia, rever
  z: 'z, as in "zebra"',
  // etapa 3: pronúncia, rever
  ch: 'a sound made at the back of the mouth, like the ch in Scottish "loch"',
  // etapa 3: pronúncia, rever
  s: 's, as in "sun"',
  // etapa 3: pronúncia, rever
  ts: 'ts, as in "cats"',
  // etapa 3: pronúncia, rever
  k: 'k, as in "kite"',
  // etapa 3: pronúncia, rever
  b: 'b, as in "boy"',
  // etapa 3: pronúncia, rever
  p: 'p, as in "pen"',
  // etapa 3: pronúncia, rever
  f: 'f, as in "fun"',
  ou: ' or '
};

const es: Traducao<typeof pt> = {
  mudo: 'muda: solo suena la vocal',
  mudoMaioria: 'muda para la mayoría: solo suena la vocal',
  // etapa 3: pronúncia, rever
  m: 'm, como en "mamá"',
  // etapa 3: pronúncia, rever
  t: 't, como en "techo"',
  // etapa 3: pronúncia, rever
  n: 'n, como en "nada"',
  // etapa 3: pronúncia, rever
  h: 'h soplada, como en el inglés "hello"',
  // etapa 3: pronúncia, rever
  j: 'y, como en "ya"',
  // etapa 3: pronúncia, rever
  g: 'g, como en "gato"',
  // etapa 3: pronúncia, rever
  d: 'd, como en "dado"',
  // etapa 3: pronúncia, rever
  sh: 'sh, como en el inglés "show"',
  // etapa 3: pronúncia, rever
  l: 'l, como en "luna"',
  // etapa 3: pronúncia, rever
  r: 'r suave del fondo de la boca, como la r francesa',
  // etapa 3: pronúncia, rever
  v: 'v con los dientes sobre el labio, como en el inglés "van"',
  // etapa 3: pronúncia, rever
  z: 'z con zumbido, como en el inglés "zebra"',
  // etapa 3: pronúncia, rever
  ch: 'sonido de la parte de atrás de la boca, como la j de "jamón"',
  // etapa 3: pronúncia, rever
  s: 's, como en "sapo"',
  // etapa 3: pronúncia, rever
  ts: 'ts, como en "tsunami"',
  // etapa 3: pronúncia, rever
  k: 'k, como la c de "casa"',
  // etapa 3: pronúncia, rever
  b: 'b, como en "bola"',
  // etapa 3: pronúncia, rever
  p: 'p, como en "pato"',
  // etapa 3: pronúncia, rever
  f: 'f, como en "foca"',
  ou: ' o '
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
