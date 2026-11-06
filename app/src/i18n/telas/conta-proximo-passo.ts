import type { Traducao } from '..';

/* components/platform/ProximoPasso.tsx */
const pt = {
  depoisDestaEtapa: 'Depois desta etapa',
  jaNaConta: 'Este curso já está na sua conta. ',
  abrir: (titulo: string) => `Abrir o ${titulo}`,
  conhecer: (nivel: string) => `Conhecer o ${nivel}`,
  verOPlano: 'Ver o plano deste curso',
  compraSeparada: 'Compra separada. O curso que você já tem continua aberto.',
  aindaNaoAbriu: 'Ainda não abriu. A página mostra o que ele vai cobrir.',
  querSaber: 'Quer saber quando ele abrir?',
  pecaOAviso: 'Peça o aviso em Sua conta'
} as const;

const en: Traducao<typeof pt> = {
  depoisDestaEtapa: 'After this stage',
  jaNaConta: 'This course is already in your account. ',
  abrir: (titulo: string) => `Open ${titulo}`,
  conhecer: (nivel: string) => `Discover ${nivel}`,
  verOPlano: 'See this course\'s plan',
  compraSeparada: 'Sold separately. The course you already have stays open.',
  aindaNaoAbriu: 'Not open yet. The page shows what it will cover.',
  querSaber: 'Want to know when it opens?',
  pecaOAviso: 'Ask for the notice in Your account'
};

const es: Traducao<typeof pt> = {
  depoisDestaEtapa: 'Después de esta etapa',
  jaNaConta: 'Este curso ya está en tu cuenta. ',
  abrir: (titulo: string) => `Abrir ${titulo}`,
  conhecer: (nivel: string) => `Conocer ${nivel}`,
  verOPlano: 'Ver el plan de este curso',
  compraSeparada: 'Se compra aparte. El curso que ya tienes sigue abierto.',
  aindaNaoAbriu: 'Todavía no abrió. La página muestra lo que va a cubrir.',
  querSaber: '¿Quieres saber cuándo abre?',
  pecaOAviso: 'Pide el aviso en Tu cuenta'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
