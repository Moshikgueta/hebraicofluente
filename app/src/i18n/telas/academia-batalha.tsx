import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* components/game/Batalha.tsx */
const pt = {
  rodadaDe: (n: number, total: number) => `Rodada ${n} de ${total}`,
  parecidasSom: 'Parecidas no som',
  parecidasDesenho: 'Parecidas no desenho',
  inimigasDeHoje: 'Inimigas de hoje',
  placar: (n: number, total: number, acertos: number) =>
    `${n} / ${total} · ${acertos} ${acertos === 1 ? 'acerto' : 'acertos'}`,
  nomeDaOpcao: (nome: string, final: boolean) => `${nome}${final ? ' final' : ''}`,

  relampagoEspera: 'A letra vai aparecer por um instante. Toque quando estiver pronto.',
  relampagoPergunta: 'Qual letra passou?',
  mostrarLetra: 'Mostrar a letra',
  passou: 'passou',
  eraA: (nome: string) => `Era a ${nome}.`,

  somInstrucao: 'Ouça a sílaba e escolha a letra que você ouviu.',
  ouvir: 'Ouvir',
  ouvirSilaba: 'Ouvir a sílaba',
  ouvirPrimeiro: 'Toque em Ouvir primeiro.',

  qualLetra: 'Qual letra é esta?',
  estaEA: (nome: string) => `Esta é a ${nome}.`,

  pediaFinal: (nome: string) =>
    `Essa é a ${nome} de começo e meio de palavra. O pedido era a forma final, a que fecha a palavra.`,
  pediaComeco: (nome: string) =>
    `Essa é a ${nome} final, a que fecha a palavra. O pedido era a forma de começo e meio.`,
  toqueEmTodas: (he: ReactNode): ReactNode => <>Toque em todas as letras{' '}{he}</>,

  qualDiferente: 'Qual é diferente?',
  isso: 'Isso!',
  olheComCalma: 'Olhe o desenho com calma e tente a próxima.'
} as const;

const en: Traducao<typeof pt> = {
  rodadaDe: (n, total) => `Round ${n} of ${total}`,
  parecidasSom: 'Sound alike',
  parecidasDesenho: 'Look alike',
  inimigasDeHoje: 'Today\'s rivals',
  placar: (n, total, acertos) => `${n} / ${total} · ${acertos} right`,
  nomeDaOpcao: (nome, final) => (final ? `final ${nome}` : nome),

  relampagoEspera: 'The letter will appear for just a moment. Tap when you are ready.',
  relampagoPergunta: 'Which letter flashed by?',
  mostrarLetra: 'Show the letter',
  passou: 'gone',
  eraA: nome => `It was ${nome}.`,

  somInstrucao: 'Listen to the syllable and choose the letter you heard.',
  ouvir: 'Listen',
  ouvirSilaba: 'Listen to the syllable',
  ouvirPrimeiro: 'Tap Listen first.',

  qualLetra: 'Which letter is this?',
  estaEA: nome => `This is ${nome}.`,

  pediaFinal: nome =>
    `That is the ${nome} used at the beginning and middle of a word. The task asked for the final form, the one that ends the word.`,
  pediaComeco: nome =>
    `That is final ${nome}, the one that ends the word. The task asked for the beginning-and-middle form.`,
  toqueEmTodas: he => <>Tap every letter{' '}{he}</>,

  qualDiferente: 'Which one is different?',
  isso: 'That\'s it!',
  olheComCalma: 'Take a calm look at the shape and try the next one.'
};

const es: Traducao<typeof pt> = {
  rodadaDe: (n, total) => `Ronda ${n} de ${total}`,
  parecidasSom: 'Parecidas en el sonido',
  parecidasDesenho: 'Parecidas en el dibujo',
  inimigasDeHoje: 'Rivales de hoy',
  placar: (n, total, acertos) =>
    `${n} / ${total} · ${acertos} ${acertos === 1 ? 'acierto' : 'aciertos'}`,
  nomeDaOpcao: (nome, final) => `${nome}${final ? ' final' : ''}`,

  relampagoEspera: 'La letra va a aparecer por un instante. Toca cuando estés listo.',
  relampagoPergunta: '¿Qué letra pasó?',
  mostrarLetra: 'Mostrar la letra',
  passou: 'pasó',
  eraA: nome => `Era la ${nome}.`,

  somInstrucao: 'Escucha la sílaba y elige la letra que oíste.',
  ouvir: 'Escuchar',
  ouvirSilaba: 'Escuchar la sílaba',
  ouvirPrimeiro: 'Toca Escuchar primero.',

  qualLetra: '¿Qué letra es esta?',
  estaEA: nome => `Esta es la ${nome}.`,

  pediaFinal: nome =>
    `Esa es la ${nome} de principio y medio de palabra. Se pedía la forma final, la que cierra la palabra.`,
  pediaComeco: nome =>
    `Esa es la ${nome} final, la que cierra la palabra. Se pedía la forma de principio y medio.`,
  toqueEmTodas: he => <>Toca todas las letras{' '}{he}</>,

  qualDiferente: '¿Cuál es diferente?',
  isso: '¡Eso!',
  olheComCalma: 'Mira el dibujo con calma e intenta la siguiente.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;
