import type { Traducao } from '..';

/* components/game/Game.tsx */
const pt = {
  localeNumero: 'pt-BR',
  progresso: 'Progresso',
  comeceHoje: 'Comece hoje',
  umDia: '1 dia seguido',
  dias: (n: number) => `${n} dias seguidos`,
  metaConcluida: 'Meta de hoje concluída',
  meta: 'Meta de hoje',
  retomar: 'Seu progresso continua aqui, sem prazo. Vamos retomar?',
  xp: 'XP',
  naoConquistada: ' (ainda não conquistada)'
} as const;

const en: Traducao<typeof pt> = {
  localeNumero: 'en-US',
  progresso: 'Progress',
  comeceHoje: 'Start today',
  umDia: '1 day in a row',
  dias: n => `${n} days in a row`,
  metaConcluida: 'Today\'s goal reached',
  meta: 'Today\'s goal',
  retomar: 'Your progress is still here, no deadline. Shall we pick it back up?',
  xp: 'XP',
  naoConquistada: ' (not earned yet)'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
