import type { Traducao } from '..';

/* components/learn/CompararSons.tsx */
const pt = {
  oucaDiferenca: 'Ouça a diferença:',
  ou: ' ou ',
  somDe: (tocando: boolean, nome: string) => `${tocando ? 'Pausar' : 'Ouvir'} o som de ${nome}`,
  carregando: 'Carregando...',
  pausar: '❚❚ Pausar',
  continuar: '▶ Continuar',
  ouvir: '▶ Ouvir',
  emPreparacao: 'Gravação em preparação.',
  falhou: 'Não consegui tocar o áudio. Confira a conexão e toque de novo.',
  identificar: 'Você consegue identificar o som?',
  tocarUm: 'Tocar um som',
  proximo: 'Próximo som',
  ouvirDeNovo: 'Ouvir de novo',
  acertos: (certos: number, total: number) => `Acertos: ${certos} de ${total}`,
  qualLetra: 'Qual letra você ouviu?',
  isso: (nome: string) => `Isso! Era o ${nome}.`,
  era: (nome: string) => `Era o ${nome}. Ouça os dois de novo e compare.`
} as const;

const en: Traducao<typeof pt> = {
  oucaDiferenca: 'Hear the difference:',
  ou: ' or ',
  somDe: (tocando, nome) => `${tocando ? 'Pause' : 'Listen to'} the sound of ${nome}`,
  carregando: 'Loading...',
  pausar: '❚❚ Pause',
  continuar: '▶ Resume',
  ouvir: '▶ Listen',
  emPreparacao: 'Recording in progress.',
  falhou: 'I couldn\'t play the audio. Check your connection and tap again.',
  identificar: 'Can you tell which sound it is?',
  tocarUm: 'Play a sound',
  proximo: 'Next sound',
  ouvirDeNovo: 'Listen again',
  acertos: (certos, total) => `Correct: ${certos} of ${total}`,
  qualLetra: 'Which letter did you hear?',
  isso: nome => `That's it! It was ${nome}.`,
  era: nome => `It was ${nome}. Listen to both again and compare.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
