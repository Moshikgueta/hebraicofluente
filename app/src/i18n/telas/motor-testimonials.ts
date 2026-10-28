import type { Traducao } from '..';

/* lib/testimonials.ts - o depoimento publicado. O português é o texto da
   aluna, sem palavra trocada. O inglês é uma TRADUÇÃO dele: antes de ir ao
   ar, o dono confere com a aluna e a página precisa dizer que é tradução. */
const pt = {
  natContexto: 'Búzios, Rio de Janeiro · aluna particular do professor',
  natResultado: 'Lê e escreve em hebraico',
  natCitacao:
    'Eu já havia estudado hebraico com outros professores, mas encontrei no Moshik uma abordagem ' +
    'diferente. Ele faz você prestar atenção em cada palavra, cada letra e cada pronúncia [...].\n\n' +
    'A plataforma também demonstra esse cuidado, com áudio, texto, imagens e exercícios de leitura, ' +
    'escrita e pronúncia. Existe uma preocupação real em fazer o aluno aprender de verdade.\n\n' +
    'Hoje consigo perceber que estou aprendendo hebraico de uma maneira diferente.'
} as const;

const en: Traducao<typeof pt> = {
  natContexto: 'Buzios, Rio de Janeiro, Brazil · the teacher\'s private student',
  natResultado: 'Reads and writes Hebrew',
  // tradução do depoimento: o dono confere com a aluna antes de publicar
  natCitacao:
    'I had already studied Hebrew with other teachers, but in Moshik I found a different ' +
    'approach. He makes you pay attention to every word, every letter and every pronunciation [...].\n\n' +
    'The platform shows that same care, with audio, text, images and reading, writing and ' +
    'pronunciation exercises. There is a real concern with making the student truly learn.\n\n' +
    'Today I can see that I am learning Hebrew in a different way.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
