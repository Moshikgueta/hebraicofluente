import type { Traducao } from '..';

/* app/teclado-hebraico/TecladoClient.tsx e page.tsx */
const pt = {
  metaTitulo: 'Teclado hebraico - Hebraico Fluente',
  metaDescricao: 'Como adicionar o teclado hebraico no iPhone, no Android, no Windows e no Mac.',
  ferramentas: 'Ferramentas',
  titulo: 'O teclado hebraico no seu aparelho',
  texto: 'Ele só é necessário para os exercícios de digitação da academia. Todo o resto do curso se faz tocando.',
  confirmado: '✓ Você já confirmou o teclado.',
  irDigitacao: 'Ir para a digitação, na academia'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Hebrew keyboard - Hebraico Fluente',
  metaDescricao: 'How to add the Hebrew keyboard on iPhone, Android, Windows and Mac.',
  ferramentas: 'Tools',
  titulo: 'The Hebrew keyboard on your device',
  texto: 'You only need it for the typing exercises in the academy. Everything else in the course is done by tapping.',
  confirmado: '✓ You have already confirmed the keyboard.',
  irDigitacao: 'Go to typing practice in the academy'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
