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

const es: Traducao<typeof pt> = {
  folgaTitulo: 'Día libre',
  folgaDesc: 'Si pasas un día sin cumplir la meta, el día libre se usa solo y tu racha continúa. Puedes guardar hasta dos.',
  cartaTitulo: 'Carta de cultura anticipada',
  cartaDesc: 'Abre ahora la próxima carta del viaje por la historia del hebreo, sin esperar a completar más lecciones.',
  nomeTitulo: 'Tu nombre en hebreo decorado',
  nomeDesc: 'Tu nombre en letra de molde y a mano, en una imagen para descargar: fondo de pantalla del celular o para imprimir.',
  textoTitulo: 'Texto bíblico extra',
  textoDesc: 'Un pasaje del Antiguo Testamento en hebreo, con transliteración, traducción y la lectura grabada, línea por línea.',
  versiculoTitulo: 'Versículo bíblico',
  versiculoDesc: 'Un versículo conocido del Antiguo Testamento, con transliteración, traducción y la lectura grabada.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
