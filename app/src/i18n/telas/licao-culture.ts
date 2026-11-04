import type { Traducao } from '..';

/* components/learn/Culture.tsx */
const pt = {
  historia: 'História',
  curiosidade: 'Curiosidade',
  cultura: 'Na vida real',
  primeiraCarta:
    'A primeira carta abre quando você dominar 3 letras. Elas não valem XP e não desbloqueiam nada - são só o que dá vontade de saber depois de começar a ler.',
  aindaFechadas: 'Ainda fechadas',
  letras: (n: number) => `${n} letras`,
  desbloqueada: 'Carta desbloqueada'
} as const;

const en: Traducao<typeof pt> = {
  historia: 'History',
  curiosidade: 'Did you know',
  cultura: 'In real life',
  primeiraCarta:
    'The first card opens when you master 3 letters. They are not worth XP and do not unlock anything - they are simply what you start wondering about once you begin to read.',
  aindaFechadas: 'Still locked',
  letras: n => `${n} letters`,
  desbloqueada: 'Card unlocked'
};

const es: Traducao<typeof pt> = {
  historia: 'Historia',
  curiosidade: 'Curiosidad',
  cultura: 'En la vida real',
  primeiraCarta:
    'La primera carta se abre cuando domines 3 letras. No valen XP y no desbloquean nada - son solo lo que da ganas de saber después de empezar a leer.',
  aindaFechadas: 'Todavía cerradas',
  letras: n => `${n} letras`,
  desbloqueada: 'Carta desbloqueada'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
