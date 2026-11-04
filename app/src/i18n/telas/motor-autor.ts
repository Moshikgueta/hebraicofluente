import type { Traducao } from '..';

/* lib/autor.ts - quem faz o Hebraico Fluente, em quatro linhas. Só o que
   /sobre afirma: nada inventado, nem na tradução. */
const pt = {
  israelense: 'Israelense, com o hebraico como língua materna',
  brasil: 'No Brasil desde 2021, ensinando hebraico a brasileiros',
  gerente: 'Gerente Pedagógico da New School, em Tel Aviv',
  formacao: 'Formação CELTA e estudos em Letras'
} as const;

const en: Traducao<typeof pt> = {
  israelense: 'Israeli, with Hebrew as his native language',
  brasil: 'In Brazil since 2021, teaching Hebrew to Brazilians',
  gerente: 'Academic Manager at New School, in Tel Aviv',
  formacao: 'CELTA qualification and studies in Languages and Literature'
};

const es: Traducao<typeof pt> = {
  israelense: 'Israelí, con el hebreo como lengua materna',
  brasil: 'En Brasil desde 2021, enseñando hebreo a brasileños',
  gerente: 'Gerente Pedagógico de New School, en Tel Aviv',
  formacao: 'Formación CELTA y estudios en Letras'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
