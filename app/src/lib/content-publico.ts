/* O conteúdo que PODE estar no pacote que qualquer visitante baixa.
 * ─────────────────────────────────────────────────────────────────────────
 * A régua é uma só: isto é o que o site de vendas mostra de propósito - a
 * estrutura do curso (módulos, títulos, metas), os glifos das 22 letras e os
 * nomes delas. É material de vitrine, e esconder vitrine não protege nada.
 *
 * O que NÃO está aqui é o curso: sílabas, palavras, exemplos, a explicação de
 * cada letra, as cartas de cultura, os extras, as cenas do mundo real, a
 * geometria dos traçados. Isso vive em `content.ts`, que em produção não
 * carrega dado nenhum - ele busca de /api/content, atrás do cookie e do
 * direito de acesso.
 *
 * ── por que os dois arquivos, e não um com um `if` ───────────────────────
 * Porque quem decide o que vai para o navegador é o empacotador, e ele
 * decide por IMPORT. Um arquivo só, com o conteúdo pago importado lá dentro,
 * põe as 58 KB de `letters.json` no mesmo pedaço que a home carrega - foi
 * exatamente o que a auditoria de 20/09/2026 mediu: 48 de 60 amostras do
 * material de ensino, num arquivo público, a um `curl` de distância.
 *
 * A regra que isso deixa, e que vale para sempre: **página pública importa
 * daqui; página de aluno importa de `content.ts`**. Uma página pública que
 * importe de `content.ts` traz o curso inteiro junto, sem aviso nenhum - e o
 * teste em tests/conteudo.test.ts existe para pegar isso.
 *
 * Os TIPOS moram todos aqui, inclusive os do conteúdo pago: tipo não existe
 * em tempo de execução, não pesa um byte no pacote, e tê-los num lugar só
 * evita duas definições de `Letter` divergindo em silêncio.
 */

import courseJson from '@content/course.json';

export type Word = {
  he: string;
  translit: string;
  pt: string;
  use: string | null;
  audioId: string;
};

export type Syllable = {
  vowel: 'a' | 'e' | 'i' | 'o' | 'u' | 'sheva' | string;
  he: string;
  translit: string;
  ptApprox: string;
  audioId: string;
};

export type Letter = {
  id: string;
  order: number;
  module: number;
  lesson: number;
  letter: string;
  finalForm: string | null;
  nameHe: string;
  namePt: string;
  translit: string;
  sound: string;
  soundNotePt: string;
  didYouKnow: string;
  brazilianMistake: { wrong: string; right: string; why: string };
  confusableWith: string[];
  /** O traço visual que separa esta letra de uma parecida, por glifo do outro.
   *  Escrito de um lado só do par; quem lê procura nos dois sentidos. */
  contrastes: Record<string, string>;
  syllables: Syllable[];
  wordsToRead: Word[];
  wordsToRecognize: Word[];
  bridgeWords: { he: string; pt: string }[];
  /** Every glyph the learner may legally be shown at this point. */
  alphabetSoFar: string[];
  strokeOrder: { base: string | null; final: string | null };
  workbookPages: { from: number; to: number } | null;
  audioId: string;
};

export type Checkpoint = {
  id: string;
  module: number;
  upTo: number;
  letterIds: string[];
  workbookPages: { from: number; to: number } | null;
};

export type CourseModule = {
  n: number;
  id: string;
  kind: 'letters' | 'consolidation' | 'extra' | string;
  titlePt: string;
  subPt: string;
  introPt: string;
  goalsPt: string[];
  milestonePt: string;
  lessons: { n: number; kind?: string; letters?: string[]; topicPt?: string }[];
  letterIds: string[];
  upTo: number | null;
  checkpoint: Checkpoint | null;
  workbookPages: { from: number; to: number } | null;
};

/** O esqueleto de uma letra que a vitrine mostra: o glifo e o nome. */
export type LetterSkel = {
  id: string; order: number; module: number;
  letter: string; namePt: string; sound: string;
};

