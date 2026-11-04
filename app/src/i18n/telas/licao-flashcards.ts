import type { Traducao } from '..';

/* components/learn/Flashcards.tsx */
const pt = {
  semLetras: 'As cartas de letras aparecem depois da primeira lição.',
  semPalavras: 'As cartas de palavras aparecem quando você já lê a primeira palavra do curso.',
  semCaderno: 'Seu caderno está vazio. Marque palavras no seu vocabulário para treinar só elas aqui.',
  voltar: 'Voltar',
  completa: 'Rodada completa',
  todasSabidas: (n: number) => `${n} cartas, todas sabidas no fim.`,
  voltaram: (n: number) => ` ${n} voltaram uma vez antes de ficar.`,
  nenhumaVoltou: ' Nenhuma precisou voltar.',
  outraRodada: 'Outra rodada',
  mostrarFrente: 'Mostrar a frente da carta',
  virarEVer: 'Virar a carta e ver a resposta',
  toqueParaVirar: 'Toque para virar',
  ouvir: 'Ouvir',
  aindaNao: 'Ainda não',
  sabia: 'Sabia',
  virar: 'Virar a carta',
  restantes: (n: number) => `${n} ${n === 1 ? 'carta' : 'cartas'} nesta rodada. "Ainda não" volta no fim.`
} as const;

const en: Traducao<typeof pt> = {
  semLetras: 'Letter cards appear after the first lesson.',
  semPalavras: 'Word cards appear once you can read the first word of the course.',
  semCaderno: 'Your notebook is empty. Mark words in your vocabulary to practice only them here.',
  voltar: 'Back',
  completa: 'Round complete',
  todasSabidas: n => `${n} cards, all known by the end.`,
  voltaram: n => ` ${n} came back once before sticking.`,
  nenhumaVoltou: ' None had to come back.',
  outraRodada: 'Another round',
  mostrarFrente: 'Show the front of the card',
  virarEVer: 'Flip the card and see the answer',
  toqueParaVirar: 'Tap to flip',
  ouvir: 'Listen',
  aindaNao: 'Not yet',
  sabia: 'I knew it',
  virar: 'Flip the card',
  restantes: n => `${n} ${n === 1 ? 'card' : 'cards'} in this round. "Not yet" comes back at the end.`
};

const es: Traducao<typeof pt> = {
  semLetras: 'Las tarjetas de letras aparecen después de la primera lección.',
  semPalavras: 'Las tarjetas de palabras aparecen cuando ya lees la primera palabra del curso.',
  semCaderno: 'Tu cuaderno está vacío. Marca palabras en tu vocabulario para practicar solo esas aquí.',
  voltar: 'Volver',
  completa: 'Ronda completa',
  todasSabidas: n => `${n} tarjetas, todas sabidas al final.`,
  voltaram: n => ` ${n} volvieron una vez antes de quedar.`,
  nenhumaVoltou: ' Ninguna tuvo que volver.',
  outraRodada: 'Otra ronda',
  mostrarFrente: 'Mostrar el frente de la tarjeta',
  virarEVer: 'Dar vuelta la tarjeta y ver la respuesta',
  toqueParaVirar: 'Toca para dar vuelta',
  ouvir: 'Escuchar',
  aindaNao: 'Todavía no',
  sabia: 'La sabía',
  virar: 'Dar vuelta la tarjeta',
  restantes: n => `${n} ${n === 1 ? 'tarjeta' : 'tarjetas'} en esta ronda. "Todavía no" vuelve al final.`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
