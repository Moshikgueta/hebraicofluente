import type { Traducao } from '..';

/* lib/loja.ts - os itens que se trocam por XP em Recompensas. */
const pt = {
  folgaTitulo: 'Dia de folga',
  folgaDesc: 'Se você passar um dia sem cumprir a meta, a folga é usada sozinha e a sua sequência continua. Dá para guardar até duas.',
  cartaTitulo: 'Carta de cultura antecipada',
  cartaDesc: 'Abre agora a próxima carta da viagem pela história do hebraico, sem esperar concluir mais lições.',
  nomeTitulo: 'Seu nome em hebraico decorado',
  nomeDesc: 'O seu nome em letra de fôrma e à mão, numa imagem para baixar: papel de parede do celular ou para imprimir.',
  textoTitulo: 'Texto bíblico bônus',
  textoDesc: 'Um trecho do Antigo Testamento em hebraico, com transliteração, tradução e a leitura gravada, linha a linha.',
  versiculoTitulo: 'Versículo bíblico',
  versiculoDesc: 'Um versículo conhecido do Antigo Testamento, com transliteração, tradução e a leitura gravada.'
} as const;

const en: Traducao<typeof pt> = {
  folgaTitulo: 'Day off',
  folgaDesc: 'If you go a day without meeting your goal, the day off is used automatically and your streak continues. You can save up to two.',
  cartaTitulo: 'Early culture card',
  cartaDesc: 'Opens the next card of the journey through the history of Hebrew right now, without waiting to complete more lessons.',
  nomeTitulo: 'Your name in decorated Hebrew',
  nomeDesc: 'Your name in print and in handwriting, as an image to download: a phone wallpaper or something to print.',
  textoTitulo: 'Bonus biblical text',
  textoDesc: 'A passage from the Old Testament in Hebrew, with transliteration, translation and the recorded reading, line by line.',
  versiculoTitulo: 'Bible verse',
  versiculoDesc: 'A well-known verse from the Old Testament, with transliteration, translation and the recorded reading.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
