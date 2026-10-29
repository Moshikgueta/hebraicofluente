import type { Traducao } from '..';

/* components/landing/Versiculo.tsx */
const pt = {
  convite: 'toque numa palavra',
  palavra: (n: number, translit: string) => `Palavra ${n}: ${translit}`,
  leSe: 'lê-se',
  semPontos: 'sem os pontos, num rolo de sinagoga:',
  setePalavras: 'São sete palavras. Depois do curso, você lê as sete em voz alta - e precisa de um dicionário para saber o que cinco delas querem dizer.',
  traducao: 'A tradução é de uma versão em português. Elas variam, e é por isso que ler o original tem valor.'
} as const;

const en: Traducao<typeof pt> = {
  convite: 'tap a word',
  palavra: (n: number, translit: string) => `Word ${n}: ${translit}`,
  leSe: 'read as',
  semPontos: 'without the dots, as in a synagogue scroll:',
  setePalavras: 'There are seven words. After the course, you read all seven aloud - and you need a dictionary to know what five of them mean.',
  traducao: 'The translation comes from one English version. Versions differ, and that is why reading the original is worth it.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
