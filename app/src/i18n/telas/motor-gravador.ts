import type { Traducao } from '..';

/* lib/gravador.ts - o diagnóstico do volume de uma gravação. */
const pt = {
  semVoz: 'Não ouvi voz nesta gravação. Confira se o microfone certo está ligado.',
  estourado: 'A voz estourou (passou do máximo). Afaste um pouco o celular e grave de novo.',
  baixo: 'Ficou muito baixo. Chegue mais perto do microfone e grave de novo.',
  ok: 'Volume bom.'
} as const;

const en: Traducao<typeof pt> = {
  semVoz: 'I did not hear a voice in this recording. Check that the right microphone is on.',
  estourado: 'The voice clipped (it went over the maximum). Hold the phone a little farther away and record again.',
  baixo: 'It came out too quiet. Move closer to the microphone and record again.',
  ok: 'Good volume.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
