import type { Traducao } from '..';

/* app/modulo/[n]/missao/MissaoClient.tsx */
const pt = {
  semMissao: 'Este módulo ainda não tem missão.',
  voltarAoModulo: 'Voltar ao módulo',
  titulo: (titulo: string) => `Missão · ${titulo}`,
  kicker: (n: number, certas: number, total: number) => `Missão ${n} · ${certas} de ${total}`,
  cumprida: 'Missão cumprida.',
  quase: 'Quase - vale tentar de novo.',
  nadaSePerde: 'Nada se perde: refaça com calma, lendo letra por letra. As alternativas mudam de lugar.',
  refazer: 'Refazer',
  proximoModulo: (n: number, titulo: string) => `Módulo ${n} - ${titulo}`,
  desafioFinal: 'Ir para o desafio final',
  voltar: (n: number) => `← Módulo ${n}`,
  missaoDoModulo: (n: number) => `Missão do módulo ${n}`,
  comoFunciona: 'Como funciona?',
  passos: (n: number) =>
    `${n} passos, na ordem da história, só com palavras que você já aprendeu. Leia com calma: passa com 70%, e dá para refazer quantas vezes quiser.`,
  jaCumpriu: '✓ Você já cumpriu esta missão.',
  deNovo: 'Fazer a missão de novo',
  comecar: 'Começar a missão'
} as const;

const en: Traducao<typeof pt> = {
  semMissao: 'This module does not have a mission yet.',
  voltarAoModulo: 'Back to the module',
  titulo: titulo => `Mission · ${titulo}`,
  kicker: (n, certas, total) => `Mission ${n} · ${certas} of ${total}`,
  cumprida: 'Mission accomplished.',
  quase: 'Almost - worth another try.',
  nadaSePerde: 'Nothing is lost: do it again calmly, reading letter by letter. The options move around.',
  refazer: 'Try again',
  proximoModulo: (n, titulo) => `Module ${n} - ${titulo}`,
  desafioFinal: 'Go to the final challenge',
  voltar: n => `← Module ${n}`,
  missaoDoModulo: n => `Module ${n} mission`,
  comoFunciona: 'How does it work?',
  passos: n =>
    `${n} steps, in the order of the story, using only words you have already learned. Read calmly: you pass with 70%, and you can redo it as many times as you like.`,
  jaCumpriu: '✓ You have already completed this mission.',
  deNovo: 'Do the mission again',
  comecar: 'Start the mission'
};

const es: Traducao<typeof pt> = {
  semMissao: 'Este módulo todavía no tiene misión.',
  voltarAoModulo: 'Volver al módulo',
  titulo: titulo => `Misión · ${titulo}`,
  kicker: (n, certas, total) => `Misión ${n} · ${certas} de ${total}`,
  cumprida: 'Misión cumplida.',
  quase: 'Casi - vale la pena intentarlo de nuevo.',
  nadaSePerde: 'No se pierde nada: hazla de nuevo con calma, leyendo letra por letra. Las opciones cambian de lugar.',
  refazer: 'Rehacer',
  proximoModulo: (n, titulo) => `Módulo ${n} - ${titulo}`,
  desafioFinal: 'Ir al desafío final',
  voltar: n => `← Módulo ${n}`,
  missaoDoModulo: n => `Misión del módulo ${n}`,
  comoFunciona: '¿Cómo funciona?',
  passos: n =>
    `${n} pasos, en el orden de la historia, solo con palabras que ya aprendiste. Lee con calma: apruebas con 70%, y puedes rehacerla todas las veces que quieras.`,
  jaCumpriu: '✓ Ya cumpliste esta misión.',
  deNovo: 'Hacer la misión de nuevo',
  comecar: 'Empezar la misión'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
