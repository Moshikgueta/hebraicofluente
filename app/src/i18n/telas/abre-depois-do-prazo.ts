import type { Traducao } from '..';

/* components/platform/AbreDepoisDoPrazo.tsx */
const pt = {
  exame: (data: string) => `O exame final abre em ${data}.`,
  certificado: (data: string) => `O certificado abre em ${data}.`,
  bonus: (data: string) => `As leituras bônus abrem em ${data}.`,
  texto: 'O exame final, o certificado e as leituras bônus ficam disponíveis quando termina o prazo para desistir da compra. Até lá, todas as lições continuam abertas.',
  continuar: 'Continuar as lições'
};

const en: Traducao<typeof pt> = {
  exame: data => `The final exam opens on ${data}.`,
  certificado: data => `The certificate opens on ${data}.`,
  bonus: data => `The bonus readings open on ${data}.`,
  texto: 'The final exam, the certificate and the bonus readings become available when the refund period for your purchase ends. Until then, all the lessons stay open.',
  continuar: 'Continue the lessons'
};

const es: Traducao<typeof pt> = {
  exame: data => `El examen final se abre el ${data}.`,
  certificado: data => `El certificado se abre el ${data}.`,
  bonus: data => `Las lecturas extra se abren el ${data}.`,
  texto: 'El examen final, el certificado y las lecturas extra quedan disponibles cuando termina el plazo de reembolso de tu compra. Hasta entonces, todas las lecciones siguen abiertas.',
  continuar: 'Seguir con las lecciones'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
