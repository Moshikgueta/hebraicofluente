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

const es: Traducao<typeof pt> = {
  ouvir: 'Escuchar',
  ouvirDevagar: 'Escuchar despacio',
  devagar: '0,7×',
  falhou: 'No pude reproducir el audio. Revisa la conexión y toca de nuevo.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
