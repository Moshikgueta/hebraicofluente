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

const es: Traducao<typeof pt> = {
  oucaDiferenca: 'Escucha la diferencia:',
  ou: ' o ',
  somDe: (tocando, nome) => `${tocando ? 'Pausar' : 'Escuchar'} el sonido de ${nome}`,
  carregando: 'Cargando...',
  pausar: '❚❚ Pausar',
  continuar: '▶ Continuar',
  ouvir: '▶ Escuchar',
  emPreparacao: 'Grabación en preparación.',
  falhou: 'No pude reproducir el audio. Revisa la conexión y toca de nuevo.',
  identificar: '¿Puedes identificar el sonido?',
  tocarUm: 'Reproducir un sonido',
  proximo: 'Siguiente sonido',
  ouvirDeNovo: 'Escuchar de nuevo',
  acertos: (certos, total) => `Aciertos: ${certos} de ${total}`,
  qualLetra: '¿Qué letra escuchaste?',
  isso: nome => `¡Eso! Era ${nome}.`,
  era: nome => `Era ${nome}. Escucha las dos de nuevo y compara.`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
