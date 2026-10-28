import type { Traducao } from '..';

/* components/shell/SessaoCaiu.tsx */
const pt = {
  titulo: 'Sua sessão terminou.',
  texto: 'O que você fizer agora fica salvo só neste aparelho, até você entrar de novo.',
  entrar: 'Entrar de novo'
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Your session has ended.',
  texto: 'Anything you do now is saved only on this device until you sign in again.',
  entrar: 'Sign in again'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
