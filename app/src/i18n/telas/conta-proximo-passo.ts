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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
