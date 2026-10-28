import type { Traducao } from '..';

/* app/verificar-certificado/VerificarClient.tsx - a conferência pública de
   um certificado pelo código. */
const pt = {
  localeDaData: 'pt-BR',
  titulo: 'Conferir um certificado',
  instrucao: 'Digite o código que aparece no certificado (por exemplo, A1-ABCD2345).',
  codigoRotulo: 'Código do certificado',
  conferindo: 'Conferindo…',
  conferir: 'Conferir',
  valido: '✓ Certificado válido',
  concluiu: 'Concluiu o curso {curso} do Hebraico Fluente, com aprovação no exame final em {data}.',
  codigoNota: 'Código {id}. Não é uma certificação oficial de nível.',
  naoAchou: 'Não achamos um certificado público com este código. Confira o código, ou peça à pessoa para ligar a verificação pública.',
  erro: 'Não deu para conferir agora. Tente de novo em instantes.'
} as const;

const en: Traducao<typeof pt> = {
  localeDaData: 'en-US',
  titulo: 'Verify a certificate',
  instrucao: 'Enter the code shown on the certificate (for example, A1-ABCD2345).',
  codigoRotulo: 'Certificate code',
  conferindo: 'Checking…',
  conferir: 'Verify',
  valido: '✓ Valid certificate',
  concluiu: 'Completed the {curso} course from Hebraico Fluente, passing the final exam on {data}.',
  codigoNota: 'Code {id}. This is not an official level certification.',
  naoAchou: 'We could not find a public certificate with this code. Check the code, or ask the person to turn on public verification.',
  erro: 'Could not check right now. Please try again in a moment.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
