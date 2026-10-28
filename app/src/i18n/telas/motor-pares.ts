import type { Traducao } from '..';

/* lib/engine/pares.ts - os exercícios de pares de letras parecidas. */
const pt = {
  essaE: 'Essa é {nome}. Olhe o desenho de novo.',
  outraParecida: 'Essa é outra letra, bem parecida.',
  parecidasPergunta: 'Entre estas parecidas, qual é {nome}?',
  seConfundem: '{a} e {b} se confundem. {porque}',
  intrusaPergunta: 'Uma destas não é {nome}. Qual?',
  intrusaEssaE: 'Essa é {nome}.',
  intrusaExplica: 'A intrusa era {letra}, de {rival}. {porque}',
  palavraPergunta: 'Em qual destas palavras aparece {nome}? As outras têm {rival}.',
  essa: 'Essa',
  palavraErro: '{palavra} tem {rival}, não {nome}. {porque}'
} as const;

const en: Traducao<typeof pt> = {
  essaE: 'That one is {nome}. Look at the shape again.',
  outraParecida: 'That is another letter, a very similar one.',
  parecidasPergunta: 'Among these look-alikes, which one is {nome}?',
  seConfundem: '{a} and {b} get mixed up. {porque}',
  intrusaPergunta: 'One of these is not {nome}. Which one?',
  intrusaEssaE: 'That one is {nome}.',
  intrusaExplica: 'The odd one out was {letra}, from {rival}. {porque}',
  palavraPergunta: 'In which of these words does {nome} appear? The others have {rival}.',
  essa: 'That one',
  palavraErro: '{palavra} has {rival}, not {nome}. {porque}'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
