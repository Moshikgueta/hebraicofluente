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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
