import type { Traducao } from '..';

/* lib/engine/deck.ts - os rótulos dos tipos de carta e os enunciados dos
   jogos de baralho da Academia. */
const pt = {
  tipoNome: 'Nome da letra',
  tipoSom: 'Som',
  tipoSilaba: 'Sílaba',
  tipoPalavra: 'Palavra',
  heNome: 'Qual é o nome desta letra?',
  heSom: 'Que som esta letra faz?',
  heSilaba: 'Como se lê esta sílaba?',
  hePalavra: 'O que esta palavra quer dizer?',
  ptNome: 'Qual é esta letra?',
  ptSom: 'Qual letra faz este som?',
  ptSilaba: 'Qual sílaba se lê assim?',
  ptPalavra: 'Qual palavra quer dizer isto?'
} as const;

const en: Traducao<typeof pt> = {
  tipoNome: 'Letter name',
  tipoSom: 'Sound',
  tipoSilaba: 'Syllable',
  tipoPalavra: 'Word',
  heNome: 'What is the name of this letter?',
  heSom: 'What sound does this letter make?',
  heSilaba: 'How is this syllable read?',
  hePalavra: 'What does this word mean?',
  ptNome: 'Which letter is this?',
  ptSom: 'Which letter makes this sound?',
  ptSilaba: 'Which syllable is read like this?',
  ptPalavra: 'Which word means this?'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
