import type { Traducao } from '..';

/* A revisão entre módulos (03/11/2026): lib/state/rules.ts `PortaDeModulo`,
   a lição trancada, o checkpoint e o painel. */
const pt = {
  porque: (n: number, proximo: number) =>
    `O módulo ${proximo} abre quando você fecha o módulo ${n}: a revisão (um checkpoint curto, feito num dia depois do dia em que você estudou as letras) e as leituras dele. Revisar depois de uma noite de sono e ler textos inteiros é o que fixa as letras na memória.`,
  passoRevisao: (n: number) => `Revisão do módulo ${n}`,
  passoPrimeira: 'Minha Primeira Leitura',
  passoTexto: (titulo: string) => `Texto: ${titulo}`,
  feito: 'feito',
  faltaFazer: 'falta fazer',
  paraAbrir: (n: number) => `Para abrir o módulo ${n}, falta: {nome}.`,
  lerSub: (n: number) => `O módulo ${n} abre depois da revisão e das leituras do módulo anterior.`,
  irPara: (nome: string) => `Ir para ${nome}`,
  abreAmanha: 'A revisão abre amanhã.',
  amanhaTitulo: 'A revisão abre amanhã',
  praticarHoje: 'Praticar as letras que você já sabe',
  amanhaTexto: 'Você estudou letras deste módulo hoje. A revisão fica para amanhã: revisar depois de uma noite de sono é o que fixa as letras na memória. Até lá, dá para refazer os exercícios das letras acima.'
} as const;

const en: Traducao<typeof pt> = {
  porque: (n: number, proximo: number) =>
    `Module ${proximo} opens when you close module ${n}: the review (a short checkpoint, taken on a later day than the one you studied the letters) and its readings. Reviewing after a night's sleep and reading whole texts is what makes the letters stick.`,
  passoRevisao: (n: number) => `Module ${n} review`,
  passoPrimeira: 'My First Reading',
  passoTexto: (titulo: string) => `Text: ${titulo}`,
  feito: 'done',
  faltaFazer: 'still to do',
  paraAbrir: (n: number) => `To open module ${n}, still to do: {nome}.`,
  lerSub: (n: number) => `Module ${n} opens after the previous module's review and readings.`,
  irPara: (nome: string) => `Go to ${nome}`,
  abreAmanha: 'The review opens tomorrow.',
  amanhaTitulo: 'The review opens tomorrow',
  praticarHoje: 'Practice the letters you already know',
  amanhaTexto: 'You studied letters from this module today. The review waits until tomorrow: reviewing after a night\'s sleep is what makes the letters stick. Until then, you can redo the exercises for the letters above.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
