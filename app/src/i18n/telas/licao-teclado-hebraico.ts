import type { Traducao } from '..';

/* components/learn/TecladoHebraico.tsx */
const pt = {
  esconder: 'Esconder o teclado hebraico da tela',
  mostrar: 'Mostrar o teclado hebraico na tela',
  teclado: 'Teclado hebraico',
  finais: 'Letras finais',
  espacoRotulo: 'Espaço',
  espaco: 'espaço',
  apagarRotulo: 'Apagar',
  apagar: 'apagar',
  sinais: 'Sinais de vogal (nikud)',
  dica: 'Toque a letra e depois o sinal dela. O teclado do seu aparelho continua funcionando.'
} as const;

const en: Traducao<typeof pt> = {
  esconder: 'Hide the on-screen Hebrew keyboard',
  mostrar: 'Show the on-screen Hebrew keyboard',
  teclado: 'Hebrew keyboard',
  finais: 'Final letters',
  espacoRotulo: 'Space',
  espaco: 'space',
  apagarRotulo: 'Delete',
  apagar: 'delete',
  sinais: 'Vowel signs (nikud)',
  dica: 'Tap the letter and then its sign. Your device\'s own keyboard still works.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
