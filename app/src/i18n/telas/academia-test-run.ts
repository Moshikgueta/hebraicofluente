import type { Traducao } from '..';

/* components/game/TestRun.tsx */
const pt = {
  registrada: (n: number, total: number) => `Resposta registrada. Pergunta ${n} de ${total}.`,
  tempoDecorrido: (s: number) => `Tempo decorrido: ${s} segundos`,
  escolhaOpcao: 'Escolha uma opção',
  terminar: 'Terminar o teste',
  confirmar: 'Confirmar e continuar',

  concluido: 'Teste concluído',
  acertou: (acertos: number, total: number) => `Você acertou ${acertos} de ${total}.`,
  forte: 'Isso é leitura firme. O que escapou volta sozinho na revisão, no dia certo.',
  meio: 'Boa base, com buracos localizados. A lista abaixo diz exatamente quais.',
  cedo: 'Ainda é cedo para este conjunto, e isso não é um problema. Reveja as letras abaixo e refaça - não há limite de tentativas.',
  escapou: 'O que escapou',
  voceMarcou: (dada: string) => `você marcou ${dada}`,
  outraLetra: 'você marcou outra letra',
  rever: (nome: string) => `Rever ${nome}`,
  refazer: 'Refazer o teste'
} as const;

const en: Traducao<typeof pt> = {
  registrada: (n, total) => `Answer recorded. Question ${n} of ${total}.`,
  tempoDecorrido: s => `Time elapsed: ${s} seconds`,
  escolhaOpcao: 'Choose an option',
  terminar: 'Finish the test',
  confirmar: 'Confirm and continue',

  concluido: 'Test complete',
  acertou: (acertos, total) => `You got ${acertos} of ${total} right.`,
  forte: 'That is solid reading. Whatever slipped comes back on its own in the review, on the right day.',
  meio: 'A good base, with a few specific gaps. The list below says exactly which ones.',
  cedo: 'It is still early for this set, and that is not a problem. Review the letters below and try again - there is no limit on attempts.',
  escapou: 'What slipped',
  voceMarcou: dada => `you chose ${dada}`,
  outraLetra: 'you chose another letter',
  rever: nome => `Review ${nome}`,
  refazer: 'Retake the test'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
