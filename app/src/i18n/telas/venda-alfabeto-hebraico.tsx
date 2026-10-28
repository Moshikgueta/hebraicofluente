import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/alfabeto-hebraico/page.tsx e [letra]/page.tsx: as páginas públicas do
   alfabeto. O hebraico entra pelos argumentos, sempre num <He>. */
const pt = {
  metaTitulo: 'Alfabeto hebraico: as 22 letras, o som e como ler - Hebraico Fluente',
  metaDescricao:
    'As 22 letras do alfabeto hebraico com o nome e o som em português, as cinco formas finais e ' +
    'como funcionam as vogais. Teste grátis da primeira letra.',
  alfabeto: 'Alfabeto hebraico',
  titulo: 'As 22 letras do hebraico, uma por uma.',
  lead: 'O alfabeto hebraico tem 22 letras, e todas são consoantes. As vogais são sinais pequenos embaixo, em cima ou ao lado das letras: o nikud. E tudo se lê da direita para a esquerda.',
  tabelaEyebrow: 'A tabela',
  tabelaTitulo: 'O nome e o som de cada letra.',
  tabelaLead: (autor: string) =>
    `Na ordem em que o curso as ensina, que vem do método do ${autor}. As cinco letras que mudam de forma no fim da palavra aparecem com a forma final ao lado.`,
  colLetra: 'Letra',
  colNome: 'Nome',
  colSom: 'Som',
  colFinal: 'Forma final',
  comoEyebrow: 'Como se lê',
  comoTitulo: 'Três coisas para saber antes da primeira letra.',
  direitaTitulo: 'Da direita para a esquerda',
  direitaTexto: 'A linha começa do lado direito da página, e o livro também abre pelo lado que, para nós, é o fim.',
  consoantesTitulo: 'As letras são consoantes',
  consoantesTexto: (alef: ReactNode): ReactNode => (
    <>Cada uma das 22 letras é uma consoante. Uma delas, o {alef}, não tem som próprio: ela só segura a vogal.</>
  ),
  vogaisTitulo: 'As vogais são sinais',
  vogaisTexto: 'Os pontos e traços embaixo ou em cima das letras são as vogais, o nikud. Com eles, dá para ler em voz alta qualquer palavra, mesmo sem saber o que ela quer dizer.',
  ctaTitulo: 'Aprenda as 22 letras, uma por vez.',
  ctaLinha: 'Comece pelo teste grátis do Álef, na página do curso: 6 exercícios curtos, sem cadastro.',

  letraMetaTitulo: (nome: string, letra: string) =>
    `${nome} (${letra}): a letra do alfabeto hebraico e como se lê - Hebraico Fluente`,
  letraMetaDescricao: (nome: string, ordem: number, som: string) =>
    `${nome}, a letra ${ordem} na ordem do curso: o som (${som}), uma palavra com a gravação ` +
    'do professor e o erro mais comum de quem fala português.',
  letraEyebrow: (ordem: number) => `Alfabeto hebraico · letra ${ordem} na ordem do curso`,
  letraLead: (som: string, final: ReactNode): ReactNode => (
    <>O som: {som}.{final && <> No fim da palavra, a letra muda de forma: {final}.</>}</>
  ),
  ouvirNome: (nome: string) => `Ouvir o nome: ${nome}`,
  palavraEyebrow: 'Uma palavra',
  palavraTitulo: (nome: string) => `Uma palavra com ${nome}.`,
  ouvirProfessor: 'Ouvir o professor',
  erroEyebrow: 'Cuidado, brasileiro',
  erroTitulo: 'O erro mais comum com esta letra.',
  costumaSair: 'O que costuma sair',
  jeitoCerto: 'O jeito certo',
  noCurso: 'No curso, a lição desta letra explica por que isso acontece e treina o som com a gravação do professor.',
  parecidasEyebrow: 'Atenção ao desenho',
  parecidasTitulo: 'Letras que se parecem com esta.',
  parecidasLead: 'No começo, é fácil confundir. O curso treina a diferença lado a lado.',
  outrasEyebrow: 'Outras letras',
  outrasTitulo: 'Continue pelo alfabeto.',
  as22: 'As 22 letras'
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'The Hebrew alphabet: the 22 letters, their sounds and how to read - Hebraico Fluente',
  metaDescricao:
    'The 22 letters of the Hebrew alphabet with their names and sounds in English, the five final forms and ' +
    'how the vowels work. A free test of the first letter.',
  alfabeto: 'Hebrew alphabet',
  titulo: 'The 22 Hebrew letters, one by one.',
  lead: 'The Hebrew alphabet has 22 letters, and they are all consonants. The vowels are small signs under, above or next to the letters: the nikud. And everything is read from right to left.',
  tabelaEyebrow: 'The chart',
  tabelaTitulo: 'The name and sound of each letter.',
  tabelaLead: (autor: string) =>
    `In the order the course teaches them, which comes from the method of ${autor}. The five letters that change shape at the end of a word appear with their final form alongside.`,
  colLetra: 'Letter',
  colNome: 'Name',
  colSom: 'Sound',
  colFinal: 'Final form',
  comoEyebrow: 'How it reads',
  comoTitulo: 'Three things to know before the first letter.',
  direitaTitulo: 'From right to left',
  direitaTexto: 'The line starts on the right side of the page, and a book also opens from the side that, for us, is the end.',
  consoantesTitulo: 'The letters are consonants',
  consoantesTexto: (alef: ReactNode): ReactNode => (
    <>Each of the 22 letters is a consonant. One of them, {alef}, has no sound of its own: it only holds the vowel.</>
  ),
  vogaisTitulo: 'The vowels are signs',
  vogaisTexto: 'The dots and lines under or above the letters are the vowels, the nikud. With them, you can read any word aloud, even without knowing what it means.',
  ctaTitulo: 'Learn the 22 letters, one at a time.',
  ctaLinha: 'Start with the free Álef test on the course page: 6 short exercises, no sign-up.',

  letraMetaTitulo: (nome: string, letra: string) =>
    `${nome} (${letra}): the Hebrew alphabet letter and how to read it - Hebraico Fluente`,
  // etapa 3: pronúncia, rever (o erro descrito hoje é o de quem fala português)
  letraMetaDescricao: (nome: string, ordem: number, som: string) =>
    `${nome}, letter ${ordem} in the course order: the sound (${som}), a word recorded ` +
    'by the teacher and the most common beginner mistake.',
  letraEyebrow: (ordem: number) => `Hebrew alphabet · letter ${ordem} in the course order`,
  letraLead: (som: string, final: ReactNode): ReactNode => (
    <>The sound: {som}.{final && <> At the end of a word, the letter changes shape: {final}.</>}</>
  ),
  ouvirNome: (nome: string) => `Hear the name: ${nome}`,
  palavraEyebrow: 'A word',
  palavraTitulo: (nome: string) => `A word with ${nome}.`,
  ouvirProfessor: 'Hear the teacher',
  // etapa 3: pronúncia, rever
  erroEyebrow: 'Watch out',
  erroTitulo: 'The most common mistake with this letter.',
  costumaSair: 'What usually comes out',
  jeitoCerto: 'The right way',
  noCurso: 'In the course, this letter\'s lesson explains why that happens and trains the sound with the teacher\'s recording.',
  parecidasEyebrow: 'Watch the shape',
  parecidasTitulo: 'Letters that look like this one.',
  parecidasLead: 'At first, it is easy to mix them up. The course trains the difference side by side.',
  outrasEyebrow: 'Other letters',
  outrasTitulo: 'Keep going through the alphabet.',
  as22: 'All 22 letters'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
