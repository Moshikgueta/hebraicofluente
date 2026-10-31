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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
