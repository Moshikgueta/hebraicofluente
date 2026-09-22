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
import bibliaJson from '@content/biblia.json';

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

/* Um item de checagem de compreensão.
 * ─────────────────────────────────────────────────────────────────────────
 * O padrão do curso é explicação → exemplo → PERGUNTAS → prática: um
 * conceito importante nunca é seguido de "próximo" sem uma pergunta no
 * meio. Ler e achar que entendeu é a forma mais comum de não entender, e a
 * conta chega três lições depois.
 *
 * Isto NÃO é exercício do motor: não vale XP, não entra na revisão
 * espaçada, não tranca nada, e por isso aceita verdadeiro/falso - que o
 * motor recusa, com razão, porque num item de prova 50% de chute não mede
 * nada. Aqui não se mede: confronta-se uma frase que a pessoa já ouviu.
 *
 * `visual` existe porque "qual destes tem niqqud?" não é uma pergunta de
 * texto: as alternativas são hebraico, renderizado.
 */
export type ItemCompreensao =
  | { t: 'escolha'; q: string; opcoes: string[]; certa: number; porque: string }
  | { t: 'vf'; q: string; certa: boolean; porque: string }
  | { t: 'visual'; q: string; opcoes: string[]; certa: number; porque: string }
  | {
      t: 'assoc';
      q: string;
      rotulos: string[];
      linhas: { item: string; he?: boolean; certa: number }[];
      porque: string;
    };

/* A camada pedagógica de uma letra.
 * ─────────────────────────────────────────────────────────────────────────
 * O curso já dizia QUAL É O SOM de cada letra. Isto diz o que a letra FAZ
 * dentro do sistema de escrita - que é a pergunta que um adulto brasileiro
 * realmente tem, e que ninguém respondia:
 *
 *   funcaoPt          como a letra aparece e funciona na leitura real;
 *   detalhePt         a particularidade dela, quando existe: forma final,
 *                     dois sons com e sem daguesh, quando pode ser muda,
 *                     quando participa de um som de vogal;
 *   paraBrasileiroPt  a comparação com o português, quando ela ajuda -
 *                     inclusive para dizer que o som NÃO existe aqui;
 *   lembrePt          uma ou duas frases: o que fica se tudo o mais sumir;
 *   checagem          duas a quatro perguntas de compreensão, que conferem
 *                     a EXPLICAÇÃO e não o reconhecimento da forma.
 *
 * Só `funcaoPt`, `lembrePt` e `checagem` são obrigatórios: uma letra sem
 * particularidade nenhuma não deve ganhar um quadro "detalhe importante"
 * escrito para preencher espaço. A V23 do validate.js cobra os três, e
 * cobra `detalhePt` nas letras que TÊM forma final ou dois sons - ali a
 * ausência é omissão, não economia.
 */
/* A dica de leitura: 💡 "você vai encontrar ISTO, e é assim que se lê".
 *
 * Existe porque há coisas que não são regra de letra nenhuma e mesmo assim
 * decidem a leitura de centenas de palavras - o {{ה}} no fim, o {{וֹ}}. Sem
 * um lugar para elas, o aluno só descobre o padrão por conta própria, e
 * tarde.
 *
 * `notaPt` é obrigatória, e é a parte mais importante do bloco: uma pista
 * de leitura vira superstição no instante em que alguém a toma por lei. */
export type DicaLeitura = {
  tituloPt: string;
  /** Os passos, na ordem em que a pessoa deve fazê-los ao ver a palavra. */
  passos: string[];
  /** Palavras que o aluno JÁ CONSEGUE ler nesta altura do curso. */
  exemplos: { he: string; translitPt: string; ptPt: string }[];
  /** O limite da dica, dito na mesma tela. */
  notaPt: string;
};

