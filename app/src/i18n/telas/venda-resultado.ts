import type { Traducao } from '..';

/* components/landing/Resultado.tsx - o que se passa a ler, módulo a módulo. */
const pt = {
  rubrica: 'O que você passa a ler',
  titulo: 'Do primeiro módulo à placa na rua.',
  lead: 'Cada módulo termina com uma palavra de verdade. No fim, você lê o que está escrito nas ruas de Israel.',
  modulo: (n: number) => `Módulo ${n}`,
  semPontos: 'sem os sinais de vogal',
  naRuaTitulo: 'No fim do curso, você lê isto.',
  naRuaLead: 'Fotos de verdade, de placas em Israel. A palavra destacada é uma que o curso ensina.',
  naPlaca: 'Na placa:',
  foto: 'Foto:',
  origem: 'Wikimedia Commons'
} as const;

// rever: a seção só aparece no site em português
const en: Traducao<typeof pt> = {
  rubrica: 'What you will be able to read',
  titulo: 'From the first module to a street sign.',
  lead: 'Every module ends with a real word. By the end, you read what is written on the streets of Israel.',
  modulo: (n: number) => `Module ${n}`,
  semPontos: 'without the vowel signs',
  naRuaTitulo: 'By the end of the course, you read this.',
  naRuaLead: 'Real photos of signs in Israel. The highlighted word is one the course teaches.',
  naPlaca: 'On the sign:',
  foto: 'Photo:',
  origem: 'Wikimedia Commons'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
