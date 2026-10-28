import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/learn/SugestaoDePar.tsx */
const pt = {
  vamosPraticar: (a: ReactNode, b: ReactNode): ReactNode =>
    <>Vamos praticar a diferença entre {a} e {b}?</>,
  trocou: (n: number) =>
    `Você trocou estas duas letras ${n} vezes. Uma rodada curta só com elas ajuda a separar uma da outra.`,
  praticarAgora: 'Praticar agora'
} as const;

const en: Traducao<typeof pt> = {
  vamosPraticar: (a, b) => <>Shall we practice telling {a} and {b} apart?</>,
  trocou: n =>
    `You mixed up these two letters ${n} times. A short round with just these two helps you tell them apart.`,
  praticarAgora: 'Practice now'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
