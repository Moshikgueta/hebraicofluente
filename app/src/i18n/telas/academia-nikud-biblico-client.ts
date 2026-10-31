import type { Traducao } from '..';

/* app/nikud-biblico/NikudBiblicoClient.tsx */
const pt = {
  indisponivel: 'Este guia ainda não está disponível.',
  voltarBonus: '← Leituras bônus',
  guiaOpcional: 'Guia opcional',
  nesteGuia: 'Neste guia',
  ouvir: (translit: string) => `Ouvir ${translit}`
} as const;

const en: Traducao<typeof pt> = {
  indisponivel: 'This guide is not available yet.',
  voltarBonus: '← Bonus readings',
  guiaOpcional: 'Optional guide',
  nesteGuia: 'In this guide',
  ouvir: translit => `Listen to ${translit}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
