import type { Traducao } from '..';

/* components/learn/AudioButton.tsx */
const pt = {
  ouvir: 'Ouvir',
  ouvirDevagar: 'Ouvir devagar',
  devagar: '0,7×',
  falhou: 'Não consegui tocar o áudio. Confira a conexão e toque de novo.'
} as const;

const en: Traducao<typeof pt> = {
  ouvir: 'Listen',
  ouvirDevagar: 'Listen slowly',
  devagar: '0.7×',
  falhou: 'I couldn\'t play the audio. Check your connection and tap again.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
