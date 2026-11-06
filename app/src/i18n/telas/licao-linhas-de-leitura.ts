import type { Traducao } from '..';

/* components/learn/LinhasDeLeitura.tsx */
const pt = {
  ajudas: 'Ajudas de leitura',
  mostrarPontos: 'Mostrar os pontos',
  transliteracao: 'Transliteração',
  traducao: 'Tradução',
  parar: '■ Parar',
  ouvirTexto: '▶ Ouvir o texto inteiro',
  linha: (n: number, aberta: boolean) => `Linha ${n}: ${aberta ? 'esconder' : 'mostrar'} a ajuda`,
  ouvirLinha: (n: number) => `Ouvir a linha ${n}`,
  toqueNumaLinha: 'Toque numa linha para ver só a ajuda dela.'
} as const;

const en: Traducao<typeof pt> = {
  ajudas: 'Reading aids',
  mostrarPontos: 'Show the vowel points',
  transliteracao: 'Transliteration',
  traducao: 'Translation',
  parar: '■ Stop',
  ouvirTexto: '▶ Listen to the whole text',
  linha: (n, aberta) => `Line ${n}: ${aberta ? 'hide' : 'show'} the help`,
  ouvirLinha: n => `Listen to line ${n}`,
  toqueNumaLinha: 'Tap a line to see the help for that line only.'
};

const es: Traducao<typeof pt> = {
  ajudas: 'Ayudas de lectura',
  mostrarPontos: 'Mostrar los puntos',
  transliteracao: 'Transliteración',
  traducao: 'Traducción',
  parar: '■ Detener',
  ouvirTexto: '▶ Escuchar el texto completo',
  linha: (n, aberta) => `Línea ${n}: ${aberta ? 'ocultar' : 'mostrar'} la ayuda`,
  ouvirLinha: n => `Escuchar la línea ${n}`,
  toqueNumaLinha: 'Toca una línea para ver solo la ayuda de esa línea.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