export type Ensino = {
  funcaoPt: string;
  detalhePt?: string;
  paraBrasileiroPt?: string;
  /** 🧠 O padrão que volta o curso inteiro. Só onde existe um de verdade. */
  padraoPt?: string;
  /** 💡 Como ler uma coisa que se repete. Só onde existe uma de verdade. */
  dicaLeitura?: DicaLeitura;
  lembrePt: string;
  checagem: ItemCompreensao[];
};

/* Uma leitura de uma letra que tem mais de uma.
 * ─────────────────────────────────────────────────────────────────────────
 * Shin e Sin são o caso que mais custa: o mesmo desenho, e o lado do ponto
 * decide se o som é "ch" ou "s". Bet/Vet, Kaf/Chaf e Pe/Fe seguem o mesmo
 * princípio com o daguesh.
 *
 * Cada uma tem `audioId` PRÓPRIO, derivado do próprio texto hebraico - é o
 * que impede um botão de tocar o som da outra quando as gravações entrarem,
 * e é a diferença entre "esta letra tem dois sons" escrito na tela e o
 * aluno conseguir ouvir os dois.
 */
export type VarianteLetra = {
  he: string;
  nomePt: string;
  som: string;
  /** Como esta leitura se escreve em letra nossa: o "sh" de {{שׁ}}, o "s" de
   *  {{שׂ}}. É o que permite montar a sílaba desta leitura - "sha" e "sa" -
   *  em vez de só nomear o som. */
  translit: string;
  /** A que som do português ela corresponde, quando corresponde. */
  comoPt: string;
  /** Onde está o sinal que a distingue - é nisto que o aluno olha. */
  ondePt: string;
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
  /** As leituras, quando há mais de uma. Vazio na maioria das letras. */
  variantes: VarianteLetra[];
  soundNotePt: string;
  /** A camada pedagógica: o que a letra FAZ, e a checagem. Ver `Ensino`. */
  ensino: Ensino;
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
  /** Verdadeiro nos módulos que consolidam em vez de ensinar letra nova: o
   *  escopo passa a ser tudo o que veio antes, e não o que o módulo trouxe. */
  cumulativo?: boolean;
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

/* ── o versículo da página «vou conseguir ler a Bíblia?» ────────────────
   Público de propósito, junto de `course.json`, e pela mesma régua: a página
   que responde essa pergunta é de VENDAS. Quem faz a pergunta ainda não
   comprou, e a resposta honesta - sim para decodificar, não para entender -
   vale mais mostrada do que afirmada.

   Não é material de aula: é um versículo de domínio público, com a fonte ao
   lado, para a pessoa julgar por si. `bare` e `after` são calculados pelo
   exportador; a grafia é conferida pela V22 do validate.js. */
export type BibleWord = {
  he: string; bare: string; translit: string; pt: string; audioId: string;
};
export type BibleVerse = {
  id: string; fontePt: string;
  he: string; bare: string; translit: string; pt: string;
  /** A ordem da letra mais tardia do versículo - em que lição ele fica legível. */
  after: number;
  words: BibleWord[];
  audioId: string;
};

export const bibleVerses = (): BibleVerse[] =>
  (bibliaJson as unknown as { verses: BibleVerse[] }).verses;

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

/**
 * Quantas lições o curso tem.
 *
 * Existe como função por uma razão que já custou caro: a soma estava
 * copiada em cinco arquivos, e num deles alguém escreveu `course.totalLetters`
 * no lugar dela. O site passou a anunciar "21 lições" na capa e "São 22
 * lições" no FAQ - dois números diferentes para a mesma coisa, na página que
 * a pessoa lê logo antes de decidir comprar.
 *
 * Letra e lição são grandezas diferentes e por acaso parecidas (22 e 21), que
 * é o pior caso: erra em silêncio e ninguém confere. Agora a soma mora aqui,
 * e `tests/numeros.test.ts` recusa a volta da cópia.
 */
export const totalLicoes = (): number =>
  course.modules.reduce((n, m) => n + m.lessons.length, 0);
