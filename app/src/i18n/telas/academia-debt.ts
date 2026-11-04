import type { Traducao } from '..';

/* components/game/Debt.tsx */
const pt = {
  paraRevisar: 'Para revisar',
  nadaPendente: 'Nada pendente. Quando você errar alguma coisa, ela aparece aqui - com o motivo, não só a letra.',
  nLetras: (n: number) => `${n} ${n === 1 ? 'letra' : 'letras'}`,
  naFila: (n: number) => `${n} ${n === 1 ? 'item' : 'itens'} na fila`,
  naFilaDeRevisao: 'na fila de revisão',
  trocando: (letras: string) => `Você está trocando com ${letras}`,
  trocaCom: 'troca com'
} as const;

const en: Traducao<typeof pt> = {
  paraRevisar: 'To review',
  nadaPendente: 'Nothing pending. When you get something wrong, it shows up here - with the reason, not just the letter.',
  nLetras: n => `${n} ${n === 1 ? 'letter' : 'letters'}`,
  naFila: n => `${n} ${n === 1 ? 'item' : 'items'} in the queue`,
  naFilaDeRevisao: 'in the review queue',
  trocando: letras => `You are mixing it up with ${letras}`,
  trocaCom: 'mixed up with'
};

const es: Traducao<typeof pt> = {
  paraRevisar: 'Para repasar',
  nadaPendente: 'Nada pendiente. Cuando te equivoques en algo, aparece aquí - con el motivo, no solo la letra.',
  nLetras: n => `${n} ${n === 1 ? 'letra' : 'letras'}`,
  naFila: n => `${n} ${n === 1 ? 'elemento' : 'elementos'} en la fila`,
  naFilaDeRevisao: 'en la fila de repaso',
  trocando: letras => `La estás confundiendo con ${letras}`,
  trocaCom: 'se confunde con'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
