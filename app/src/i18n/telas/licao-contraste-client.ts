import type { Traducao } from '..';

/* app/som/[id]/ContrasteClient.tsx */
const pt = {
  osPares: 'Os pares',
  silabas: 'Sílabas',
  palavras: 'Palavras',
  fixacao: 'Fixação',
  exercicios: 'Exercícios',
  naoAbriu: 'A lição dos três pares ainda não abriu',
  mapa: '← Mapa',
  badge: (modulo: number, licao: number) => `Módulo ${modulo} · lição ${licao} · com e sem o ponto`,
  etapas: 'Etapas da lição',
  etapaDe: (n: number, rotulo: string) => `Etapa ${n} de 5 - ${rotulo}`,
  parDe: (n: number, total: number) => `par ${n} de ${total}`,
  proximoPar: 'Próximo par',
  irExercicios: 'Ir para os exercícios',
  tituloExercicios: 'Exercícios - com e sem o ponto',
  comESem: 'Com e sem o ponto',
  seisSons:
    'Você já conhece os seis sons, cada um na sua lição. Agora eles ficam lado a lado: a mesma letra, com o ponto dentro e sem ele.',
  quandoVem: 'Quando vem o ponto?',
  continuarSilabas: 'Continuar para as sílabas',
  silabasLado: 'As sílabas, lado a lado',
  leiaCadaLinha:
    'Leia cada linha em voz alta, primeiro a coluna da direita (com o ponto) e depois a da esquerda (sem o ponto), e sinta a boca mudar.',
  continuarPalavras: 'Continuar para as palavras',
  palavrasLados: 'As palavras, dos dois lados',
  olheOMiolo: 'Antes de ler cada palavra, olhe o miolo da letra destacada: com o ponto ou sem ele.',
  leiaDoisLados: 'Leia os dois lados em voz alta',
  leiaDoisLadosInstrucao:
    'Leia as palavras de cada par, grave e confira se a diferença aparece: B e V, K e o raspado, P e F.',
  continuarFixacao: 'Continuar para a fixação',
  placar: (certas: number, total: number, pct: number) => `${certas} de ${total} · ${pct}%`,
  firmes: 'Os três pares estão firmes.',
  vamosFirmar: 'Vamos firmar os três pares.',
  bom: 'Você olha o miolo da letra e decide o som. Pode seguir.',
  refaca: (libera: number) =>
    `Refaça quando quiser: as perguntas mudam, e o que conta é decidir com o ponto ou sem ele sem hesitar. O checkpoint abre a partir de ${libera}%.`,
  refazer: 'Refazer os exercícios',
  concluir: 'Concluir e continuar'
} as const;

const en: Traducao<typeof pt> = {
  osPares: 'The pairs',
  silabas: 'Syllables',
  palavras: 'Words',
  fixacao: 'Practice',
  exercicios: 'Exercises',
  naoAbriu: 'The three-pairs lesson is not open yet',
  mapa: '← Map',
  badge: (modulo, licao) => `Module ${modulo} · lesson ${licao} · with and without the dot`,
  etapas: 'Lesson steps',
  etapaDe: (n, rotulo) => `Step ${n} of 5 - ${rotulo}`,
  parDe: (n, total) => `pair ${n} of ${total}`,
  proximoPar: 'Next pair',
  irExercicios: 'Go to the exercises',
  tituloExercicios: 'Exercises - with and without the dot',
  comESem: 'With and without the dot',
  seisSons:
    'You already know all six sounds, each from its own lesson. Now they sit side by side: the same letter, with the dot inside and without it.',
  quandoVem: 'When does the dot appear?',
  continuarSilabas: 'Continue to the syllables',
  silabasLado: 'The syllables, side by side',
  leiaCadaLinha:
    'Read each row aloud, first the right column (with the dot) and then the left (without the dot), and feel your mouth change.',
  continuarPalavras: 'Continue to the words',
  palavrasLados: 'The words, on both sides',
  olheOMiolo: 'Before reading each word, look at the middle of the highlighted letter: with the dot or without it.',
  leiaDoisLados: 'Read both sides aloud',
  // etapa 3: pronúncia, rever
  leiaDoisLadosInstrucao:
    'Read the words in each pair, record yourself and check that the difference comes through: B and V, K and the scraped sound, P and F.',
  continuarFixacao: 'Continue to practice',
  placar: (certas, total, pct) => `${certas} of ${total} · ${pct}%`,
  firmes: 'The three pairs are solid.',
  vamosFirmar: 'Let\'s make the three pairs solid.',
  bom: 'You look at the middle of the letter and decide the sound. You can move on.',
  refaca: libera =>
    `Redo it whenever you like: the questions change, and what counts is deciding with or without the dot without hesitating. The checkpoint opens at ${libera}%.`,
  refazer: 'Redo the exercises',
  concluir: 'Finish and continue'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;
