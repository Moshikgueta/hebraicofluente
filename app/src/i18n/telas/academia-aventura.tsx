import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/aventura: EscadaDeLeitura, CartaDaLetra, AberturaDoLugar e Cenarios */
const pt = {
  /* EscadaDeLeitura */
  degrauComAjuda: 'Com ajuda',
  degrauMenosAjuda: 'Menos ajuda',
  degrauSemAjuda: 'Sem ajuda',
  marcoPrimeiraGuiada: 'Sua primeira palavra lida no laboratório.',
  marcoPrimeiraMenos: 'Sua primeira palavra lida com menos ajuda.',
  marcoPrimeiraSem: 'Sua primeira palavra lida sem ajuda nenhuma.',
  marcoDezenas: (n: number) => `${n} palavras lidas sem ajuda.`,
  escadaAria: 'Palavras que você marcou como lidas, por nível de ajuda',
  nPalavras: (n: number) => `${n} ${n === 1 ? 'palavra' : 'palavras'}`,
  escadaNota: 'Contam as palavras que você marcou como lidas. O domínio das letras vem dos exercícios corrigidos.',
  marcoDeLeitura: 'Marco de leitura',
  continuarLendo: 'Continuar lendo',

  /* CartaDaLetra */
  rotuloDominada: 'Dominada',
  rotuloConcluida: 'Concluída',
  rotuloAdiante: 'Ainda não',
  cartaAria: (nome: string, estado: string) => `${nome}: ${estado.toLowerCase()}`,
  abrirLicao: (rotulo: string) => `${rotulo}. Abrir a lição`,
  letraConquistada: 'Letra conquistada',
  entrouNaColecao: (nome: string) => `${nome} entrou na sua coleção.`,
  leNomeYael: (he: ReactNode): ReactNode => <>Agora você lê o nome da Yael:{' '}{he}</>,
  yaelLegenda: "ya'él · o íbex",
  verColecao: 'Ver a coleção de letras',

  /* AberturaDoLugar */
  moduloLugar: (n: number, lugar: string) => `Módulo ${n} · ${lugar}`,

  /* Cenarios: o nome do lugar em português (o hebraico fica no código) */
  lugar1: 'o mar',
  lugar2: 'o jardim',
  lugar3: 'a janela',
  lugar4: 'a cidade',
  lugar5: 'o mercado',
  lugar6: 'a rua, sem os pontos',
  lugar7: 'o telhado'
} as const;

const en: Traducao<typeof pt> = {
  degrauComAjuda: 'With help',
  degrauMenosAjuda: 'Less help',
  degrauSemAjuda: 'No help',
  marcoPrimeiraGuiada: 'Your first word read in the lab.',
  marcoPrimeiraMenos: 'Your first word read with less help.',
  marcoPrimeiraSem: 'Your first word read with no help at all.',
  marcoDezenas: n => `${n} words read with no help.`,
  escadaAria: 'Words you marked as read, by level of help',
  nPalavras: n => `${n} ${n === 1 ? 'word' : 'words'}`,
  escadaNota: 'These count the words you marked as read. Your mastery of the letters comes from the checked exercises.',
  marcoDeLeitura: 'Reading milestone',
  continuarLendo: 'Keep reading',

  rotuloDominada: 'Mastered',
  rotuloConcluida: 'Completed',
  rotuloAdiante: 'Not yet',
  cartaAria: (nome, estado) => `${nome}: ${estado.toLowerCase()}`,
  abrirLicao: rotulo => `${rotulo}. Open the lesson`,
  letraConquistada: 'Letter earned',
  entrouNaColecao: nome => `${nome} has joined your collection.`,
  leNomeYael: he => <>Now you can read Yael&apos;s name:{' '}{he}</>,
  yaelLegenda: "ya'el · the ibex",
  verColecao: 'See the letter collection',

  moduloLugar: (n, lugar) => `Module ${n} · ${lugar}`,

  lugar1: 'the sea',
  lugar2: 'the garden',
  lugar3: 'the window',
  lugar4: 'the city',
  lugar5: 'the market',
  lugar6: 'the street, without the dots',
  lugar7: 'the rooftop'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
