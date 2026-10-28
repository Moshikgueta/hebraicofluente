import type { Traducao } from '..';

/* lib/engine/exam.ts - as partes do exame final e as três faixas do resultado. */
const pt = {
  letrasTitulo: 'As letras',
  letrasDesc: 'Reconhecer a forma, fora de ordem, incluindo as cinco formas finais.',
  dificeisTitulo: 'As letras difíceis',
  dificeisDesc: 'As que se parecem entre si, a mesma letra em outra fonte, e achar uma letra dentro de uma palavra - no começo, no meio ou no fim.',
  sinaisTitulo: 'Os sinais de vogal',
  sinaisDesc: 'Que som cada sinal faz - independente da consoante em que ele está.',
  silabasTitulo: 'Sílabas',
  silabasDesc: 'Consoante mais vogal, nas duas direções: ler e montar.',
  palavrasTitulo: 'Palavras',
  palavrasDesc: 'Palavras inteiras: ler, completar, montar, escrever - e achar uma letra dentro delas, no começo, no meio ou no fim.',
  frasesTitulo: 'Frases',
  frasesDesc: 'Duas ou três palavras juntas. Sem transliteração.',
  semPontosTitulo: 'Sem os pontos',
  semPontosDesc: 'Palavras que você conhece, escritas como na rua: sem os sinais de vogal.',
  gerechTitulo: 'Os sons de fora',
  gerechDesc: 'O sinal ׳ que dá ao hebraico os sons de TCH, DJ e J.',
  escutaTitulo: 'Escuta',
  escutaDesc: 'Só o som, sem ver antes.',
  mundoTitulo: 'Hebraico de verdade',
  mundoDesc: 'Palavras como você vai encontrá-las: numa garrafa, numa porta, num recibo.',
  faixaOtimaTitulo: 'Você lê hebraico.',
  faixaOtimaTexto: 'Não é força de expressão: você decodificou as palavras do curso sozinho, sem transliteração e sem pistas. O que falta agora é volume de leitura, não método.',
  faixaAprovadoTitulo: 'Aprovado - e dá para ver onde apertar.',
  faixaAprovadoFraca: 'Você lê. Uma parte ficou abaixo do resto, e ela está marcada aqui embaixo com o link para treinar exatamente isso.',
  faixaAprovadoEquilibrado: 'Você lê, e de forma equilibrada - nenhuma parte ficou para trás.',
  faixaAindaNaoTitulo: 'Ainda não - e isso é informação, não veredito.',
  faixaAindaNaoTexto: 'O exame não tem limite de tentativas e não custa nada. Abaixo está exatamente qual parte derrubou a nota e onde treinar. Volte quando quiser: quase sempre é uma parte só.'
} as const;

const en: Traducao<typeof pt> = {
  letrasTitulo: 'The letters',
  letrasDesc: 'Recognize each shape, out of order, including the five final forms.',
  dificeisTitulo: 'The tricky letters',
  dificeisDesc: 'The look-alikes, the same letter in another font, and finding a letter inside a word - at the beginning, in the middle or at the end.',
  sinaisTitulo: 'The vowel signs',
  sinaisDesc: 'What sound each sign makes - whatever consonant it sits on.',
  silabasTitulo: 'Syllables',
  silabasDesc: 'Consonant plus vowel, in both directions: reading and building.',
  palavrasTitulo: 'Words',
  palavrasDesc: 'Whole words: reading, completing, building, typing - and finding a letter inside them, at the beginning, in the middle or at the end.',
  frasesTitulo: 'Sentences',
  frasesDesc: 'Two or three words together. No transliteration.',
  semPontosTitulo: 'Without the dots',
  semPontosDesc: 'Words you know, written the way they appear on the street: without the vowel signs.',
  gerechTitulo: 'The borrowed sounds',
  // etapa 3: pronúncia, rever
  gerechDesc: 'The sign ׳ that gives Hebrew the sounds CH (as in church), J (as in jam) and ZH (as in measure).',
  escutaTitulo: 'Listening',
  escutaDesc: 'Only the sound, without seeing it first.',
  mundoTitulo: 'Real-world Hebrew',
  mundoDesc: 'Words the way you will find them: on a bottle, on a door, on a receipt.',
  faixaOtimaTitulo: 'You read Hebrew.',
  faixaOtimaTexto: 'That is not a figure of speech: you decoded the words of the course on your own, with no transliteration and no clues. What you need now is more reading, not more method.',
  faixaAprovadoTitulo: 'Passed - and you can see where to tighten up.',
  faixaAprovadoFraca: 'You read. One part came out below the rest, and it is marked below with a link to practice exactly that.',
  faixaAprovadoEquilibrado: 'You read, and evenly - no part fell behind.',
  faixaAindaNaoTitulo: 'Not yet - and that is information, not a verdict.',
  faixaAindaNaoTexto: 'The exam has no limit on attempts and costs nothing. Below you can see exactly which part brought the score down and where to practice. Come back whenever you like: it is almost always just one part.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
