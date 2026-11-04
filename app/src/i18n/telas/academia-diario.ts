import type { Traducao } from '..';

/* components/aventura/Diario.tsx */
const pt = {
  localeData: 'pt-BR',
  abaRegistros: 'Registros',
  abaLugares: 'Lugares',
  abaPalavras: 'Palavras',
  titulo: 'Diário de descobertas',
  nRegistros: (n: number) => `${n} ${n === 1 ? 'registro' : 'registros'}`,
  paginas: 'Páginas do diário',
  vazio: 'O diário começa na Aula 0. Cada letra aprendida, cada leitura e cada missão ganha uma linha aqui, com a data.',
  verRecentes: 'Ver só os mais recentes',
  verTodos: (n: number) => `Ver todos os ${n} registros`,
  modulo: (n: number, foi: boolean) => `Módulo ${n} · ${foi ? 'visitado' : 'ainda não'}`,
  visto: 'visto',
  semPalavras: 'As palavras aparecem aqui quando você ler a primeira, lá pela segunda lição.',
  jaLe: (n: number) => `Você já lê ${n} ${n === 1 ? 'palavra' : 'palavras'} do curso. As mais recentes:`,
  verVocabulario: 'Ver o vocabulário inteiro'
} as const;

const en: Traducao<typeof pt> = {
  localeData: 'en-US',
  abaRegistros: 'Entries',
  abaLugares: 'Places',
  abaPalavras: 'Words',
  titulo: 'Discovery journal',
  nRegistros: n => `${n} ${n === 1 ? 'entry' : 'entries'}`,
  paginas: 'Journal pages',
  vazio: 'The journal starts with Lesson 0. Every letter you learn, every reading and every mission gets a line here, with the date.',
  verRecentes: 'Show only the most recent',
  verTodos: n => `Show all ${n} entries`,
  modulo: (n, foi) => `Module ${n} · ${foi ? 'visited' : 'not yet'}`,
  visto: 'seen',
  semPalavras: 'Words show up here once you read the first one, around the second lesson.',
  jaLe: n => `You can already read ${n} ${n === 1 ? 'word' : 'words'} from the course. The most recent:`,
  verVocabulario: 'See the whole vocabulary'
};

const es: Traducao<typeof pt> = {
  localeData: 'es-419',
  abaRegistros: 'Registros',
  abaLugares: 'Lugares',
  abaPalavras: 'Palabras',
  titulo: 'Diario de descubrimientos',
  nRegistros: n => `${n} ${n === 1 ? 'registro' : 'registros'}`,
  paginas: 'Páginas del diario',
  vazio: 'El diario empieza en la Clase 0. Cada letra aprendida, cada lectura y cada misión gana una línea aquí, con la fecha.',
  verRecentes: 'Ver solo los más recientes',
  verTodos: n => `Ver los ${n} registros`,
  modulo: (n, foi) => `Módulo ${n} · ${foi ? 'visitado' : 'todavía no'}`,
  visto: 'visto',
  semPalavras: 'Las palabras aparecen aquí cuando leas la primera, más o menos en la segunda lección.',
  jaLe: n => `Ya lees ${n} ${n === 1 ? 'palabra' : 'palabras'} del curso. Las más recientes:`,
  verVocabulario: 'Ver todo el vocabulario'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
