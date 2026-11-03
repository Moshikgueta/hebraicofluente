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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
