import type { Traducao } from '..';

/* components/game/ImpressaCursiva.tsx */
const pt = {
  titulo: 'Impressa e cursiva',
  placar: (n: number, total: number, acertos: number) =>
    `${n} / ${total} · ${acertos} ${acertos === 1 ? 'acerto' : 'acertos'}`,
  rodadaDe: (n: number, total: number) => `Rodada ${n} de ${total}`,
  exatamente: 'Exatamente.',
  compare: 'Compare os dois desenhos com calma.',
  qualCursiva: 'Qual é esta letra em cursiva?',
  qualImpressa: 'Qual é esta letra na forma impressa?',
  estaEOutra: (esta: string, alvo: string) => `Esta é a ${esta}. A que você procura é a ${alvo}.`,
  paresInstrucao: 'Toque numa letra impressa e depois na mesma letra em cursiva.',
  deTotal: (n: number, total: number) => `${n} de ${total}`,
  impressa: 'Impressa',
  cursiva: 'Cursiva',
  ariaPeca: (nome: string, cursiva: boolean) => `${nome}${cursiva ? ' em cursiva' : ' impressa'}`
} as const;

const en: Traducao<typeof pt> = {
  titulo: 'Print and cursive',
  placar: (n, total, acertos) => `${n} / ${total} · ${acertos} right`,
  rodadaDe: (n, total) => `Round ${n} of ${total}`,
  exatamente: 'Exactly.',
  compare: 'Compare the two shapes calmly.',
  qualCursiva: 'Which is this letter in cursive?',
  qualImpressa: 'Which is this letter in print?',
  estaEOutra: (esta, alvo) => `This is ${esta}. The one you are looking for is ${alvo}.`,
  paresInstrucao: 'Tap a printed letter and then the same letter in cursive.',
  deTotal: (n, total) => `${n} of ${total}`,
  impressa: 'Print',
  cursiva: 'Cursive',
  ariaPeca: (nome, cursiva) => `${nome}${cursiva ? ' in cursive' : ' in print'}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
