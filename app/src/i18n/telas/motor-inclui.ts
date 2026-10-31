import type { Traducao } from '..';

/* lib/inclui.ts - o que o preço do curso compra, item por item. */
const pt = {
  aula0: 'Aula 0: como o hebraico funciona, antes da primeira letra',
  licoes: (n: number): string => `${n} lições, uma letra por vez`,
  cursiva: 'Escrita cursiva traçada na tela, com avaliação do traço',
  audio: 'Áudio gravado pelo professor, um israelense',
  semAudio: 'Explicação de som para cada letra',
  jogos: 'Jogos de prática na Academia de Leitura',
  exame: 'Exame final e certificado de conclusão (não oficial)',
  progresso: 'Progresso salvo, no celular e no computador'
} as const;

const en: Traducao<typeof pt> = {
  aula0: 'Lesson 0: how Hebrew works, before the first letter',
  licoes: (n: number): string => `${n} lessons, one letter at a time`,
  cursiva: 'Cursive writing traced on the screen, with feedback on your strokes',
  audio: 'Audio recorded by the teacher, a native Israeli',
  semAudio: 'An explanation of the sound of each letter',
  jogos: 'Practice games in the Reading Academy',
  exame: 'Final exam and certificate of completion (not official)',
  progresso: 'Progress saved, on your phone and on your computer'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
