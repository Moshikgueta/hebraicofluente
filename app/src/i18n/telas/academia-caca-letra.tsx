import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/game/CacaLetra.tsx */
const pt = {
  letra: 'letra',
  nomeFinal: (nome: string) => `${nome} final`,
  encontre: 'Encontre todas as letras iguais a esta.',
  aLetraE: (nome: string) => ` A letra é ${nome}.`,
  nestaGrade: (achadas: number, quantas: number) => `${achadas} de ${quantas} nesta grade`,
  letraDe: (n: number, total: number) => `Letra ${n} de ${total}`,
  encontrada: (nome: string) => `${nome}, encontrada`,
  achou: (n: number, he: ReactNode, ultima: boolean): ReactNode =>
    <>Achou as {n}{' '}{he}.{' '}{ultima ? 'Fim da partida.' : 'Agora outra letra.'}</>,
  nLetras: (n: number) => `${n} letras`
} as const;

const en: Traducao<typeof pt> = {
  letra: 'letter',
  nomeFinal: nome => `final ${nome}`,
  encontre: 'Find every letter that matches this one.',
  aLetraE: nome => ` The letter is ${nome}.`,
  nestaGrade: (achadas, quantas) => `${achadas} of ${quantas} in this grid`,
  letraDe: (n, total) => `Letter ${n} of ${total}`,
  encontrada: nome => `${nome}, found`,
  achou: (n, he, ultima) =>
    <>You found all {n}{' '}{he}.{' '}{ultima ? 'End of the game.' : 'Now another letter.'}</>,
  nLetras: n => `${n} letters`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
