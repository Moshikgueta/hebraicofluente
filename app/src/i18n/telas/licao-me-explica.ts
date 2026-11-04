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
  entendi: 'Entendi, voltar à lição',
  video: (nome: string) => `O Moshik explica o ${nome}`,
  legenda: 'Português'
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
  entendi: 'Got it, back to the lesson',
  video: nome => `Moshik explains ${nome}`,
  legenda: 'Portuguese'
};

const es: Traducao<typeof pt> = {
  meExplica: 'Explícamelo, Moshik',
  fechar: 'Cerrar la explicación',
  ouvirLetra: 'Escuchar la letra',
  lembrar: 'Lo que necesitas recordar',
  faz: 'Lo que hace esta letra',
  pronunciar: 'Cómo pronunciarla',
  // etapa 3: pronúncia, rever
  erroComum: 'El error más común de quien habla español',
  sai: 'Lo que sale:',
  certo: 'Correcto:',
  naoConfunda: 'No la confundas con',
  gravacao: nome => `El nombre, el sonido y una palabra con ${nome}.`,
  entendi: 'Entendido, volver a la lección',
  video: nome => `Moshik explica la ${nome}`,
  legenda: 'Portugués'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
