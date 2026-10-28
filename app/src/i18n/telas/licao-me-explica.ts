import type { Traducao } from '..';

/* components/learn/MeExplica.tsx */
const pt = {
  meExplica: 'Me explica, Moshik',
  fechar: 'Fechar a explicação',
  ouvirLetra: 'Ouvir a letra',
  lembrar: 'O que você precisa lembrar',
  faz: 'O que esta letra faz',
  pronunciar: 'Como pronunciar',
  erroComum: 'O erro mais comum de quem fala português',
  sai: 'Sai:',
  certo: 'Certo:',
  naoConfunda: 'Não confunda com',
  gravacao: (nome: string) => `O nome, o som e uma palavra com ${nome}.`,
  entendi: 'Entendi, voltar à lição'
} as const;

const en: Traducao<typeof pt> = {
  meExplica: 'Explain it, Moshik',
  fechar: 'Close the explanation',
  ouvirLetra: 'Listen to the letter',
  lembrar: 'What you need to remember',
  faz: 'What this letter does',
  pronunciar: 'How to pronounce it',
  // etapa 3: pronúncia, rever
  erroComum: 'The most common mistake for English speakers',
  sai: 'What comes out:',
  certo: 'Correct:',
  naoConfunda: 'Do not confuse it with',
  gravacao: nome => `The name, the sound and a word with ${nome}.`,
  entendi: 'Got it, back to the lesson'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
