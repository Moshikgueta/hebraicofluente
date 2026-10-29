import type { Traducao } from '..';

/* lib/depoimento.ts - a assinatura anônima e os erros do formulário de
   depoimento. */
const pt = {
  anonimo: 'Aluno do curso',
  textoCurto: 'Escreva pelo menos {n} caracteres.',
  textoLongo: 'O texto passou de {n} caracteres. Corte um pouco.',
  nomeFaltando: 'Escreva o nome que deve aparecer, ou escolha outra forma de assinar.',
  rateLimited: 'Muitas alterações seguidas. Tente de novo daqui a uma hora.',
  noAccess: 'O depoimento é só para quem tem o curso liberado.',
  notSignedIn: 'Sua sessão terminou. Entre de novo para enviar.'
} as const;

const en: Traducao<typeof pt> = {
  // a assinatura do painel sai do Worker (worker/src/api/depoimentos.js), ainda em português
  anonimo: 'Course student',
  textoCurto: 'Write at least {n} characters.',
  textoLongo: 'The text is over {n} characters. Trim it a little.',
  nomeFaltando: 'Write the name that should appear, or choose another way to sign.',
  rateLimited: 'Too many changes in a row. Try again in an hour.',
  noAccess: 'Testimonials are only for students with access to the course.',
  notSignedIn: 'Your session has ended. Sign in again to send it.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
