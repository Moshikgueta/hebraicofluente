import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/game/Blast.tsx */
const pt = {
  elogio3: '3 acertos seguidos!',
  elogio5: 'Você está pegando o jeito!',
  elogio8: '8 seguidos - isso é leitura automática.',
  elogio12: 'Doze. Pode parar quando quiser, você já provou.',
  seguidos: (n: number) => `${n} seguidos`,
  acertos: (n: number) => `${n} acertos`,
  perguntaDe: (n: number, total: number) => `Pergunta ${n} de ${total}`,
  boa: 'Boa!',
  quase: (resposta: ReactNode): ReactNode => <>Quase. A resposta era {resposta}.</>
} as const;

const en: Traducao<typeof pt> = {
  elogio3: '3 right in a row!',
  elogio5: 'You are getting the hang of it!',
  elogio8: '8 in a row - that is automatic reading.',
  elogio12: 'Twelve. Stop whenever you like, you have proved it.',
  seguidos: n => `${n} in a row`,
  acertos: n => `${n} right`,
  perguntaDe: (n, total) => `Question ${n} of ${total}`,
  boa: 'Nice!',
  quase: resposta => <>Almost. The answer was {resposta}.</>
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
