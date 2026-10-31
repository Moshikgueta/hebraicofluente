import type { Traducao } from '..';

/* components/platform: AntesEDepois.tsx, AccessNotice.tsx e Campo.tsx */
const pt = {
  antesEDepois: 'Antes e depois',
  frasesDestravadas: (n: number) => (n === 1 ? '1 frase destravada' : `${n} frases destravadas`),
  eraUmDesenho: (data: string, dias: number) =>
    `Em ${data}, há ${dias} ${dias === 1 ? 'dia' : 'dias'}, isto era um desenho.`,
  oQueEstaEscrito: 'O que está escrito?',
  leiaAntes: 'Leia antes de abrir. É para isso que serve.',

  terminaHoje: 'Seu acesso termina hoje.',
  terminaEm: (dias: number) => `Seu acesso termina em ${dias} ${dias === 1 ? 'dia' : 'dias'}.`,
  depoisDisso: (curso: string) =>
    `Depois disso as aulas do ${curso} fecham. Seu progresso continua guardado na sua conta e ` +
    'volta inteiro assim que você renovar.',
  renovarAcesso: 'Renovar acesso',

  ocultarSenha: 'Ocultar senha',
  mostrarSenha: 'Mostrar senha'
} as const;

const en: Traducao<typeof pt> = {
  antesEDepois: 'Before and after',
  frasesDestravadas: (n: number) => (n === 1 ? '1 sentence unlocked' : `${n} sentences unlocked`),
  eraUmDesenho: (data: string, dias: number) =>
    `On ${data}, ${dias} ${dias === 1 ? 'day' : 'days'} ago, this was just a drawing.`,
  oQueEstaEscrito: 'What does it say?',
  leiaAntes: 'Read it before you open it. That is the point.',

  terminaHoje: 'Your access ends today.',
  terminaEm: (dias: number) => `Your access ends in ${dias} ${dias === 1 ? 'day' : 'days'}.`,
  depoisDisso: (curso: string) =>
    `After that, the ${curso} lessons close. Your progress stays saved in your account and comes ` +
    'back in full as soon as you renew.',
  renovarAcesso: 'Renew access',

  ocultarSenha: 'Hide password',
  mostrarSenha: 'Show password'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
