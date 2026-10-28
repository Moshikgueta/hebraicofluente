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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
