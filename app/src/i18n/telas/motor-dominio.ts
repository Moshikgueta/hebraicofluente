import type { Traducao } from '..';

/* lib/dominio.ts - as três habilidades do domínio das letras e os nomes dos
   níveis. */
const pt = {
  formaTitulo: 'Reconhecimento visual',
  formaDesc: 'Identificar a forma da letra.',
  formaResumo: 'identificar a forma da letra',
  somTitulo: 'Reconhecimento sonoro',
  somDesc: 'Associar a letra ao seu som.',
  somResumo: 'associar a letra ao som',
  leituraTitulo: 'Leitura em palavras',
  leituraDesc: 'Reconhecer e ler a letra dentro de palavras.',
  leituraResumo: 'reconhecer e ler a letra dentro de palavras',
  poucosDados: 'Dados insuficientes',
  aprendendo: 'Ainda aprendendo',
  desenvolvimento: 'Em desenvolvimento',
  quase: 'Quase dominada',
  dominada: 'Dominada'
} as const;

const en: Traducao<typeof pt> = {
  formaTitulo: 'Visual recognition',
  formaDesc: 'Identify the shape of the letter.',
  formaResumo: 'identify the shape of the letter',
  somTitulo: 'Sound recognition',
  somDesc: 'Connect the letter to its sound.',
  somResumo: 'connect the letter to its sound',
  leituraTitulo: 'Reading in words',
  leituraDesc: 'Recognize and read the letter inside words.',
  leituraResumo: 'recognize and read the letter inside words',
  poucosDados: 'Not enough data',
  aprendendo: 'Still learning',
  desenvolvimento: 'Developing',
  quase: 'Almost mastered',
  dominada: 'Mastered'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