export type Course = {
  generatedAt: string;
  source: string;
  totalLetters: number;
  modules: CourseModule[];
  letters: LetterSkel[];
};

export type NikudSign = {
  nameHe: string;
  namePt: string;
  /** The sign shown on mem, e.g. מַ. */
  demo: string;
  /** The mark alone, to put on another consonant. */
  sign: string;
  position: string;
  /** The syllable said out loud. */
  audioId: string;
  /** The sign's own name said out loud - "patach". */
  nameAudioId: string;
};

export type NikudSound = {
  sound: string;
  ptApprox: string | null;
  signs: NikudSign[];
};

export type NikudIntro = { title: string; lead: string; correction: string };

/* Uma frase inteira, que era o que o curso não tinha.
   `after` é a ordem da letra mais tardia que ela usa - calculada e conferida
   pela V20 do validate.js, nunca escrita à mão sem conferência. `era` separa
   o hebraico de hoje do texto antigo, que é o que permite pô-los lado a lado
   no fim sem misturá-los antes. */
export type SentenceWord = { he: string; translit: string; pt: string; audioId: string };
export type Sentence = {
  id: string; he: string; translit: string; pt: string;
  after: number; era: 'moderno' | 'antigo';
  words: SentenceWord[]; notePt: string; audioId: string;
};

/* Uma linha antiga e uma linha de hoje que dividem a mesma raiz.

   `antigo` e `moderno` são IDS de `Sentence`, e não cópias das frases: uma
   correção feita na frase não pode deixar uma versão velha escondida aqui. E
   a `raiz` é conferida consoante por consoante contra as duas frases pela V21
   do validate.js - o parentesco que a tela anuncia não é opinião do autor. */
export type EraPair = {
  id: string; antigo: string; moderno: string;
  raiz: string; raizPt: string;
  fontePt: string; idadePt: string; notePt: string;
};

export type Scene = {
  id: string; fromOrder: number; sceneType: string; labelPt: string;
  he: string; contextPt: string; translit: string; pt: string; audioId: string;
};

/* Gerado com os diagramas de traçado, a partir do mesmo contorno de fonte e
   na mesma execução - então a contagem e os pontos de partida não têm como
   discordar da página impressa. `null` para uma letra sem dado é resposta
   normal: a tela de traçar cai no diagrama estático. */
export type Stroke = {
  /** O contorno do próprio traço, na caixa de 200 unidades. */
  d: string;
  /** Onde a caneta encosta. */
  start: [number, number];
  /** Um vetor unitário para dentro da forma. Diz "por aqui", não "arredonde
   *  assim". */
  dir: [number, number];
};
export type StrokeSet = { box: number; strokes: Stroke[] };

/* Opcional e destravável. `unlockAt` é uma contagem de letras, não um id de
   lição: a carta aparece quando o aluno domina aquele tanto, o que a mantém
   recompensa por avanço em vez de mais uma coisa para fazer. Nada do caminho
   principal depende de nenhuma delas. */
export type CultureCard = {
  id: string;
  titlePt: string;
  kind: 'historia' | 'curiosidade' | 'cultura' | string;
  /** Letras dominadas antes de a carta aparecer. */
  unlockAt: number;
  leadPt: string;
  bodyPt: string[];
  /** De onde vem a afirmação. Não vai para o aluno; fica para revisão. */
  sources?: string;
};

export const course = courseJson as unknown as Course;

/** O módulo pelo número. Só lê a estrutura, então vive do lado público - é
 *  o que permite a `generateStaticParams` enumerar rotas na build sem
 *  precisar do conteúdo pago. */
export const getModule = (n: number): CourseModule | undefined =>
  course.modules.find(m => m.n === n);

/** Os ids das letras, em ordem de ensino. Idem: a lista de rotas não é
 *  segredo, o que está dentro de cada uma é. */
export const letterIds = (): string[] =>
  course.letters.slice().sort((a, b) => a.order - b.order).map(l => l.id);
