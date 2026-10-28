import type { Traducao } from '..';

/* lib/cursiva.ts - o que o curso diz sobre a letra impressa e a cursiva. */
const pt = {
  impLivros: 'livros',
  impSites: 'sites',
  impJornais: 'jornais',
  impAplicativos: 'aplicativos',
  impPlacas: 'placas',
  impLegendas: 'legendas',
  impDocumentos: 'documentos',
  impMaterial: 'material de estudo',
  curCaderno: 'caderno',
  curAnotacoes: 'anotações',
  curListas: 'listas',
  curRecados: 'recados',
  curFormularios: 'formulários',
  curQuadro: 'quadro da sala',
  curQualquer: 'qualquer coisa escrita à mão',
  regraLer: 'letra impressa',
  regraEscrever: 'letra cursiva',
  analogia: 'Dá para desenhar as letras impressas à mão, sim. Só que ninguém faz isso - seria como escrever um bilhete em português tentando copiar exatamente a fonte de um livro, letra por letra, toda vez.',
  mesmaLetra: 'São duas representações da MESMA letra, e não dois alfabetos. O nome é o mesmo, o som é o mesmo, o lugar no alfabeto é o mesmo - muda o desenho, como entre a letra de forma e a letra de mão em português.',
  noCurso: 'No começo, ler continua sendo com a forma impressa: é ela que está nos livros e nas placas. A cursiva entra como escrita e como reconhecimento, uma letra de cada vez, junto com a lição dessa letra.'
} as const;

const en: Traducao<typeof pt> = {
  impLivros: 'books',
  impSites: 'websites',
  impJornais: 'newspapers',
  impAplicativos: 'apps',
  impPlacas: 'signs',
  impLegendas: 'subtitles',
  impDocumentos: 'documents',
  impMaterial: 'study materials',
  curCaderno: 'notebooks',
  curAnotacoes: 'notes',
  curListas: 'lists',
  curRecados: 'messages',
  curFormularios: 'forms',
  curQuadro: 'the classroom board',
  curQualquer: 'anything written by hand',
  regraLer: 'print letters',
  regraEscrever: 'cursive letters',
  analogia: 'You can draw the print letters by hand, yes. It is just that nobody does - it would be like writing a note in English while trying to copy the exact font of a book, letter by letter, every time.',
  mesmaLetra: 'They are two forms of the SAME letter, not two alphabets. The name is the same, the sound is the same, the place in the alphabet is the same - only the shape changes, like print and handwriting in English.',
  noCurso: 'At first, you keep reading with the print form: it is the one in books and on signs. Cursive comes in as writing and as recognition, one letter at a time, together with that letter\'s lesson.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
