import type { Traducao } from '..';

/* app/vocabulario/VocabularioClient.tsx e app/vocabulario/page.tsx */
const pt = {
  metaTitulo: 'Meu vocabulário - Hebraico Fluente',
  metaDescricao: 'As palavras em hebraico que você já consegue ler com as letras que aprendeu.',

  meuVocabulario: 'Meu vocabulário',
  intro: (letras: number, faltam: number) =>
    `São as palavras do curso escritas só com as ${letras} letras que você já concluiu.` +
    (faltam > 0 ? ` Mais ${faltam} chegam com as próximas letras.` : ' É o vocabulário inteiro do curso.'),
  praticarAMao: 'Praticar estas palavras à mão, em cursiva',
  praticarLeitura: 'Pratique a leitura destas palavras no Laboratório de Leitura.',
  procurar: 'Procurar',
  placeholder: 'em hebraico, transliteração ou português',
  achadas: (achadas: number, total: number) => `${achadas} de ${total}`,
  nPalavras: (n: number) => `${n} palavras`,
  vazio: 'Conclua a lição do Mem e a primeira palavra aparece aqui.',
  irCurso: 'Ir para o curso',
  palavras: 'Palavras',
  ouvir: (translit: string) => `Ouvir ${translit}`,
  letrasDaPalavra: 'As letras desta palavra',
  letras: 'Letras',
  aMao: 'À mão',
  nenhuma: (busca: string) =>
    `Nenhuma palavra que você já lê tem “${busca}”. A palavra pode usar uma letra que ainda vem pela frente.`
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'My vocabulary - Hebraico Fluente',
  metaDescricao: 'The Hebrew words you can already read with the letters you have learned.',

  meuVocabulario: 'My vocabulary',
  intro: (letras, faltam) =>
    `These are the course words written only with the ${letras} letters you have already finished.` +
    (faltam > 0 ? ` ${faltam} more come with the next letters.` : ' This is the whole course vocabulary.'),
  praticarAMao: 'Practice these words by hand, in cursive',
  praticarLeitura: 'Practice reading these words in the Reading Lab.',
  procurar: 'Search',
  placeholder: 'in Hebrew, transliteration or English',
  achadas: (achadas, total) => `${achadas} of ${total}`,
  nPalavras: n => `${n} words`,
  vazio: 'Finish the Mem lesson and the first word shows up here.',
  irCurso: 'Go to the course',
  palavras: 'Words',
  ouvir: translit => `Listen to ${translit}`,
  letrasDaPalavra: 'The letters of this word',
  letras: 'Letters',
  aMao: 'By hand',
  nenhuma: busca =>
    `None of the words you can read has “${busca}”. The word may use a letter that is still ahead.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
