import type { Traducao } from '..';

/* components/landing/Resultado.tsx - as placas que se lê no fim do curso. */
const pt = {
  rubrica: 'Na rua, em Israel',
  naRuaTitulo: 'No fim do curso, você lê isto.',
  naRuaLead: 'Fotos de verdade, de placas em Israel. A palavra destacada é uma que o curso ensina.',
  naPlaca: 'Na placa:',
  foto: 'Foto:',
  origem: 'Wikimedia Commons'
} as const;

// rever: a seção só aparece no site em português
const en: Traducao<typeof pt> = {
  rubrica: 'On the street, in Israel',
  naRuaTitulo: 'By the end of the course, you read this.',
  naRuaLead: 'Real photos of signs in Israel. The highlighted word is one the course teaches.',
  naPlaca: 'On the sign:',
  foto: 'Photo:',
  origem: 'Wikimedia Commons'
};

const es: Traducao<typeof pt> = {
  rubrica: 'En la calle, en Israel',
  naRuaTitulo: 'Al final del curso, lees esto.',
  naRuaLead: 'Fotos reales de carteles en Israel. La palabra resaltada es una que el curso enseña.',
  naPlaca: 'En el cartel:',
  foto: 'Foto:',
  origem: 'Wikimedia Commons'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
